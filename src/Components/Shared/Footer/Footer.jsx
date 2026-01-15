import React from "react";
import { ArrowUpShort, ArrowRight } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const socalList = [
  {
    id: 1,
    platfrom: "LinkedIn",
    icon: <ArrowRight />,
    routelist: "https://www.linkedin.com/in/ortegapublicity/"
  },
  {
    id: 2,
    platfrom: "Instagram",
    icon: <ArrowRight />,
    routelist: "https://www.instagram.com/ortegafreelance/"
  },
  {
    id: 3,
    platfrom: "Behance",
    icon: <ArrowRight />,
    routelist: "https://www.behance.net/ortegapublicity/"
  },
  {
    id: 4,
    platfrom: "Vimeo",
    icon: <ArrowRight />,
    routelist: "https://www.vimeo.com/ortegapublicity/"
  },
];
const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer__section">
      <div className="container">
        <div className="footer__top pt-120 pb-120">
          <div className="fl" data-aos="fade-up" data-aos-duration="1000">
            {t('footer.getInTouch')}
          </div>
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="get__content">
                <p>
                  {t('footer.contactIntro')}
                </p>
                <a href="mailto:raul@ortegafreelance.com">{t('footer.email')}</a>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="get__rightcontetn">
                <div className="row g-4">
                  {socalList.map(({ id, icon, platfrom, routelist }) => {
                    return (
                      <div key={id} className="col-lg-6 col-md-6 col-sm-6">
                        <a href={routelist} target= "_blank"  className="social__footer">
                          {platfrom}
                          <i>{icon}</i>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer__bottom cmn__bg">
        <div className="container">
          <div className="copyright">
            <p className="white">
              Copyright © 2025 {" "}
              <Link to={"/"} className="base">
                Raul Ortega.
              </Link>{" "}
              {t('footer.allRightsReserved')}
            </p>
            <ul className="terms">
              <li>
                <a href="#0"> {t('footer.terms')} </a>
              </li>
              <li>
                <a href="#0"> {t('footer.privacy')} </a>
              </li>
            </ul>
            <a href="#about" className="toparrow">
              <i>
                <ArrowUpShort />
              </i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
