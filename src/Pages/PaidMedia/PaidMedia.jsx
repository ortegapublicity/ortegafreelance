import React from "react";
import { ArrowRight } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import PageHeader from "../../Components/Shared/PageHeader/PageHeader"; 
import Accordion from "../../Components/Accordion/Accordion";
import { Link, ScrollRestoration } from "react-router-dom";
import serDv1 from "../../assets/img/project/ser-dv1.png"; 
import detialcontact from "../../assets/img/contact/ser-detialcontact.png";
import basic from "../../assets/img/project/basic.png";
import warranty from "../../assets/img/project/warranty.png";

const PaidMedia = () => {
  const { t } = useTranslation();

  const accordionList = [
    {
      id: "pm1",
      heading: t("service.paidmedia.faq.q1"),
      para: t("service.paidmedia.faq.a1"),
    },
    {
      id: "pm2",
      heading: t("service.paidmedia.faq.q2"),
      para: t("service.paidmedia.faq.a2"),
    },
    {
      id: "pm3",
      heading: t("service.paidmedia.faq.q3"),
      para: t("service.paidmedia.faq.a3"),
    },
    {
      id: "pm4",
      heading: t("service.paidmedia.faq.q4"),
      para: t("service.paidmedia.faq.a4"),
    },
    {
      id: "pm5",
      heading: t("service.paidmedia.faq.q5"),
      para: t("service.paidmedia.faq.a5"),
    },
  ];

  return (
    <>
      <PageHeader heading={t("service.paidmedia.heading")} page={t("service.paidmedia.subheading")} />
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
                 src="https://www.loom.com/embed/4f5baa2ee5f94283920a35c0fd805199"
                 title={t("service.paidmedia.video.title")}
                 frameBorder="0"
                 allowFullScreen
                 allow="autoplay; encrypted-media; picture-in-picture"
                  style={{
                  zIndex: 9999,
                  position: "relative",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              ></iframe>
            </div>


                {/* About Section */}
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  <h3 className="textt36 d-block">{t("service.paidmedia.about.title")}</h3>
                  <p className="fz-16 pra ttext__one">{t("service.paidmedia.about.p1")}</p>
                  <p className="fz-16 pra">{t("service.paidmedia.about.p2")}</p>
                </div>

                {/* Process Section */}
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  <h3 className="textt36 d-block">{t("service.paidmedia.process.title")}</h3>
                  <p className="fz-16 pra">{t("service.paidmedia.process.p1")}</p>
                  <p className="fz-16 pra">{t("service.paidmedia.process.p2")}</p>

                  {/* Pricing Cards Section */}
                  <div className="row g-4 mt-4">
                    {/* Plan 1 - Digital Advertising ($1050) */}
                    <div className="col-md-6">
                      <div className="process__item price__item h-100" style={{ backgroundColor: '#00cfba', border: 'none', borderRadius: '16px', padding: '30px' }}>
                        <div className="pri__iconbox" style={{ backgroundColor: '#000', borderRadius: '12px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                          <img src={basic} alt="Plan 1" style={{ maxWidth: '35px' }} />
                        </div>
                        <h4 className="mb-16" style={{ color: '#000', fontWeight: '700' }}>{t("services.pricing.plan1.name")}</h4>
                        <h2 className="big__title mb-12" style={{ color: '#000' }}>
                          $1050
                          <span style={{ fontSize: '16px', color: '#222' }}>/{t("services.pricing.time.perQuarter")}</span>
                        </h2>
                        <ul className="pri__list mb-16" style={{ listStyle: 'none', padding: 0 }}>
                          {Array.isArray(t("services.pricing.plan1.features", { returnObjects: true })) &&
                            t("services.pricing.plan1.features", { returnObjects: true }).map((item, index) => (
                              <li key={index} className="mb-2" style={{ color: '#000', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="bi bi-check2-circle"></i> {item}
                              </li>
                            ))
                          }
                        </ul>
                        <p className="price__result mb-4" style={{ color: '#000', fontStyle: 'italic', fontSize: '14px' }}>{t("services.pricing.plan1.result")}</p>
                        <Link
                          to="/checkout"
                          state={{ planName: t("services.pricing.plan1.name"), price: "$1050" }}
                          className="cmn--btn d-flex align-items-center justify-content-center gap-2 w-100"
                          style={{ backgroundColor: '#fff', color: '#000', border: 'none', borderRadius: '8px', padding: '12px' }}
                        >
                          <span>{t("price.button", { defaultValue: "Start Now" })}</span>
                          <i className="bi bi-arrow-right fz-20"></i>
                        </Link>
                      </div>
                    </div>

                    {/* Plan 2 - Complete Digital Marketing ($1650) */}
                    <div className="col-md-6">
                      <div className="process__item price__item h-100" style={{ backgroundColor: '#f4f4f4', border: '1px solid #eee', borderRadius: '16px', padding: '30px' }}>
                        <div className="pri__iconbox" style={{ backgroundColor: '#00cfba', borderRadius: '12px', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                          <img src={warranty} alt="Plan 2" style={{ maxWidth: '35px' }} />
                        </div>
                        <h4 className="mb-16" style={{ color: '#000', fontWeight: '700' }}>{t("services.pricing.plan2.name")}</h4>
                        <h2 className="big__title mb-12" style={{ color: '#000' }}>
                          $1650
                          <span style={{ fontSize: '16px', color: '#666' }}>/{t("services.pricing.time.perQuarter")}</span>
                        </h2>
                        <ul className="pri__list mb-16" style={{ listStyle: 'none', padding: 0 }}>
                          {Array.isArray(t("services.pricing.plan2.features", { returnObjects: true })) &&
                            t("services.pricing.plan2.features", { returnObjects: true }).map((item, index) => (
                              <li key={index} className="mb-2" style={{ color: '#444', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <i className="bi bi-check2-circle text-primary"></i> {item}
                              </li>
                            ))
                          }
                        </ul>
                        <p className="price__result mb-4" style={{ color: '#666', fontStyle: 'italic', fontSize: '14px' }}>{t("services.pricing.plan2.result")}</p>
                        <Link
                          to="/checkout"
                          state={{ planName: t("services.pricing.plan2.name"), price: "$1650" }}
                          className="cmn--btn d-flex align-items-center justify-content-center gap-2 w-100"
                          style={{ backgroundColor: '#00cfba', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px' }}
                        >
                          <span>{t("price.button", { defaultValue: "Start Now" })}</span>
                          <i className="bi bi-arrow-right fz-20"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="paythumb position-relative"
                  style={{
                    position: "relative",
                    paddingBottom: "56.25%", // 16:9 ratio
                    height: 0,
                    overflow: "hidden",
                    borderRadius: "12px",
                  }}
                >
                  <iframe
                    src="https://www.loom.com/embed/e8352a9f778d4c7284a75b35b233b706"
                    title={t("service.paidmedia.video.title")}
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; encrypted-media; picture-in-picture"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                     height: "100%",
                   }}
                 ></iframe>
                </div>

                {/* Accordion */}
                <div className="ser__components">
                  <h2 className="whites mb-5">{t("service.paidmedia.faq.title")}</h2>
                  <div className="accordion" id="accordionExample">
                    {accordionList.map(({ id, heading, para }) => (
                      <Accordion key={id} id={id} heading={heading} para={para} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-lg-4">
              <div className="service__right__wrap">
                <div className="service__rightbox mb-30">
                  <h3>{t("service.list.title")}</h3>
                  <Link to="/services/illustration-design" className="link__box mb-15">
                    {t("service.illustration.heading")} <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/business-branding" className="link__box mb-15">
                    {t("service.branding.heading")} <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/web-design" className="link__box mb-15">
                    {t("service.uiux.heading")} <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/paid-media" className="link__box mb-15">
                    {t("service.paidmedia.heading")} <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/video-editing" className="link__box mb-15">
                    {t("service.video.heading")} <i className="bi bi-chevron-right"></i>
                  </Link>
                </div>

                {/* Contact Box */}
                <div className="service__rightbox">
                  <div className="thumb">
                    <img src={detialcontact} alt="img" />
                    <Link to="/contact" className="cmn--btn">
                      <span>{t("contact.button")}</span>
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

export default PaidMedia;
