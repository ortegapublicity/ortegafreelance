import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
// Puedes usar el ícono de Bootstrap que ya tienes instalado
import { CheckCircleFill, ArrowRight } from "react-bootstrap-icons";

const PaymentSuccess = () => {
  const { t } = useTranslation();

  return (
    <section className="payment-success-section pt-120 pb-120 d-flex align-items-center justify-content-center" style={{ minHeight: "80vh", backgroundColor: "#f4f4f4" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div 
              className="success-card text-center p-5" 
              style={{ backgroundColor: "#ffffff", borderRadius: "16px", boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.05)" }}
            >
              {/* Ícono de Check de color turquesa de tu marca */}
              <div className="icon-wrapper mb-4">
                <CheckCircleFill style={{ fontSize: "80px", color: "#00cfba" }} />
              </div>

              {/* Textos de agradecimiento */}
              <h2 className="mb-3" style={{ color: "#222", fontWeight: "700" }}>
                {t("checkout.success.title", { defaultValue: "Thank you!" })}
              </h2>
              <p className="fz-18 mb-4" style={{ color: "#666" }}>
                {t("checkout.success.message", { defaultValue: "Your payment has been received successfully. We will contact you shortly to start your project." })}
              </p>

              {/* Botón de regreso o próximos pasos */}
              <div className="mt-5">
                <Link
                  to="/"
                  className="cmn--btn d-inline-flex align-items-center justify-content-center gap-2"
                  style={{ backgroundColor: "#00cfba", color: "#fff", border: "none", borderRadius: "8px", padding: "12px 30px" }}
                >
                  <span>{t("checkout.success.button", { defaultValue: "Back to Home" })}</span>
                  <ArrowRight className="fz-20" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PaymentSuccess;