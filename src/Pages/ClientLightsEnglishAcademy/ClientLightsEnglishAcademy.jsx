import React from "react";
import CaseStudy from "../../Components/Shared/CaseStudy/CaseStudy";
import hero from "../../assets/img/protfolio/lights/LOGO-DE-LIGHTS.png";

// Caso de estudio con la estética común (Components/Shared/CaseStudy).
// Los textos están en src/i18n.js bajo "clientlightsenglishacademy.".
const ClientLightsEnglishAcademy = () => (
  <CaseStudy
    ns="clientlightsenglishacademy"
    id="lights"
    hero={hero}
    site={{ url: "https://www.leaingles.com", label: "leaingles.com" }}
    intro={["description.p1", "description.p2"]}
    middle={{ quote: "description.h3", paragraphs: ["description.p3", "description.p4"] }}
    takeaways={["keyTakeaways.item1", "keyTakeaways.item2", "keyTakeaways.item3", "keyTakeaways.item4"]}
    closing="cta.p"
    video="https://www.youtube.com/embed/gAlgur5HZWU"
    gallery={[]}
  />
);

export default ClientLightsEnglishAcademy;
