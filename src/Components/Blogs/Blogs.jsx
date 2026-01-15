import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Blog from "./Blog";
import { useTranslation } from "react-i18next";
import { LOCALE_MAP } from "../../i18n";
import {
  buildFallbackPosts,
  loadContentfulPosts,
} from "../../utils/contentfulPosts";

const Blogs = () => {
  const { t, i18n } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fallbackPosts = useMemo(() => buildFallbackPosts(), []);
  const postsToRender = posts.length ? posts : fallbackPosts;
  const cardsToRender = postsToRender.slice(0, 3);

  // Carga de posts con locale según i18n
  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        const contentfulLocale = LOCALE_MAP[i18n.language] || "en-US";

        const { posts: fetchedPosts, error: fetchError } =
          await loadContentfulPosts({
            limit: 6,
            include: 2,
            locale: contentfulLocale,
          });

        if (!isMounted) return;

        setPosts(fetchedPosts ?? []);
        setError(fetchError ?? null);
      } catch (err) {
        if (isMounted) {
          setError(
            err?.message ||
              t(
                "blogs.contentfulError",
                "No fue posible cargar las entradas de Contentful."
              )
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPosts();
    return () => {
      isMounted = false;
    };
  }, [i18n.language, t]);

  return (
    <section className="blog__section overhid pt-120 pb-120" id="blog">
      <div className="container">
        <div className="row g-4">
          {/* COLUMNA IZQUIERDA: Títulos (y botón desktop) */}
          <div className="col-xl-4 col-lg-3">
            <div className="project__head">
              <span
                className="common__sub"
                data-aos="fade-down"
                data-aos-duration="1000"
              >
                {t("blogs.myBlogs", "My Blogs")}
              </span>
              <h2
                className="fw-500 mt-3"
                data-aos="fade-down"
                data-aos-duration="1500"
              >
                {t("blogs.recentPosts", "Recent Posts")}
              </h2>

              {/* Botón solo para DESKTOP (se oculta en mobile) */}
              <div className="blog__hoverbox blog__hoverbox--desktop">
                <Link
                  className="hover__circle wow fadeInUp"
                  data-wow-duration="1.6s"
                  to="/all-blog"
                >
                  <span className="box">
                    <i className="bi bi-arrow-up-right"></i>
                    <span className="textmore">
                      {t("blogs.clickForMoreBlogs", "More Blogs")}
                    </span>
                  </span>
                </Link>

                {loading && (
                  <span className="textmore d-block mt-3">
                    {t(
                      "blogs.loadingContentfulPosts",
                      "Loading Contentful entries..."
                    )}
                  </span>
                )}

                {error && !loading && (
                  <span className="textmore d-block mt-3">{error}</span>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Blogs + botón mobile al final */}
          <div className="col-xl-8 col-lg-9">
            <div className="blog__rightwrap">
              <div className="service__uniquewrap">
                {cardsToRender.map((post, index) => (
                  <Blog key={post.sys?.id ?? index} post={post} index={index} />
                ))}
              </div>

              {/* Botón solo para MOBILE (debajo de los posts) */}
              <div className="blog__hoverbox blog__hoverbox--mobile">
                <Link
                  className="hover__circle wow fadeInUp"
                  data-wow-duration="1.6s"
                  to="/all-blog"
                >
                  <span className="box">
                    <i className="bi bi-arrow-up-right"></i>
                    <span className="textmore">
                      {t("blogs.clickForMoreBlogs", "More Blogs")}
                    </span>
                  </span>
                </Link>

                {loading && (
                  <span className="textmore d-block mt-3">
                    {t(
                      "blogs.loadingContentfulPosts",
                      "Loading Contentful entries..."
                    )}
                  </span>
                )}

                {error && !loading && (
                  <span className="textmore d-block mt-3">{error}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Solo controlamos visibilidad del botón según viewport.
          Desktop queda EXACTO como antes. */}
      <style>{`
        /* Desktop (por defecto): botón se muestra a la izquierda, el de abajo se oculta */
        .blog__hoverbox--desktop {
          display: block;
        }
        .blog__hoverbox--mobile {
          display: none;
        }

        /* Mobile: esconder botón de la izquierda y mostrar el de abajo */
        @media (max-width: 768px) {
          .blog__hoverbox--desktop {
            display: none;
          }
          .blog__hoverbox--mobile {
            display: block;
            margin-top: 2rem;
            text-align: center;
            justify-content: center; 
            align-items: center;
          }
            .blog__hoverbox--mobile .hover__circle {
            margin: 0 auto;
          }

        }
      `}</style>
    </section>
  );
};

export default Blogs;
