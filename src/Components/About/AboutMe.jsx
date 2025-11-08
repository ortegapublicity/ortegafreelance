// This is a test comment to force re-evaluation
import React, { useEffect } from "react";
import {
  Facebook,
  Behance,
  Linkedin,
  Vimeo,
  Instagram,
} from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";

// Importamos Link de react-router-dom, aunque lo usaremos menos aquí
import { Link } from "react-router-dom"; 
import personalInfoThumb from "../../assets/img/about/personal-infothumb.png";

import AOS from "aos";
import "aos/dist/aos.css";

const AboutMe = ({ isTabActive }) => {
  const { t } = useTranslation();

  const contactInfo = [
    {
      id: 1,
      system: t("aboutme.email"),
      contact: "raul@ortegafreelance.com",
      // Nuevo campo para manejar el protocolo (mailto:)
      href: "mailto:raul@ortegafreelance.com",
    },
    {
      id: 2,
      system: t("aboutme.phone"),
      contact: "+(58) 414 041 9317",
      // Nuevo campo para manejar el protocolo (tel:)
      href: "tel:+584140419317",
    },
    {
      id: 3,
      system: t("aboutme.location"),
      contact: "San Diego, Carabobo, Venezuela",
      // Este no necesita un href, lo dejamos como texto
      href: "#", 
    },
    {
      id: 4,
      system: t("aboutme.follow"),
      socalContact: [
        { icon: <Facebook />, url: "https://www.facebook.com/ortegafreelance" },
        { icon: <Behance />, url: "https://www.behance.net/ortegapublicity/" },
        { icon: <Linkedin />, url: "https://www.linkedin.com/in/ortegapublicity/" },
        { icon: <Vimeo />, url: "https://www.vimeo.com/ortegapublicity/" },
        { icon: <Instagram />, url: "https://www.instagram.com/ortegafreelance/" },
      ],
    },
  ];

  useEffect(() => {
    AOS.init({ once: true }); // Usamos once: true para animar solo una vez
  }, []);

  return (
    <div className={`tabitem ${isTabActive === "about" ? "active" : ""} `}>
      <div className="about__v1wrap">
        <div className="row g-4 align-items-lg-start align-items-center">
          <div className="col-lg-5">
            <div
              className="about__onethumb"
              data-aos="zoom-in"
              data-aos-duration="500"
            >
              <img src={personalInfoThumb} alt="img" />
            </div>
          </div>
          <div className="col-lg-7">
            <div className="about__onecontent">
              <h2
                className="h2-head"
                data-aos="fade-up"
                data-aos-duration="500"
              >
                {t("aboutme.title")}
              </h2>
              <p
                className="p-descrip"
                data-aos="fade-up"
                data-aos-duration="500"
              >
                {t("aboutme.description")}
              </p>
              <div className="about__contactwrap">
                <div className="row g-4">
                  {contactInfo.map(({ id, contact, socalContact, system, href }) => {
                    return (
                      <div
                        key={id}
                        className="col-xxl-6 col-xl-6 col-lg-12 col-md-6"
                        data-aos="zoom-in"
                        data-aos-duration="1000" // Añadido duración para zoom-in
                      >
                        <div className="abox">
                          <div className="about__contbox__item">
                            <span className="ptext fz-18 mb-20 d-block">
                              {system}
                            </span>
                            
                            {/* ✨ CORRECCIÓN: Usar <a> para email/phone/location */}
                            {contact && href && href !== '#' ? (
                                // Usar <a> con href (mailto: o tel:)
                                <a href={href} target="_blank" rel="noopener noreferrer">{contact}</a>
                            ) : (
                                // Usar Link o span para texto que no es enlace o link interno
                                <span className="contact-text">{contact}</span>
                            )}
                            
                            {socalContact && (
                              <ul className="d-flex align-items-center gap-2 gap-xl-4">
                                {socalContact.map((info, index) => (
                                  <li key={index}>
                                    {/* ✨ CORRECCIÓN: Usar <a> para redes sociales */}
                                    <a 
                                      href={info.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                    >
                                      {info.icon} 
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMe;
