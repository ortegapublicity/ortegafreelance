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
              <h3>Project Info</h3>
              <div className="prot__itembox">
                <div className="prot__left">
                  <div className="items mb__cus30">
                    <h5>Clients</h5>
                    <p>Javier Tojo</p>
                  </div>
                  <div className="items">
                    <h5>Date</h5>
                    <p>July 12, 2023</p>
                  </div>
                </div>
                <div className="prot__left">
                  <div className="items mb__cus30">
                    <h5>Category</h5>
                    <p>Digital Presence</p>
                  </div>
                  <div className="items">
                    <h5>Location</h5>
                    <p>Montevideo, Uruguay</p>
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
                When I started working with Javier Tojo, the goal was more than 
                creating a digital presence; it was building a system that allowed 
                him to live from his art, work remotely, and attract clients from 
                the U.S. and beyond. We designed and developed www.javitoyz.com on 
                WordPress, integrating e-commerce functionality and usability tailored 
                to his artistic style. Each section was crafted to highlight his 
                personal brand and the professional value behind his visual work.
              </p>
              <p className="fz-16 pra">
                Along with the website, I produced a video presentation showcasing his 
                collaboration with Hot Buttered Elves, edited to align with his brand 
                identity and storytelling. We built Meta Ads campaigns targeting potential 
                clients in Los Angeles and added LinkedIn Ads to reach agencies and creative 
                directors. Complementing this, I managed his Meta profiles and digital assets, 
                ensuring brand consistency across every platform.
              </p>
            </div>
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1600"
            >
              <h3 className="text__boxhead">As David Ogilvy once said, “If it doesn’t sell, it isn’t creative.”</h3>
              <p className="fz-16 pra ttext__one">
                Every asset we developed, from visuals to campaigns, was designed to drive 
                opportunity. Within a few months, Javier landed multiple high-value projects 
                that generated over $10,000 in revenue, achieving his goal of moving from 
                Uruguay to Bali and working remotely while surfing in the mornings and 
                designing by the sea in the afternoons.
              </p>
              <p className="fz-16 pra">
                Every asset we developed, from visuals to campaigns, was designed to drive 
                opportunity. Within a few months, Javier landed multiple high-value projects 
                that generated over $10,000 in revenue, achieving his goal of moving from 
                Uruguay to Bali and working remotely while surfing in the mornings and 
                designing by the sea in the afternoons. This project became a clear example of 
                how structured creativity, aligned with data-driven strategy, transforms not 
                just a brand but a lifestyle. The blend of e-commerce design, ad strategy, 
                and branding clarity turned his passion into a sustainable business model 
                with freedom at its core.
              </p>
              <h3 className="text__boxhead">Key Takeaways</h3>
              <ul className="challenge__list">
                <li>
                  A cohesive digital ecosystem multiplies results.
                </li>
                <li>
                  Paid campaigns amplify creative visibility when aligned with purpose.
                </li>
                <li>
                  Branding consistency builds emotional and professional credibility.
                </li>
              </ul>
            </div>
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1800"
            >
              <p className="fz-16 pra">
                If you’d like to learn more about how I approach digital transformation for 
                creative professionals, explore more insights on my projects or book a video 
                call to discuss your next project and how we can scale it together.
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
              Portfolio
            </span>
            <h2 className="fw-500" data-aos="fade-up" data-aos-duration="1000">
              Related Work
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
