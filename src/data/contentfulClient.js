// src/data/contentfulClient.js

// Llama a la función que devuelve todos los blogs
export async function fetchAllBlogs() {
  const response = await fetch("/.netlify/functions/get-blogs");
  if (!response.ok) throw new Error("Failed to fetch blogs");
  return await response.json();
}

// Llama a la función que devuelve un blog por slug
export async function fetchBlogBySlug(slug) {
  const response = await fetch(`/.netlify/functions/get-blog-by-slug?slug=${slug}`);
  if (!response.ok) throw new Error("Failed to fetch blog detail");
  return await response.json();
}
