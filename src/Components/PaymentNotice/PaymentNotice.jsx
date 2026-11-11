import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import "./PaymentNotice.scss";

// «Ya pagué»: el cliente avisa de su pago (PayPal, ACH o wire). Lo envía a
// /api/pago-aviso, que manda un correo a Raúl con los datos y otro al cliente
// confirmando que se recibió el aviso, con la agenda, WhatsApp y redes.
// No confirma el pago: ni PayPal ni las transferencias avisan a la web solas,
// así que Raúl lo verifica y responde.

const TEXT = {
  es: {
    title: "¿Ya hiciste el pago? Avísame",
    intro: "Te llega un correo de confirmación y yo recibo el aviso para verificarlo y empezar.",
    name: "Nombre y apellido",
    email: "Correo",
    method: "Cómo pagaste",
    methods: { paypal: "PayPal / tarjeta", ach: "Transferencia ACH", wire: "Transferencia wire" },
    reference: "Referencia o número de confirmación (opcional)",
    send: "Enviar aviso de pago",
    sending: "Enviando…",
    ok: "¡Listo! Te envié un correo de confirmación. Revisa también la carpeta de spam.",
    error: "No se pudo enviar. Escríbeme por WhatsApp al +58 414 041 9317.",
  },
  en: {
    title: "Already paid? Let me know",
    intro: "You'll get a confirmation email and I'll get the notice to verify it and get started.",
    name: "Full name",
    email: "Email",
    method: "How you paid",
    methods: { paypal: "PayPal / card", ach: "ACH transfer", wire: "Wire transfer" },
    reference: "Reference or confirmation number (optional)",
    send: "Send payment notice",
    sending: "Sending…",
    ok: "Done! I sent you a confirmation email. Please check your spam folder too.",
    error: "It couldn't be sent. Message me on WhatsApp at +58 414 041 9317.",
  },
};

const PaymentNotice = ({ plan, amount, defaultMethod = "paypal", methods = ["paypal", "ach", "wire"] }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("es") ? "es" : "en";
  const tx = TEXT[lang];
  const [form, setForm] = useState({ nombre: "", email: "", metodo: defaultMethod, referencia: "", website: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | ok | error

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/pago-aviso", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, plan, monto: amount, idioma: lang }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || String(res.status));
      setStatus("ok");
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: "payment_notice", payment_type: form.metodo, value: Number(amount) || 0, currency: "USD" });
    } catch {
      setStatus("error");
    }
  };

  if (status === "ok") {
    return <div className="payment-notice payment-notice--ok">{tx.ok}</div>;
  }

  return (
    <form className="payment-notice" onSubmit={submit} onClick={(e) => e.stopPropagation()}>
      <p className="payment-notice__title">{tx.title}</p>
      <p className="payment-notice__intro">{tx.intro}</p>
      <label>
        {tx.name}
        <input type="text" value={form.nombre} onChange={set("nombre")} required maxLength={100} autoComplete="name" />
      </label>
      <label>
        {tx.email}
        <input type="email" value={form.email} onChange={set("email")} required maxLength={150} autoComplete="email" />
      </label>
      {methods.length > 1 && (
        <label>
          {tx.method}
          <select value={form.metodo} onChange={set("metodo")}>
            {methods.map((m) => (
              <option key={m} value={m}>{tx.methods[m]}</option>
            ))}
          </select>
        </label>
      )}
      <label>
        {tx.reference}
        <input type="text" value={form.referencia} onChange={set("referencia")} maxLength={120} />
      </label>
      {/* Campo trampa para bots: las personas no lo ven. */}
      <input type="text" value={form.website} onChange={set("website")} tabIndex={-1} autoComplete="off" className="payment-notice__hp" aria-hidden="true" />
      <button type="submit" disabled={status === "sending"}>
        {status === "sending" ? tx.sending : tx.send}
      </button>
      {status === "error" && <p className="payment-notice__error">{tx.error}</p>}
    </form>
  );
};

export default PaymentNotice;
