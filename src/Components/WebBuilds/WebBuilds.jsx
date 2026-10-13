import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, CheckCircleFill } from "react-bootstrap-icons";

import Title from "../Shared/Title/Title";
import nexolabImg from "../../assets/img/webbuilds/nexolab.jpg";
import todxsImg from "../../assets/img/webbuilds/todxs.jpg";
import mimaImg from "../../assets/img/webbuilds/mima.jpg";

const builds = [
  {
    id: "nexolab",
    name: "NEXO LAB Marketing",
    domain: "nexolabmarketing.com",
    image: nexolabImg,
    descKey: "webbuilds.nexolab.desc",
    tags: ["Node.js", "Stripe", "Resend", "Vercel", "GitHub"],
  },
  {
    id: "todxs",
    name: "Todxs Podemos Ser",
    domain: "todxspodemosser.com",
    image: todxsImg,
    descKey: "webbuilds.todxs.desc",
    resultKey: "webbuilds.todxs.result",
    resultLink: {
      url: "https://todxspodemosser.com/reddecreadorxsartivistas/",
      labelKey: "webbuilds.todxs.resultLink",
    },
    tags: ["WordPress"],
  },
  {
    id: "mima",
    name: "Mima Cortez",
    domain: "mimacortez.com",
    image: mimaImg,
    descKey: "webbuilds.mima.desc",
    resultKey: "webbuilds.mima.result",
    tags: ["Resend"],
  },
];

const WebBuilds = () => {
  const { t } = useTranslation();

  return (
    <section className="webbuilds__section pt-120 pb-120" id="web-development">
      <div className="container">
        <Title
          mainTitle={t("webbuilds.mainTitle")}
          sortTitle={t("webbuilds.sortTitle")}
        />
        <div className="webbuilds__grid">
          {builds.map(
            ({ id, name, domain, image, descKey, resultKey, resultLink, tags }) => (
              <article
                key={id}
                className="webbuilds__card"
                data-aos="fade-up"
                data-aos-duration="800"
              >
                <a
                  className="webbuilds__thumb"
                  href={`https://${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={-1}
                  aria-hidden="true"
                >
                  <img src={image} alt="" loading="lazy" />
                </a>
                <div className="webbuilds__body">
                  <span className="webbuilds__domain">{domain}</span>
                  <h3>{name}</h3>
                  <p>{t(descKey)}</p>
                  {resultKey && (
                    <p className="webbuilds__result">
                      <CheckCircleFill aria-hidden="true" />
                      <span>{t(resultKey)}</span>
                    </p>
                  )}
                  {tags.length > 0 && (
                    <ul className="webbuilds__tags">
                      {tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  )}
                  <div className="webbuilds__links">
                    <a
                      className="webbuilds__visit"
                      href={`https://${domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("webbuilds.visit")}
                      <ArrowUpRight aria-hidden="true" />
                    </a>
                    {resultLink && (
                      <a
                        className="webbuilds__visit"
                        href={resultLink.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t(resultLink.labelKey)}
                        <ArrowUpRight aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </div>
              </article>
            )
          )}
        </div>
        <p className="webbuilds__note">{t("webbuilds.note")}</p>
      </div>
    </section>
  );
};

export default WebBuilds;
