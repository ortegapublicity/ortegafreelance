import { blogsList } from "../Utlits/blogList.jsx";

export const DEFAULT_FALLBACK_LOCALE = "en-US";

export const slugify = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "entrada";

export const getContentfulConfig = () => {
  const env = import.meta.env ?? {};

  const spaceId =
    env.VITE_CONTENTFUL_SPACE_ID ??
    env.CONTENTFUL_SPACE_ID ??
    env.REACT_APP_CONTENTFUL_SPACE_ID ??
    "";

  const environmentId =
    env.VITE_CONTENTFUL_ENVIRONMENT_ID ??
    env.CONTENTFUL_ENVIRONMENT_ID ??
    env.REACT_APP_CONTENTFUL_ENVIRONMENT_ID ??
    "master";

  // Token: primero delivery, luego preview, luego otros posibles nombres
  const deliveryToken =
    env.VITE_CONTENTFUL_DELIVERY_TOKEN ??
    env.VITE_CONTENTFUL_ACCESS_TOKEN ??
    env.CONTENTFUL_DELIVERY_TOKEN ??
    env.CONTENTFUL_ACCESS_TOKEN ??
    env.REACT_APP_CONTENTFUL_DELIVERY_TOKEN ??
    "";

  const contentType =
    env.VITE_CONTENTFUL_BLOG_POST_TYPE ??
    env.CONTENTFUL_BLOG_POST_TYPE ??
    env.REACT_APP_CONTENTFUL_CONTENT_TYPE ??
    "blogPage"; // asegúrate de que este sea el ID real del Content Type

  const locale =
    env.VITE_CONTENTFUL_LOCALE ??
    env.CONTENTFUL_LOCALE ??
    env.REACT_APP_CONTENTFUL_LOCALE ??
    DEFAULT_FALLBACK_LOCALE;

  // Si VITE_CONTENTFUL_USE_PREVIEW === "true" usamos la Preview API, si no la Delivery API
  const host =
    env.VITE_CONTENTFUL_USE_PREVIEW === "true"
      ? "preview.contentful.com"
      : "cdn.contentful.com";

  return {
    spaceId,
    environmentId,
    deliveryToken,
    contentType,
    locale,
    host,
  };
};

// ✅ Versión que respeta documentos Rich Text (Body, Video embed, etc.)
const getLocalizedValue = (
  value,
  locale,
  fallbackLocale = DEFAULT_FALLBACK_LOCALE
) => {
  if (value == null) return value;
  if (Array.isArray(value)) return value;
  if (typeof value !== "object") return value;

  // Si es un link de Contentful, lo devolvemos tal cual
  if (value.sys?.type === "Link") return value;

  // Si ya es un documento Rich Text, NO lo tocamos
  if (value.nodeType === "document" && Array.isArray(value.content)) {
    return value;
  }

  // Si es un objeto con claves por locale (en-US, es-ES, etc.)
  if (Object.prototype.hasOwnProperty.call(value, locale)) return value[locale];
  if (Object.prototype.hasOwnProperty.call(value, fallbackLocale))
    return value[fallbackLocale];

  const firstKey = Object.keys(value)[0];
  return firstKey ? value[firstKey] : undefined;
};

// Safari (navegación privada de iOS, bloqueadores, DNS filtrados) puede cortar
// las peticiones a dominios de terceros y lo reporta como "Load failed". Por eso
// el navegador pide a nuestro propio dominio y Netlify (netlify.toml) o Vite (dev)
// reenvían a Contentful. El token va en la query para que la petición sea simple
// y no necesite preflight CORS; es el token público de entrega, ya incluido en el JS.
const API_PROXY = {
  "cdn.contentful.com": "/cf-api",
  "preview.contentful.com": "/cf-preview",
};

