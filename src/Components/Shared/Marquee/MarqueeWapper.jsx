import React from "react";
import Marquee from "react-fast-marquee";
import { useTranslation } from "react-i18next";

const Asterisk = () => (
  <svg
    className="marquee-star"
    viewBox="0 0 24 24"
    width="30"
    height="30"
    aria-hidden="true"
    focusable="false"
  >
    <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" />
    </g>
  </svg>
);

const MarqueeWapper = ({ items = [], direction }) => {
  const { t } = useTranslation();

  return (
    <div className="marquee-wrapper text-slider" aria-hidden="true">
      <div className="marquee-inner ">
        <Marquee direction={direction} autoFill>
          {items.map((key) => (
            <span key={key} className="marquee-item">
              <Asterisk />
              {t(key)}
            </span>
          ))}
        </Marquee>
      </div>
    </div>
  );
};

export default MarqueeWapper;
