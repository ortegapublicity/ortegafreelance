import React from "react";
import { HashLink } from "react-router-hash-link";
import { useTranslation } from "react-i18next";
import { trackCta } from "../../Utlits/track";

import bannerMan from "../../assets/img/banner/banner-man.png";

// Hero limpio: la promesa en dos líneas, una frase y los dos botones. Los
// logros van justo debajo (Results) y las redes, en el pie.
const Banner = () => {
  const { t } = useTranslation();

  return (
    <section id="home" className="banner__hero">
      <div className="container">
        <div className="banner__grid">
          <div className="banner__content">
            <h1>
              <span className="d-block">{t("banner.headline.line1")}</span>
              <span className="d-block banner__accent">{t("banner.headline.line2")}</span>
            </h1>
            <p className="banner__lead">{t("banner.lead")}</p>
            <div className="banner__actions">
              <HashLink
                smooth
                to="/#agenda"
                className="cmn--btn"
                onClick={() => trackCta("book_call", "hero")}
              >
                <span>{t("cta.bookCall")}</span>
              </HashLink>
              <HashLink
                smooth
                to="/#pricing"
                className="banner__ghost"
                onClick={() => trackCta("view_plans", "hero")}
              >
                {t("cta.viewPlans")}
              </HashLink>
            </div>
            <a className="banner__phone" href="tel:+584140419317">
              +58 414 041 9317
            </a>
          </div>
          <figure className="banner__photo">
            <img src={bannerMan} alt={t("banner.photoAlt")} width="504" height="597" />
          </figure>
        </div>
      </div>
    </section>
  );
};

export default Banner;
