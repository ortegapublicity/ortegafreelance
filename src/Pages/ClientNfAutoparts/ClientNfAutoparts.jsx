import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { imagesList, projectList } from "../../Utlits/projectList";
import PageHeader from "../../Components/Shared/PageHeader/PageHeader";
import detailbg from "../../assets/img/protfolio/nfautoparts/LOGO-DE-NF.png";
import detailbg1 from "../../assets/img/protfolio/nfautoparts/nf1.png";
import detailbg2 from "../../assets/img/protfolio/nfautoparts/nf2.png";
import ProjectCard from "../../Components/Shared/ProjectCard/ProjectCard";
import Lightbox from "../../Components/Shared/LightBox/LightBox";
import { Globe } from "react-bootstrap-icons";

const ClientNfAutoparts = () => {
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

      <PageHeader
        heading={"Driving Local Growth Through Digital Vision"}
        page="The NF Autoparts Case"
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
                    <p>Freddy Ortega</p>
                  </div>
                  <div className="items">
                    <h5>Date</h5>
                    <p>July 1, 2018</p>
                  </div>
                </div>
                <div className="prot__left">
                  <div className="items mb__cus30">
                    <h5>Category</h5>
                    <p>Digital Presence</p>
                  </div>
                  <div className="items">
                    <h5>Location</h5>
                    <p>Carabobo, Venezuela</p>
                  </div>
                </div>
              </div>
              <ul className="social d-flex gap-3">
              <li key={"brandtop-web"}>
                    <Link to={"https://www.nfautoparts.com"} target="_blank">
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
                When I started working with NF Autoparts, it was a small import company
                in Venezuela with two partners and one employee. Their main goal was to 
                strengthen the presence of their brand |CRB|, earn market trust, and reach 
                wholesalers despite local digital and logistic limitations. My role was 
                to create a strategy that combined branding, advertising, and cultural 
                relevance to transform a traditional business into a recognized 
                digital brand.
              </p>
              <p className="fz-16 pra">
                We began by connecting the brand to national pride. Through a campaign 
                called “Travel Safely,” we showcased CRB products in Venezuela’s most 
                symbolic locations, collaborating with local photographers and influencers. 
                This not only promoted tourism but also built emotional connections with 
                customers, driving sales and brand recognition among retail stores that 
                became loyal buyers.
              </p>
              <p className="fz-16 pra">
                As the strategy evolved, we shifted toward entertainment-based marketing. 
                We collaborated with emerging public figures and comedians, using the Product 
                Launch Formula to tell stories in three sequential ads: one for brand awareness, 
                one for value, and one for direct action. This approach positioned NF Autoparts 
                as a relatable, aspirational, and authentic Venezuelan brand that people 
                wanted to support.
              </p>
            </div>
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1600"
            >
              <h3 className="text__boxhead">As Philip Kotler once said, “Marketing takes a day to learn. Unfortunately, it takes a lifetime to master.” </h3>
              <p className="fz-16 pra ttext__one">
                Every asset we developed, from visuals to campaigns, was designed to drive 
                opportunity. Within a few months, Javier landed multiple high-value projects 
                that generated over $10,000 in revenue, achieving his goal of moving from 
                Uruguay to Bali and working remotely while surfing in the mornings and 
                designing by the sea in the afternoons.
              </p>
              <p className="fz-16 pra">
                That mastery paid off when a key wholesaler, Mayor Beval, joined as a major 
                partner, leading to a 30,000-dollar increase every quarter. NF Autoparts grew 
                from four employee to a full team with eight employees and ten vendors, 
                investing in BTL campaigns and sponsorships with Magallanes, one of Venezuela’s 
                most iconic baseball teams.
              </p>
              <h3 className="text__boxhead">Key Takeaways</h3>
              <ul className="challenge__list">
                <li>
                  Cultural identity can powerfully elevate brand trust and sales.
                </li>
                <li>
                  Story-driven campaigns strengthen emotional connections with customers.
                </li>
                <li>
                  Consistency in visual and strategic communication builds long-term credibility.
                </li>
                <li>
                  Local relevance paired with digital presence multiplies business growth.
                </li>
              </ul>
            </div>
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1800"
            >
              <p className="fz-16 pra">
               If you’d like to explore how I help companies evolve from local recognition to national 
               growth through strategic digital design, visit my other projects or book a video call 
               to discuss your next project and set measurable goals for your brand.
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
              .slice(1, 3)
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

export default ClientNfAutoparts;
