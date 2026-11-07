import React from "react";
import { ScrollRestoration } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useTranslation } from "react-i18next";
import { ArrowUpRight } from "react-bootstrap-icons";

import PageHeader from "../../Components/Shared/PageHeader/PageHeader";
import Title from "../../Components/Shared/Title/Title";
import { trackCta } from "../../Utlits/track";
import heroImg from "../../assets/img/protfolio/todxsweb/hero.jpg";
import blogImg from "../../assets/img/protfolio/todxsweb/blog.jpg";

// Caso: la web nueva de todxspodemosser.com (noviembre de 2026). De WordPress
// en hosting compartido a Astro en Netlify, con blog editable y correo propio.
const STEPS = ["content", "site", "blog", "mail", "move"];
const INFO = ["client", "date", "category", "stack"];
const CHANGES = ["c1", "c2", "c3", "c4"];

const ClientTodxsWeb = () => {
  const { t } = useTranslation();
  const k = (key) => t(`clienttodxsweb.${key}`);

  return (
    <>
      <ScrollRestoration />
      <PageHeader heading={k("header.heading")} page={k("header.page")} />

      <section className="caseweb pb-120">
        <div className="container">
          <figure className="caseweb__hero" data-aos="fade-up" data-aos-duration="900">
            <img src={heroImg} alt={k("heroAlt")} width="1600" height="940" />
          </figure>

          <dl className="caseweb__info">
            {INFO.map((item) => (
              <div key={item}>
                <dt>{k(`info.${item}.label`)}</dt>
                <dd>{k(`info.${item}.value`)}</dd>
              </div>
            ))}
          </dl>
          <a
            className="caseweb__visit"
            href="https://todxspodemosser.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            {k("visit")}
            <ArrowUpRight aria-hidden="true" />
          </a>

          <div className="caseweb__text">
            <h2>{k("start.title")}</h2>
            <p>{k("start.p1")}</p>
            <p>{k("start.p2")}</p>
          </div>

          {/* Respalda la cifra «+$6.000» de la home (Results.jsx), que antes
              enlazaba a la página vieja de Todxs Podemos Ser. */}
          <div className="caseweb__text" id="antes">
            <h2>{k("before.title")}</h2>
            <p>{k("before.p")}</p>
          </div>
        </div>
      </section>

      <section className="caseweb__process pt-120 pb-120">
        <div className="container">
          <Title mainTitle={k("process.title")} />
          <ol className="caseweb__steps">
            {STEPS.map((step, i) => (
              <li key={step} data-aos="fade-up" data-aos-duration="800">
                <span className="caseweb__num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{k(`process.${step}.title`)}</h3>
                <p>{k(`process.${step}.text`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="caseweb pb-120">
        <div className="container">
          <div className="caseweb__split">
            <figure className="caseweb__shot" data-aos="fade-up" data-aos-duration="900">
              <img src={blogImg} alt={k("blogAlt")} width="800" height="600" loading="lazy" />
            </figure>
            <div className="caseweb__text">
              <h2>{k("changes.title")}</h2>
              <ul className="caseweb__list">
                {CHANGES.map((item) => (
                  <li key={item}>{k(`changes.${item}`)}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="caseweb__cta">
            <h2>
              <span className="d-block">{k("cta.line1")}</span>
              <span className="d-block">{k("cta.line2")}</span>
            </h2>
            <HashLink
              smooth
              to="/#agenda"
              className="cmn--btn"
              onClick={() => trackCta("book_call", "case_tps_web")}
            >
              <span>{t("cta.bookCall")}</span>
            </HashLink>
          </div>
        </div>
      </section>
    </>
  );
};

export default ClientTodxsWeb;
