import React from "react";
import Service from "./Service";
import Title from "../Shared/Title/Title";
import { useTranslation } from 'react-i18next';

const serviceList = [
  { 
    id: "01",
    headingKey: "service.illustration.heading", 
    subheadingKey: "service.illustration.subheading", 
    paraKey: "service.illustration.para",
    // ✨ NUEVO: Ruta URL pública para el detalle del servicio
    linkTo: "/services/illustration-design", 
  },
  { 
    id: "02",
    headingKey: "service.branding.heading",
    subheadingKey: "service.branding.subheading",
    paraKey: "service.branding.para",
    // ✨ NUEVO: Ruta URL pública para el detalle del servicio
    linkTo: "/services/business-branding",
  },
  { 
    id: "03",
    headingKey: "service.uiux.heading",
    subheadingKey: "service.uiux.subheading",
    paraKey: "service.uiux.para",
    // ✨ NUEVO: Ruta URL pública para el detalle del servicio
    linkTo: "/services/web-design",
  },
  { 
    id: "04",
    headingKey: "service.paidmedia.heading",
    subheadingKey: "service.paidmedia.subheading",
    paraKey: "service.paidmedia.para",
    // ✨ NUEVO: Ruta URL pública para el detalle del servicio
    linkTo: "/services/paid-media",
  },
  { 
    id: "05",
    headingKey: "service.video.heading",
    subheadingKey: "service.video.subheading",
    paraKey: "service.video.para",
    // ✨ NUEVO: Ruta URL pública para el detalle del servicio
    linkTo: "/services/video-editing",
  },
];
const Services = ({ isHeading }) => {
  const { t } = useTranslation();

  return (
    <section
      id="services"
      className={`service__section overhid ${isHeading && "pt-120"}  pb-120`}
    >
      <div className="container">
        {isHeading && (
          <Title
            // 1. Traducción de Títulos
            mainTitle={t('services.mainTitle')} 
            sortTitle={t('services.sortTitle')}
          />
        )}

        <div className={`service__uniquewrap `}>
          {serviceList.map((service) => ( 
            <Service
            key={service.id}
            id={service.id}
            // Usamos t() para traducir las llaves del objeto 'service'
            heading={t(service.headingKey)} 
            subheading={t(service.subheadingKey)}
            para={t(service.paraKey)}
            // ✨ IMPORTANTE: Pasamos la nueva prop de enlace
            linkTo={service.linkTo} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
