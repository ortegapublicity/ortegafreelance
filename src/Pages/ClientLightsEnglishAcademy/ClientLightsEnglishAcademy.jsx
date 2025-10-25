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

const ClientLightsEnglishAcademy = () => {
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
        heading={"Turning Sound Into Visual Storytelling"}
        page="Motion Video Presentation for Lights English Academy"
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
                    <p>Elizabeth Maldonado</p>
                  </div>
                  <div className="items">
                    <h5>Date</h5>
                    <p>NOV 17, 2023</p>
                  </div>
                </div>
                <div className="prot__left">
                  <div className="items mb__cus30">
                    <h5>Category</h5>
                    <p>Video Editing</p>
                  </div>
                  <div className="items">
                    <h5>Location</h5>
                    <p>Florida, Estados Unidos</p>
                  </div>
                </div>
              </div>
              <ul className="social d-flex gap-3">
                {socialIcons.map(({ icon, id }) => (
                  <li key={id}>
                    <Link to={"https://www.leaingles.com/"} target="_blank">
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
               Lights English Academy approached me with a unique challenge: to transform an audio 
               jingle created for radio into a motion video presentation for their website. The goal 
               was to give life to the brand’s voice through animation, creating a dynamic visual piece 
               hat captured the essence of learning, rhythm, and creativity. To achieve this, I used a 
               professional After Effects template as the foundation and customized it entirely to 
               match the academy’s brand identity.
              </p>
              <p className="fz-16 pra">
                I presented several motion structures until the client chose one that best reflected their 
                tone and message. From there, I personalized the animation using the academy’s brand colors, 
                logo, and image assets. The video incorporated photographs of books, classroom elements, 
                and PNG visuals that symbolized education and progress. Once approved, I refined each 
                sequence, ensuring smooth transitions and synchronized movement that reflected both 
                clarity and energy.
              </p>
            </div>
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1600"
            >
              <h3 className="text__boxhead">As Saul Bass once said, “Design is thinking made visual.” </h3>
              <p className="fz-16 pra ttext__one">
               This philosophy guided the project’s creative direction. Every motion served a purpose: 
               the logo animation, the pacing, and the use of brand colors worked together to tell the 
               story of an institution that values clarity, precision, and connection. The project was 
               completed in 45 days, with feedback cycles that ensured every detail aligned with the 
               client’s expectations and vision.
              </p>
              <p className="fz-16 pra">
               The final delivery was a high-quality video optimized for web performance, rendered through 
               Adobe Media Encoder for seamless playback on YouTube. The result was a polished, brand-aligned 
               presentation that elevated the academy’s website and reinforced its digital presence. Beyond 
               animation, this project demonstrated how motion design can transform a simple sound into a 
               visual narrative that communicates identity and emotion.
              </p>
              <h3 className="text__boxhead">Key Takeaways</h3>
              <ul className="challenge__list">
                <li>
                  Motion graphics amplify brand storytelling and recognition.
                </li>
                <li>
                  Template-based animation allows speed without losing customization.
                </li>
                <li>
                  Collaboration and iteration ensure creative precision.
                </li>
                <li>
                  Video optimization is essential for a seamless web experience.
                </li>
              </ul>
            </div>
            <div
              className="text__box mb__cus60"
              data-aos="fade-up"
              data-aos-duration="1800"
            >
              <p className="fz-16 pra">
               If you’re looking to turn your brand’s message into a visual experience through motion design and 
               animation, read more about my projects or book a video call to discuss how we can create your next 
               dynamic presentation.
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
            setLightboxOpen={setLightboxOpen}
            currentId={currentId}
          />
        )}
      </section>
    </>
  );
};

export default ClientLightsEnglishAcademy;
