import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { imagesList, projectList } from "../../Utlits/projectList";
import PageHeader from "../../Components/Shared/PageHeader/PageHeader";
import detailbg from "../../assets/img/protfolio/Brandtop/Logo-brandtop.png";
import detailbg1 from "../../assets/img/protfolio/Brandtop/Brandtop-image.png";
import detailbg2 from "../../assets/img/protfolio/Brandtop/Brandtop-image2.png";
import ProjectCard from "../../Components/Shared/ProjectCard/ProjectCard";
import Lightbox from "../../Components/Shared/LightBox/LightBox";
import { Globe } from "react-bootstrap-icons";

const ClientBrandtop = () => {
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
        heading={"From Complexity to Clarity"}
        page="Building the BrandTop Identity"
      />
      <section className="protfolio__details pb-120">
        <div className="container">
          <div
            className="details__bigthumb mb-60 video-responsive"
            data-aos="fade-up"
            data-aos-duration="1000"
          >
             <iframe 
            width="100%" 
            height="500" 
            src="https://www.youtube.com/embed/uHqOZrl3yzE?si=nn4fah6Vq0mFu_QM" 
            title="Brandtop Video Motion" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerpolicy="strict-origin-when-cross-origin" 
            allowfullscreen>
            </iframe>
            <img src={detailbg} alt="img" />
            <div className="prot__detail__contact">
              <h3>Project Info</h3>
              <div className="prot__itembox">
                <div className="prot__left">
                  <div className="items mb__cus30">
                    <h5>Clients</h5>
                    <p>Jorge Polo</p>
                  </div>
                  <div className="items">
                    <h5>Date</h5>
                    <p>July 1, 2018</p>
                  </div>
                </div>
                <div className="prot__left">
                  <div className="items mb__cus30">
                    <h5>Category</h5>
                    <p>Branding & Marketing</p>
                  </div>
                  <div className="items">
                    <h5>Location</h5>
                    <p>Delaware, Estados Unidos</p>
                  </div>
                </div>
              </div>
              <ul className="social d-flex gap-3">
                  <li key={"brandtop-web"}>
                    <Link to={"https://www.brandtop.co"} target="_blank">
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
                When I started working with BrandTop, the challenge was clear: transform 
                a highly technical service into a message people could easily understand, 
                connect with, and buy into. The company, originally part of SAEES.tech, 
                offered advanced e-commerce optimization services for Amazon, Walmart, 
                and Etsy sellers. My first step was to observe their workflow for a week, 
                listening the process of client calls, understanding their language, and 
                identifying what truly made their service valuable.
              </p>
              <p className="fz-16 pra">
                Through this analysis, I realized that BrandTop’s essence was visual transformation,
                improving how products look and perform in digital marketplaces. This insight became 
                the foundation for their new branding. I redefined their mission and vision, connecting 
                them to the core idea of turning online listings into experiences that sell. From there, 
                I built their visual identity, editing promotional videos and reels in CapCut, creating 
                logo animations in After Effects, and structuring the content strategy that would carry 
                the brand forward.
              </p>
            </div>
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1600"
            >
              <h3 className="text__boxhead">As Marty Neumeier once said, “Branding is the process of connecting good strategy with good creativity.” That principle guided my approach. I simplified” </h3>
              <p className="fz-16 pra ttext__one">
                While my original role was as a Media Buyer, the experience proved that paid 
                media only works when supported by strategic content. A campaign needs a voice, 
                a story, and a purpose. By building BrandTop’s digital foundation first, we 
                turned ads into narratives and clicks into understanding. This project became 
                an example of how strong storytelling and branding transform not only sales, 
                but also how a business sees itself.
              </p>
              <h3 className="text__boxhead">Key Takeaways</h3>
              <ul className="challenge__list">
                <li>
                  Branding must start with clarity before advertising begins.
                </li>
                <li>
                  Understanding the client’s mission is key to creative direction.
                </li>
                <li>
                  Content built on purpose multiplies AD performance.
                </li>
                <li>
                  Simplicity and storytelling make complex services relatable.
                </li>
              </ul>
            </div>
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1800"
            >
              <p className="fz-16 pra">
               If you want to explore how I help companies define their message, 
               align their content, and scale their digital impact, read more of 
               my Projects or book a video call to discuss how we can bring clarity 
               and structure to your next brand.
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
              .slice(2, 4)
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

export default ClientBrandtop;
