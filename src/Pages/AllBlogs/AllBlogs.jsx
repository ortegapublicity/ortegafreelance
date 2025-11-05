// src/Pages/AllBlogs/AllBlogs.jsx
import React, { useEffect, useState } from "react";
import { fetchAllBlogs } from "../../data/contentfulClient";
import BlogCard from "../../Components/Blogs/BlogCard/BlogCard";

export default function AllBlogs() {
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    fetchAllBlogs()
      .then((data) => {
        console.log("BLOGS DATA:", data); // ✅ verifica aquí que llegan bien
        setBlogs(data);
      })
      .catch(console.error);
  }, []);

  if (!blogs || blogs.length === 0) {
    return <p>Loading blogs...</p>;
  }

  return (
    <section className="all-blogs">
      <h2>All Blogs</h2>
      <div className="blog-grid">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>
    </section>
  );
}
