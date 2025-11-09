import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import defaultBlogImage from "../../../assets/img/blog/bblog1.png";
import {
  resolveAssetUrl,
  slugify,
  getContentfulConfig,
} from "../../../utils/contentfulPosts";

const truncate = (value = "", maxLength = 180) => {
  const text = value?.toString().trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
};

const BlogCard = ({ blog, index = 0 }) => {
  if (!blog) return null;

  const fields = blog.fields ?? blog;
  const [imageUrl, setImageUrl] = useState(defaultBlogImage);

  useEffect(() => {
    const loadImage = async () => {
      // primero tomamos los posibles campos de imagen
      const rawImage =
        fields.image ??
        fields.featuredImage ??
        blog.image ??
        null;

      // si ya viene resuelto, usamos directamente
      let resolvedUrl = rawImage ? resolveAssetUrl(rawImage) : null;

      // si sigue siendo un Link, intentamos resolverlo con llamada al API
      if (!resolvedUrl && rawImage?.sys?.id) {
        try {
          const { spaceId, environmentId, deliveryToken, host } =
            getContentfulConfig();

          if (spaceId && environmentId && deliveryToken) {
            const res = await fetch(
              `https://${host || "cdn.contentful.com"}/spaces/${spaceId}/environments/${environmentId}/assets/${rawImage.sys.id}`,
              {
                headers: {
                  Authorization: `Bearer ${deliveryToken}`,
                },
              }
            );
            if (res.ok) {
              const assetJson = await res.json();
              resolvedUrl = resolveAssetUrl(assetJson);
            }
          }
        } catch (err) {
          console.warn("No se pudo resolver el asset de imagen:", err);
        }
      }

      setImageUrl(resolvedUrl || defaultBlogImage);
    };

    loadImage();
  }, [fields.image]);

  const title = fields.title ?? blog.title ?? "Entrada sin título";

  const rawSlug =
    fields.slug ??
    blog.slug ??
    (title ? slugify(title) : blog.sys?.id ?? "");

  const slug =
    typeof rawSlug === "string" && rawSlug.length
      ? rawSlug
      : rawSlug?.sys?.id
      ? slugify(rawSlug.sys.id)
      : "";

  // 📅 Fecha
  const rawDate =
    fields.date ??
    blog.date ??
    blog.sys?.createdAt ??
    "";
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Fecha no disponible";

  const excerptSource =
    fields.excerpt ??
    fields.summary ??
    blog.summary ??
    blog.para ??
    "";
  const excerpt = truncate(excerptSource);

  const href = slug ? `/blog/${slug}` : "#";

  return (
    <article
      className="allblogs__card"
      data-aos="fade-up"
      data-aos-duration={900 + index * 100}
      style={{
        backgroundColor: "#AEAFB0",
        borderRadius: "1.2rem",
      }}
    >
      <Link to={href} className="allblogs__thumb">
        <img src={imageUrl} alt={title} loading="lazy" />
      </Link>

      <div className="allblogs__body">
        <div className="allblogs__meta">
          <span className="allblogs__meta-pill">{formattedDate}</span>
        </div>

        {/* Título con hover */}
        <h3 className="allblogs__title">
          <Link
            to={href}
            style={{
              color: "#000",
              textDecoration: "none",
              transition: "color 0.3s ease",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#4a6fa5")}
            onMouseLeave={(e) => (e.target.style.color = "#000")}
          >
            {title}
          </Link>
        </h3>

        <p className="allblogs__excerpt">{excerpt}</p>

        {/* "Leer más" */}
        <Link
          to={href}
          className="allblogs__cta"
          style={{
            color: "#4a6fa5",
            fontWeight: "600",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            transition: "color 0.3s ease",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#2f4f7f")}
          onMouseLeave={(e) => (e.target.style.color = "#4a6fa5")}
        >
          Leer más
          <span
            className="allblogs__cta-icon"
            style={{
              display: "inline-block",
              marginLeft: "6px",
              width: "0",
              height: "0",
              borderLeft: "8px solid #4a6fa5",
              borderTop: "5px solid transparent",
              borderBottom: "5px solid transparent",
              transform: "rotate(35deg)",
            }}
          ></span>
        </Link>
      </div>
    </article>
  );
};

export default BlogCard;
