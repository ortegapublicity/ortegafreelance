import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const PageHeader = ({heading, page}) => {
  const { t } = useTranslation();

  return (
    <div className="container pt-120 pb-120">
      <div className="row g-4 justify-content-center">
        <div className="col-lg-8">
          <div className="breadcrumnd__wrap text-center">
            <h1>{heading}</h1>
            <ul className="breakcrumnd__cont justify-content-center">
              <li>
                <Link to="/">{t("home")}</Link>
              </li>
              <li className="white">/</li>
              <li className="base">{page}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
