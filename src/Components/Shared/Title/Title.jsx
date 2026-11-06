import React from "react";

// sortTitle ya no se pinta: la convención del sitio es sin etiquetas
// (eyebrow) sobre los titulares. Se acepta para no romper a quien lo pasa.
// Los títulos de sección van en dos líneas: el texto las separa con "\n".
const Title = ({ mainTitle = "" }) => {
  return (
    <div className="project__head text-center">
      <h2 className="fw-500" data-aos="fade-up" data-aos-duration="1200">
        {mainTitle.split("\n").map((line) => (
          <span className="d-block" key={line}>
            {line}
          </span>
        ))}
      </h2>
    </div>
  );
};

export default Title;
