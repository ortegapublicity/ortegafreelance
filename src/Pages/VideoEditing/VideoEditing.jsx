import React from "react";
import { ArrowRight } from "react-bootstrap-icons";
import PageHeader from "../../Components/Shared/PageHeader/PageHeader"; 
import Accordion from "../../Components/Accordion/Accordion";
import { Link, ScrollRestoration } from "react-router-dom";
import detialcontact from "../../assets/img/contact/ser-detialcontact.png";

const accordionList = [
  {
    id: "ved1",
    heading: "How does the video editing process work?",
    para: `Every project starts with a short strategy session to define goals, tone, and target audience.
Then, I deliver a first-cut preview for feedback, ensuring full creative control before the final export.
Revisions are agile and transparent, designed to meet your vision while keeping deadlines efficient.`,
  },
  {
    id: "ved2",
    heading: "Can you adapt videos to different platforms and algorithms?",
    para: `Absolutely. Each edit is optimized for current content standards, including Meta’s Andromeda 
    AI and Reels performance formats, ensuring your videos are algorithm-friendly, high-retention, 
    and conversion-ready.`,
  },
  {
    id: "ved3",
    heading: "What makes your video style unique?",
    para: `My approach combines brand storytelling, data analysis, and rhythm-based editing.
    Every video reflects your brand’s personality — from tone and typography to pacing — creating content 
    that’s visually engaging and strategically aligned with your growth goals.`,
  },
];

const VideoEditing = () => {
  return (
    <>
      <PageHeader heading={"Video Editing"} page={"Video Editing"} />
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
                    src="https://player.vimeo.com/video/1115670837?h=6497b234ab"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ zIndex: 9999, position: "relative" }}
                  ></iframe>
                </div>

                {/* About Section */}
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  <h3 className="textt36 d-block">
                    About Video Editing Service
                  </h3>
                  <p className="fz-16 pra ttext__one">
                    Your brand deserves deserves recognition. 
                    I craft videos that merge storytelling, data, and performance insights 
                    to captivate your audience and align with the evolving standards of 
                    Meta’s Andromeda AI and the demand for high-performing Reels content.
                  </p>
                  <p className="fz-16 pra">
                    Every video is built with purpose, designed to trigger emotion, engagement, 
                    and measurable results. Whether it’s an ad, a social reel, or a brand narrative, 
                    I edit with strategy, rhythm, and brand psychology in mind.
                  </p>
                </div>

                {/* Process Section */}
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  <h3 className="textt36 d-block">
                    Specialization & Working Process
                  </h3>
                  <p className="fz-16 pra">
                    I work with Adobe Premiere Pro, After Effects, CapCut, and Media Encoder 
                    to produce videos that balance creativity with algorithmic performance. 
                    From color grading and motion graphics to AI-optimized pacing, 
                    every frame is refined to enhance retention and maximize reach.
                  </p>
                  <p className="fz-16 pra">
                    My workflow focuses on understanding your brand data, analyzing what drives 
                    engagement and adapting visuals to meet the latest AI-driven content 
                    ranking models across Meta and other social platforms.
                  </p>
                </div>

                {/* Embedded Video */}
                <div className="paythumb position-relative">
                  <iframe
                    width="100%"
                    height="450"
                    src="https://player.vimeo.com/video/885310167?h=f25daa1818"
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    style={{ zIndex: 9999, position: "relative" }}
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

export default VideoEditing;
