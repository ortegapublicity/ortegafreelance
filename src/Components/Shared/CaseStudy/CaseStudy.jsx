import React from "react";
import { ScrollRestoration } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "react-bootstrap-icons";

import PageHeader from "../PageHeader/PageHeader";
import { trackCta } from "../../../Utlits/track";

// Plantilla de caso de estudio con la estética limpia de la página de
// Todxs Podemos Ser · Web (estilos .caseweb en Pages/ClientTodxsWeb).
// Cada página de cliente solo pasa su configuración; los textos siguen en
// src/i18n.js bajo su prefijo (ns), así que no se pierde ningún contenido.
//
// Props:
//   ns         prefijo i18n del caso ("clientbrandtop"…)
//   id         nombre corto para la analítica del botón (case_<id>)
//   hero       imagen principal
//   site       { url, label } del sitio del cliente
//   intro      claves de los párrafos del punto de partida
//   middle     { heading | quote, paragraphs } segundo bloque
//   takeaways  claves de los puntos clave
//   closing    clave del párrafo de cierre (va en la llamada a la acción)
//   video      URL de YouTube (embed), opcional
//   gallery    imágenes adicionales, opcional
const CaseStudy = ({ ns, id, hero, site, intro, middle, takeaways, closing, video, gallery = [] }) => {
  const { t } = useTranslation();
  const k = (key) => t(`${ns}.${key}`);
  const heading = k("header.heading");

  // Medio del bloque partido: el vídeo si lo hay; si no, la primera imagen.
  const splitImage = video ? null : gallery[0];
  const extraImages = video ? gallery : gallery.slice(1);

  return (
    <>
      <ScrollRestoration />
      <PageHeader heading={heading} page={k("header.page")} />

      <section className="caseweb pb-120">
        <div className="container">
          <figure className="caseweb__hero" data-aos="fade-up" data-aos-duration="900">
            <img src={hero} alt={heading} />
          </figure>

          <dl className="caseweb__info">
            {["clients", "date", "category", "location"].map((item) => (
              <div key={item}>
                <dt>{k(`projectInfo.${item}`)}</dt>
                <dd>{k(`projectInfo.${item}Value`)}</dd>
              </div>
            ))}
          </dl>
          {site && (
            <a className="caseweb__visit" href={site.url} target="_blank" rel="noopener noreferrer">
              {t("case.visit", { site: site.label })}
              <ArrowUpRight aria-hidden="true" />
            </a>
          )}

          <div className="caseweb__text">
            <h2>{t("case.start")}</h2>
            {intro.map((key) => (
              <p key={key}>{k(key)}</p>
            ))}
          </div>

          <div className="caseweb__text">
            {middle.heading && <h2>{k(middle.heading)}</h2>}
            {middle.quote && <blockquote className="caseweb__quote">{k(middle.quote)}</blockquote>}
            {middle.paragraphs.map((key) => (
              <p key={key}>{k(key)}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="caseweb pb-120">
        <div className="container">
          <div className="caseweb__split">
            {video ? (
              <div className="caseweb__shot caseweb__video" data-aos="fade-up" data-aos-duration="900">
                <iframe
                  src={video}
                  title={heading}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>
            ) : (
              splitImage && (
                <figure className="caseweb__shot" data-aos="fade-up" data-aos-duration="900">
                  <img src={splitImage} alt={heading} loading="lazy" />
                </figure>
              )
            )}
            <div className="caseweb__text">
              <h2>{k("keyTakeaways.title")}</h2>
              <ul className="caseweb__list">
                {takeaways.map((key) => (
                  <li key={key}>{k(key)}</li>
                ))}
              </ul>
            </div>
          </div>

          {extraImages.length > 0 && (
            <div className="caseweb__gallery">
              {extraImages.map((src) => (
                <figure className="caseweb__shot" key={src} data-aos="fade-up" data-aos-duration="900">
                  <img src={src} alt={heading} loading="lazy" />
                </figure>
              ))}
            </div>
          )}

          <div className="caseweb__cta">
            <h2>
              <span className="d-block">{t("case.cta.line1")}</span>
              <span className="d-block">{t("case.cta.line2")}</span>
            </h2>
            {closing && <p>{k(closing)}</p>}
            <HashLink
              smooth
              to="/#agenda"
              className="cmn--btn"
              onClick={() => trackCta("book_call", `case_${id}`)}
            >
              <span>{t("cta.bookCall")}</span>
            </HashLink>
          </div>
        </div>
      </section>
    </>
  );
};

export default CaseStudy;
