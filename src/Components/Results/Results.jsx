import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import Title from "../Shared/Title/Title";

// Cada cifra sale de la página de su caso de estudio (y de
// src/data/caseStudies.js). Si cambia una, se cambia en los dos sitios.
const resultList = [
  { id: "nf", key: "results.nf", linkTo: "/client-nfautoparts" },
  { id: "rey", key: "results.rey", linkTo: "/client-reyantiguedades" },
  { id: "javi", key: "results.javi", linkTo: "/client-javitoyz" },
  { id: "tps", key: "results.tps", linkTo: "/client-todxspodemosser-web" },
];

const Results = () => {
  const { t } = useTranslation();

  return (
    <section className="results__section pt-120 pb-120" id="results">
      <div className="container">
        {/* El título se ve al instante; solo las cifras entran al hacer scroll. */}
        <Title mainTitle={t("results.title")} animate={false} />
        <div className="results__grid">
          {resultList.map(({ id, key, linkTo }) => (
            <Link
              to={linkTo}
              className="results__item"
              key={id}
              data-aos="fade-up"
              data-aos-duration="1000"
            >
              <span className="results__figure">{t(`${key}.figure`)}</span>
              <span className="results__label">{t(`${key}.label`)}</span>
              <span className="results__client">
                {t(`${key}.client`)}
                <ArrowUpRight />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Results;
