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

  const deliveryToken =
    env.VITE_CONTENTFUL_DELIVERY_TOKEN ??
    env.CONTENTFUL_DELIVERY_TOKEN ??
    env.CONTENTFUL_ACCESS_TOKEN ??
    env.REACT_APP_CONTENTFUL_DELIVERY_TOKEN ??
    "";

  const contentType =
    env.VITE_CONTENTFUL_BLOG_POST_TYPE ??
    env.CONTENTFUL_BLOG_POST_TYPE ??
    env.REACT_APP_CONTENTFUL_CONTENT_TYPE ??
    "blogPost";

  const locale =
    env.VITE_CONTENTFUL_LOCALE ??
    env.CONTENTFUL_LOCALE ??
    env.REACT_APP_CONTENTFUL_LOCALE ??
    DEFAULT_FALLBACK_LOCALE;

  return {
    spaceId,
    environmentId,
    deliveryToken,
    contentType,
    locale,
  };
};

const getLocalizedValue = (value, locale, fallbackLocale = DEFAULT_FALLBACK_LOCALE) => {
  if (value == null) return value;
  if (Array.isArray(value)) return value;
  if (typeof value !== "object") return value;
  if (value.sys?.type === "Link") return value;
  if (Object.prototype.hasOwnProperty.call(value, locale)) return value[locale];
  if (Object.prototype.hasOwnProperty.call(value, fallbackLocale)) return value[fallbackLocale];
  const firstKey = Object.keys(value)[0];
  return firstKey ? value[firstKey] : undefined;
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
    return asset.startsWith("http") ? asset : `https:${asset}`;
  }

  const url = asset?.fields?.file?.url;
  if (!url) return null;
  return url.startsWith("http") ? url : `https:${url}`;
};

const normalizeAsset = (asset, locale) => {
  const file = getLocalizedValue(asset.fields?.file, locale);
  const url = file?.url
    ? file.url.startsWith("//")
      ? `https:${file.url}`
      : file.url
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
  error?.body?.details?.errors?.some((detail) => detail?.name === "unknownContentType");

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
  } = config;

  if (!spaceId || !deliveryToken) {
    return {
      posts: [],
      error:
        "Contentful no esta configurado. Define CONTENTFUL_SPACE_ID (o VITE_CONTENTFUL_SPACE_ID) y CONTENTFUL_ACCESS_TOKEN (o VITE_CONTENTFUL_DELIVERY_TOKEN) en tu entorno.",
      missingConfig: true,
    };
  }

  const contentType = options.contentType ?? defaultContentType;
  const include = options.include ?? "1";
  const locale = options.locale ?? defaultLocale;
  const limit = options.limit;

  const requestEntries = async ({ skipContentType } = {}) => {
    const url = new URL(
      `https://cdn.contentful.com/spaces/${spaceId}/environments/${environmentId}/entries`
    );
    if (!skipContentType && contentType) {
      url.searchParams.set("content_type", contentType);
    }
    url.searchParams.set("include", include);
    url.searchParams.set("locale", locale);
    if (limit) {
      url.searchParams.set("limit", String(limit));
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${deliveryToken}`,
      },
    });

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
        warning = `El Content Type "${contentType}" no existe o no esta publicado. Se muestran todas las entradas disponibles.`;
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
      posts: [],
      error: baseMessage,
      missingConfig: false,
    };
  }
};
