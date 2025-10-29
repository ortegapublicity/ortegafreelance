import React, { useState } from "react"; // Importar useState
import { ArrowRight, CheckCircleFill, ExclamationCircleFill } from "react-bootstrap-icons"; // Añadir iconos de estado

// Endpoint de FormSubmit
const FORMSUBMIT_URL = "https://formsubmit.co/ajax/raul@ortegafreelance.com"; 

const Form = ({ isColTwo }) => {
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState(null); // { type: 'success'/'error', text: '...' }
  const [loading, setLoading] = useState(false);

  // Maneja el cambio en los campos del formulario
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Maneja el envío del formulario usando Fetch (sin redirección)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Detiene el comportamiento de envío por defecto (que causaría la redirección)
    setLoading(true);
    setMessage(null);

    try {
      // Usamos FormData para construir el cuerpo de la solicitud
      const form = e.target;
      const data = new FormData(form);

      const response = await fetch(form.action, {
        method: form.method,
        body: data,
        headers: {
          'Accept': 'application/json', // Requerido por FormSubmit AJAX
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ 
          type: 'success', 
          text: '¡Mensaje enviado con éxito! Te contactaré pronto.' 
        });
        form.reset(); // Limpia el formulario
        setFormData({});
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Hubo un error al enviar el mensaje. Intenta de nuevo.' 
        });
      }
    } catch (error) {
      console.error("Error sending form:", error);
      setMessage({ 
        type: 'error', 
        text: 'Error de conexión. Por favor, verifica tu red.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="replay__box cmn__bg">
      <h3>Leave a Reply</h3>
      <p>
        Your email address will not be published. Required fields are marked *
      </p>
      
      {/* ✨ CORRECCIÓN: Usar onSubmit para manejar el envío con JS */}
      <form 
        action={`https://formsubmit.co/ajax/raul@ortegafreelance.com`} // Usar endpoint AJAX
        method="POST" 
        className="row g-4"
        onSubmit={handleSubmit}
      >
        
        {/* Campo Oculto de Honeypot (Anti-bot simple) */}
        <input type="text" name="_honeypot" style={{ display: 'none' }} /> 

        {/* Campo Oculto para redirección de éxito (opcional, aunque con AJAX no es necesario) */}
        <input type="hidden" name="_next" value="" />

        {/* Campo de Nombre (name="Name") */}
        <div className={` ${isColTwo ? "col-lg-6" : "col-lg-12"}`}>
          <input 
            type="text" 
            name="Name" 
            placeholder="Name" 
            onChange={handleChange}
            required 
          />
        </div>
        
        {/* Campo de Email (name="Email") */}
        <div className={` ${isColTwo ? "col-lg-6" : "col-lg-12"}`}>
          <input 
            type="email" 
            name="Email" 
            placeholder="Email" 
            onChange={handleChange}
            required 
          />
        </div>
        
        {/* Campo de Comentarios (name="Message") */}
        <div className="col-lg-12">
          <textarea
            name="Message"
            rows="5"
            placeholder="Write Comments"
            onChange={handleChange}
            required
          ></textarea>
        </div>
        
        {/* Mostrar mensaje de estado */}
        {message && (
          <div className={`col-lg-12 p-3 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            <span className="d-flex align-items-center justify-content-center gap-2">
              {message.type === 'success' ? <CheckCircleFill /> : <ExclamationCircleFill />}
              {message.text}
            </span>
          </div>
        )}

        {/* Botón de envío */}
        <button
          type="submit" 
          className="d-flex fw-500 cmn--btn align-items-center gap-2"
          disabled={loading} // Deshabilitar mientras se envía
        >
          <span className="get__text">
            {loading ? 'Sending...' : 'Submit Comment'}
          </span>
          <span>
            <i className=" fz-20">
              {" "}
              <ArrowRight />{" "}
            </i>
          </span>
        </button>
      </form>
    </div>
  );
};

export default Form;
