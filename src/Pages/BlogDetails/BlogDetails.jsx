// src/Pages/BlogDetails/BlogDetails.jsx

import React, { useEffect, useState } from "react";
import { useParams, ScrollRestoration, Link } from "react-router-dom";
import {
  documentToReactComponents,
} from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS, INLINES } from "@contentful/rich-text-types";

import PageHeader from "../../Components/Shared/PageHeader/PageHeader";
import {
  loadContentfulPosts,
  buildFallbackPosts,
  resolveAssetUrl,
  slugify,
  getContentfulConfig,
} from "../../utils/contentfulPosts";

// Helper para detectar Rich Text válido
const isRichTextDoc = (value) =>
  value &&
  typeof value === "object" &&
  value.nodeType === "document" &&
  Array.isArray(value.content);

// Opciones de renderizado Rich Text
const RICHTEXT_OPTIONS = {
  renderMark: {
    [MARKS.BOLD]: (text) => <strong>{text}</strong>,
    [MARKS.ITALIC]: (text) => <em>{text}</em>,
    [MARKS.UNDERLINE]: (text) => <u>{text}</u>,
  },
  renderNode: {
    [BLOCKS.HEADING_2]: (node, children) => (
      <h3 className="text__boxhead">{children}</h3>
    ),
    [BLOCKS.HEADING_3]: (node, children) => (
      <h4 className="text__boxhead">{children}</h4>
    ),
    [BLOCKS.PARAGRAPH]: (node, children) => (
      <p className="fz-16 pra ttext__one">{children}</p>
    ),
    [BLOCKS.UL_LIST]: (node, children) => (
      <ul className="challenge__list">{children}</ul>
    ),
    [BLOCKS.OL_LIST]: (node, children) => (
      <ol className="challenge__list">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (node, children) => <li>{children}</li>,
    [BLOCKS.QUOTE]: (node, children) => (
      <div className="quite__box">
        <p>{children}</p>
      </div>
    ),
    [INLINES.HYPERLINK]: (node, children) => {
      const url = node.data.uri;
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  },
};

const BlogDetail = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    let isMounted = true;
    setError("");
    setLoading(true);
    setBlog(null);
    setRecommended([]);
    setImageUrl(null);

    const fetchBlog = async () => {
      try {
        const { posts: fetchedPosts } = await loadContentfulPosts({
          include: 2, // importante para que "image" se resuelva desde includes.Asset
        });

        if (!isMounted) return;

        const allPosts =
          fetchedPosts && fetchedPosts.length
            ? fetchedPosts
            : buildFallbackPosts();

        // Busca el blog por su slug
        const match = allPosts.find((post) => {
          const fields = post.fields ?? post;
          const title = fields.title ?? post.title ?? "";
          const rawSlug =
            fields.slug ??
            post.slug ??
            (title ? slugify(title) : post.sys?.id ?? "");
          const finalSlug =
            typeof rawSlug === "string" && rawSlug.length
              ? rawSlug
              : rawSlug?.sys?.id
              ? slugify(rawSlug.sys.id)
              : "";
          return finalSlug === slug;
        });

        if (!match) {
          setError("No se encontró este blog.");
          setBlog(null);
          setRecommended([]);
          setImageUrl(null);
          return;
        }

        setBlog(match);

        const fields = match.fields ?? match;

        // --- RESOLVER IMAGEN DEL CONTENT MODEL (image) ---
        const rawImage =
          fields.image ??      // campo real del Content Type blogPage
          fields.featuredImage ??
          match.image ??
          null;

        // 1) Si ya viene como asset resuelto (tiene fields.file.url)
        let resolvedUrl = rawImage ? resolveAssetUrl(rawImage) : null;

        // 2) Si sigue siendo solo un Link (no hay fields.file), hacemos una llamada directa al asset
        if (!resolvedUrl && rawImage?.sys?.id) {
          try {
            const {
              spaceId,
              environmentId,
              deliveryToken,
              host,
            } = getContentfulConfig();

            if (spaceId && environmentId && deliveryToken) {
              const assetRes = await fetch(
                `https://${host || "cdn.contentful.com"}/spaces/${spaceId}/environments/${environmentId}/assets/${rawImage.sys.id}`,
                {
                  headers: {
                    Authorization: `Bearer ${deliveryToken}`,
                  },
                }
              );

              if (assetRes.ok) {
                const assetJson = await assetRes.json();
                resolvedUrl = resolveAssetUrl(assetJson);
              }
            }
          } catch (assetErr) {
            console.error("Error al resolver asset de imagen:", assetErr);
          }
        }

        if (isMounted) {
          setImageUrl(resolvedUrl || null);
        }

        // --- Recommended posts ---
        const recommendedField =
          fields.recommendedPosts ?? fields.recommended ?? [];

        if (Array.isArray(recommendedField)) {
          const recPosts = recommendedField
            .map((ref) => {
              const id = ref?.sys?.id;
              if (!id) return null;
              return allPosts.find((p) => p.sys?.id === id) ?? null;
            })
            .filter(Boolean);

          if (isMounted) {
            setRecommended(recPosts);
          }
        } else if (isMounted) {
          setRecommended([]);
        }
      } catch (err) {
        console.error("Error al cargar blog:", err);
        if (isMounted) {
          setError(
            err?.message ||
              "¡Lo sentimos! No se pudo cargar el detalle del blog."
          );
          setBlog(null);
          setRecommended([]);
          setImageUrl(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchBlog();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <>
        <ScrollRestoration />
        <PageHeader heading="Blog" page="Blog" />
        <p className="blogdetail__status text-center py-5">Cargando...</p>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ScrollRestoration />
        <PageHeader heading="Blog" page="Blog" />
        <p className="blogdetail__error text-center py-5">{error}</p>
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <ScrollRestoration />
        <PageHeader heading="Blog" page="Blog" />
        <p className="blogdetail__error text-center py-5">
          No se encontró información para este blog.
        </p>
      </>
    );
  }

  const fields = blog.fields ?? blog;
  const title = fields.title ?? blog.title ?? "Entrada sin título";

  const rawDate =
    fields.date ??
    blog.date ??
    blog.sys?.createdAt ??
    "";
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const body = fields.body ?? null;

  return (
    <>
      <ScrollRestoration />
      <PageHeader heading={title} page="Blog" />

      <section className="protfolio__details pb-120">
        <div className="container">
          {/* Imagen principal desde Contentful */}
          {imageUrl && (
            <div
              className="details__bigthumb mb-60"
              data-aos="fade-up"
              data-aos-duration="1000"
            >
              <img src={imageUrl} alt={title} />
            </div>
          )}

          <div className="details__textwrap">
            {/* Título + fecha */}
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1200"
            >
              <h1 className="text__boxhead">{title}</h1>
              {formattedDate && (
                <p className="bdate fz-16 pra">{formattedDate}</p>
              )}
            </div>

            {/* Contenido principal */}
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1400"
            >
              {isRichTextDoc(body) ? (
                documentToReactComponents(body, RICHTEXT_OPTIONS)
              ) : body ? (
                <p className="fz-16 pra ttext__one">{String(body)}</p>
              ) : (
                <p className="fz-16 pra ttext__one">
                  This post has no content yet.
                </p>
              )}
            </div>

            {/* Recommended posts */}
            {recommended.length > 0 && (
              <div
                className="text__box mb__cus60"
                data-aos="fade-up"
                data-aos-duration="1600"
              >
                <h3 className="text__boxhead">Recommended posts</h3>
                <ul className="challenge__list">
                  {recommended.map((post) => {
                    const f = post.fields ?? post;
                    const recTitle =
                      f.title ?? post.title ?? "Entrada sin título";
                    const rawSlug =
                      f.slug ??
                      post.slug ??
                      (recTitle ? slugify(recTitle) : post.sys?.id ?? "");
                    const recSlug =
                      typeof rawSlug === "string" && rawSlug.length
                        ? rawSlug
                        : rawSlug?.sys?.id
                        ? slugify(rawSlug.sys.id)
                        : "";
                    const href = recSlug ? `/blog/${recSlug}` : "#";
                    return (
                      <li key={post.sys?.id}>
                        <Link to={href}>{recTitle}</Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default BlogDetail;
