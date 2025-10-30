import React from "react";
import { ArrowRight } from "react-bootstrap-icons";
// Corregí la ruta de los imports a un estándar más común (asumiendo que los componentes están en ../Components/)
import PageHeader from "../../Components/Shared/PageHeader/PageHeader"; 
import Accordion from "../../Components/Accordion/Accordion";
import { Link } from "react-router-dom";
// Usaremos un placeholder de imagen por ahora
import serDv1 from "../../assets/img/project/ser-dv1.png"; 
import detialcontact from "../../assets/img/contact/ser-detialcontact.png";
import { ScrollRestoration } from "react-router-dom";

const accordionList = [
  {
    id: "cmnid4",
    heading: "Simple process for workflow?",
    para: `We start with a discovery session, develop 
    mood boards and brand archetypes, then move into 
    design and rollout.`,
  },
  {
    id: "cmnid5",
    heading: "Unique brand identity and strategy",
    para: ` Your brand is built with clarity and 
    psychological insight (not trends) ensuring 
    longevity and memorability.`,
  },
  {
    id: "cmnid6",
    heading: "Do you handle rebranding?",
    para: `Absolutely. I help existing companies 
    realign their image and communication with 
    current market demands. `,
  },
];
const IllustrationDesign = () => { // ✨ Nombre de la función corregido: IllustrationDesign

  return (
    <>
 
      {/* ✨ Texto del encabezado corregido para reflejar el servicio */}
      <PageHeader heading={"Business Branding"} page={"Business Branding"} />
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
                    About Business Branding Service
                  </h3>
                  <p className="fz-16 pra ttext__one">
                    Branding is the foundation of every successful business.
                    I help companies craft brands that sell, building strong 
                    visual systems supported by strategy, storytelling, and 
                    design consistency. From defining your mission to designing 
                    your logo and brand guidelines, my process shapes an 
                    identity that speaks with authenticity and drives conversion.
                  </p>
                  <p className="fz-16 pra">
                    Each brand strategy I create connects emotion with data
                    combining intuition with measurable goals to make your 
                    brand both memorable 
                  </p>
                </div>
                <div
                  className="text__box mb__cus60"
                  data-aos="fade-up"
                  data-aos-duration="1400"
                >
                  <h3 className="textt36 d-block">
                    Specialization & Working Process
                  </h3>
                  <p className="fz-16 pra">
                    My branding approach blends creative 
                    strategy with business insight. I use 
                    market research, audience analysis, 
                    and competitive positioning to establish 
                    a strong foundation. Once your tone and 
                    purpose are defined, I develop logo systems, 
                    color palettes, and typography that translate 
                    your story into visuals that convert.
                  </p>
                </div>
                <div className="paythumb position-relative">
                  <iframe
                   width="100%" // O el ancho que necesites
                   height="450" // O la altura que necesites
                   src="https://www.youtube.com/embed/uHqOZrl3yzE?si=H0Swi7NDRYGXyEFT"
                   title="YouTube video player"
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
                 <Link to="/Pages/illustration-design" className="link__box mb-15">
                    Illustration Design
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/Pages/business-branding" className="link__box mb-15">
                    Business Branding
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/Pages/web-design" className="link__box mb-15">
                    Web UI/UX Design
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/Pages/paid-media" className="link__box mb-15">
                    Paid Media
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                  <Link to="/Pages/video-editing" className="link__box mb-15">
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
