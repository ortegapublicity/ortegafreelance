import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

import AOS from "aos";
import "aos/dist/aos.css";


const Awards = () => {
  const { t } = useTranslation();

  const awardList = [
    {
      id: 1,
      awardName: t("awards.award1.awardName"),
      contest: t("awards.award1.contest"),
      year: "2020",
    },
    {
      id: 2,
      awardName: t("awards.award2.awardName"),
      contest: t("awards.award2.contest"),
      year: "2024",
    },
    {
      id: 3,
      awardName: t("awards.award3.awardName"),
      contest: t("awards.award3.contest"),
      year: "2024",
    },
    {
      id: 4,
      awardName: t("awards.award4.awardName"),
      contest: t("awards.award4.contest"),
      year: "2026",
    },
  ];

  useEffect(() => {
    AOS.init();
  }, []);

  return (
    <div className="awoard__section">
      <div className="container">
        <div
          className="award__wraper table-responsive"
          data-aos="fade-up"
          data-aos-duration="2000"
        >
          <table className="table w-100">
            <tbody>
              <tr>
                <td>
                  <span className="table__title">{t("awards.title")}</span>
                </td>
                <td className="cusnoe"></td>
                <td className="text-end">
                  <a
                    href="/portfolio"
                    className="d-flex table__view justify-content-end align-items-center base gap-2"
                  >
                    <span>{t("awards.viewMyWork")}</span>
                    <i className="bi bi-arrow-right"></i>
                  </a>
                </td>
              </tr>
              {awardList.map(({ contest, id, year, awardName }) => {
                return (
                  <tr key={id}>
                    <td>{awardName}</td>
                    <td>{contest}</td>
                    <td className="text-end">{year}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Awards;
