import React from "react";
import { useTranslation } from "react-i18next";

import paisita from "../../assets/img/clients/paisita.png";
import nexolab from "../../assets/img/clients/nexolab.png";
import lights from "../../assets/img/clients/lights.png";
import brandtop from "../../assets/img/clients/brandtop.png";
import nfAutoparts from "../../assets/img/clients/nfautoparts.png";
import javitoyz from "../../assets/img/clients/javitoyz.png";
import reyAntiguedades from "../../assets/img/clients/reyantiguedades.png";
import todxs from "../../assets/img/clients/todxs.png";

// Logos de clientes reales. Se pintan todos como silueta del mismo tono
// (ver partner.scss) para que la franja se lea uniforme sobre blanco: el de
// Nexolab, por ejemplo, tiene letras blancas pensadas para fondo oscuro.
// Antes era un carrusel de 5 por fila que en el móvil dejaba los logos
// diminutos; ahora es una cuadrícula (2 columnas en móvil, 4 en escritorio).
const clients = [
  { name: "El Paisita", logo: paisita },
  { name: "NEXO LAB", logo: nexolab },
  { name: "Lights English Academy", logo: lights },
  { name: "Brandtop", logo: brandtop },
  { name: "NF Autoparts", logo: nfAutoparts },
  { name: "JaviToyz", logo: javitoyz },
  { name: "Rey Antigüedades", logo: reyAntiguedades },
  { name: "Todxs Podemos Ser", logo: todxs },
];

const Partner = () => {
  const { t } = useTranslation();
  return (
    <div className="sponsor__area pt-120">
      <h4 className="sponsor__title" data-aos="fade-down" data-aos-duration="1000">
        {t("partner.title")}
      </h4>
      <ul className="sponsor__grid">
        {clients.map(({ name, logo }) => (
          <li key={name} className="sponsor__slide">
            <img src={logo} alt={name} loading="lazy" />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Partner;
