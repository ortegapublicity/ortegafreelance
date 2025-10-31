import React from "react";
import { ArrowUpRight } from "react-bootstrap-icons";
import { Link } from "react-router-dom";

// ✨ CAMBIO CLAVE: Agregamos 'linkTo' a las props que recibe el componente.
const Service = ({ heading, subHeading, para, id, linkTo }) => {
  // Aseguramos que la ruta sea válida, usando '#' como fallback si linkTo es undefined.
  const targetLink = linkTo || '#'; 

  return (
    <div
      className="service__unique__item pb-40 pt-40"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div className="left__service">
        <div className="serial__adjust">
          <span> {id} </span>
          <div className="cont">
            <h5>{subHeading}</h5>
            <h2>
              {/* ✨ CAMBIO: Usamos la prop linkTo en el título */}
              <Link to={targetLink}> {heading} </Link> 
            </h2>
          </div>
        </div>
        <p className="pra">{para}</p>
      </div>
      
      {/* ✨ CAMBIO: Usamos la prop linkTo en el icono de flecha */}
      <Link to={targetLink} className="common__icon">
        <ArrowUpRight className="i" />
      </Link>
    </div>
  );
};

export default Service;
