import { createClient } from "contentful-management";

// Acceso a Contentful para el blog. Nunca publica: las entradas y las
// imágenes quedan en BORRADOR y Raúl las revisa y publica en Contentful
// (00-CONSTITUCION.md: no se publican datos de clientes sin permiso).
//
// contentful-management v12: createClient() devuelve la API «plain»
// (client.entry.create…); client.getSpace() ya no existe.
//
// El espacio tiene dos idiomas: en-US (el principal) y es-ES. Cada campo
// localizado lleva su texto en su idioma: el español va en es-ES, NUNCA en
// el principal (ese fue el fallo de los primeros borradores de la bitácora).

function getClient() {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  const environmentId = process.env.CONTENTFUL_ENVIRONMENT_ID || "master";
  if (!spaceId || !managementToken) {
    throw new Error(
      "Faltan CONTENTFUL_SPACE_ID o CONTENTFUL_MANAGEMENT_TOKEN en las variables de entorno de la función."
    );
  }
  const client = createClient(
    { accessToken: managementToken },
    { defaults: { spaceId, environmentId } }
  );
  return { client, spaceId, environmentId };
}

async function getLocales(client) {
  const { items } = await client.locale.getMany({});
  const en = items.find((l) => l.default)?.code || "en-US";
  const es = items.find((l) => /^es\b/i.test(l.code))?.code;
  if (!es) throw new Error("El espacio de Contentful no tiene un idioma español (es-…).");
  return { en, es };
}

const editUrl = (spaceId, environmentId, kind, id) =>
  `https://app.contentful.com/spaces/${spaceId}/environments/${environmentId}/${kind}/${id}`;

/**
 * Sube una imagen JPG como asset en borrador (mismo archivo en los dos
 * idiomas, para que se vea aunque es-ES no tenga idioma de respaldo).
 */
export async function uploadBlogImage({ title, fileName, buffer, contentType = "image/jpeg" }) {
  const { client, spaceId, environmentId } = getClient();
  const { en, es } = await getLocales(client);
  const file = { file: buffer, contentType, fileName };
  const asset = await client.asset.createFromFiles(
    {},
    {
      fields: {
        title: { [en]: title, [es]: title },
        description: { [en]: title, [es]: title },
        file: { [en]: file, [es]: file },
      },
    }
  );
  // Procesar genera la URL de la imagen. Si tarda, el asset ya existe y
  // Contentful lo termina de procesar solo; no hace falta fallar.
  try {
    await client.asset.processForAllLocales({}, asset);
  } catch {
    /* se procesa en segundo plano */
  }
  return { assetId: asset.sys.id, editUrl: editUrl(spaceId, environmentId, "assets", asset.sys.id) };
}

/**
 * Crea (o actualiza, si se pasa entryId y sigue en borrador) la entrada del
 * blog con el español en es-ES y el inglés en en-US.
 *   es, en: { title, excerpt, richTextBody }
 *   covers: { es: assetId, en: assetId } opcional
 */
export async function saveBlogDraft({ es, en, covers, entryId }) {
  const { client, spaceId, environmentId } = getClient();
  const contentTypeId = process.env.CONTENTFUL_BLOG_POST_TYPE || "blogPage";
  const loc = await getLocales(client);
  const contentType = await client.contentType.get({ contentTypeId });
  const byId = Object.fromEntries(contentType.fields.map((f) => [f.id, f]));

  const localized = (id, esValue, enValue) => {
    const field = byId[id];
    if (!field) return null;
    // Campo sin traducción: solo admite el idioma principal; va el español,
    // que es el idioma del sitio.
    return field.localized ? { [loc.es]: esValue, [loc.en]: enValue } : { [loc.en]: esValue };
  };

  const fields = {
    title: localized("title", es.title, en.title),
    body: localized("body", es.richTextBody, en.richTextBody),
  };

  // Extracto, si el modelo tiene un campo de texto para ello.
  const excerptField = ["excerpt", "description", "summary"].map((id) => byId[id]).find(
    (f) => f && (f.type === "Symbol" || f.type === "Text")
  );
  if (excerptField && es.excerpt) {
    const cut = (s) => (excerptField.type === "Symbol" ? String(s || "").slice(0, 255) : s);
    fields[excerptField.id] = localized(excerptField.id, cut(es.excerpt), cut(en.excerpt || es.excerpt));
  }

  // Imagen destacada: el primer campo que enlaza a un asset (image o featuredImage).
  const imageField =
    byId.image || byId.featuredImage || contentType.fields.find((f) => f.type === "Link" && f.linkType === "Asset");
  if (imageField && covers?.es) {
    const link = (id) => ({ sys: { type: "Link", linkType: "Asset", id } });
    fields[imageField.id] = localized(imageField.id, link(covers.es), link(covers.en || covers.es));
  }

  for (const k of Object.keys(fields)) if (!fields[k]) delete fields[k];

  let entry;
  if (entryId) {
    const current = await client.entry.get({ entryId });
    if (current.sys.publishedVersion) {
      throw new Error("Esa entrada ya está publicada; no se modifica desde la bitácora.");
    }
    entry = await client.entry.update({ entryId }, { ...current, fields: { ...current.fields, ...fields } });
  } else {
    entry = await client.entry.create({ contentTypeId }, { fields });
  }

  return {
    entryId: entry.sys.id,
    spaceId,
    environmentId,
    locales: loc,
    imageField: imageField?.id || null,
    editUrl: editUrl(spaceId, environmentId, "entries", entry.sys.id),
  };
}

/**
 * Compatibilidad con generate-article.js (Gemini), que solo escribe en
 * español: rellena es-ES y deja en-US vacío para traducirlo en Contentful.
 */
export async function createDraftBlogEntry({ title, richTextBody }) {
  return saveBlogDraft({
    es: { title, richTextBody },
    en: {}, // los valores undefined no se envían
  });
}
