import React, { useState, useEffect } from "react";
import { Eye } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import defaultBlogImage from "../../assets/img/blog/bblog1.png";
import {
  resolveAssetUrl,
  slugify,
  getContentfulConfig,
} from "../../utils/contentfulPosts";

const Blog = ({ post, index = 0 }) => {
  const [currentId, setCurrentId] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(defaultBlogImage);

  if (!post) return null;

  const fields = post.fields ?? post;

  // Título
  const title = fields.title ?? post.title ?? "Entrada sin titulo";

  // Slug (misma lógica que en el resto de componentes)
  const rawSlug =
    fields.slug ??
    post.slug ??
    (title ? slugify(title) : post.sys?.id ?? "");

  const slug =
    typeof rawSlug === "string" && rawSlug.length
      ? rawSlug
      : rawSlug?.sys?.id
      ? slugify(rawSlug.sys.id)
      : "";

  const blogHref = slug ? `/blog/${slug}` : "#";

  // Fecha: usa fields.date, o post.date, o sys.createdAt
  const rawDate =
    fields.date ??
    post.date ??
    post.sys?.createdAt ??
    "";

  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // 🔹 Resolver imagen igual que en BlogCard / BlogDetails
  useEffect(() => {
    const loadImage = async () => {
      const rawImage =
        fields.image ??
        fields.featuredImage ??
        post.image ??
        null;

      let resolvedUrl = rawImage ? resolveAssetUrl(rawImage) : null;

      // Si sigue siendo un Link sin fields, llamamos al endpoint de assets
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.image, fields.featuredImage]);

  const openLightbox = (lightboxIndex) => {
    setCurrentId(lightboxIndex ?? 0);
    setLightboxOpen(true);
  };

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
              <span className="dates">{formattedDate}</span>
              <h3>
                <Link to={blogHref}>{title}</Link>
              </h3>
            </div>
          </div>
          <div className="opa__thumb imgc">
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

      {/* Lightbox queda listo para implementar más adelante */}
      {lightboxOpen && null}
    </>
  );
};

export default Blog;
