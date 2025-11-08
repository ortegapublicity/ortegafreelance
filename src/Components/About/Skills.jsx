import React from "react";
import personalInfothumb from "../../assets/img/about/personal-infothumb.png";
import figma from "../../assets/img/about/figma.png";
import word from "../../assets/img/about/word.png";
import html from "../../assets/img/about/html.png";
import boot from "../../assets/img/about/boot.png";
import { useTranslation } from "react-i18next";

const Skills = ({ isTabActive }) => {
  const { t } = useTranslation();

  const skillsList = [
    {
      id: 1,
      skill: t("skills.notion"),
      percentage: "90%",
      image: figma,
    },
    {
      id: 2,
      skill: t("skills.frontend"),
      percentage: "85%",
      image: word,
    },
    {
      id: 3,
      skill: t("skills.adobesuite"),
      percentage: "90%",
      image: html,
    },
    {
      id: 4,
      skill: t("skills.paidmedia"),
      percentage: "97%",
      image: boot,
    },
  ];

  return (
    <div className={`tabitem ${isTabActive === "skills" ? "active" : ""} `}>
      <div className="about__v1wrap">
        <div className="row g-4 align-items-lg-start align-items-center">
          <div className="col-lg-5">
            <div className="about__onethumb">
              <img src={personalInfothumb} alt="img" />
            </div>
          </div>
          <div className="col-lg-7">
            <div className="about__onecontent">
              <h2>{t("skills.title")}</h2>
              <p>{t("skills.description")}</p>
              <div className="about__contactwrap">
                <div className="row g-4">
                  {skillsList.map(({ id, skill, image, percentage }) => {
                    return (
                      <div
                        key={id}
                        className="col-xxl-6 col-xl-6 col-lg-12 col-md-6"
                      >
                        <div className="abox myskill__item">
                          <div className="thumb">
                            <img src={image} alt="img" />
                          </div>
                          <div className="mys">
                            <span className="ptext fz-18 mb-15 d-block">
                              {skill}
                            </span>
                            <h1 className="fw-600">{percentage}</h1>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skills;
