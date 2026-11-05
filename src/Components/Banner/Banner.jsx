import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { useTranslation } from "react-i18next";
import { trackCta } from "../../Utlits/track";

import {
  Facebook,
  Behance,
  Linkedin,
  Vimeo,
  Instagram,
  PlayFill,
} from "react-bootstrap-icons";

import bannerMan from "../../assets/img/banner/banner-man.png";
import scrollDown from "../../assets/img/banner/scroll-down.png";
import dial from "../../assets/img/banner/dial.png";
import bnArrow from "../../assets/img/banner/bn-arrow.png";
import VideoPlay from "../Shared/VideoPlay/VideoPlay";

const socalIcon = [
  {
    id: 1,
    icon: <Facebook />,
    routeIcon: "https://www.facebook.com/ortegafreelance",
  },
  {
    id: 2,
    icon: <Behance />,
    routeIcon: "https://www.behance.net/ortegapublicity/",
  },
  {
    id: 3,
    icon: <Linkedin />,
    routeIcon: "https://www.linkedin.com/in/ortegapublicity/",
  },
  {
    id: 4,
    icon: <Vimeo />,
    routeIcon: "https://www.vimeo.com/ortegapublicity/",
  },
  {
    id: 5,
    icon: <Instagram />,
    routeIcon: "https://www.instagram.com/ortegafreelance/",
  },
];
const Banner = () => {
  const { t } = useTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [position, setPosition] = useState(false);

  useEffect(() => {
    if(!position){
      setPosition(true)
    }
  }, []);

  const openLightbox = () => {
    setLightboxOpen(true);
  };

  return (
    <section id="home">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="banner__content">
              <h1>
                <span className="hone">{t("banner.headline.line1")}</span>
                <span className="d-block designers" data-text={t("banner.headline.line2")}>
                  {t("banner.headline.line2")}
                </span>
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
              <div className="video__area">
                <img src={bnArrow} className="vid__arrow" alt="img" />
                <div onClick={openLightbox} className="video__80 video-btn">
                  <i>
                    <PlayFill />
                  </i>
                </div>
                <span className="proces">{t("banner.recentResults")}</span>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div
              className={`banner__thumb  ${
                position  ? "right_up_animat" : "right_up"
              }`}
             
            >
              <img src={bannerMan} alt="man-img" />
            </div>
          </div>
        </div>
      </div>
      <div className="banner__leftinfo">
        <div className="left__infomobile">
          <a href="tel:+584140419317">
            <img src={dial} alt="" />
          </a>
          <a href="tel:+584140419317">(+58)-414-041-9317</a>
        </div>
        <div className="right__infoscroll">
          <Link className="scroll">
            {t("banner.scrollDown")}
          </Link>
          <Link className="scroll__bar">
            <img src={scrollDown} alt="img" />
          </Link>
        </div>
      </div>
      <div className="banner__rightinfo">
        <div className="right__infoscroll">
          <Link to={""} className="scroll">
            {t("banner.followMe")}
          </Link>
          <Link to={""} className="scroll__bar">
            <img src={scrollDown} alt="img" />
          </Link>
        </div>
        <div className="banner__xlsocial">
          <ul className="banner__soci d-grid justify-content-center">
            {socalIcon.map(({ icon, id, routeIcon }) => {
              return (
                <li key={id}>
                  <Link to={routeIcon} target="_blank" >
                    <i>{icon}</i>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      {lightboxOpen && (
        <VideoPlay
          setLightboxOpen={setLightboxOpen}
        />
      )}
    </section>
  );
};

export default Banner;
