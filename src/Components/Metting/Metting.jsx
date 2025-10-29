import React from "react";
import {Envelope, GeoAlt} from "react-bootstrap-icons"

const Metting = () => {
  // Tu URL de Calendly, formateada para un embed simple
  const calendlyEmbedUrl = "https://calendly.com/ortegapublicity/meeting?hide_event_type_details=1&hide_gdpr_banner=1&primary_color=0079ff";

  return (
    <section className="project__metting overhid pt-120 pb-120">
      <div className="container">
        <div className="row g-4 align-items-center">
          
          {/* Columna Izquierda: Información de Contacto */}
          <div className="col-lg-7">
            <div className="pro__metting__content">
              <div className="project__head">
                <span
                  className="common__sub"
                  data-aos="fade-down"
                  data-aos-duration="1000"
                >
                  Need a Project?
                </span>
                <h2
                  className="fw-500"
                  data-aos="fade-down"
                  data-aos-duration="1600"
                >
                  Let's work together. schedule a meeting
                </h2>
              </div>
              
              {/* Enlace de Correo (mailto:) */}
              <div
                className="about__contbox__item pb-30"
                data-aos="fade-up"
                data-aos-duration="1000"
              >
                <span className="icon">
                  <Envelope className="i"/>
                </span>
                <span className="box">
                  <span className="ptext fz-18 mb-1 d-block"> Email </span>
                  {/* ✨ CORREGIDO: Usar mailto: */}
                  <a href="mailto:raul@ortegafreelance.com"> raul@ortegafreelance.com </a>
                </span>
              </div>
              
              {/* Ubicación */}
              <div
                className="about__contbox__item pb-30 pt-30"
                data-aos="fade-up"
                data-aos-duration="1500"
              >
                <span className="icon">
                  <GeoAlt className="i"/>
                </span>
                <span className="box">
                  <span className="ptext fz-18 mb-1 d-block"> Location </span>
                  {/* ✨ CORREGIDO: Removido href="#0" */}
                  <span className="address-text"> San Diego, Carabobo, Venezuela </span>
                </span>
              </div>

              {/* Aquí puedes usar la imagen si quieres, o dejar este espacio para texto adicional */}
             

            </div>
          </div>
          
          {/* Columna Derecha: Calendly Embed */}
          <div className="col-lg-5">
            <div 
              className="calendly-embed-container"
              data-aos="zoom-in"
              data-aos-duration="2000"
              style={{ minHeight: '600px', width: '100%', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
            >
              {/* ✨ NUEVO: Embed del Calendario usando Iframe */}
              <iframe
                title="Calendly Meeting Scheduler"
                src={calendlyEmbedUrl}
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ minHeight: '600px' }}
              ></iframe>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Metting;
