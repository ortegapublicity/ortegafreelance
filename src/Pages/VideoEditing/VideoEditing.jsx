import React from "react";
import { ArrowRight } from "react-bootstrap-icons";
import PageHeader from "../../Components/Shared/PageHeader/PageHeader"; 
import Accordion from "../../Components/Accordion/Accordion";
import { Link, ScrollRestoration } from "react-router-dom";
import detialcontact from "../../assets/img/contact/ser-detialcontact.png";
import { useTranslation } from "react-i18next";

const VideoEditing = () => {
  const { t } = useTranslation();

  const accordionList = [
    {
      id: "ved1",
      heading: t("videoediting.faq.q1"),
      para: t("videoediting.faq.a1"),
    },
    {
      id: "ved2",
      heading: t("videoediting.faq.q2"),
      para: t("videoediting.faq.a2"),
    },
    {
      id: "ved3",
      heading: t("videoediting.faq.q3"),
      para: t("videoediting.faq.a3"),
    },
  ];

  return (
    <>
      <PageHeader
        heading={t("videoediting.header.heading")}
        page={t("videoediting.header.page")}
      />
      <section className="service__details overhid pb-120">
        <div className="container">
          <div className="row g-4">
            {/* Left Column */}
            <div className="col-lg-8">
              <div className="ser__left__details">
                <div className="paythumb position-relative">
                  <iframe
                    width="100%"
                    height="450"
                    src="https://player.vimeo.com/video/1115670837?h=6497b234ab"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ zIndex: 9999, position: "relative" }}
                  ></iframe>
                </div>

                {/* About Section */}
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  <h3 className="textt36 d-block">
                    {t("videoediting.about.title")}
                  </h3>
                  <p className="fz-16 pra ttext__one">
                    {t("videoediting.about.p1")}
                  </p>
                  <p className="fz-16 pra">{t("videoediting.about.p2")}</p>
                </div>

                {/* Process Section */}
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  <h3 className="textt36 d-block">
                    {t("videoediting.process.title")}
                  </h3>
                  <p className="fz-16 pra">{t("videoediting.process.p1")}</p>
                  <p className="fz-16 pra">{t("videoediting.process.p2")}</p>
                </div>

                {/* Embedded Video */}
                <div className="paythumb position-relative">
                  <iframe
                    width="100%"
                    height="450"
                    src="https://player.vimeo.com/video/885310167?h=f25daa1818"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ zIndex: 9999, position: "relative" }}
                  ></iframe>
                </div>

                {/* Accordion */}
                <div className="ser__components">
                  <h2 className="whites mb-5">{t("videoediting.faq.title")}</h2>
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

            {/* Right Column */}
            <div className="col-lg-4">
              <div className="service__right__wrap">
                <div className="service__rightbox mb-30">
                  <h3>{t("videoediting.servicelist.title")}</h3>
                  <Link
                    to="/services/illustration-design"
                    className="link__box mb-15"
                  >
                    {t("videoediting.servicelist.item1")}{" "}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link
                    to="/services/business-branding"
                    className="link__box mb-15"
                  >
                    {t("videoediting.servicelist.item2")}{" "}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/web-design" className="link__box mb-15">
                    {t("videoediting.servicelist.item3")}{" "}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/paid-media" className="link__box mb-15">
                    {t("videoediting.servicelist.item4")}{" "}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/video-editing" className="link__box mb-15">
                    {t("videoediting.servicelist.item5")}{" "}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                </div>

                {/* Contact Box */}
                <div className="service__rightbox">
                  <div className="thumb">
                    <img src={detialcontact} alt="img" />
                    <Link to="/contact" className="cmn--btn">
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

export default VideoEditing;
