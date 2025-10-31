import React from "react";
import { Envelope, GeoAlt } from "react-bootstrap-icons";
import PageHeader from "../../Components/Shared/PageHeader/PageHeader";
import Form from "../../Components/Shared/Form/Form";
import { ScrollRestoration } from "react-router-dom";

const Contact = () => {
  const calendlyEmbedUrl =
    "https://calendly.com/ortegapublicity/meeting?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=0079ff";
  
    return (
    <>
      <PageHeader
        heading={"Let's Start Something"}
        page={"Let's Start Something"}
      />
      <section className="contact__section">
        <div className="container">
          <div className="row g-4">
            {/* Left Side: Contact Form */}
            <div
              className="col-lg-8"
              data-aos="fade-up"
              data-aos-duration="1000"
            >
              <div className="contact__box">
                <Form isColTwo={false} />
              </div>
            </div>

            {/* Right Side: Contact Info + Calendly */}
            <div
              className="col-lg-4"
              data-aos="fade-up"
              data-aos-duration="1500"
            >
              <div className="contact__rightside cmn__bg">
                <h4 className="mb-30">Feel free to contact me anytime</h4>

                {/* Email */}
                <div className="contact__item mb-20">
                  <span className="he1">Email</span>
                  <a href="mailto:raul@ortegafreelance.com">
                    raul@ortegafreelance.com
                  </a>
                  <span className="d-block mt-2" style={{ fontSize: "15px" }}>
                    or schedule a video meeting 👇
                  </span>
                </div>

                {/* Calendly Embed (Compact) */}
                <div
                  className="calendly-embed-container mb-30 mt-4"
                  style={{
                    minHeight: "500px",
                    width: "100%",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  }}
                >
                  <iframe
                    title="Calendly Meeting Scheduler"
                    src={calendlyEmbedUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ minHeight: "500px", border: "none" }}
                  ></iframe>
                </div>

                {/* Phone */}
                <div className="contact__item mb-20">
                  <span className="he1">Phone</span>
                  <a href="tel:+584140419317">+(58) 414 041 9317</a>
                </div>

                {/* Address */}
                <div className="contact__item">
                  <span className="he1">Address</span>
                  <span className="address">San Diego, Carabobo, Venezuela</span>
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

export default Contact;
