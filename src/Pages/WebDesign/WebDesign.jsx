import React from "react";
import { ArrowRight } from "react-bootstrap-icons";
import PageHeader from "../../Components/Shared/PageHeader/PageHeader";
import Accordion from "../../Components/Accordion/Accordion";
import { Link, ScrollRestoration } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Imágenes
import serDv1 from "../../assets/img/project/ser-webpage.png";
import detialcontact from "../../assets/img/contact/ser-detialcontact.png";
import premium from "../../assets/img/project/premium-quality.png"; // Agregado para el ícono del plan

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
                
                {/* About Section */}
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  <h3 className="textt36 d-block">
                    {t("webdesign.about.title")}
                  </h3>
                  <p className="fz-16 pra ttext__one">
                    {t("webdesign.about.p1")}
                  </p>
                  <p className="fz-16 pra">{t("webdesign.about.p2")}</p>
                </div>

                {/* Process Section */}
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  <h3 className="textt36 d-block">
                    {t("webdesign.process.title")}
                  </h3>
                  <p className="fz-16 pra">{t("webdesign.process.p1")}</p>
                  
                  {/* Pricing Card Section */}
                  <div className="row mt-4">
                    <div className="col-md-8 col-lg-7">
                      <div className="process__item price__item h-100" style={{ backgroundColor: '#00cfba', border: 'none', borderRadius: '16px', padding: '30px' }}>
                        <div className="pri__iconbox" style={{ backgroundColor: '#dcd8d8', borderRadius: '12px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                          <img src={premium} alt="Web Design Plan" style={{ maxWidth: '35px' }} />
                        </div>
                        <h4 className="mb-16" style={{ color: '#000', fontWeight: '700' }}>{t("services.pricing.plan3.name")}</h4>
                        <h2 className="big__title mb-12" style={{ color: '#000' }}>
                          $2250
                          <span style={{ fontSize: '16px', color: '#222' }}>/{t("services.pricing.time.web")}</span>
                        </h2>
                        <ul className="pri__list mb-16" style={{ listStyle: 'none', padding: 0 }}>
                          {Array.isArray(t("services.pricing.plan3.features", { returnObjects: true })) &&
                            t("services.pricing.plan3.features", { returnObjects: true }).map((item, index) => (
                              <li key={index} className="mb-2" style={{ color: '#000', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="bi bi-check2-circle"></i> {item}
                              </li>
                            ))
                          }
                        </ul>
                        <p className="price__result mb-4" style={{ color: '#000', fontStyle: 'italic', fontSize: '14px' }}>{t("services.pricing.plan3.result")}</p>
                        <Link
                          to="/checkout"
                          state={{ planName: t("services.pricing.plan3.name"), price: "$2250" }}
                          className="cmn--btn d-flex align-items-center justify-content-center gap-2 w-100"
                          style={{ backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '12px' }}
                        >
                          <span>{t("price.button", { defaultValue: "Start Now" })}</span>
                          <i className="bi bi-arrow-right fz-20"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FAQ / Accordion */}
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

            {/* Right Column (Service List & Contact) */}
            <div className="col-lg-4">
              <div className="service__right__wrap">
                <div className="service__rightbox mb-30">
                  <h3>{t("videoediting.servicelist.title")}</h3>
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
                </div>
                
                <div className="service__rightbox">
                  <div className="thumb">
                    <img src={detialcontact} alt="img" />
                    <Link
                      to="/contact"
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