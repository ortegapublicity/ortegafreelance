import React from "react";
import { Link } from "react-router-dom";
import defaultBlogImage from "../../../assets/img/blog/bblog1.png";
import { resolveAssetUrl, slugify } from "../../../utils/contentfulPosts";

const truncate = (value = "", maxLength = 180) => {
  const text = value?.toString().trim();
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength - 3)}...` : text;
};

const BlogCard = ({ blog, index = 0 }) => {
  if (!blog) {
    return null;
  }

  const fields = blog.fields ?? blog;

  const title = fields.title ?? blog.title ?? "Entrada sin titulo";
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
  const rawDate = fields.date ?? blog.date ?? "";
  const excerptSource =
    fields.excerpt ??
    fields.summary ??
    blog.summary ??
    blog.para ??
    "";
  const excerpt = truncate(excerptSource);

  const imageUrl =
    resolveAssetUrl(fields.featuredImage) ??
    blog.image ??
    defaultBlogImage;

  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Fecha no disponible";

  const href = slug ? `/blog/${slug}` : "#";

  return (
    <article
      className="allblogs__card"
      data-aos="fade-up"
      data-aos-duration={900 + index * 100}
    >
      <Link to={href} className="allblogs__thumb">
        <img src={imageUrl} alt={title} loading="lazy" />
      </Link>
      <div className="allblogs__body">
        <div className="allblogs__meta">
          <span className="allblogs__meta-pill">{formattedDate}</span>
        </div>
        <h3 className="allblogs__title">
          <Link to={href}>{title}</Link>
        </h3>
        <p className="allblogs__excerpt">{excerpt}</p>
        <Link to={href} className="allblogs__cta">
          Leer mas
          <span className="allblogs__cta-icon">
            <i className="bi bi-arrow-right"></i>
          </span>
        </Link>
      </div>
    </article>
  );
};

export default BlogCard;
