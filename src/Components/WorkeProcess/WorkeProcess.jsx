import React from "react";
import Title from "../Shared/Title/Title";
import WorkProcessCard from "./WorkProcessCard";

const processList = [
  {
    id: 1,
    title: "Concept",
    info: "I analyze your goals, audience, and market to set measurable objectives, like achieving a strong ROI within the first six months. This stage builds the foundation for a digital brand strategy tailored to your business growth.",
    list: [
      "Reviewing any existing branding",
      "Target audience and competitors research",
      "Developing a strategy",
    ],
  },
  {
    id: 2,
    title: "Design",
    info: "Here I define the creative direction using agile workflows, wireframes, and the right design tools — building a cohesive presence that connects your website, social media, and brand identity.",
    list: [
      "Defining the creative direction",
      "Building wireframes & prototypes",
      "Choosing the right tools & methods",
    ],
  },
  {
    id: 3,
    title: "Go Live",
    info: "This phase activates your online presence across all platforms — from your website to social media and paid campaigns. Every element works together to attract, engage, and convert your ideal audience.",
    list: [
      "Activating digital channels",
      "Implementing ad strategies",
      "Designing dynamic content",
    ],
  },
];
const WorkeProcess = () => {
  return (
    <section className="process__section pt-120 pb-120">
      <div className="container">
        <Title
          mainTitle="Boost Your Brand Online in a Few Steps."
          sortTitle="Working Process"
        />
        <div className="row g-4">
          {processList.map(({ id, info, list, title }) => (
            <WorkProcessCard key={id} info={info} list={list} title={title} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WorkeProcess;
