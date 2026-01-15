import React, { useEffect, useState } from "react";
import { Link, ScrollRestoration } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import { imagesList, projectList } from "../../Utlits/projectList";
import PageHeader from "../../Components/Shared/PageHeader/PageHeader";
import detailbg from "../../assets/img/protfolio/reyantiguedades/reybg1.png";
import ProjectCard from "../../Components/Shared/ProjectCard/ProjectCard";
import Lightbox from "../../Components/Shared/LightBox/LightBox";
import { Globe } from "react-bootstrap-icons";

const ClientReyAntiguedades = () => {
  const { t } = useTranslation();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentId, setCurrentId] = useState(0);

  const openLightbox = (index) => {
    setCurrentId(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };
  return (
    <>
      <ScrollRestoration />
      <PageHeader
        heading={t('clientreyantiguedades.header.heading')}
        page={t('clientreyantiguedades.header.page')}
      />
      <section className="protfolio__details pb-120">
        <div className="container">
          <div
            className="details__bigthumb mb-60"
            data-aos="fade-up"
            data-aos-duration="1000"
          >
            <img src={detailbg} alt="img" />
            <div className="prot__detail__contact">
              <h3>{t('clientreyantiguedades.projectInfo.title')}</h3>
              <div className="prot__itembox">
                <div className="prot__left">
                  <div className="items mb__cus30">
                    <h5>{t('clientreyantiguedades.projectInfo.clients')}</h5>
                    <p>{t('clientreyantiguedades.projectInfo.clientsValue')}</p>
                  </div>
                  <div className="items">
                    <h5>{t('clientreyantiguedades.projectInfo.date')}</h5>
                    <p>{t('clientreyantiguedades.projectInfo.dateValue')}</p>
                  </div>
                </div>
                <div className="prot__left">
                  <div className="items mb__cus30">
                    <h5>{t('clientreyantiguedades.projectInfo.category')}</h5>
                    <p>{t('clientreyantiguedades.projectInfo.categoryValue')}</p>
                  </div>
                  <div className="items">
                    <h5>{t('clientreyantiguedades.projectInfo.location')}</h5>
                    <p>{t('clientreyantiguedades.projectInfo.locationValue')}</p>
                  </div>
                </div>
              </div>
              <ul className="social d-flex gap-3">
              <li key={"brandtop-web"}>
                    <Link to={"https://www.reysubastas.com"} target="_blank">
                      <i><Globe/></i>
                    </Link>
                  </li>
              </ul>
            </div>
          </div>
          <div className="details__textwrap">
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1400"
            >
              <p className="fz-16 pra ttext__one">
                {t('clientreyantiguedades.description.p1')}
              </p>
              <p className="fz-16 pra">
                {t('clientreyantiguedades.description.p2')}
              </p>
            </div>
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1600"
            >
              <h3 className="text__boxhead">{t('clientreyantiguedades.description.h3')}</h3>
              <p className="fz-16 pra ttext__one">
                {t('clientreyantiguedades.description.p3')}
              </p>
              <p className="fz-16 pra">
                {t('clientreyantiguedades.description.p4')}
              </p>
              <h3 className="text__boxhead">{t('clientreyantiguedades.keyTakeaways.title')}</h3>
              <ul className="challenge__list">
                <li>
                  {t('clientreyantiguedades.keyTakeaways.item1')}
                </li>
                <li>
                  {t('clientreyantiguedades.keyTakeaways.item2')}
                </li>
                <li>
                  {t('clientreyantiguedades.keyTakeaways.item3')}
                </li>
                <li>
                  {t('clientreyantiguedades.keyTakeaways.item4')}
                </li>
              </ul>
            </div>
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1800"
            >
              <p className="fz-16 pra">
              {t('clientreyantiguedades.conclusion')}
              </p>
            </div>
            <div
              className="details__small"
              data-aos="fade-up"
              data-aos-duration="2000"
            >
              <div className="thumb">
              <iframe 
            width="100%" 
            height="500" 
            src="https://www.youtube.com/embed/OUWJ34ifPxo?si=1pmUZXu4lGsTG6BH" 
            title="Brandtop Video Motion" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerpolicy="strict-origin-when-cross-origin" 
            allowfullscreen>
            </iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="protfolidetails__section cmn__bg pt-120 pb-120">
        <div className="container">
          <div className="project__head text-center">
            <span
              className="common__sub"
              data-aos="fade-down"
              data-aos-duration="1000"
            >
              {t('clientreyantiguedades.relatedWork.subtitle')}
            </span>
            <h2 className="fw-500" data-aos="fade-up" data-aos-duration="1000">
              {t('clientreyantiguedades.relatedWork.title')}
            </h2>
          </div>

          <div className=" project__wrapone">
            {projectList
              .slice(0, 2)
              .map(({ heading, id, image, subHeading, routeList }, index) => (
                <ProjectCard
                  key={id}
                  image={image}
                  heading={heading}
                  subHeading={subHeading}
                  openLightbox={openLightbox}
                  index={index}
                  navigate={routeList}
                />
              ))}
          </div>
        </div>
        {lightboxOpen && (
          <Lightbox
            images={imagesList}
            setLightboxOpen={setLightboxOpen}
            currentId={currentId}
          />
        )}
      </section>
    </>
  );
};

export default ClientReyAntiguedades;
