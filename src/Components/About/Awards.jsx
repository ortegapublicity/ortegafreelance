import React, { useEffect } from "react";

import AOS from "aos";
import "aos/dist/aos.css";


const awardList = [
  {
    id: 1,
    awardName: "NF Autoparts",
    contest: "30k + Monthly Sales",
    year: "2020",
  },
  {
    id: 2,
    awardName: "Todxs Podemos Ser",
    contest: "6k+ financed by ONG's",
    year: "2024",
  },
  {
    id: 3,
    awardName: "JaviToyz",
    contest: "10k+ Sales w/ services",
    year: "2024",
  },
  {
    id: 4,
    awardName: "Rey Antigüedades",
    contest: "100k+ Views on reels",
    year: "2025",
  },
];
const Awards = () => {

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
                  <span className="table__title">Milestones</span>
                </td>
                <td className="cusnoe"></td>
                <td className="text-end">
                  <a
                    href="#0"
                    className="d-flex table__view justify-content-end align-items-center base gap-2"
                  >
                    <span>View My Work</span>
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
