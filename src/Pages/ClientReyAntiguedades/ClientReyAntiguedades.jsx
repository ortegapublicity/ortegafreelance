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
              <h3>Project Info</h3>
              <div className="prot__itembox">
                <div className="prot__left">
                  <div className="items mb__cus30">
                    <h5>Clients</h5>
                    <p>Danilo Rey</p>
                  </div>
                  <div className="items">
                    <h5>Date</h5>
                    <p>Dec 1, 2024</p>
                  </div>
                </div>
                <div className="prot__left">
                  <div className="items mb__cus30">
                    <h5>Category</h5>
                    <p>Media Buying</p>
                  </div>
                  <div className="items">
                    <h5>Location</h5>
                    <p>Montevideo, Uruguay</p>
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
                When I began working with ReySubastas.com in December 2024, the goal was
                to bring visibility and credibility to a luxury auction brand through 
                paid media. We focused on analyzing retention data and audience behavior 
                across Meta and Google Ads. From those insights, we built a structured 
                campaign framework designed to transform organic content into viral 
                assets that would fuel both reach and conversions.
              </p>
              <p className="fz-16 pra">
                The process started with small-scale testing. Each video ad went through 
                several stages of optimization, from concept structure to editing rhythm 
                and caption design. By identifying audience retention peaks, we learned 
                exactly when users stayed engaged. Those data points shaped future videos, 
                allowing us to produce high-performing content that turned viewers into 
                followers. Within months, costs per follower dropped to between $0.09 and 
                $0.12, thanks to efficient content loops and data-backed refinements.
              </p>
            </div>
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1600"
            >
              <h3 className="text__boxhead">As Gary Vaynerchuk once said, “Content is king, but context is God.”</h3>
              <p className="fz-16 pra ttext__one">
                Using this mindset, we took one of our viral videos past 100,000 organic views, 
                scaling it through paid exposure to over 200,000 total views. Other campaigns 
                surpassed 400,000 impressions, all driving traffic directly to the brand’s 
                Instagram profile. The account grew from 3,000 to over 7,000 followers, 
                while maintaining engagement and trust with an audience genuinely interested 
                in collectible and high-value items.
              </p>
              <p className="fz-16 pra">
                The impact was not limited to visibility. Using segmented audiences, CRM 
                integration through Mailchimp, and retargeting campaigns, ReySubastas sold 
                Rolex watches worth over $2,000 with campaigns costing as little as $60. This 
                demonstrated how data-led creativity can connect luxury with accessibility, 
                turning a local auction house into a growing digital brand with measurable 
                returns and loyal clients.
              </p>
              <h3 className="text__boxhead">Key Takeaways</h3>
              <ul className="challenge__list">
                <li>
                  Data analysis turns creativity into predictable success.
                </li>
                <li>
                  Retention peaks are the blueprint for viral content.
                </li>
                <li>
                  Paid and organic strategies amplify each other when aligned.
                </li>
                <li>
                  Structured campaigns convert engagement into measurable sales.
                </li>
              </ul>
            </div>
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1800"
            >
              <p className="fz-16 pra">
              If you want to discover how I combine creative direction, advertising strategy, 
              and analytics to generate viral growth and real revenue, explore more projects 
              on my page or book a video call to start building your next digital success story.
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
              Portfolio
            </span>
            <h2 className="fw-500" data-aos="fade-up" data-aos-duration="1000">
              Related Work
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
