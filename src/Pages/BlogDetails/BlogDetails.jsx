// BlogDetail.HireInSouthLayout.jsx (v2 fix: sin duplicar "hash")

import React, { useEffect, useMemo, useState } from "react";
import { useParams, ScrollRestoration, Link, useLocation } from "react-router-dom";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS, MARKS, INLINES } from "@contentful/rich-text-types";
import { useTranslation } from "react-i18next";
import { LOCALE_MAP } from "../../i18n";
import {
  loadContentfulPosts,
  buildFallbackPosts,
  resolveAssetUrl,
  slugify,
  getContentfulConfig,
  DEFAULT_FALLBACK_LOCALE,
} from "../../utils/contentfulPosts";

import PageHeader from "../../Components/Shared/PageHeader/PageHeader";

// ------------------------------
// Helpers
// ------------------------------
const isRichTextDoc = (value) =>
  value && typeof value === "object" && value.nodeType === "document" && Array.isArray(value.content);

const textFromNode = (node) => {
  if (!node) return "";
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(textFromNode).join(" ");
  if (node.nodeType === "text") return node.value || "";
  if (node.content) return node.content.map(textFromNode).join(" ");
  return "";
};

const estReadingTime = (body) => {
  const words = textFromNode(body).trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
};

const useReadingProgress = () => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;
      setProgress(pct);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);
  return progress;
};

const extractHeadings = (richDoc) => {
  const headings = [];
  if (!isRichTextDoc(richDoc)) return headings;
  const walk = (nodes) => {
    nodes.forEach((n) => {
      if (
        n.nodeType === BLOCKS.HEADING_1 ||
        n.nodeType === BLOCKS.HEADING_2 ||
        n.nodeType === BLOCKS.HEADING_3
      ) {
        const text = textFromNode(n).trim();
        const id = slugify(text || Math.random().toString(36).slice(2));
        headings.push({ id, text, level: n.nodeType });
      }
      if (n.content) walk(n.content);
    });
  };
  walk(richDoc.content);
  return headings;
};

const computeSlug = (entry) => {
  const f = entry?.fields ?? entry ?? {};
  const title = f.title ?? entry?.title ?? "";
  const rawSlug = f.slug ?? entry?.slug ?? (title ? slugify(title) : entry?.sys?.id ?? "");
  return typeof rawSlug === "string" && rawSlug.length
    ? rawSlug
    : rawSlug?.sys?.id
    ? slugify(rawSlug.sys.id)
    : "";
};

const findBySlug = (list, targetSlug) => {
  if (!Array.isArray(list)) return null;
  return list.find((post) => computeSlug(post) === targetSlug) ?? null;
};

