import React, { useState } from "react";
import { Eye } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import defaultBlogImage from "../../assets/img/blog/bblog1.png";

const resolveAssetUrl = (asset) => {
  if (!asset) return null;

  if (Array.isArray(asset)) {
    return resolveAssetUrl(asset[0]);
  }

  if (typeof asset === "string") {
    return asset;
  }

  const url = asset?.fields?.file?.url;
  if (!url) return null;

  return url.startsWith("http") ? url : `https:${url}`;
};

const Blog = ({ post, index }) => {
  const [currentId, setCurrentId] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const fields = post?.fields ?? {};
  const { title = "Entrada sin titulo", date, slug = "", featuredImage } = fields;

  const imageUrl = resolveAssetUrl(featuredImage) || defaultBlogImage;

  const formattedDate = date ? new Date(date).toLocaleDateString() : "";
  const blogHref = slug ? `/blog/${slug}` : "#";

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
      {/* Lightbox placeholder: add implementation when ready */}
    </>
  );
};

export default Blog;
