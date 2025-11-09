import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Blog from "./Blog";
import {
  buildFallbackPosts,
  loadContentfulPosts,
} from "../../utils/contentfulPosts";

const Blogs = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fallbackPosts = useMemo(() => buildFallbackPosts(), []);
  const postsToRender = posts.length ? posts : fallbackPosts;
  const cardsToRender = postsToRender.slice(0, 3);

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      setLoading(true);
      const { posts: fetchedPosts, error: fetchError } =
        await loadContentfulPosts({
          limit: 6,
        });

      if (!isMounted) return;

      setPosts(fetchedPosts ?? []);
      setError(fetchError ?? null);
      setLoading(false);
    };

    fetchPosts().catch((err) => {
      if (isMounted) {
        setError(
          err.message || "No fue posible cargar las entradas de Contentful."
        );
        setLoading(false);
      }
    });

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
                  to="/all-blog"
                >
                  <span className="box">
                    <i className="bi bi-arrow-up-right"></i>
                    <span className="textmore">More Blogs</span>
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
