// src/Pages/Blog Details/BlogDetails.jsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchBlogBySlug } from "../../data/contentfulClient";

export default function BlogDetail() {
    // Desestructurar 'slug' correctamente
    const { slug } = useParams(); 
    const [blog, setBlog] = useState(null);
    const [error, setError] = useState(false); // Nuevo estado para manejar errores

    useEffect(() => {
        // Reiniciar el estado de error al cargar
        setError(false); 
        fetchBlogBySlug(slug)
            .then(setBlog)
            .catch(err => {
                console.error("Error al cargar blog:", err);
                setBlog(null); // Asegura que el blog sea null si hay un error
                setError(true); // Activa el estado de error
            });
    }, [slug]);

    // Manejar el estado de error (si la llamada falla)
    if (error) {
        return <p>¡Lo sentimos! No se pudo cargar el detalle del blog. Vuelve más tarde.</p>;
    }

    // Manejar el estado de carga (mientras blog es null)
    if (!blog) {
        return <p>Cargando...</p>;
    }
    
    // Si llegamos aquí, 'blog' es un objeto con datos planos (title, image, content, etc.)
    return (
        <article className="blog-detail">
            {/* Usamos el encadenamiento opcional (?) en caso de que alguna propiedad falte */}
            <img src={blog?.image} alt={blog?.title || "Imagen de Blog"} />
            <h1>{blog?.title}</h1>
            <p className="date">{blog?.date}</p>
            <div className="content">
                {/* Asumiendo que blog.content es renderizado como rich text o solo texto */}
                {blog?.content || "This post has no content yet."}
            </div>
        </article>
    );
}