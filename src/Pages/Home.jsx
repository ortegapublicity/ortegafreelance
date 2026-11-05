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

// Orden pensado para convertir: lo que gana el cliente (hero y resultados),
// qué hago, la prueba, cómo trabajo, precios y la llamada. El hero (Banner)
// lo pinta Root solo en "/".
const Home = () => {
  return (
    <>
      <Results />
      <Services isHeading={true} focus />
      <WebBuilds />
      <Projects />
      <WorkeProcess />
      <Testimonial />
      <div id="pricing">
        <Pricing />
      </div>
      <Metting />
      <Blogs />
    </>
  );
};

export default Home;
