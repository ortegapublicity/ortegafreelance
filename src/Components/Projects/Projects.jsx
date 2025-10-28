import React, { useEffect, useState } from "react";

import Title from "../Shared/Title/Title";
import Lightbox from "../Shared/LightBox/LightBox";
import ProjectCard from "../Shared/ProjectCard/ProjectCard";
import { imagesList, projectList } from "../../Utlits/projectList";
import { Link } from "react-router-dom";

const Projects = () => {
  const [currentId, setCurrentId] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = (index) => {
    setCurrentId(index);
    setLightboxOpen(true);
  };

  return (
    <section className="project__section pt-120 pb-120" id="projects">
      <div className="container">
        <Title
          mainTitle={"Look at my portfolio and give me your feedback"}
          sortTitle={"Complete Project"}
        />
        <div className=" project__wrapone">
    {
        [
            // 1. DESESTRUCTURA (spread) el array de slice(0, 1) en el nuevo array
            ...projectList.slice(1, 2), 

            // 2. DESESTRUCTURA (spread) el array de slice(3, 4) en el nuevo array
            ...projectList.slice(3, 4), 
        ]
        // Se ejecuta el .map() sobre el array final [P1, P4]
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
        ))
  } 
</div>

        <div className="custom__hover">
          <Link to={"/portfolio"}
            className="hover__circle mauto"
            data-aos="zoom-out-down"
            data-aos-duration="2000"
          >
            <span className="box">
              <i className="bi bi-arrow-up-right"></i>
              <span className="textmore"> Click Here For More Work </span>
            </span>
          </Link>
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
  );
};

export default Projects;
