import React, { useEffect, useState } from "react";
import { Link, ScrollRestoration} from "react-router-dom";
import { useTranslation } from 'react-i18next';

import { imagesList, projectList } from "../../Utlits/projectList";
import PageHeader from "../../Components/Shared/PageHeader/PageHeader";
import detailbg from "../../assets/img/protfolio/prot-detailsbig.png";
import detailbg1 from "../../assets/img/protfolio/prot-detials1.png";
import detailbg2 from "../../assets/img/protfolio/prot-detials2.png";
import ProjectCard from "../../Components/Shared/ProjectCard/ProjectCard";
import Lightbox from "../../Components/Shared/LightBox/LightBox";
import { Globe } from "react-bootstrap-icons";

const ProtfolioDetails = () => {
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
        heading={t('protfoliodetails.header.heading')}
        page={t('protfoliodetails.header.page')}
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
              <h3>{t('protfoliodetails.projectInfo.title')}</h3>
              <div className="prot__itembox">
                <div className="prot__left">
                  <div className="items mb__cus30">
                    <h5>{t('protfoliodetails.projectInfo.clients')}</h5>
                    <p>{t('protfoliodetails.projectInfo.clientsValue')}</p>
                  </div>
                  <div className="items">
                    <h5>{t('protfoliodetails.projectInfo.date')}</h5>
                    <p>{t('protfoliodetails.projectInfo.dateValue')}</p>
                  </div>
                </div>
                <div className="prot__left">
                  <div className="items mb__cus30">
                    <h5>{t('protfoliodetails.projectInfo.category')}</h5>
                    <p>{t('protfoliodetails.projectInfo.categoryValue')}</p>
                  </div>
                  <div className="items">
                    <h5>{t('protfoliodetails.projectInfo.location')}</h5>
                    <p>{t('protfoliodetails.projectInfo.locationValue')}</p>
                  </div>
                </div>
              </div>
              <ul className="social d-flex gap-3">
              <li key={"brandtop-web"}>
                    <Link to={"https://www.javitoyz.com"} target="_blank">
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
                {t('protfoliodetails.description.p1')}
              </p>
              <p className="fz-16 pra">
                {t('protfoliodetails.description.p2')}
              </p>
            </div>
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1600"
            >
              <h3 className="text__boxhead">{t('protfoliodetails.quote')}</h3>
              <p className="fz-16 pra ttext__one">
                {t('protfoliodetails.description.p3')}
              </p>
              <p className="fz-16 pra">
                {t('protfoliodetails.description.p4')}
              </p>
              <h3 className="text__boxhead">{t('protfoliodetails.keyTakeaways.title')}</h3>
              <ul className="challenge__list">
                <li>
                  {t('protfoliodetails.keyTakeaways.item1')}
                </li>
                <li>
                  {t('protfoliodetails.keyTakeaways.item2')}
                </li>
                <li>
                  {t('protfoliodetails.keyTakeaways.item3')}
                </li>
              </ul>
            </div>
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1800"
            >
              <p className="fz-16 pra">
                {t('protfoliodetails.cta')}
              </p>
            </div>
            <div
              className="details__small"
              data-aos="fade-up"
              data-aos-duration="2000"
            >
              <div className="thumb">
                <img src={detailbg1} alt="img" />
              </div>
              <div className="thumb">
                <img src={detailbg2} alt="img" />
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
              {t('protfoliodetails.relatedWork.subtitle')}
            </span>
            <h2 className="fw-500" data-aos="fade-up" data-aos-duration="1000">
              {t('protfoliodetails.relatedWork.title')}
            </h2>
          </div>

          <div className=" project__wrapone">
            {projectList
              .slice(3, 5)
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

export default ProtfolioDetails;
