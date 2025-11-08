import React, { useEffect, useMemo, useState } from "react";
import BlogCard from "../../Components/Blogs/BlogCard/BlogCard";
import {
  buildFallbackPosts,
  loadContentfulPosts,
} from "../../utils/contentfulPosts";

const AllBlogs = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fallbackPosts = useMemo(() => buildFallbackPosts(), []);

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      const { posts: fetchedPosts, error: fetchError } = await loadContentfulPosts({
        include: 2,
      });

      if (!isMounted) {
        return;
      }

      setPosts(fetchedPosts ?? []);
      setError(fetchError ?? null);
      setLoading(false);
    };

    fetchPosts().catch((err) => {
      if (isMounted) {
        setError(err.message || "No fue posible cargar las entradas de Contentful.");
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const postsToRender = posts.length ? posts : fallbackPosts;

  return (
    <section className="allblogs">
      <div className="container">
        <header className="allblogs__header" data-aos="fade-down" data-aos-duration="1000">
          <span className="allblogs__eyebrow">Recent Posts</span>
          <h1 className="allblogs__headline">Stories, Ideas, and Learnings</h1>
          <p className="allblogs__intro">
            Explore the latest blog entries with useful recommendations, creative processes,
            and tactics that are already helping other brands grow. Select an article to
            dive deeper into the details.
          </p>
        </header>

        {loading && (
          <div className="allblogs__status" role="status">
            Loading content...
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
  );
};

export default AllBlogs;
