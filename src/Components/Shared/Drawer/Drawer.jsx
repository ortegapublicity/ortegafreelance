import React from "react";
import { XLg, ChevronRight } from "react-bootstrap-icons";
import logo from "../../../assets/img/logo/logo.png";
import { useTranslation } from "react-i18next";
import { socialIcons } from "../../../Utlits/socilIcons";
import { Link } from "react-router-dom"; // Se mantiene para enlaces de navegación interna

const Drawer = ({ isSidebarActive, setIsSidebarActive }) => {
  const { t } = useTranslation();
  return (
    <div className={`subside__barmenu ${isSidebarActive ? "active" : ""}`}>
      <div
        onClick={() => setIsSidebarActive(false)}
        className="remove__click d-flex justify-content-center align-items-center"
      >
        <i>
          <XLg />
        </i>
      </div>
      <div className="sub__contact__wrapper d-grid">
        {/* Usar Link si el logo lleva a la página de inicio ('/') o a '' si es el mismo archivo */}
        <Link to={"/"} className="side-logo"> 
          <img src={logo} alt="img" />
        </Link>
        <p>
          {t('drawer.intro')}
        </p>
        <div className="sub__contact-left d-grid">
          <div className="sub__contac-item">
            <div className="content">
              <span className="address d-block"> {t('drawer.address')} </span>
              <span className="textp"> San Diego, Carabobo, Venezuela </span>
            </div>
          </div>
          <div className="sub__contac-item">
            <div className="content">
              <span className="address d-block"> {t('drawer.email')} </span>
              {/* ✨ CORRECCIÓN: Usar <a> con mailto: */}
              <a href="mailto:raul@ortegafreelance.com" className="textp"> raul@ortegafreelance.com </a>
            </div>
          </div>
          <div className="sub__contac-item">
            <div className="content">
              <span className="address d-block"> {t('drawer.callNow')} </span>
              {/* ✨ CORRECCIÓN: Usar <a> con tel: */}
              <a href="tel:+584140419317" className="textp"> +58 414 041 9317 </a>
            </div>
          </div>
        </div>
        <div className="sub__contact-right mb-80 position-relative">
          <ul className="social d-flex gap-3">
            {/* ✨ CORRECCIÓN: Desestructuración y uso de la URL */}
            {socialIcons.map(({ icon, id, routeIcon }) => (
              <li key={id}>
                <a 
                  href={routeIcon}           
                  target="_blank"            
                  rel="noopener noreferrer"  
                >
                  <i>{icon}</i>
                </a>
              </li>
            ))}
          </ul>
        </div>
        <a // 
          href="https://calendly.com/ortegapublicity/meeting?back=1&month=2025-10" // va a Calendly
          target="_blank"
          rel="noopener noreferrer"
          className="d-flex justify-content-center fw-500 cmn--btn align-items-center gap-2"
        >
          <span>
            <i>
              <ChevronRight />
            </i>
          </span>
          <span className="get__text">{t('header.letsTalk')}</span>
        </a>
      </div>
    </div>
  );
};

export default Drawer;