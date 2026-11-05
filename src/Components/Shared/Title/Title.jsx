import React from "react";

// sortTitle ya no se pinta: la convención del sitio es sin etiquetas
// (eyebrow) sobre los titulares. Se acepta para no romper a quien lo pasa.
const Title = ({ mainTitle }) => {
  return (
    <div className="project__head text-center">
      <h2 className="fw-500" data-aos="fade-up" data-aos-duration="1200">
        {mainTitle}
      </h2>
    </div>
  );
};

export default Title;
