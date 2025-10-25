import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { imagesList, projectList } from "../../Utlits/projectList";
import PageHeader from "../../Components/Shared/PageHeader/PageHeader";
import detailbg from "../../assets/img/protfolio/prot-detailsbig.png";
import detailbg1 from "../../assets/img/protfolio/prot-detials1.png";
import detailbg2 from "../../assets/img/protfolio/prot-detials2.png";
import ProjectCard from "../../Components/Shared/ProjectCard/ProjectCard";
import Lightbox from "../../Components/Shared/LightBox/LightBox";
import { socialIcons } from "../../Utlits/socilIcons";

const ClientTodxsPodemosSer = () => {
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
        heading={"From Digital Presence to Real Impact"}
        page="Building the TodxsPodemosSer Community"
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
                    <p>Mima Cortez</p>
                  </div>
                  <div className="items">
                    <h5>Date</h5>
                    <p>August 1, 2020</p>
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
                {socialIcons.map(({ icon, id }) => (
                  <li key={id}>
                    <Link to={"https://www.todxspodemosser.com"} target="_blank">
                      <i>{icon}</i>
                    </Link>
                  </li>
                ))}
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
                When I began working on www.todxspodemosser.com, the mission was to create 
                something deeper than a digital campaign: a community. We built a WordPress 
                website that reflected inclusion, creativity, and purpose. Alongside it, we 
                created personalized emails, visual content, and paid ads for key events, 
                allowing us to host our first event in 2022 with ten attendees through a 
                minimal ad investment.
              </p>
              <p className="fz-16 pra">
                The turning point came when the content creators embraced a unique identity 
                that connected directly with young audiences between 17 and 24 years old. 
                Through consistent storytelling, we transformed simple gatherings into 
                meaningful projects like the Drawing Club, a free creative space that 
                strengthened both participation and belonging. The digital presence became 
                the foundation for something real: people connecting through purpose.
              </p>
            </div>
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1600"
            >
              <h3 className="text__boxhead">As Simon Sinek once said, “People don’t buy what you do; they buy why you do it.” y once said, A“If it doesn’t sell, it isn’t creative.”</h3>
              <p className="fz-16 pra ttext__one">
               That principle guided every strategy. We documented progress on the website, 
               shared authentic stories, and presented measurable results to international NGOs, 
               securing over $6,000 in project funding. Those investments led to two impactful 
               initiatives before political circumstances in the country shifted the 
               organization’s partnerships.
              </p>
              <p className="fz-16 pra">
                Even after that, the movement continued growing organically. With over 50 active 
                members in each ongoing activity and more than 100 attendees at the last major event, 
                a creative marketplace at the Alliance Française in Carabobo, the project proved that 
                authenticity, structure, and data-driven creativity can turn a small idea into 
                a social movement.
              </p>
              <h3 className="text__boxhead">Key Takeaways</h3>
              <ul className="challenge__list">
                <li>
                  Community growth starts with authentic storytelling and purpose.
                </li>
                <li>
                  A clear digital structure transforms online visibility into real action
                </li>
                <li>
                  Strategic content and events attract engagement and investment
                </li>
                <li>
                  Organic impact can outlast external funding when the mission is clear.
                </li>
              </ul>
            </div>
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1800"
            >
              <p className="fz-16 pra">
                If you’d like to learn how I help creative and social projects turn digital 
                strategy into real-world impact, explore more case studies on my projects or 
                book a video call to discuss your next step toward building purpose-driven 
                visibility.
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
              Protfolio
            </span>
            <h2 className="fw-500" data-aos="fade-up" data-aos-duration="1000">
              Related Work
            </h2>
          </div>

          <div className=" project__wrapone">
            {projectList
              .slice(0, 2)
              .map(({ heading, id, image, subHeading }, index) => (
                <ProjectCard
                  key={id}
                  image={image}
                  heading={heading}
                  subHeading={subHeading}
                  openLightbox={openLightbox}
                  index={index}
                />
              ))}
          </div>
        </div>
        {lightboxOpen && (
          <Lightbox
            images={imagesList}
            onClose={closeLightbox}
            currentId={currentId}
          />
        )}
      </section>
    </>
  );
};

export default ClientTodxsPodemosSer;
