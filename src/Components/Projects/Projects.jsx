import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Title from "../Shared/Title/Title";
import Lightbox from "../Shared/LightBox/LightBox";
import ProjectCard from "../Shared/ProjectCard/ProjectCard";
import { imagesList, projectList } from "../../Utlits/projectList";
import { Link } from "react-router-dom";

const HOME_ROUTES = ["/client-todxspodemosser-web", "/client-nfautoparts"];

const Projects = () => {
  const [currentId, setCurrentId] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openLightbox = (index) => {
    setCurrentId(index);
    setLightboxOpen(true);
  };

  const { t } = useTranslation();

  return (
    <section className="project__section pt-120 pb-120" id="projects">
      <div className="container">
        <Title
          mainTitle={t("projects.mainTitle")}
          sortTitle={t("projects.sortTitle")}
        />
        <div className=" project__wrapone">
          {/* En la home: el caso más reciente (la web nueva de TPS) y NF Autoparts.
              Se buscan por ruta, no por posición: la lista puede cambiar de orden. */}
          {HOME_ROUTES.map((route) => projectList.find((p) => p.routeList === route)).filter(Boolean).map(
            ({ heading, id, image, subHeading, routeList }) => (
              <ProjectCard
                key={id}
                image={image}
                heading={heading}
                subHeading={subHeading}
                openLightbox={openLightbox}
                index={projectList.findIndex((p) => p.id === id)}
                navigate={routeList}
              />
            )
          )}

</div>

        <div className="custom__hover">
          <Link to={"/portfolio"}
            className="hover__circle mauto"
            data-aos="zoom-out-down"
            data-aos-duration="2000"
          >
            <span className="box">
              <i className="bi bi-arrow-up-right"></i>
              <span className="textmore"> {t("projects.cta")} </span>
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
