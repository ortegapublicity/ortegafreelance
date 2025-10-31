import React from "react";
import { Link } from "react-router-dom";

const Price = ({ image, planName, price, time, fetcher, id, description, result }) => {
  return (
    <div
      className="col-lg-4 col-md-6 col-sm-6"
      data-aos="fade-up"
      data-aos-duration="1000"
    >
      <div className={`process__item price__item ${id === 2 && "pri__active"}`}>
        <div className="pri__iconbox">
          <img src={image} alt={planName} />
        </div>

        {/* Nombre del plan */}
        <h4 className="white mb-16">{planName}</h4>

        {/* Descripción del plan */}
        {description && (
          <p className="price__description">{description}</p>
        )}

        {/* Precio */}
        <h2 className="big__title mb-12">
          {price}
          <span>/{time}</span>
        </h2>

        {/* Lista de features */}
        <ul className="pri__list mb-16">
          {fetcher?.map((fet, index) => (
            <li key={index}>{fet}</li>
          ))}
        </ul>

        {/* Resultado o promesa de valor */}
        {result && (
          <p className="price__result">{result}</p>
        )}

        {/* CTA */}
        <Link
          to={""}
          className="cmn--btn d-flex align-items-center justify-content-center gap-2 w-100"
        >
          <span>Start My Project Now</span>
          <span>
            <i className="bi bi-arrow-right fz-20"></i>
          </span>
        </Link>
      </div>
    </div>
  );
};

export default Price;