// ------------------------------
// Asset helper
// ------------------------------
const fetchAssetUrlById = async (assetId) => {
  try {
    const { spaceId, environmentId, deliveryToken, host } = getContentfulConfig();
    if (!spaceId || !environmentId || !deliveryToken || !assetId) return null;
    const res = await fetch(
      `https://${host || "cdn.contentful.com"}/spaces/${spaceId}/environments/${environmentId}/assets/${assetId}`,
      { headers: { Authorization: `Bearer ${deliveryToken}` } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    return resolveAssetUrl(json);
  } catch {
    return null;
  }
};

// ------------------------------
// Component
// ------------------------------
const BlogDetail = () => {
  const { i18n, t } = useTranslation();
  const cfLocale = LOCALE_MAP[i18n.language] || DEFAULT_FALLBACK_LOCALE;

  const { slug } = useParams();
  const { hash } = useLocation(); // <-- solo una vez

  const [blog, setBlog] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [recCards, setRecCards] = useState([]); // { title, slug, img }
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [allPosts, setAllPosts] = useState([]);

  const progress = useReadingProgress();

  // Carga del post (según slug + idioma)

useEffect(() => {
  if (!slug) return;
  let mounted = true;

  setError("");
  setLoading(true);
  setBlog(null);
  setRecommended([]);
  setRecCards([]);
  setImageUrl(null);

  const run = async () => {
    try {
      // 1) Mapea idioma de i18n a Contentful
      const currentLang = i18n.language || "en";
      const contentfulLocale =
        (LOCALE_MAP && LOCALE_MAP[currentLang]) || DEFAULT_FALLBACK_LOCALE;
      const fallbackLocale = DEFAULT_FALLBACK_LOCALE;

      // 2) Trae posts en el idioma activo
      const { posts: postsActive } = await loadContentfulPosts({
        include: 5, // Aumentamos a 5 para resolver Inline Entries y Assets anidados
        locale: contentfulLocale,
      });
      if (!mounted) return;

      // 3) Intenta match por slug en el idioma activo
      let matchActive = findBySlug(postsActive, slug);

      // 4) Si no encontró, intenta en el idioma fallback
      let postsFallback = [];
      let matchFallback = null;
      if (!matchActive && contentfulLocale !== fallbackLocale) {
        const resFallback = await loadContentfulPosts({
          include: 5, // Aumentamos a 5 aquí también por si se usa el fallback
          locale: fallbackLocale,
        });
        postsFallback = resFallback.posts || [];
        matchFallback = findBySlug(postsFallback, slug);
      }

      // 5) Resolver entrada seleccionada + lista para related
      let chosen;
      if (matchActive) {
        chosen = matchActive; // ya en el idioma activo
        setAllPosts(postsActive);
      } else if (matchFallback) {
        // Busca el mismo sys.id en la lista activa para renderizar en idioma activo (si existe)
        const sameIdActive =
          postsActive.find((p) => p?.sys?.id === matchFallback?.sys?.id) || null;
        chosen = sameIdActive || matchFallback;
        // Lista base para vecinos/recomendados en el idioma activo
        setAllPosts(postsActive.length ? postsActive : postsFallback);
      } else {
        setAllPosts(postsActive);
        setError("No se encontró este blog.");
        setLoading(false);
        return;
      }

      setBlog(chosen);

      // Imagen principal
      const fields = chosen.fields ?? chosen;
      const rawImage = fields.image ?? fields.featuredImage ?? chosen.image ?? null;
      let resolvedUrl = rawImage ? resolveAssetUrl(rawImage) : null;
      if (!resolvedUrl && rawImage?.sys?.id) {
        resolvedUrl = await fetchAssetUrlById(rawImage.sys.id);
      }
      setImageUrl(resolvedUrl || null);

      // Recomendados (se resuelven por id dentro de la lista activa para mantener idioma)
      const recField = fields.recommendedPosts ?? fields.recommended ?? [];
      if (Array.isArray(recField) && recField.length) {
        const baseList = postsActive.length ? postsActive : postsFallback;
        const recPosts = recField
          .map((ref) => {
            const id = ref?.sys?.id;
            if (!id) return null;
            return baseList.find((p) => p?.sys?.id === id) ?? null;
          })
          .filter(Boolean);
        setRecommended(recPosts);
      } else {
        setRecommended([]);
      }
    } catch (err) {
      console.error("Error al cargar blog:", err);
      setError(err?.message || "¡Lo sentimos! No se pudo cargar el detalle del blog.");
    } finally {
      if (mounted) setLoading(false);
    }
  };

  run();
  return () => {
    mounted = false;
  };
  // importante: vuelve a cargar si cambia el idioma de i18n o el slug
}, [slug, i18n.language]);


  // Resolver imágenes de relacionados ASYNC
  useEffect(() => {
    const run = async () => {
      const cards = [];
      for (const post of recommended) {
        const f = post.fields ?? post;
        const title = f.title ?? post.title ?? (i18n.language === "es" ? "Entrada sin título" : "Untitled Entry");
        const rawSlug = f.slug ?? post.slug ?? (title ? slugify(title) : post.sys?.id ?? "");
        const finalSlug =
          typeof rawSlug === "string" && rawSlug.length ? rawSlug : rawSlug?.sys?.id ? slugify(rawSlug.sys.id) : "";
        let img = resolveAssetUrl(f.image ?? f.featuredImage ?? post.image);
        if (!img) {
          const assetLink = (f.image ?? f.featuredImage)?.sys?.id;
          if (assetLink) img = await fetchAssetUrlById(assetLink);
        }
        cards.push({ title, slug: finalSlug, img });
      }
      setRecCards(cards);
    };
    if (recommended && recommended.length) run();
  }, [recommended, i18n.language]);

  // Datos del post
  const fields = blog?.fields ?? blog ?? {};
  const title = fields?.title ?? blog?.title ?? t("blog.defaultTitle", "Untitled Entry");
  const rawDate = fields?.date ?? blog?.date ?? blog?.sys?.createdAt ?? "";

  const uiLocale = LOCALE_MAP[i18n.language] || "en-US";
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString(uiLocale, { year: "numeric", month: "long", day: "numeric" })
    : "";

  const body = fields?.body ?? null;

  const headings = useMemo(() => extractHeadings(body), [body]);
  const readingMinutes = useMemo(() => (isRichTextDoc(body) ? estReadingTime(body) : 1), [body]);

  // Scroll a hash si llega en URL (reutiliza la variable 'hash')
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.replace("#", ""));
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }, [hash]);

  // Render Rich Text con anchors, assets Y ENTRIES
  const RICHTEXT_OPTIONS = useMemo(
    () => ({
      renderMark: {
        [MARKS.BOLD]: (text) => <strong>{text}</strong>,
        [MARKS.ITALIC]: (text) => <em>{text}</em>,
        [MARKS.UNDERLINE]: (text) => <u>{text}</u>,
        [MARKS.CODE]: (text) => <code className="bd__code">{text}</code>,
      },
      renderNode: {
        [BLOCKS.HEADING_1]: (node, children) => {
          const text = textFromNode(node).trim();
          const id = slugify(text);
          return <h2 id={id} className="text__boxhead bdh2">{children}</h2>;
        },
        [BLOCKS.HEADING_2]: (node, children) => {
          const text = textFromNode(node).trim();
          const id = slugify(text);
          return <h3 id={id} className="text__boxhead bdh3">{children}</h3>;
        },
        [BLOCKS.HEADING_3]: (node, children) => {
          const text = textFromNode(node).trim();
          const id = slugify(text);
          return <h4 id={id} className="text__boxhead bdh4">{children}</h4>;
        },
        [BLOCKS.PARAGRAPH]: (node, children) => <p className="bd__p">{children}</p>,
        [BLOCKS.UL_LIST]: (node, children) => <ul className="bd__ul">{children}</ul>,
        [BLOCKS.OL_LIST]: (node, children) => <ol className="bd__ol">{children}</ol>,
        [BLOCKS.LIST_ITEM]: (node, children) => <li>{children}</li>,
        [BLOCKS.QUOTE]: (node, children) => (
          <blockquote className="bd__quote"><p>{children}</p></blockquote>
        ),
        [BLOCKS.EMBEDDED_ASSET]: (node) => {
          const url = resolveAssetUrl(node?.data?.target);
          const alt = node?.data?.target?.fields?.title || title;
          if (!url) return null;
          return (
            <figure className="bd__figure">
              <img src={url} alt={alt} loading="lazy" />
              {alt ? <figcaption>{alt}</figcaption> : null}
            </figure>
          );
        },
        
        // --- CORRECCIÓN AQUÍ: Manejo de Entry en Bloque ---
        [BLOCKS.EMBEDDED_ENTRY]: (node) => {
          // 1. Obtenemos el ID de la referencia
          const targetId = node.data.target?.sys?.id;
          
          // 2. Buscamos el post completo en 'allPosts' para tener acceso a 'fields' (slug, imagen, titulo)
          // Si no está en allPosts, usamos node.data.target como fallback (aunque probablemente esté incompleto)
          const resolvedEntry = allPosts.find(p => p.sys.id === targetId) || node.data.target;

          if (!resolvedEntry) return null;

          const f = resolvedEntry.fields ?? resolvedEntry;
          
          // Título real
          const entryTitle = f.title || (i18n.language === "es" ? "Entrada relacionada" : "Related Entry");
          
          // Slug real calculado con el objeto completo
          const entrySlug = computeSlug(resolvedEntry);
          
          // Imagen real
          const rawEntryImage = f.image || f.featuredImage;
          const entryImage = resolveAssetUrl(rawEntryImage);

          // Si el slug está vacío, evitamos crear un link roto
          if (!entrySlug) return null; 

          return (
            <div className="bd__embedded-card">
              <Link to={`/blog/${entrySlug}`} className="bd__embedded-link">
                {entryImage && (
                  <div className="bd__embedded-img">
                     <img src={entryImage} alt={entryTitle} />
                  </div>
                )}
                <div className="bd__embedded-info">
                   <span className="bd__embedded-label">{i18n.language === 'es' ? 'Leer también:' : 'Read also:'}</span>
                   <h5 className="bd__embedded-title">{entryTitle}</h5>
                </div>
              </Link>
            </div>
          );
        },

        // --- CORRECCIÓN AQUÍ: Manejo de Entry Inline ---
        [INLINES.EMBEDDED_ENTRY]: (node) => {
           const targetId = node.data.target?.sys?.id;
           const resolvedEntry = allPosts.find(p => p.sys.id === targetId) || node.data.target;
           
           if (!resolvedEntry) return null;
           
           const f = resolvedEntry.fields ?? resolvedEntry;
           const entryTitle = f.title || "Enlace";
           const entrySlug = computeSlug(resolvedEntry);
           
           if (!entrySlug) return <span>{entryTitle}</span>;

           return (
             <Link to={`/blog/${entrySlug}`} className="bd__link bd__inline-entry">
               {entryTitle}
             </Link>
           );
        },
        [INLINES.HYPERLINK]: (node, children) => {
          const url = node.data.uri;
          return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="bd__link">
              {children}
            </a>
          );
        },
      },
    }),
    [title, i18n.language, allPosts] // <--- IMPORTANTE: Agregamos allPosts aquí
  );

  // Estados
  if (loading) {
    return (
      <>
        <ScrollRestoration />
        <PageHeader heading={t("blogs.myBlogs", "Blog")} page={t("blogs.myBlogs", "Blog")} />
        <p className="blogdetail__status text-center py-5">
          {t("blogs.loadingContentfulPosts", "Loading...")}
        </p>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ScrollRestoration />
        <PageHeader heading={t("blogs.myBlogs", "Blog")} page={t("blogs.myBlogs", "Blog")} />
        <p className="blogdetail__error text-center py-5">{error}</p>
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <ScrollRestoration />
        <PageHeader heading={t("blogs.myBlogs", "Blog")} page={t("blogs.myBlogs", "Blog")} />
        <p className="blogdetail__error text-center py-5">
          {i18n.language === "es"
            ? "No se encontró información para este blog."
            : "No information was found for this blog."}
        </p>
      </>
    );
  }

  return (
    <>
      <ScrollRestoration />

      {/* Barra de progreso */}
      <div className="bd__progress" style={{ width: `${progress}%` }} />

      {/* HERO */}
      <PageHeader heading={title} page={t("blogs.myBlogs", "Blog")} />

      <section className="bd__hero mb-16" data-aos="fade-up" data-aos-duration="800">
        {imageUrl && (
          <div className="bd__heroimg">
            <img src={imageUrl} alt={title} loading="lazy" />
          </div>
        )}
        <div className="bd__meta container">
          {formattedDate && <span className="bd__date">{formattedDate}</span>}
          <span className="bd__dot">•</span>
          <span className="bd__time">
            {i18n.language === "es" ? `${readingMinutes} min de lectura` : `${readingMinutes} min read`}
          </span>
        </div>
      </section>

      {/* GRID: Sidebar izquierda + artículo (angosto) */}
      <section className="protfolio__details pb-120">
        <div className="container">
          <div className="bd__grid">
            <aside className="bd__aside">
              {/* Table of Contents */}
              {headings.length > 0 && (
                <div className="bd__toc" data-aos="fade-up" data-aos-duration="800">
                  <div className="bd__cardtitle">
                    {i18n.language === "es" ? "Índice del artículo" : "Table of Contents"}
                  </div>
                  <nav>
                    <ul>
                      {headings.map((h) => (
                        <li
                          key={h.id}
                          className={
                            h.level === BLOCKS.HEADING_3 ? "lvl-3" : h.level === BLOCKS.HEADING_2 ? "lvl-2" : "lvl-1"
                          }
                        >
                          <a href={`#${h.id}`}>{h.text}</a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>
              )}
            </aside>

            <article className="bd__article" data-aos="fade-up" data-aos-duration="1000">
              {isRichTextDoc(body) ? (
                documentToReactComponents(body, RICHTEXT_OPTIONS)
              ) : body ? (
                <p className="bd__p">{String(body)}</p>
              ) : (
                <p className="bd__p">
                  {i18n.language === "es" ? "Esta entrada aún no tiene contenido." : "This post has no content yet."}
                </p>
              )}
            </article>
          </div>

          {/* Artículos relacionados */}
          {(recCards?.length || 0) > 0 && (
            <div className="bd__related" data-aos="fade-up" data-aos-duration="900">
              <h3 className="text__boxhead">
                {i18n.language === "es" ? "Contenido relacionado del blog" : "More Blog Content"}
              </h3>
              <div className="bd__cards">
                {recCards.map(({ title, slug, img }) => {
                  const href = slug ? `/blog/${slug}` : "#";
                  return (
                    <Link key={href + title} to={href} className="bd__card">
                      {img ? <img src={img} alt={title} loading="lazy" /> : <div className="bd__ph" />}
                      <div className="bd__cardtitle">{title}</div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CSS */}
      <style>{`
        .bd__progress{position:fixed;top:0;left:0;height:3px;background:var(--theme,#111);z-index:60;transition:width .15s ease}
        .bd__heroimg img{max-width:720px;width:100%;display:block;margin:0 auto;height:auto;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.12)}
        .bd__meta{display:flex;justify-content:center;align-items:center;gap:8px;margin-top:12px;font-size:.95rem;color:rgba(0,0,0,.6)}
        .bd__dot{opacity:.6}
        .bd__grid{display:grid;grid-template-columns:300px minmax(0, 720px);gap:2rem;justify-content:center}
        @media (max-width: 1100px){.bd__grid{grid-template-columns:260px minmax(0, 680px)}}
        @media (max-width: 992px){.bd__grid{grid-template-columns:1fr}}
        .bd__aside{position:relative}
        .bd__toc{position:sticky;top:96px;background:rgba(255,255,255,.65);backdrop-filter:saturate(140%) blur(6px);border:1px solid rgba(0,0,0,.06);border-radius:12px;padding:16px}
        .bd__cardtitle{font-weight:800;margin-bottom:10px}
        .bd__toc ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
        .bd__toc a{display:block;text-decoration:none;opacity:.9}
        .bd__toc a:hover{opacity:1}
        .bd__toc .lvl-2{margin-left:12px}
        .bd__toc .lvl-3{margin-left:24px}
        .bd__article{min-width:0;max-width:720px}
        .bd__p{font-size:1.05rem;line-height:1.75;margin:0 0 1.1rem}
        .bd__ul,.bd__ol{padding-left:1.25rem;margin:0 0 1.1rem}
        .bd__quote{padding:12px 16px;border-left:3px solid rgba(0,0,0,.2);background:rgba(0,0,0,.03);border-radius:8px;margin:16px 0}
        .bd__figure{margin:20px 0}
        .bd__figure img{width:100%;border-radius:12px}
        .bd__figure figcaption{font-size:.85rem;opacity:.7;margin-top:4px}
        .bd__link{text-decoration:underline}
        .bdh2,.bdh3,.bdh4{scroll-margin-top:100px}
        .bd__code{padding:2px 6px;border-radius:6px;background:rgba(0,0,0,.06)}
        .bd__cards{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        @media (max-width: 992px){.bd__cards{grid-template-columns:1fr 1fr}}
        @media (max-width: 576px){.bd__cards{grid-template-columns:1fr}}
        .bd__card{display:block;border:1px solid rgba(0,0,0,.06);border-radius:12px;overflow:hidden;background:rgba(255,255,255,.55)}
        .bd__card img{width:100%;height:180px;object-fit:cover;display:block}
        .bd__cardtitle{padding:12px;font-weight:600}
        .bd__ph{height:180px;background:linear-gradient(90deg,#eee 25%,#f5f5f5 37%,#eee 63%);animation:shimmer 1.4s infinite}
        @keyframes shimmer{0%{background-position:-468px 0}100%{background-position:468px 0}}
      `}</style>
    </>
  );
};

export default BlogDetail;
