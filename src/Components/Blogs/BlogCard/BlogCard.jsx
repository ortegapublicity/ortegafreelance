// src/Components/Blogs/BlogCard/BlogCard.jsx
import React from "react";
import { Link } from "react-router-dom";

const BlogCard = ({ blog }) => {
  if (!blog) {
    return <div>Loading blog...</div>;
  }

  const { title, summary, date, slug, image } = blog;

  // Verificamos la URL de imagen
  const imageUrl = image
    ? image
    : "/ruta/a/imagen/por/defecto.jpg";

  // Formateamos la fecha
  const formattedDate = date
    ? new Date(date).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Fecha no disponible";

  return (
    <div
      className="blog__bitem mb__cus50"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <Link to={`/blog/${slug}`} className="thumb">
        <img src={imageUrl} alt={title || "Blog Image"} />
      </Link>

      <div className="content">
        <span className="bdate d-flex align-items-center gap-1 ptext fz-16">
          <span className="text-uppercase text-white">NEWS</span>. {formattedDate}
        </span>
        <h3>
          <Link to={`/blog/${slug}`}>{title}</Link>
        </h3>
        <p className="fz-16 ptext">{summary}</p>

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
