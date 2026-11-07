import React from "react";
import CaseStudy from "../../Components/Shared/CaseStudy/CaseStudy";
import hero from "../../assets/img/protfolio/Brandtop/Logo-brandtop.png";
import img1 from "../../assets/img/protfolio/Brandtop/Brandtop-image.png";
import img2 from "../../assets/img/protfolio/Brandtop/Brandtop-image2.png";

// Caso de estudio con la estética común (Components/Shared/CaseStudy).
// Los textos están en src/i18n.js bajo "clientbrandtop.".
const ClientBrandtop = () => (
  <CaseStudy
    ns="clientbrandtop"
    id="brandtop"
    hero={hero}
    site={{ url: "https://www.brandtop.co", label: "brandtop.co" }}
    intro={["description.p1", "description.p2"]}
    middle={{ quote: "description.h3", paragraphs: ["description.p3"] }}
    takeaways={["keyTakeaways.item1", "keyTakeaways.item2", "keyTakeaways.item3", "keyTakeaways.item4"]}
    closing="description.p4"
    video="https://www.youtube.com/embed/uHqOZrl3yzE"
    gallery={[img1, img2]}
  />
);

export default ClientBrandtop;
