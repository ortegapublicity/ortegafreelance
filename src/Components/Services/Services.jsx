import React from "react";
import Service from "./Service";
import Title from "../Shared/Title/Title";

const serviceList = [
  {
    id: "01",
    heading: "Illustration Design",
    subHeading: "Designer",
    para: "Transform ideas into striking visuals that connect emotionally and strengthen your brand’s identity.",
  },
  {
    id: "02",
    heading: "Business Branding",
    subHeading: "Branding",
    para: "Build a brand that sells: from strategy and logo design to a consistent digital presence across all platforms.",
  },
  {
    id: "03",
    heading: "Web UI/UX Design",
    subHeading: "UI/UX Design",
    para: "Designing user-focused, responsive websites that look great and drive real business performance.",
  },
  {
    id: "04",
    heading: "Paid Media",
    subHeading: "Media Buyer",
    para: "Maximize ROI with targeted Meta and Google Ads campaigns that turn traffic into measurable results.",
  },
  {
    id: "05",
    heading: "Video Editing",
    subHeading: "Audiovisuals",
    para: "Create high-impact videos that tell your story, capture attention, and enhance your brand’s credibility.",
  },
];
const Services = ({ isHeading }) => {
  return (
    <section
      id="services"
      className={`service__section overhid ${isHeading && "pt-120"}  pb-120`}
    >
      <div className="container">
        {isHeading && (
          <Title
            mainTitle="My Special Service For Your Business Development"
            sortTitle="What I Do"
          />
        )}

        <div className={`service__uniquewrap `}>
          {serviceList.map(({ id, heading, subHeading, para }) => (
            <Service
              key={id}
              id={id}
              heading={heading}
              subHeading={subHeading}
              para={para}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
