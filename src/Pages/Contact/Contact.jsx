import React from "react";
import PageHeader from "../../Components/Shared/PageHeader/PageHeader";
import Form from "../../Components/Shared/Form/Form";
import { ScrollRestoration } from "react-router-dom";

const Contact = () => {
  return (
    <>
      <PageHeader
        heading={"Let's Start Something"}
        page={"Let's Start Something"}
      />
      <section className="contact__section">
        <div className="container">
          <div className="row g-4">
            <div
              className="col-lg-8"
              data-aos="fade-up"
              data-aos-duration="1000"
            >
              <div className="contact__box">
                {/* NOTA: La lógica de envío del formulario está dentro de este componente <Form /> */}
                <Form isColTwo={false} /> 
              </div>
            </div>
            <div
              className="col-lg-4"
              data-aos="fade-up"
              data-aos-duration="1500"
            >
              <div className="contact__rightside cmn__bg">
                <h4 className="mb-30">Feel free to contact me anytime</h4>
                <div className="contact__item mb-20">
                  <span className="he1">Email</span>
                  {/* ✨ CORRECCIÓN: mailto: para abrir el cliente de correo */}
                  <a href="mailto:raul@ortegafreelance.com">raul@ortegafreelance.com</a>
                </div>
                <div className="contact__item mb-20">
                  <span className="he1">Phone</span>
                  {/* ✨ CORRECCIÓN: tel: para iniciar la llamada (solo números) */}
                  <a href="tel:+584140419317">+(58) 414 041 9317 </a>
                </div>
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