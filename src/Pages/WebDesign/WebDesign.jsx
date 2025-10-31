import React from "react";
import { ArrowRight } from "react-bootstrap-icons";
// Corregí la ruta de los imports a un estándar más común (asumiendo que los componentes están en ../Components/)
import PageHeader from "../../Components/Shared/PageHeader/PageHeader"; 
import Accordion from "../../Components/Accordion/Accordion";
import { Link } from "react-router-dom";
// Usaremos un placeholder de imagen por ahora
import serDv1 from "../../assets/img/project/ser-webpage.png"; 
import detialcontact from "../../assets/img/contact/ser-detialcontact.png";
import { ScrollRestoration } from "react-router-dom";

const accordionList = [
  {
    id: "cmnid4",
    heading: "Simple process for workflow?",
    para: `You’ll choose templates at early stage, 
    ensuring your vision matches the final product.`,
  },
  {
    id: "cmnid5",
    heading: "How long does it take to build a website?",
    para: ` Most web design projects take between 
    3 to 5 weeks, depending on the scope and content readiness. 
    I start with knowing your goals and brand 
    identity, then move into UX/UI design, development, and 
    optimization. The goal is to deliver a functional and visually 
    consistent brand that’s ready to convert.`,
  },
  {
    id: "cmnid6",
    heading: "Tailor-made digital products",
    para: `Each site is optimized for SEO, speed, and 
    accessibility ready to perform on any device.`,
  },
];
const IllustrationDesign = () => { // ✨ Nombre de la función corregido: IllustrationDesign

  return (
    <>
 
      {/* ✨ Texto del encabezado corregido para reflejar el servicio */}
      <PageHeader heading={"Web Design"} page={"Web Design"} />
      <section className="service__details overhid pb-120">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="ser__left__details">
                <div className="thumb">
                  <img src={serDv1} alt="Web Design Thumb" />
                </div>
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  {/* ✨ Texto del servicio corregido */}
                  <h3 className="textt36 d-block">
                  About Web UI/UX Design Service
                  </h3>
                  <p className="fz-16 pra ttext__one">
                    A great website it’s necessary. My UI/UX design service focuses on usability, 
                    responsiveness, and conversion-driven layouts that turn visitors into loyal 
                    customers. I design experiences that feel intuitive while expressing your 
                    brand identity in every interaction.
                  </p>
                  <p className="fz-16 pra">
                    I combine design systems and user psychology to ensure your website is clear, 
                    fast, and results-oriented.
                  </p>
                </div>
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  {/* ✨ Texto del servicio corregido */}
                  <h3 className="textt36 d-block">
                    Specialization & Working Process
                  </h3>
                  <p className="fz-16 pra">
                    I specialize in React, Node.js, WordPress, and HTML/CSS frameworks, ensuring 
                    high-performance web design with responsive interfaces. My process starts with 
                    templates selected by the clients, personalization and ends with functional 
                    testing to guarantee fluid navigation and engagement.
                  </p>
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
            {/* El Service List que actúa como navegación se mantiene igual */}
            <div className="col-lg-4">
              <div className="service__right__wrap">
                <div className="service__rightbox mb-30">
                  <h3>Service List</h3>
                 {/* ✨ MODIFICACIÓN: Usamos <Link> con rutas relativas */}
                 <Link to="/services/illustration-design" className="link__box mb-15">
                    Illustration Design
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/business-branding" className="link__box mb-15">
                    Business Branding
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/web-design" className="link__box mb-15">
                    Web UI/UX Design
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/paid-media" className="link__box mb-15">
                    Paid Media
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/services/video-editing" className="link__box mb-15">
                    Video Editing
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  {/* FIN de MODIFICACIÓN */}
                </div> 
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

export default IllustrationDesign; // ✨ Nombre de la exportación corregido
