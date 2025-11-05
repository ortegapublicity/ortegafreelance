// src/Components/Blogs/BlogCard/BlogCard.jsx

import React from "react";
import { Link } from "react-router-dom";

// 1. Ahora, extraemos los campos directamente del objeto 'post' (que ya es plano)
const BlogCard = ({ post }) => {
    
    // Los nombres de las propiedades deben coincidir con la salida de get-blogs.js
    const { title, description, date, slug, image } = post; 
    
    // 2. La URL de la imagen ya viene completa (https://...) desde el Serverless Function
    const imageUrl = image || '/ruta/a/imagen/por/defecto.jpg';
 
    // 3. Formato de la fecha (mantenemos tu lógica)
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
            {/* Enlace Dinámico a la plantilla de Detalle */}
            <Link to={`/blog/${slug}`} className="thumb">
                <img src={imageUrl} alt={title || "Blog Image"} />
            </Link>
            
            <div className="content">
                <span className="bdate d-flex align-items-center gap-1 ptext fz-16">
                    <span className="text-uppercase text-white">NEWS</span>. {formattedDate}
                </span>
                
                <h3>
                    {/* Título Dinámico */}
                    <Link to={`/blog/${slug}`}>{title}</Link>
                </h3>
                
                {/* Resumen Dinámico (usando 'description' del serverless) */}
                <p className="fz-16 ptext">{description}</p>
                
                {/* Botón 'Read More' con Enlace Dinámico */}
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