import { createClient } from "contentful-management";

/**
 * Crea la entrada de blog en Contentful como DRAFT (nunca se llama a
 * entry.publish()). Publicarla a mano es una decisión deliberada: el
 * contenido lo genera una IA y cita clientes reales, así que Raúl revisa y
 * publica él mismo desde el panel de Contentful. Ver decisión en
 * .claude/docs/00-CONSTITUCION.md: "ningún agente publica datos de un
 * cliente sin permiso confirmado".
 */
export async function createDraftBlogEntry({ title, richTextBody }) {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const managementToken = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  const environmentId = process.env.CONTENTFUL_ENVIRONMENT_ID || "master";
  const contentTypeId = process.env.CONTENTFUL_BLOG_POST_TYPE || "blogPage";

  if (!spaceId || !managementToken) {
    throw new Error(
      "Faltan CONTENTFUL_SPACE_ID o CONTENTFUL_MANAGEMENT_TOKEN en las variables de entorno de la función."
    );
  }

  const client = createClient({
    accessToken: managementToken,
  });

  const space = await client.getSpace(spaceId);
  const environment = await space.getEnvironment(environmentId);

  // El content type tiene localización activada (ver Content model). Escribimos
  // en el locale por defecto del espacio para no romper la validación de
  // Contentful, que exige un valor en ese locale como mínimo.
  const locales = await environment.getLocales();
  const defaultLocale =
    locales.items.find((l) => l.default)?.code || "en-US";

  const entry = await environment.createEntry(contentTypeId, {
    fields: {
      title: { [defaultLocale]: title },
      body: { [defaultLocale]: richTextBody },
    },
  });

  return {
    entryId: entry.sys.id,
    spaceId,
    environmentId,
    // Link directo a la entrada en el panel de Contentful para que Raúl la
    // revise y la publique con un clic.
    editUrl: `https://app.contentful.com/spaces/${spaceId}/environments/${environmentId}/entries/${entry.sys.id}`,
  };
}
