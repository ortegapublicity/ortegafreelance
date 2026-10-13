import React, { useEffect, useState } from "react";

import { skillsMarquee, proofMarquee } from "../Utlits/marqueeItems";
import WebBuilds from "../Components/WebBuilds/WebBuilds";
import About from "../Components/About/About";
import Projects from "../Components/Projects/Projects";
import Metting from "../Components/Metting/Metting";
import Services from "../Components/Services/Services";
import WorkeProcess from "../Components/WorkeProcess/WorkeProcess";
import Testimonial from "../Components/Testimonial/Testimonial";
import Pricing from "../Components/Pricing/Pricing";
import Blogs from "../Components/Blogs/Blogs";
import MarqueeWapper from "../Components/Shared/Marquee/MarqueeWapper";
import Awards from "../Components/About/Awards";
import Preloader from "../Components/Shared/Preloader/Preloader";


const Home = () => {
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    setTimeout(function () {
      setIsFetching(false);
    }, 1500);
  }, []);

  return (
    <>
      {isFetching && <Preloader />}
      <MarqueeWapper direction="left" items={skillsMarquee} />
      <About />
      <Services isHeading={true} />
      <WebBuilds />
      <MarqueeWapper direction="right" items={proofMarquee} />
      <Projects />
      <WorkeProcess />
      <Testimonial />
      <div id="pricing">
        <Pricing />
      </div>
      <Metting />
      <Blogs />
      <Awards />
    </>
  );
};

export default Home;
