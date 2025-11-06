import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Blog from "./Blog";
import { blogsList } from "../../Utlits/blogList.jsx";

const DEFAULT_FALLBACK_LOCALE = "en-US";

const slugify = (value = "") =>
  value
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "entrada";

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
        .map((item) => resolveLink(item, assetsMap, locale))
        .filter(Boolean);
      return;
    }

    const resolved = resolveLink(localized, assetsMap, locale);
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

const parseErrorBody = (input) => {
  if (typeof input !== "string" || !input.length) return null;
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
};

const buildFallbackPosts = () =>
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

const Blogs = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fallbackPosts = useMemo(() => buildFallbackPosts(), []);
  const postsToRender = posts.length ? posts : fallbackPosts;
  const cardsToRender = postsToRender.slice(0, 3);

  useEffect(() => {
    let isMounted = true;

    const spaceId =
      import.meta.env.VITE_CONTENTFUL_SPACE_ID ??
      import.meta.env.CONTENTFUL_SPACE_ID ??
      "";
    const environmentId =
      import.meta.env.VITE_CONTENTFUL_ENVIRONMENT_ID ??
      import.meta.env.CONTENTFUL_ENVIRONMENT_ID ??
      "master";
    const deliveryToken =
      import.meta.env.VITE_CONTENTFUL_DELIVERY_TOKEN ??
      import.meta.env.CONTENTFUL_DELIVERY_TOKEN ??
      import.meta.env.CONTENTFUL_ACCESS_TOKEN ??
      "";
    const contentType =
      import.meta.env.VITE_CONTENTFUL_BLOG_POST_TYPE ??
      import.meta.env.CONTENTFUL_BLOG_POST_TYPE ??
      "blogPost";
    const locale =
      import.meta.env.VITE_CONTENTFUL_LOCALE ??
      import.meta.env.CONTENTFUL_LOCALE ??
      DEFAULT_FALLBACK_LOCALE;

    if (!spaceId || !deliveryToken) {
      setError(
        "Contentful no esta configurado. Define VITE_CONTENTFUL_SPACE_ID (o CONTENTFUL_SPACE_ID) y VITE_CONTENTFUL_DELIVERY_TOKEN (o CONTENTFUL_ACCESS_TOKEN) en tu entorno."
      );
      return () => {
        isMounted = false;
      };
    }

    const fetchEntries = async () => {
      setLoading(true);

      try {
        const requestEntries = async ({ skipContentType } = {}) => {
          const url = new URL(
            `https://cdn.contentful.com/spaces/${spaceId}/environments/${environmentId}/entries`
          );
          if (!skipContentType && contentType) {
            url.searchParams.set("content_type", contentType);
          }
          url.searchParams.set("include", "1");
          url.searchParams.set("locale", locale);

          const response = await fetch(url.toString(), {
            headers: {
              Authorization: `Bearer ${deliveryToken}`,
            },
          });

          const rawBody = await response.text();

          if (!response.ok) {
            const error = new Error(
              `Error Contentful ${response.status}: ${rawBody || response.statusText}`
            );
            error.status = response.status;
            error.body = parseErrorBody(rawBody);
            throw error;
          }

          return parseErrorBody(rawBody) ?? {};
        };

        let payload;
        try {
          payload = await requestEntries();
        } catch (err) {
          const unknownContentType =
            err.status === 400 &&
            err.body?.details?.errors?.some(
              (detail) => detail?.name === "unknownContentType"
            );

          if (unknownContentType) {
            payload = await requestEntries({ skipContentType: true });
          } else {
            throw err;
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

        if (isMounted) {
          setPosts(normalizedEntries);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          const baseMessage =
            err.message || "No fue posible cargar las entradas de Contentful.";
          if (
            err.status === 400 &&
            err.body?.details?.errors?.some(
              (detail) => detail?.name === "unknownContentType"
            )
          ) {
            setError(
              `${baseMessage} Verifica que el Content Type "${contentType}" exista o elimina la variable de entorno para usar todos los tipos.`
            );
          } else {
            setError(baseMessage);
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchEntries();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="blog__section overhid pt-120 pb-120" id="blog">
      <div className="container">
        <div className="row g-4">
          <div className="col-xl-4 col-lg-3">
            <div className="project__head">
              <span
                className="common__sub"
                data-aos="fade-down"
                data-aos-duration="1000"
              >
                My Blogs
              </span>
              <h2
                className="fw-500 mt-3"
                data-aos="fade-down"
                data-aos-duration="1500"
              >
                Recent Posts
              </h2>
              <div className="blog__hoverbox">
                <Link
                  className="hover__circle wow fadeInUp"
                  data-wow-duration="1.6s"
                  to="#"
                >
                  <span className="box">
                    <i className="bi bi-arrow-up-right"></i>
                    <span className="textmore">Click For More Works</span>
                  </span>
                </Link>
                {loading && (
                  <span className="textmore d-block mt-3">
                    Cargando entradas de Contentful...
                  </span>
                )}
                {error && !loading && (
                  <span className="textmore d-block mt-3">{error}</span>
                )}
              </div>
            </div>
          </div>
          <div className="col-xl-8 col-lg-9">
            <div className="blog__rightwrap">
              <div className="service__uniquewrap">
                {cardsToRender.map((post, index) => (
                  <Blog key={post.sys?.id ?? index} post={post} index={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blogs;
