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
  },
  { 
    id: "02",
    headingKey: "service.branding.heading",
    subheadingKey: "service.branding.subheading",
    paraKey: "service.branding.para",
  },
  { 
    id: "03",
    headingKey: "service.uiux.heading",
    subheadingKey: "service.uiux.subheading",
    paraKey: "service.uiux.para",
  },
  { 
    id: "04",
    headingKey: "service.paidmedia.heading",
    subheadingKey: "service.paidmedia.subheading",
    paraKey: "service.paidmedia.para",
  },
  { 
    id: "05",
    headingKey: "service.video.heading",
    subheadingKey: "service.video.subheading",
    paraKey: "service.video.para",
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
          {serviceList.map((service) => ( // <-- Corregido para usar 'service'
            <Service
            key={service.id}
            id={service.id}
            // Usamos t() para traducir las llaves del objeto 'service'
            heading={t(service.headingKey)} 
            subheading={t(service.subheadingKey)}
            para={t(service.paraKey)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
