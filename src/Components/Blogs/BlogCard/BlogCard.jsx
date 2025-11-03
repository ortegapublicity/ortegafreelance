import React from "react";
import { Link } from "react-router-dom";

// 1. Cambiamos las props para recibir el objeto 'post' de Contentful
const BlogCard = ({ post }) => {
  
  // 2. Extraemos los campos necesarios de post.fields
  // ¡Asegúrate de que 'title', 'summary', 'date', 'slug' e 'featuredImage' 
  // coincidan con los IDs de los campos en tu Content Model de Contentful!
  const { title, summary, date, slug, featuredImage } = post.fields; 

  // 3. Manejo de la URL de la imagen (de un Asset de Contentful)
  const imageUrl = featuredImage 
    ? `https:${featuredImage.fields.file.url}` 
    : '/ruta/a/imagen/por/defecto.jpg'; // Ruta a una imagen local por si falla

  // 4. Formateo de la fecha (opcional, pero útil)
  const formattedDate = new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="blog__bitem mb__cus50"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      {/* 5. Enlace Dinámico a la plantilla de Detalle */}
      <Link to={`/blog/${slug}`} className="thumb">
        <img src={imageUrl} alt={title || "Blog Image"} />
      </Link>
      
      <div className="content">
        <span className="bdate d-flex align-items-center gap-1 ptext fz-16">
          <span className="text-uppercase text-white">NEWS</span>. {formattedDate}
        </span>
        <h3>
          {/* 6. Título Dinámico */}
          <Link to={`/blog/${slug}`}>{title}</Link>
        </h3>
        {/* 7. Resumen Dinámico */}
        <p className="fz-16 ptext">{summary}</p> 
        
        {/* 8. Botón 'Read More' con Enlace Dinámico */}
        <Link
          to={`/blog/${slug}`}
          className="d-flex justify-content-center fw-500 cmn--btn align-items-center gap-2"
        >
          <span className="get__text">Read More</span>
          <span>
            <i className="bi bi-arrow-right"></i>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default BlogCard;