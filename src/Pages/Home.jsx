import React from "react";

import Results from "../Components/Results/Results";
import Services from "../Components/Services/Services";
import WebBuilds from "../Components/WebBuilds/WebBuilds";
import Projects from "../Components/Projects/Projects";
import WorkeProcess from "../Components/WorkeProcess/WorkeProcess";
import Testimonial from "../Components/Testimonial/Testimonial";
import Pricing from "../Components/Pricing/Pricing";
import Metting from "../Components/Metting/Metting";
import Blogs from "../Components/Blogs/Blogs";

// Lo importante delante: la foto y la promesa (Banner, lo pinta Root solo en
// "/"), los logros, la videollamada y los planes. Después, para quien quiere
// más contexto: servicios, lo que he construido, casos, proceso y opiniones.
const Home = () => {
  return (
    <>
      <Results />
      <Metting />
      <div id="pricing">
        <Pricing />
      </div>
      <Services isHeading={true} focus />
      <WebBuilds />
      <Projects />
      <WorkeProcess />
      <Testimonial />
      <Blogs />
    </>
  );
};

export default Home;
