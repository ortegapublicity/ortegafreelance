// src/pages/AllBlogs.jsx
import React, { useEffect, useState } from "react";
import { fetchAllBlogs } from "../../data/contentfulClient";
import { Link } from "react-router-dom";

export default function AllBlogs() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetchAllBlogs().then(setBlogs).catch(console.error);
  }, []);

  return (
    <section className="all-blogs">
      <h2>All Blogs</h2>
      <div className="blog-grid">
        {blogs.map((blog) => (
          <article key={blog.id} className="blog-card">
            <Link to={`/blog/${blog.slug}`}>
              <img src={blog.image} alt={blog.title} />
            </Link>
            <p className="date">{blog.date}</p>
            <h3>{blog.title}</h3>
            <p>{blog.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
