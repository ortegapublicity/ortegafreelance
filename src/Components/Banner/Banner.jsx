import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

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
              <Link to={""} className="bn__currently">
                <span className="d-block">
                  {t("banner.currentlyAvailable")}
                </span>
                <span className="d-flex gap-4 align-items-center">
                  {t("banner.worldwide")}
                  <i className="bi bi-arrow-up-right"></i>
                </span>
              </Link>
              <h1>
                <span className="hone"> {t("banner.creativeVisual")}</span>
                <span className="d-block designers" data-text={t("banner.designer")}>
                  {t("banner.designer")}
                </span>
              </h1>
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
          <Link to={""}>
            <img src={dial} alt="img" />
          </Link>
          <Link to={""}>(+58)-414-041-9317</Link>
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
