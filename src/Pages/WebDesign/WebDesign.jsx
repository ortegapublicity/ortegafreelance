import React from "react";
import { ArrowRight } from "react-bootstrap-icons";
// Corregí la ruta de los imports a un estándar más común (asumiendo que los componentes están en ../Components/)
import PageHeader from "../../Components/Shared/PageHeader/PageHeader";
import Accordion from "../../Components/Accordion/Accordion";
import { Link } from "react-router-dom";
// Usaremos un placeholder de imagen por ahora
import serDv1 from "../../assets/img/project/ser-webpage.png";
import detialcontact from "../../assets/img/contact/ser-detialcontact.png";
import { ScrollRestoration } from "react-router-dom";
import { useTranslation } from "react-i18next";

const WebDesign = () => {
  const { t } = useTranslation();

  const accordionList = [
    {
      id: "cmnid4",
      heading: t("webdesign.faq.q1"),
      para: t("webdesign.faq.a1"),
    },
    {
      id: "cmnid5",
      heading: t("webdesign.faq.q2"),
      para: t("webdesign.faq.a2"),
    },
    {
      id: "cmnid6",
      heading: t("webdesign.faq.q3"),
      para: t("webdesign.faq.a3"),
    },
  ];

  return (
    <>
      {/* ✨ Texto del encabezado corregido para reflejar el servicio */}
      <PageHeader
        heading={t("webdesign.header.heading")}
        page={t("webdesign.header.page")}
      />
      <section className="service__details overhid pb-120">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="ser__left__details">
                <div className="thumb">
                  <img src={serDv1} alt="Web Design Thumb" />
                </div>
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  {/* ✨ Texto del servicio corregido */}
                  <h3 className="textt36 d-block">
                    {t("webdesign.about.title")}
                  </h3>
                  <p className="fz-16 pra ttext__one">
                    {t("webdesign.about.p1")}
                  </p>
                  <p className="fz-16 pra">{t("webdesign.about.p2")}</p>
                </div>
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  {/* ✨ Texto del servicio corregido */}
                  <h3 className="textt36 d-block">
                    {t("webdesign.process.title")}
                  </h3>
                  <p className="fz-16 pra">{t("webdesign.process.p1")}</p>
                </div>

                <div className="ser__components">
                  <h2 className="whites mb-5">{t("webdesign.faq.title")}</h2>
                  <div className="accordion" id="accordionExample">
                    {accordionList.map(({ id, heading, para }) => (
                      <Accordion
                        key={id}
                        id={id}
                        heading={heading}
                        para={para}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* El Service List que actúa como navegación se mantiene igual */}
            <div className="col-lg-4">
              <div className="service__right__wrap">
                <div className="service__rightbox mb-30">
                  <h3>{t("videoediting.servicelist.title")}</h3>
                  {/* ✨ MODIFICACIÓN: Usamos <Link> con rutas relativas */}
                  <Link
                    to="/services/illustration-design"
                    className="link__box mb-15"
                  >
                    {t("videoediting.servicelist.item1")}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link
                    to="/services/business-branding"
                    className="link__box mb-15"
                  >
                    {t("videoediting.servicelist.item2")}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/web-design" className="link__box mb-15">
                    {t("videoediting.servicelist.item3")}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/paid-media" className="link__box mb-15">
                    {t("videoediting.servicelist.item4")}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/video-editing" className="link__box mb-15">
                    {t("videoediting.servicelist.item5")}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  {/* FIN de MODIFICACIÓN */}
                </div>
                <div className="service__rightbox">
                  <div className="thumb">
                    <img src={detialcontact} alt="img" />
                    <Link
                      to="/contact" // Redirige a la ruta /contact
                      className="cmn--btn"
                    >
                      <span>{t("videoediting.contact.button")}</span>
                      <span>
                        <i>
                          <ArrowRight />
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
      <ScrollRestoration />
    </>
  );
};

export default WebDesign;

