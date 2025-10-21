import React from "react";
import personalInfothumb from "../../assets/img/about/personal-infothumb.png"

const Experience = ({isTabActive}) => {
  return (
    <div className={`tabitem ${isTabActive === "experience" ? "active":""} `}>
      <div className="about__v1wrap">
        <div className="row g-4 align-items-lg-start align-items-center">
          <div className="col-lg-5">
            <div className="about__onethumb">
              <img src={personalInfothumb} alt="img" />
            </div>
          </div>
          <div className="col-lg-7">
            <div className="about__onecontent">
              <h2>My Experience</h2>
              <p>
               I’ve worked with brands across real estate, antiques,
               Wholesalers and eCommerce; combining design, marketing,
               and analytics to deliver growth and measurable results.
              </p>
              <div className="exprience__box mt-30">
                <div className="exri__item">
                  <span className="fz-18 fw-500 base">from 2018</span>
                  <div className="expri__cont">
                    <h4 className="mb-15 text-black">Digital Designer</h4>
                    <p className="fz-18 pra d-block">NF Autoparts</p>
                  </div>
                </div>
                <div className="exri__item">
                  <span className="fz-18 fw-500 base">from 2021</span>
                  <div className="expri__cont">
                    <h4 className="mb-15 text-black">Digital Designer</h4>
                    <p className="fz-18 pra d-block">Todxs Podemos Ser</p>
                  </div>
                </div>
                <div className="exri__item">
                  <span className="fz-18 fw-500 base">from 2024</span>
                  <div className="expri__cont">
                    <h4 className="mb-15 text-black">Media Buyer</h4>
                    <p className="fz-18 pra d-block">Rey Antigüedades</p>
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

export default Experience;
