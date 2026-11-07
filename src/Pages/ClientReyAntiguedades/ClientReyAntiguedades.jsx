import React from "react";
import CaseStudy from "../../Components/Shared/CaseStudy/CaseStudy";
import hero from "../../assets/img/protfolio/reyantiguedades/reybg1.png";

// Caso de estudio con la estética común (Components/Shared/CaseStudy).
// Los textos están en src/i18n.js bajo "clientreyantiguedades.".
const ClientReyAntiguedades = () => (
  <CaseStudy
    ns="clientreyantiguedades"
    id="rey"
    hero={hero}
    site={{ url: "https://www.reysubastas.com", label: "reysubastas.com" }}
    intro={["description.p1", "description.p2"]}
    middle={{ quote: "description.h3", paragraphs: ["description.p3", "description.p4"] }}
    takeaways={["keyTakeaways.item1", "keyTakeaways.item2", "keyTakeaways.item3", "keyTakeaways.item4"]}
    closing="conclusion"
    video="https://www.youtube.com/embed/OUWJ34ifPxo"
    gallery={[]}
  />
);

export default ClientReyAntiguedades;
