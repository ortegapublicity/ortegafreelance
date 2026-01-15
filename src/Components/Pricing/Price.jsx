import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Price = ({ image, planName, price, time, fetcher, id, description, result }) => {
  // Usamos el namespace por defecto "translation"
  const { t } = useTranslation();

  // Si es clave i18n -> traduce; si es texto literal -> úsalo como fallback
  const tOr = (keyOrText) => t(keyOrText, { defaultValue: keyOrText });

  return (
    <div
      className="col-lg-4 col-md-6 col-sm-6"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div className={`process__item price__item ${id === 2 && "pri__active"}`}>
        <div className="pri__iconbox">
          <img src={image} alt={tOr(planName)} />
        </div>

        {/* Nombre del plan */}
        <h4 className="white mb-16">{tOr(planName)}</h4>

        {/* Descripción del plan */}
        {description && <p className="price__description">{tOr(description)}</p>}

        {/* Precio */}
        <h2 className="big__title mb-12">
          {price}
          <span>/{tOr(time)}</span>
        </h2>

        {/* Lista de features */}
        <ul className="pri__list mb-16">
          {fetcher?.map((fet, index) => (
            <li key={index}>{tOr(fet)}</li>
          ))}
        </ul>

        {/* Resultado o promesa de valor */}
        {result && <p className="price__result">{tOr(result)}</p>}

        {/* CTA: usa tu clave existente 'price.button' si está, y si no, 'Start Now' */}
        <Link
          to={"/checkout"}
          state={{ planName, price }}
          className="cmn--btn d-flex align-items-center justify-content-center gap-2 w-100"
        >
          <span>{t("price.button", { defaultValue: "Start Now" })}</span>
          <span><i className="bi bi-arrow-right fz-20"></i></span>
        </Link>
      </div>
    </div>
  );
};

export default Price;
