import React from "react";
import personalInfothumb from "../../assets/img/about/personal-infothumb.png"

const Education = ({isTabActive}) => {
  return (
    <div className={`tabitem ${isTabActive === "education" ? "active":""} `}>
      <div className="about__v1wrap">
        <div className="row g-4 align-items-lg-start align-items-center">
          <div className="col-lg-5">
            <div className="about__onethumb">
              <img src={personalInfothumb} alt="img" />
            </div>
          </div>
          <div className="col-lg-7">
            <div className="about__onecontent">
              <h2>My Education</h2>
              <p>
                Bachelor’s in Media and Communication. Certified in 
                Cinematic Production & Creative Design, 
                combining storytelling, branding, and digital innovation, 
                ready to bring your ideas to life with creative solutions.
              </p>
              <div className="exprience__box mt-30">
                <div className="exri__item">
                  <span className="fz-18 fw-500 base">2009</span>
                  <div className="expri__cont">
                    <h4 className="mb-15 text-black">Cinematic Production</h4>
                    <p className="fz-18 pra d-block">metacarpo Producciones</p>
                  </div>
                </div>
                <div className="exri__item">
                  <span className="fz-18 fw-500 base">2013</span>
                  <div className="expri__cont">
                    <h4 className="mb-15 text-black">Creative Design</h4>
                    <p className="fz-18 pra d-block">Brothers Escuela de Creativos</p>
                  </div>
                </div>
                <div className="exri__item">
                  <span className="fz-18 fw-500 base">2009-2014</span>
                  <div className="expri__cont">
                    <h4 className="mb-15 text-black">B.A. in Media and Comm.</h4>
                    <p className="fz-18 pra d-block">Universidad Arturo Michelena</p>
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
