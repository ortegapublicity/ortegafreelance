import React from "react";
import { ArrowRight } from "react-bootstrap-icons";
import PageHeader from "../Components/Shared/PageHeader/PageHeader";
import Accordion from "../Components/Accordion/Accordion";
import { Link } from "react-router-dom";
import serDv1 from "../assets/img/project/ser-dt.png";
import detialcontact from "../assets/img/contact/ser-detialcontact.png";
import { ScrollRestoration } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const ServiceDetails = () => {
  const { t } = useTranslation();

  const accordionList = [
    {
      id: "cmnid4",
      heading: t('serviceDetails.accordion.q1.heading'),
      para: t('serviceDetails.accordion.q1.para'),
    },
    {
      id: "cmnid5",
      heading: t('serviceDetails.accordion.q2.heading'),
      para: t('serviceDetails.accordion.q2.para'),
    },
    {
      id: "cmnid6",
      heading: t('serviceDetails.accordion.q3.heading'),
      para: t('serviceDetails.accordion.q3.para'),
    },
  ];

  return (
    <>
 
      <PageHeader heading={t('serviceDetails.header.heading')} page={t('serviceDetails.header.page')} />
      <section className="service__details overhid pb-120">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="ser__left__details">
                <div className="thumb">
                  <img src={serDv1} alt="img" />
                </div>
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  <h3 className="textt36 d-block">
                    {t('serviceDetails.intro.h3')}
                  </h3>
                  <p className="fz-16 pra ttext__one">
                    {t('serviceDetails.intro.p1')}
                  </p>
                  <p className="fz-16 pra">
                    {t('serviceDetails.intro.p2')}
                  </p>
                </div>
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  <p className="fz-16 ttext__one">
                    {t('serviceDetails.identity.p1')}
                  </p>
                  <p className="fz-16 pra">
                    {t('serviceDetails.identity.p2')}
                  </p>               
                  <p className="fz-16 ttext__one">
                    {t('serviceDetails.identity.p3')}
                  </p>
                    <h3 className="textt36 d-block">
                    {t('serviceDetails.quote')}
                  </h3>
                  <h3 className="text__boxhead">{t('serviceDetails.keyTakeaways.title')}</h3>
              <ul className="challenge__list">
                <li>
                  {t('serviceDetails.keyTakeaways.item1')}
                </li>
                <li>
                  {t('serviceDetails.keyTakeaways.item2')}
                </li>
                <li>
                  {t('serviceDetails.keyTakeaways.item3')}
                </li>
                <li>
                  {t('serviceDetails.keyTakeaways.item4')}
                </li>
              </ul>
                </div>
                <div className="ser__components">
                  <h2 className="whites mb-5">{t('serviceDetails.questions.title')}</h2>
                  <div className="accordion" id="accordionExample">
                    {accordionList.map(({ id, heading, para }) => (
                      <Accordion key={id} id={id} heading={heading} para={para} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="service__right__wrap">
                <div className="service__rightbox mb-30">
                  <h3>{t('serviceDetails.serviceList.title')}</h3>
                 {/* ✨ MODIFICACIÓN: Usamos <Link> con rutas relativas */}
                 <Link to="/Services/illustration-design" className="link__box mb-15">
                    {t('serviceDetails.serviceList.item1')}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/Services/business-branding" className="link__box mb-15">
                    {t('serviceDetails.serviceList.item2')}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/Services/web-design" className="link__box mb-15">
                    {t('serviceDetails.serviceList.item3')}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/Services/paid-media" className="link__box mb-15">
                    {t('serviceDetails.serviceList.item4')}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/Services/video-editing" className="link__box mb-15">
                    {t('serviceDetails.serviceList.item5')}
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  </div>
                  {/* FIN de MODIFICACIÓN */}
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
                      <span>{t('serviceDetails.contact.button')}</span>
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

export default ServiceDetails;
