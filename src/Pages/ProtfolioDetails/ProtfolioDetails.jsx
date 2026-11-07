import React from "react";
import CaseStudy from "../../Components/Shared/CaseStudy/CaseStudy";
import hero from "../../assets/img/protfolio/prot-detailsbig.png";
import img1 from "../../assets/img/protfolio/prot-detials1.png";
import img2 from "../../assets/img/protfolio/prot-detials2.png";

// Caso de estudio con la estética común (Components/Shared/CaseStudy).
// Los textos están en src/i18n.js bajo "protfoliodetails.".
const ProtfolioDetails = () => (
  <CaseStudy
    ns="protfoliodetails"
    id="javitoyz"
    hero={hero}
    site={{ url: "https://www.javitoyz.com", label: "javitoyz.com" }}
    intro={["description.p1", "description.p2"]}
    middle={{ quote: "quote", paragraphs: ["description.p3", "description.p4"] }}
    takeaways={["keyTakeaways.item1", "keyTakeaways.item2", "keyTakeaways.item3"]}
    closing="cta"
    gallery={[img1, img2]}
  />
);

export default ProtfolioDetails;
