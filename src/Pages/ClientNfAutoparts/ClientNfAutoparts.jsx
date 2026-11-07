import React from "react";
import CaseStudy from "../../Components/Shared/CaseStudy/CaseStudy";
import hero from "../../assets/img/protfolio/nfautoparts/LOGO-DE-NF.png";
import img1 from "../../assets/img/protfolio/nfautoparts/nf1.png";
import img2 from "../../assets/img/protfolio/nfautoparts/nf2.png";

// Caso de estudio con la estética común (Components/Shared/CaseStudy).
// Los textos están en src/i18n.js bajo "clientnfautoparts.".
const ClientNfAutoparts = () => (
  <CaseStudy
    ns="clientnfautoparts"
    id="nf"
    hero={hero}
    site={{ url: "https://www.nfautoparts.com", label: "nfautoparts.com" }}
    intro={["description.p1", "description.p2", "description.p3"]}
    middle={{ quote: "quote", paragraphs: ["description.p4"] }}
    takeaways={["keyTakeaways.item1", "keyTakeaways.item2", "keyTakeaways.item3", "keyTakeaways.item4"]}
    closing="cta"
    gallery={[img1, img2]}
  />
);

export default ClientNfAutoparts;
