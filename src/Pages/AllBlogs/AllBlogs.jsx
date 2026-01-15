import React, { useEffect, useMemo, useState } from "react";
import { ScrollRestoration } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BlogCard from "../../Components/Blogs/BlogCard/BlogCard";
import {
  buildFallbackPosts,
  loadContentfulPosts,
} from "../../utils/contentfulPosts";

const AllBlogs = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fallbackPosts = useMemo(() => buildFallbackPosts(), []);

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      try {
        const { posts: fetchedPosts, error: fetchError } =
          await loadContentfulPosts({
            include: 2,
            locale: i18n.language === "es" ? "es-ES" : "en-US",
          });

        if (!isMounted) return;

        setPosts(fetchedPosts ?? []);
        setError(fetchError ?? null);
      } catch (err) {
        if (isMounted) {
          setError(
            err.message ||
              t("blogs.contentfulError", "No fue posible cargar las entradas de Contentful.")
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, [i18n.language, t]);

  const postsToRender = posts.length ? posts : fallbackPosts;

  return (
    <>
      <ScrollRestoration />

      <section className="allblogs">
        <div className="container">
          <header
            className="allblogs__header"
            data-aos="fade-down"
            data-aos-duration="1000"
          >
            <span className="allblogs__eyebrow">
              {t("blogs.recentPosts", "Publicaciones Recientes")}
            </span>
            <h1 className="allblogs__headline">
              {i18n.language === "es"
                ? "Historias, Ideas y Aprendizajes"
                : "Stories, Ideas, and Learnings"}
            </h1>
            <p className="allblogs__intro">
              {i18n.language === "es"
                ? "Explora las últimas entradas del blog con recomendaciones útiles, procesos creativos y tácticas que ya están ayudando a otras marcas a crecer. Selecciona un artículo para profundizar en los detalles."
                : "Explore the latest blog entries with useful recommendations, creative processes, and tactics that are already helping other brands grow. Select an article to dive deeper into the details."}
            </p>
          </header>

          {loading && (
            <div className="allblogs__status" role="status">
              {t("blogs.loadingContentfulPosts", "Cargando contenido...")}
            </div>
          )}

          {error && !loading && (
            <div className="allblogs__alert" role="alert">
              {error}
            </div>
          )}

          <div className="allblogs__grid">
            {postsToRender.map((post, index) => (
              <BlogCard key={post.sys?.id ?? index} blog={post} index={index} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default AllBlogs;
