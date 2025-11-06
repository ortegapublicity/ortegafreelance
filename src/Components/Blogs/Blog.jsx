import React, { useState } from "react";
import { Eye } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

const Blog = ({ post, index }) => {
  const [currentId, setCurrentId] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const fields = post?.fields ?? {};
  const { title = "Entrada sin título", date, slug = "", featuredImage } = fields;

  const imageUrl = featuredImage?.fields?.file?.url
    ? `https:${featuredImage.fields.file.url}`
    : "placeholder.jpg";

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
