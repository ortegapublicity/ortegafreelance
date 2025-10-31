import React from "react";
import { ArrowRight } from "react-bootstrap-icons";
import PageHeader from "../../Components/Shared/PageHeader/PageHeader"; 
import Accordion from "../../Components/Accordion/Accordion";
import { Link, ScrollRestoration } from "react-router-dom";
import serDv1 from "../../assets/img/project/ser-dv1.png"; 
import detialcontact from "../../assets/img/contact/ser-detialcontact.png";

const accordionList = [
  {
    id: "pm1",
    heading: "How does the paid media process work?",
    para: `We start with a strategy session to define goals, target audiences, and KPIs. 
    Then I design and launch Meta and Google Ads campaigns, continuously testing creatives, 
    audiences, and placements to optimize results week after week.`,
  },
  {
    id: "pm2",
    heading: "How long does it take to see results from ads?",
    para: `Most clients start seeing measurable results within 2 to 4 weeks, depending on 
    their industry, budget, and conversion setup. Continuous optimization and data analysis 
    ensure campaigns scale efficiently over time.`,
  },
  {
    id: "pm3",
    heading: "What makes your ad management different?",
    para: `I combine creative direction with data science, analyzing audience behavior, 
    ad fatigue, and funnel performance to ensure every dollar spent generates maximum ROI. 
    Campaigns are adapted to your brand voice, goals, and customer journey.`,
  },
  {
    id: "pm4",
    heading: "Do you handle both Meta and Google Ads?",
    para: `Yes. I manage both platforms strategically, Meta Ads for emotional storytelling 
    and brand awareness, and Google Ads for high-intent conversions. Together, they build 
    a full-funnel system that captures and converts your audience effectively.`,
  },
  {
    id: "pm5",
    heading: "Can you integrate my ads with CRM or landing pages?",
    para: `Absolutely. I connect your ad ecosystem with CRM tools, email automations, 
    and optimized landing pages for complete conversion tracking and audience retargeting.`,
  },
];

const PaidMedia = () => {
  return (
    <>
      <PageHeader heading={"Paid Media"} page={"Paid Media"} />
      <section className="service__details overhid pb-120">
        <div className="container">
          <div className="row g-4">
            {/* Left Column */}
            <div className="col-lg-8">
              <div className="ser__left__details">
               <div className="paythumb position-relative">
               <iframe
                 width="100%"
                 height="450"
                 src="https://www.loom.com/embed/4f5baa2ee5f94283920a35c0fd805199"
                 title="Loom video player"
                 frameBorder="0"
                 allowFullScreen
                 allow="autoplay; encrypted-media; picture-in-picture"
                  style={{
                  zIndex: 9999,
                  position: "relative",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              ></iframe>
            </div>


                {/* About Section */}
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  <h3 className="textt36 d-block">
                    About Paid Media Service
                  </h3>
                  <p className="fz-16 pra ttext__one">
                    I design and manage Meta and Google Ads campaigns that turn ad spend 
                    into measurable profit. By aligning creative direction with performance 
                    data, I ensure every campaign connects with your ideal audience and 
                    drives consistent ROI.
                  </p>
                  <p className="fz-16 pra">
                    From audience segmentation to conversion tracking, my focus is on clarity, 
                    optimization, and results. Every campaign is built on a data-backed strategy 
                    that scales sustainably while staying authentic to your brand.
                  </p>
                </div>

                {/* Process Section */}
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  <h3 className="textt36 d-block">Specialization & Working Process</h3>
                  <p className="fz-16 pra">
                    Using Meta Ads Manager, Google Ads, and Data Studio, I monitor key metrics 
                    that reveal audience patterns and conversion behavior. Each campaign goes 
                    through continuous A/B testing of creatives, copy, and placements to 
                    improve results month after month.
                  </p>
                  <p className="fz-16 pra">
                    I combine analytical precision with creative storytelling, ensuring your ads 
                    not only perform but also build long-term brand equity and trust.
                  </p>
                </div>

                <div
                  className="paythumb position-relative"
                  style={{
                    position: "relative",
                    paddingBottom: "56.25%", // 16:9 ratio
                    height: 0,
                    overflow: "hidden",
                    borderRadius: "12px",
                  }}
                >
                  <iframe
                    src="https://www.loom.com/embed/e8352a9f778d4c7284a75b35b233b706"
                    title="Loom video player"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; encrypted-media; picture-in-picture"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                     height: "100%",
                   }}
                 ></iframe>
                </div>

                {/* Accordion */}
                <div className="ser__components">
                  <h2 className="whites mb-5">Questions? You’re Covered</h2>
                  <div className="accordion" id="accordionExample">
                    {accordionList.map(({ id, heading, para }) => (
                      <Accordion key={id} id={id} heading={heading} para={para} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-lg-4">
              <div className="service__right__wrap">
                <div className="service__rightbox mb-30">
                  <h3>Service List</h3>
                  <Link to="/Pages/illustration-design" className="link__box mb-15">
                    Illustration Design <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/Pages/business-branding" className="link__box mb-15">
                    Business Branding <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/Pages/web-design" className="link__box mb-15">
                    Web UI/UX Design <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/Pages/paid-media" className="link__box mb-15">
                    Paid Media <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/Pages/video-editing" className="link__box mb-15">
                    Video Editing <i className="bi bi-chevron-right"></i>
                  </Link>
                </div>

                {/* Contact Box */}
                <div className="service__rightbox">
                  <div className="thumb">
                    <img src={detialcontact} alt="img" />
                    <Link to="/contact" className="cmn--btn">
                      <span>Contact Me</span>
                      <span>
                        <i>
                          <ArrowRight />
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
      <ScrollRestoration />
    </>
  );
};

export default PaidMedia;
