import React, { useState } from "react";
import { Eye } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
// ... otras importaciones ...

// El componente ahora recibe una prop 'post' de Contentful
// y (opcionalmente) el índice para la lightbox.
const Blog = ({ post, index }) => { 
  const [currentId, setCurrentId] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  
  // Extrae los campos de Contentful. 
  // ¡Asegúrate de que estos nombres coincidan con los de tu Content Model!
  const { title, date, slug, featuredImage } = post.fields; 
  
  // Obtiene la URL de la imagen. La imagen de Contentful es un objeto de Asset.
  const imageUrl = featuredImage 
    ? `https:${featuredImage.fields.file.url}` 
    : 'placeholder.jpg'; // Sustituye con una imagen por defecto

  const openLightbox = (index) => {
    setCurrentId(index);
    setLightboxOpen(true);
  };
  
  // Nota: Si usas la lightbox, necesitarás adaptar `blogImages` para que use
  // las imágenes de Contentful en lugar de las estáticas.
  
  return (
    <>
      <div
        className="service__unique__item pb-40 pt-40"
        data-aos="fade-up"
        data-aos-duration="1000"
      >
        <div className="left__service">
          <div className="serial__adjust">
            <div className="cont">
              <span className="dates">
                {/* 1. Formatea la fecha de Contentful */}
                {new Date(date).toLocaleDateString()} 
              </span>
              <h3>
                {/* 2. ENLACE DINÁMICO: usa el slug para apuntar a la plantilla de detalle */}
                {/* Debes asegurar que tu router tiene la ruta /blog/:slug */}
                <Link to={`/blog/${slug}`}>{title}</Link> 
              </h3>
            </div>
          </div>
          <div className="opa__thumb imgc">
            {/* 3. IMAGEN DINÁMICA: usa la URL de Contentful */}
            <img
              src={imageUrl} 
              alt={title}
              onClick={() => openLightbox(index)}
            />
          </div>
        </div>
        <div className="common__icon imgc">
          <Eye className="i" />
        </div>
      </div>
      {/* ... Lightbox ... */}
    </>
  );
};

export default Blog;