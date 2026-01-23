import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { List, ArrowRight } from "react-bootstrap-icons";
import i18n from "../../../i18n"; // Import i18n
import { useTranslation } from "react-i18next";

import Drawer from "../Drawer/Drawer";
import logo from "../../../assets/img/logo/logo.png";

const menuList = [
  {
    id: 1,
    path: "/",
    name: "header.home",
  },
  {
    id: 2,
    path: "/",
    section: "#about",
    name: "header.about",
  },
  {
    id: 3,
    path: "/",
    section: "#projects",
    name: "header.work",
  },
  {
    id: 4,
    path: "/",
    section: "#services",
    name: "header.services",
    dropDown: [
      {
        id: 1,
        path: "/all-services",
        name: "services",
      },
      {
        id: 2,
        path: "/service-details",
        name: "serviceDetails.header.page",
      },
    ],
  },
  {
    id: 5,
    path: "/",
    section: "#testimonial",
    name: "header.testimonial",
  },
  {
    id: 6,
    path: "/",
    section: "#blog",
    name: "header.blog",
    dropDown: [
      {
        id: 1,
        path: "/all-blog",
        name: "header.blog",
      },
    ],
  },
  {
    id: 7,
    path: "/",
    section: "#pricing",
    name: "header.pricing",
  },
  {
    id: 8,
    path: "/contact",
    name: "header.contact",
  },
];

const Header = () => {
  const { t } = useTranslation();
  const [isSidebarActive, setIsSidebarActive] = useState(false);
  const [menuActive, setMenuActive] = useState(false);
  const [dropDownId, setDropDownId] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState(i18n?.language || 'en'); // State for current language

  useEffect(() => {
    window.addEventListener("scroll", isSticky);
    return () => {
      window.removeEventListener("scroll", isSticky);
    };
  }, []);

  const isSticky = (e) => {
    const header = document.querySelector(".header-section");
    const scrollTop = window.scrollY;

    scrollTop >= 35
      ? header.classList.add("menu-fixed", "animated", "fadeInDown")
      : header.classList.remove("menu-fixed");
  };

  const handleHeaderToggle = () => {
    setMenuActive(!menuActive);
  };

  const handleSubMenu = (id) => {
    setDropDownId(id);
  };

  const toggleLanguage = () => {
    const newLang = currentLanguage === 'en' ? 'es' : 'en';
    i18n.changeLanguage(newLang);
    setCurrentLanguage(newLang);
  };

  return (
    <header className={`header-section `}>
      <div className="container">
        <div className="header-wrapper" style={{ transform: 'translateX(4px)' }}>
          <div className="main__logo">
            <Link to={"/"} className="logo">
              <img src={logo} alt="logo" />
            </Link>
          </div>
          <ul
            className={`main-menu ${menuActive ? "active" : ""}`}
            style={{ transform: "translateX(-5px)" }}
          >
            {menuList.map(({ id, name, path, dropDown, section }) => {
              return (
                <li key={id} onClick={() => handleSubMenu(id)}>
                  <HashLink smooth to={`${path}${section ? section : ""}`}>
                    {t(name)}
                  </HashLink>
                  {dropDown?.length && (
                    <ul className={`sub-menu ${dropDownId === id ? "sub-menu_active":""}`}>
                      {dropDown.map(({ id, name, path }) => {
                        return (
                          <li key={id}>
                            <HashLink smooth to={path}>
                              {t(name)}
                            </HashLink>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="menu__components d-flex align-items-center justify-content-between ">
            <div className="language-switcher-item">
              <button onClick={toggleLanguage} style={{ transform: "translateX(-10px)", background: 'none', border: 'none', cursor: 'pointer', marginLeft: '10px' }}>
                {currentLanguage === 'en' ? '🇺🇸' : '🇪🇸'}
              </button>
            </div>
            <Link
              to="/contact"
              className="d-flex fw-500 cmn--btn align-items-center gap-3 get__btn"
            >
              <span className="get__text">{t('header.letsTalk')}</span>
              <span>
                <ArrowRight className="fz-20" />
              </span>
            </Link>
            <div
              onClick={handleHeaderToggle}
              className={`header-bar d-lg-none ${menuActive ? "active" : ""}`}
            >
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div
              onClick={() => setIsSidebarActive(true)}
              className="remove__click"
            >
              <List className="icon" />
            </div>
          </div>
        </div>
      </div>
      <Drawer
        isSidebarActive={isSidebarActive}
        setIsSidebarActive={setIsSidebarActive}
      />
    </header>
  );
};

export default Header;
