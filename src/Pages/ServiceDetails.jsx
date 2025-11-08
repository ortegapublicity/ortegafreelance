import React from "react";
import { ArrowRight } from "react-bootstrap-icons";
import PageHeader from "../Components/Shared/PageHeader/PageHeader";
import Accordion from "../Components/Accordion/Accordion";
import { Link } from "react-router-dom";
import serDv1 from "../assets/img/project/ser-dt.png";
import detialcontact from "../assets/img/contact/ser-detialcontact.png";
import { ScrollRestoration } from "react-router-dom";

const accordionList = [
  {
    id: "cmnid4",
    heading: "What makes your branding and marketing approach different from other freelancers or agencies?",
    para: `I combine creative design with performance-driven 
    strategy. Instead of separating visuals from results, 
    I integrate branding, UX/UI, video, and paid media 
    into one consistent system. This approach ensures 
    that every piece of content, from your logo to 
    your ads, works together to build recognition, 
    trust, and measurable growth.`,
  },
  {
    id: "cmnid5",
    heading: "How long does it take to build a complete brand and website?",
    para: ` Most branding and web design projects take between 
    3 to 6 weeks, depending on the scope and content readiness. 
    I start with a discovery phase to define your goals and brand 
    identity, then move into UX/UI design, development, and 
    optimization. The goal is to deliver a functional and visually 
    consistent brand that’s ready to convert.`,
  },
  {
    id: "cmnid6",
    heading: "Can you manage advertising campaigns after the website or branding is complete?",
    para: `Yes. I manage Meta and Google Ads campaigns to help brands 
    grow after launch. Each campaign includes audience targeting, 
    creative testing, remarketing, and performance tracking. 
    This ensures your investment translates into real traffic, leads, 
    and sales while maintaining a consistent brand voice across all platforms.`,
  },
];
const ServiceDetails = () => {

  return (
    <>
 
      <PageHeader heading={"Services Details"} page={"Services Details"} />
      <section className="service__details overhid pb-120">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="ser__left__details">
                <div className="thumb">
                  <img src={serDv1} alt="img" />
                </div>
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  <h3 className="textt36 d-block">
                    Integrated Design and Marketing Strategy That Builds Brands with Purpose
                  </h3>
                  <p className="fz-16 pra ttext__one">
                    A strong digital presence starts with clarity and consistency. 
                    Every successful brand needs strategy, design, and communication 
                    working together. That’s where branding, web design, video, 
                    and paid media align to generate real growth.
                  </p>
                  <p className="fz-16 pra">
                    A website is more than a place to visit. Through UX/UI design 
                    and front-end development, I create WordPress websites that 
                    communicate trust, convert visitors, and deliver a seamless experience. 
                    Every layout, button, and section is designed to guide users 
                    toward action and build credibility online.
                  </p>
                </div>
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  <p className="fz-16 ttext__one">
                   Visual identity defines how people see and remember your business. 
                   Branding and illustration design transform ideas into visuals that 
                   communicate your message with precision and emotion. When your colors, 
                   typography, and style are consistent, your audience instantly recognizes 
                   your brand.
                  </p>
                  <p className="fz-16 pra">
                    Video editing and paid media strategy take your message further. 
                    Video captures attention, and ads turn that attention into measurable 
                    results. By combining creative storytelling with data-driven campaigns 
                    on Meta and Google Ads, I help brands increase traffic, engagement, 
                    and sales.
                  </p>               
                  <p className="fz-16 ttext__one">
                    When all elements of your digital ecosystem work together, growth becomes 
                    predictable. The right combination of design, content, and marketing creates
                    a brand that stands out, builds trust, and drives long-term results.
                    </p>
                    <h3 className="textt36 d-block">
                    “People don’t buy products, they buy stories.” — Gary Vaynerchuk
                  </h3>
                  <h3 className="text__boxhead">Key Takeaways</h3>
              <ul className="challenge__list">
                <li>
                  A strong brand identity builds trust and recognition
                </li>
                <li>
                  High-converting websites turn visitors into customers
                </li>
                <li>
                  Video and paid media amplify reach and performance
                </li>
                <li>
                  Consistency across design and strategy drives growth
                </li>
              </ul>
                </div>
                <div className="ser__components">
                  <h2 className="whites mb-5">Questions ? You're Covered</h2>
                  <div className="accordion" id="accordionExample">
                    {accordionList.map(({ id, heading, para }) => (
                      <Accordion key={id} id={id} heading={heading} para={para} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="service__right__wrap">
                <div className="service__rightbox mb-30">
                  <h3>Service List</h3>
                 {/* ✨ MODIFICACIÓN: Usamos <Link> con rutas relativas */}
                 <Link to="/Services/illustration-design" className="link__box mb-15">
                    Illustration Design
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/Services/business-branding" className="link__box mb-15">
                    Business Branding
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/Services/web-design" className="link__box mb-15">
                    Web UI/UX Design
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/Services/paid-media" className="link__box mb-15">
                    Paid Media
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/Services/video-editing" className="link__box mb-15">
                    Video Editing
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  </div>
                  {/* FIN de MODIFICACIÓN */}
                <div className="service__rightbox">
                  <div className="thumb">
                    <img
                      src={detialcontact}
                      alt="img"
                    />
                     <Link 
                      to="/contact" // Redirige a la ruta /contact
                      className="cmn--btn"
                    >
                      <span>Contact Me</span>
                      <span>
                        <i>
                          <ArrowRight/>
                        </i>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <ScrollRestoration/>
    </>
  );
};

export default ServiceDetails;
