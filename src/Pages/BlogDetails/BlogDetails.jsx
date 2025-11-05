// src/pages/BlogDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchBlogBySlug } from "../../data/contentfulClient";

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    fetchBlogBySlug(slug).then(setBlog).catch(console.error);
  }, [slug]);

  if (!blog) return <p>Loading...</p>;

  return (
    <article className="blog-detail">
      <img src={blog.image} alt={blog.title} />
      <h1>{blog.title}</h1>
      <p className="date">{blog.date}</p>
      <div className="content">
        {blog.content || "This post has no content yet."}
      </div>
    </article>
  );
}
