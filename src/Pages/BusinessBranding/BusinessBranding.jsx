import React from "react";
import { ArrowRight } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
// Corregí la ruta de los imports a un estándar más común (asumiendo que los componentes están en ../Components/)
import PageHeader from "../../Components/Shared/PageHeader/PageHeader"; 
import Accordion from "../../Components/Accordion/Accordion";
import { Link } from "react-router-dom";
// Usaremos un placeholder de imagen por ahora
import serDv1 from "../../assets/img/project/ser-dv1.png"; 
import detialcontact from "../../assets/img/contact/ser-detialcontact.png";
import { ScrollRestoration } from "react-router-dom";

const IllustrationDesign = () => { // ✨ Nombre de la función corregido: IllustrationDesign
  const { t } = useTranslation();

  const accordionList = [
    {
      id: "cmnid4",
      heading: t("service.branding.faq.q1"),
      para: t("service.branding.faq.a1"),
    },
    {
      id: "cmnid5",
      heading: t("service.branding.faq.q2"),
      para: t("service.branding.faq.a2"),
    },
    {
      id: "cmnid6",
      heading: t("service.branding.faq.q3"),
      para: t("service.branding.faq.a3"),
    },
  ];

  return (
    <>

      {/* ✨ Texto del encabezado corregido para reflejar el servicio */}
      <PageHeader heading={t("service.branding.heading")} page={t("service.branding.subheading")} />
      <section className="service__details overhid pb-120">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="ser__left__details">
                <div className="thumb">
                  <img src={serDv1} alt={t("service.branding.heading") + " Thumb"} />
                </div>
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  {/* ✨ Texto del servicio corregido */}
                  <h3 className="textt36 d-block">{t("service.branding.about.title")}</h3>
                  <p className="fz-16 pra ttext__one">{t("service.branding.para")}</p>
                  <p className="fz-16 pra">{t("service.branding.about.p2")}</p>
                </div>
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  <h3 className="textt36 d-block">{t("service.branding.process.title")}</h3>
                  <p className="fz-16 pra">{t("service.branding.process.p1")}</p>
                </div>
                <div className="paythumb position-relative">
                  <iframe
                   width="100%" // O el ancho que necesites
                   height="450" // O la altura que necesites
                   src="https://www.youtube.com/embed/uHqOZrl3yzE?si=H0Swi7NDRYGXyEFT"
                   title="YouTube video player"
                   frameBorder="0"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                   allowFullScreen
                   style={{ zIndex: 9999, position: 'relative' }}
                  >
                  </iframe>
                </div>
                <div className="ser__components">
                  <h2 className="whites mb-5">{t("service.branding.faq.title")}</h2>
                  <div className="accordion" id="accordionExample">
                    {accordionList.map(({ id, heading, para }) => (
                      <Accordion key={id} id={id} heading={heading} para={para} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* El Service List que actúa como navegación se mantiene igual */}
            <div className="col-lg-4">
              <div className="service__right__wrap">
                <div className="service__rightbox mb-30">
                  <h3>{t("service.list.title")}</h3>
                 {/* ✨ MODIFICACIÓN: Usamos <Link> con rutas relativas */}
                 <Link to="/services/illustration-design" className="link__box mb-15">
                    {t("service.illustration.heading")}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/business-branding" className="link__box mb-15">
                    {t("service.branding.heading")}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/web-design" className="link__box mb-15">
                    {t("service.uiux.heading")}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/paid-media" className="link__box mb-15">
                    {t("service.paidmedia.heading")}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/video-editing" className="link__box mb-15">
                    {t("service.video.heading")}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  {/* FIN de MODIFICACIÓN */}
                </div> 
                <div className="service__rightbox">
                  <div className="thumb">
                    <img
                      src={detialcontact}
                      alt="img"
                    />
                     <Link 
                      to="/contact" // Redirige a la ruta /contact
                      className="cmn--btn"
                    >
                      <span>{t("contact.button")}</span>
                      <span>
                        <i>
                          <ArrowRight/>
                        </i>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ScrollRestoration/>
    </>
  );
};

export default IllustrationDesign; // ✨ Nombre de la exportación corregido
