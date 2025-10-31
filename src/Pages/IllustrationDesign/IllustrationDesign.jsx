import React from "react";
import { ArrowRight } from "react-bootstrap-icons";
// Corregí la ruta de los imports a un estándar más común (asumiendo que los componentes están en ../Components/)
import PageHeader from "../../Components/Shared/PageHeader/PageHeader"; 
import Accordion from "../../Components/Accordion/Accordion";
import { Link } from "react-router-dom";
// Usaremos un placeholder de imagen por ahora
import serDv1 from "../../assets/img/project/ser-illustration.png"; 
import detialcontact from "../../assets/img/contact/ser-detialcontact.png";
import { ScrollRestoration } from "react-router-dom";

const accordionList = [
  {
    id: "cmnid4",
    heading: "Simple process for workflow?",
    para: `Each project begins with a creative brief,
    followed by sketches, concept approval, and final
    delivery in multiple formats.`,
  },
  {
    id: "cmnid5",
    heading: "How do you ensure brand consistency?",
    para: ` I work from existing brand palettes or 
    develop new ones aligned with your visual tone 
    and psychological color framework.`,
  },
  {
    id: "cmnid6",
    heading: "Can you animate my illustrations?",
    para: `Yes, static or motion graphics can be 
    developed, adding movement and emotion to your 
    visual storytelling.`,
  },
];
const IllustrationDesign = () => { // ✨ Nombre de la función corregido: IllustrationDesign

  return (
    <>
 
      {/* ✨ Texto del encabezado corregido para reflejar el servicio */}
      <PageHeader heading={"Illustration Design"} page={"Illustration Design"} />
      <section className="service__details overhid pb-120">
        <div className="container">
          <div className="row g-4">
            <div className="col-lg-8">
              <div className="ser__left__details">
                <div className="thumb">
                  <img src={serDv1} alt="Illustration Design Thumb" />
                </div>
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  {/* ✨ Texto del servicio corregido */}
                  <h3 className="textt36 d-block">
                    About Illustration Design Service
                  </h3>
                  <p className="fz-16 pra ttext__one">
                    Every powerful brand starts with an image that speaks. My illustration
                    design process transforms your ideas into visual stories that connect 
                    emotionally and define your brand’s personality. Whether for digital 
                    campaigns, web assets, or printed materials, I combine composition, 
                    color psychology, and concept depth to make your message unforgettable.
                  </p>
                  <p className="fz-16 pra">
                    Each project begins with a detailed understanding of your goals and 
                    audience. From sketches to final vector design, every detail is 
                    fine-tuned to align with your tone, purpose, and visual direction. 
                    The result: illustrations that engage, sell, and remain timeless.
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
                    I specialize in creating illustrations that combine aesthetic impact with 
                    strategic clarity. Using tools like Adobe Illustrator, Photoshop, and 
                    After Effects, I develop scalable visuals that maintain high resolution 
                    across every medium. My workflow is iterative sketch, prototype, refine, 
                    and deliver; ensuring both creative freedom and commercial precision.
                  </p>
                </div>
                <div className="paythumb position-relative">
                  <iframe
                   width="100%" // O el ancho que necesites
                   height="450" // O la altura que necesites
                   src="https://player.vimeo.com/video/696149125?h=d307c9b65f"
                   title="NF Logo Reveal"
                   frameBorder="0"
                   allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                   allowFullScreen
                   style={{ zIndex: 9999, position: 'relative' }}
                  >
                  </iframe>
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
