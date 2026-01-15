import React from "react";
import personalInfothumb from "../../assets/img/about/personal-infothumb.png";
import { useTranslation } from "react-i18next";

const Education = ({ isTabActive }) => {
  const { t } = useTranslation();

  return (
    <div className={`tabitem ${isTabActive === "education" ? "active" : ""} `}>
      <div className="about__v1wrap">
        <div className="row g-4 align-items-lg-start align-items-center">
          <div className="col-lg-5">
            <div className="about__onethumb">
              <img src={personalInfothumb} alt="img" />
            </div>
          </div>
          <div className="col-lg-7">
            <div className="about__onecontent">
              <h2>{t("education.title")}</h2>
              <p>{t("education.description")}</p>
              <div className="exprience__box mt-30">
                <div className="exri__item">
                  <span
                    className="fz-18 fw-500 base"
                    style={{ width: "100px" }}
                  >
                    2009
                  </span>
                  <div className="expri__cont">
                    <h4 className="mb-15 text-black">
                      {t("education.cinematic.title")}
                    </h4>
                    <p className="fz-18 pra d-block">
                      {t("education.cinematic.institution")}
                    </p>
                  </div>
                </div>
                <div className="exri__item">
                  <span
                    className="fz-18 fw-500 base"
                    style={{ width: "100px" }}
                  >
                    2013
                  </span>
                  <div className="expri__cont">
                    <h4 className="mb-15 text-black">
                      {t("education.creative.title")}
                    </h4>
                    <p className="fz-18 pra d-block">
                      {t("education.creative.institution")}
                    </p>
                  </div>
                </div>
                <div className="exri__item">
                  <span
                    className="fz-18 fw-500 base"
                    style={{ width: "100px" }}
                  >
                    2009-2014
                  </span>
                  <div className="expri__cont">
                    <h4 className="mb-15 text-black">
                      {t("education.media.title")}
                    </h4>
                    <p className="fz-18 pra d-block">
                      {t("education.media.institution")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;

