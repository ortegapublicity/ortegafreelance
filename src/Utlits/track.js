// Eventos para Google Tag Manager (GTM-P7S9QXNR). Cada nombre de evento
// necesita su trigger "Custom Event" en GTM para llegar a GA4 / LinkedIn.

const push = (data) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(data);
};

// Clic en un CTA. type: "book_call" | "view_plans" | "start_checkout";
// location: dónde está el botón (hero, header, drawer, pricing).
export const trackCta = (type, location) =>
  push({ event: "cta_click", cta_type: type, cta_location: location });

// Calendly avisa por postMessage cuando alguien reserva dentro del iframe.
// Devuelve la función para quitar el listener.
export const listenCalendlyBookings = () => {
  const onMessage = (e) => {
    if (e.origin !== "https://calendly.com") return;
    if (e.data?.event === "calendly.event_scheduled") {
      push({ event: "videollamada_agendada" });
    }
  };
  window.addEventListener("message", onMessage);
  return () => window.removeEventListener("message", onMessage);
};