export const contentfulFetch = async (path, params = {}) => {
  const { host, deliveryToken } = getContentfulConfig();
  const apiHost = host || "cdn.contentful.com";
  const query = new URLSearchParams({ ...params, access_token: deliveryToken });
  const bases = [API_PROXY[apiHost], `https://${apiHost}`].filter(Boolean);

  let lastError;
  for (const base of bases) {
    try {
      const response = await fetch(`${base}${path}?${query}`);
      // Sin proxy (p. ej. otro hosting) llega el index.html del SPA: probamos directo.
      if (!(response.headers.get("content-type") || "").includes("json")) {
        throw new Error(`Respuesta no JSON desde ${base} (${response.status})`);
      }
      return response;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
};

const proxyImageUrl = (url) => {
  const match = url?.match(/^(?:https?:)?\/\/images\.ctfassets\.net(\/.*)$/);
  return match ? `/cf-img${match[1]}` : url;
};

export const resolveAssetUrl = (asset) => {
  if (!asset) return null;
  if (Array.isArray(asset)) {
    for (const candidate of asset) {
      const url = resolveAssetUrl(candidate);
      if (url) return url;
    }
    return null;
  }
  if (typeof asset === "string") {
    return proxyImageUrl(asset.startsWith("http") ? asset : `https:${asset}`);
  }

  const url = asset?.fields?.file?.url;
  if (!url) return null;
  return proxyImageUrl(url.startsWith("http") ? url : `https:${url}`);
};

const normalizeAsset = (asset, locale) => {
  const file = getLocalizedValue(asset.fields?.file, locale);
  const url = file?.url
    ? proxyImageUrl(file.url.startsWith("//") ? `https:${file.url}` : file.url)
    : "";

  return {
    sys: asset.sys,
    fields: {
      title: getLocalizedValue(asset.fields?.title, locale) ?? "",
      description: getLocalizedValue(asset.fields?.description, locale) ?? "",
      file: {
        url,
        details: file?.details,
        fileName: file?.fileName,
        contentType: file?.contentType,
      },
    },
  };
};

const resolveLink = (value, assetsMap) => {
  if (value && typeof value === "object" && value.sys?.type === "Link") {
    if (value.sys.linkType === "Asset") {
      return assetsMap.get(value.sys.id) ?? null;
    }
    return value;
  }
  return value;
};

const normalizeEntry = (entry, assetsMap, locale) => {
  const normalizedFields = {};

  Object.entries(entry.fields ?? {}).forEach(([key, rawValue]) => {
    const localized = getLocalizedValue(rawValue, locale);

    if (Array.isArray(localized)) {
      normalizedFields[key] = localized
        .map((item) => resolveLink(item, assetsMap))
        .filter(Boolean);
      return;
    }

    const resolved = resolveLink(localized, assetsMap);
    normalizedFields[key] = resolved;
  });

  if (!normalizedFields.slug && normalizedFields.title) {
    normalizedFields.slug = slugify(normalizedFields.title);
  }

  return {
    sys: entry.sys,
    fields: normalizedFields,
  };
};

const isUnknownContentTypeError = (error) =>
  error?.body?.details?.errors?.some(
    (detail) => detail?.name === "unknownContentType"
  );

export const buildFallbackPosts = () =>
  blogsList.map((item, index) => ({
    sys: { id: String(item.id ?? index) },
    fields: {
      title: item.heading?.trim() ?? "Entrada sin titulo",
      date: item.date ?? "",
      slug: slugify(item.heading ?? `entrada-${index + 1}`),
      featuredImage: item.image
        ? {
            fields: {
              file: { url: item.image },
            },
          }
        : null,
      excerpt: item.para ?? "",
    },
  }));

export const loadContentfulPosts = async (options = {}) => {
  const config = getContentfulConfig();
  const {
    spaceId,
    environmentId,
    deliveryToken,
    contentType: defaultContentType,
    locale: defaultLocale,
    host,
  } = config;

  if (!spaceId || !deliveryToken) {
    return {
      posts: buildFallbackPosts(),
      error:
        "Contentful no está configurado. Define VITE_CONTENTFUL_SPACE_ID y VITE_CONTENTFUL_DELIVERY_TOKEN (o VITE_CONTENTFUL_PREVIEW_TOKEN) en tu entorno.",
      missingConfig: true,
    };
  }

  const contentType = options.contentType ?? defaultContentType;
  const include = options.include ?? "1";
  const locale = options.locale ?? defaultLocale;
  const limit = options.limit;

  const requestEntries = async ({ skipContentType } = {}) => {
    const params = {
      include,
      locale,
      // Ordenar por fecha de creación descendente
      order: "-sys.createdAt",
    };

    if (!skipContentType && contentType) {
      params.content_type = contentType;
    }

    if (limit) {
      params.limit = String(limit);
    }

    const response = await contentfulFetch(
      `/spaces/${spaceId}/environments/${environmentId}/entries`,
      params
    );

    let body;
    try {
      body = await response.json();
    } catch {
      body = null;
    }

    if (!response.ok) {
      const error = new Error(
        body?.message ??
          body?.sys?.id ??
          `Error Contentful ${response.status}: ${response.statusText}`
      );
      error.status = response.status;
      error.body = body;
      throw error;
    }

    return body ?? {};
  };

  try {
    let payload;
    let warning = null;

    try {
      payload = await requestEntries();
    } catch (error) {
      if (isUnknownContentTypeError(error)) {
        warning = `El Content Type "${contentType}" no existe o no está publicado. Se muestran todas las entradas disponibles.`;
        payload = await requestEntries({ skipContentType: true });
      } else {
        throw error;
      }
    }

    const assetsMap = new Map(
      (payload.includes?.Asset ?? []).map((asset) => [
        asset.sys.id,
        normalizeAsset(asset, locale),
      ])
    );

    const normalizedEntries = (payload.items ?? []).map((item) =>
      normalizeEntry(item, assetsMap, locale)
    );

    return {
      posts: normalizedEntries,
      error: warning,
      missingConfig: false,
    };
  } catch (error) {
    const baseMessage =
      error?.message || "No fue posible cargar las entradas de Contentful.";
    return {
      posts: buildFallbackPosts(),
      error: baseMessage,
      missingConfig: false,
    };
  }
};
