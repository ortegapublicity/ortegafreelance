import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Traducciones
const resources = {
  en: {
    translation: {
      home: "Home",
      services: "Services",
      "services.mainTitle": "My Special Service For Your Business Development",
      "services.sortTitle": "What I Do",

      "service.illustration.heading": "Illustration Design",
      "service.illustration.subheading": "Designer",
      "service.illustration.para": "Transform ideas into striking visuals that connect emotionally and strengthen your brand’s identity.",

      "service.branding.heading": "Business Branding",
      "service.branding.subheading": "Branding",
      "service.branding.para": "Build a brand that sells: from strategy and logo design to a consistent digital presence across all platforms.",

      "service.uiux.heading": "Web UI/UX Design",
      "service.uiux.subheading": "UI/UX Design",
      "service.uiux.para": "Designing user-focused, responsive websites that look great and drive real business performance.",

      "service.paidmedia.heading": "Paid Media",
      "service.paidmedia.subheading": "Media Buyer",
      "service.paidmedia.para": "Maximize ROI with targeted Meta and Google Ads campaigns that turn traffic into measurable results.",

      "service.video.heading": "Video Editing",
      "service.video.subheading": "Audiovisuals",
      "service.video.para": "Create high-impact videos that tell your story, capture attention, and enhance your brand’s credibility.",
    }
    ,
  },
  es: {
    translation: {
      home: "Inicio",
      services: "Servicios",
      "services.mainTitle": "Mi Servicio Especial para el Desarrollo de tu Negocio",
      "services.sortTitle": "Lo Que Hago",

      "service.illustration.heading": "Diseño de Ilustración",
      "service.illustration.subheading": "Diseñador",
      "service.illustration.para": "Transforma ideas en visuales impactantes que conectan emocionalmente y fortalecen la identidad de tu marca.",

      "service.branding.heading": "Branding Empresarial",
      "service.branding.subheading": "Branding",
      "service.branding.para": "Construye una marca que vende: desde la estrategia y el diseño del logo hasta una presencia digital consistente en todas las plataformas.",

      "service.uiux.heading": "Diseño Web UI/UX",
      "service.uiux.subheading": "Diseño UI/UX",
      "service.uiux.para": "Diseño de sitios web responsivos y centrados en el usuario que se ven geniales e impulsan el rendimiento empresarial real.",

      "service.paidmedia.heading": "Medios Pagados",
      "service.paidmedia.subheading": "Comprador de Medios (Media Buyer)",
      "service.paidmedia.para": "Maximiza el ROI con campañas segmentadas de Meta y Google Ads que convierten el tráfico en resultados medibles.",

      "service.video.heading": "Edición de Video",
      "service.video.subheading": "Audiovisuales",
      "service.video.para": "Crea videos de alto impacto que cuentan tu historia, capturan la atención y mejoran la credibilidad de tu marca.",
    }
    ,
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // idioma por defecto
    interpolation: {
      escapeValue: false
    }
  });

  window.i18n = i18n;

export default i18n;
