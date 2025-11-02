import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '../../Components/Shared/PageHeader/PageHeader';
import './Checkout.scss';
// Necesitas tu propia librería/componente de reCAPTCHA. 
// Asumo que 'ReCAPTCHA' ya está configurado para usarse.
import ReCAPTCHA from "react-google-recaptcha"; 
import { Paypal, Bank, CurrencyDollar, } from 'react-bootstrap-icons';

const Checkout = () => {
  const location = useLocation();
  // Se obtiene el plan y el precio del estado de la ruta, o valores por defecto
  const { planName: selectedPlanName = "Plan No Seleccionado", price: selectedPrice = "$0.00" } = location.state || {};
  
  // Estado para manejar si la información del usuario ya fue verificada
  const [isVerified, setIsVerified] = useState(false);
  // Estado para el método de pago seleccionado
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('paypal');
  // Estado para la verificación del reCAPTCHA
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
  // Estado para los datos del formulario de facturación
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    idNumber: '',
    country: '',
    address1: '',
    city: '',
    zip: '',
  });

  // Cálculo del precio
  const numericPrice = parseFloat(selectedPrice.replace('$', '').replace(',', ''));
  const subtotal = isNaN(numericPrice) ? 0 : numericPrice;
  const taxes = 0.00;
  const total = (subtotal + taxes).toFixed(2);

  // 🎯 PayPal Payment Routes (Se asume que estas rutas son correctas)
  const paypalLinks = {
    1050: "https://www.paypal.com/ncp/payment/Z36K9R9B56B9U",
    1650: "https://www.paypal.com/ncp/payment/L74D9ZQ7SL7ZC",
    2250: "https://www.paypal.com/ncp/payment/5D6JJKGL8J6UG"
  };

  // 🎯 Bank Transfer Info
  const transferInfo = (
    <div className="p-3 mt-3 border rounded bg-light small">
      <p><strong>Cuenta ACH:</strong> 028000024</p>
      <p><strong>Tipo de cuenta:</strong> Checking</p>
      <p><strong>Routing Wire:</strong> 021000021</p>
      <p><strong>Titular:</strong> RAUL ALBERTO ORTEGA TALAVERA</p>
      <p><strong>Dirección del banco:</strong> 270 Park Avenue, New York, NY 10017</p>
    </div>
  );

  // 🎯 Crypto Wallets
  const cryptoInfo = (
    <div className="p-3 mt-3 border rounded bg-light small">
      <p><strong>Red ETH (ERC20):</strong> 0x8D134699291Bc87Ebbe3B1Ff76e799bd5FB3F8c2</p>
      <p><strong>Red TRON (TRC20):</strong> TYM1tUs5Wc5xAgyGddpmcqhYQfyXgMwGqA</p>
      <p><strong>BNB Smart Chain:</strong> 0x8D134699291Bc87Ebbe3B1Ff76e799bd5FB3F8c2</p>
      <p><strong>Solana:</strong> DzrUN9tfCRiAjR9zNviRNHFUJkvih8N5SXmsFszL1QL3</p>
      <p><strong>Polygon:</strong> 0x8D134699291Bc87Ebbe3B1Ff76e799bd5FB3F8c2</p>
    </div>
  );

  // 🎯 Handle CAPTCHA verification
  const handleCaptchaChange = (value) => {
    setCaptchaVerified(!!value);
  };
  
  // 🎯 Manejador de cambios en el formulario
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };


  // 🎯 Handle form submit
  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Verificación de campos y reCAPTCHA
    if (
      formData.fullName &&
      formData.email &&
      formData.idNumber &&
      formData.country &&
      formData.address1 &&
      formData.city &&
      captchaVerified
    ) {
      // Simular envío de datos a Netlify (no pasa por aquí en producción)
      
      // Una vez que los datos son válidos, pasamos a la fase de pago
      setIsVerified(true); 
      // Si usas Netlify, aquí podrías redirigir o hacer un fetch POST manual. 
      // Para esta demo, solo cambiamos el estado.
    } else {
      // Nota: Reemplazar alert() por un componente modal en producción
      console.error("Por favor completa todos los campos y verifica el reCAPTCHA.");
      alert("Por favor completa todos los campos y verifica el reCAPTCHA.");
    }
  };

  return (
    <>
      <PageHeader mainTitle="Proceso de Pago" sortTitle="Completa tu Compra" />

      <section className="checkout__section py-120">
        <div className="container">
          <div className="row g-5">

            {/* Columna izquierda: Información o Pago */}
            <div className="col-lg-7">
              {/* --- LÓGICA CONDICIONAL ARREGLADA --- */}
              {!isVerified ? (
                <>
                  <h3 className="mb-4 text-primary">Información de Contacto y Facturación</h3>
                  <div className="checkout__form p-4 rounded shadow-sm bg-white">
                    <form
                      name="checkout-form"
                      method="POST"
                      data-netlify="true"
                      onSubmit={handleFormSubmit}
                    >
                      {/* Netlify Hidden Field */}
                      <input type="hidden" name="form-name" value="checkout-form" />

                      {/* Fila 1: Nombre y Correo */}
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="fullName" className="form-label">Nombre Completo</label>
                          <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            className="form-control"
                            placeholder="Escribe tu nombre"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="email" className="form-label">Correo Electrónico</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            placeholder="tu.correo@ejemplo.com"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Fila 2: País y Dirección */}
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="country" className="form-label">País</label>
                          <select
                            id="country"
                            name="country"
                            className="form-select"
                            value={formData.country}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">Selecciona tu país...</option>
                            <option value="VE">Venezuela</option>
                            <option value="US">Estados Unidos</option>
                            <option value="COL">Colombia</option>
                            <option value="MEX">México</option>
                            <option value="UY">Uruguay</option>
                            <option value="AR">Argentina</option>
                            <option value="BR">Brasil</option>
                            <option value="CL">Chile</option>
                            <option value="PE">Perú</option>
                            <option value="EC">Ecuador</option>
                            <option value="PY">Paraguay</option>
                            <option value="BO">Bolivia</option>
                            <option value="HN">Honduras</option>
                            <option value="GT">Guatemala</option>
                            <option value="CR">Costa Rica</option>
                            <option value="PA">Panamá</option>
                            <option value="SV">El Salvador</option>
                            <option value="NI">Nicaragua</option>
                            <option value="DO">República Dominicana</option>
                            <option value="IT">Italia</option>
                            <option value="ES">España</option>
                            <option value="FR">Francia</option>
                            <option value="DE">Alemania</option>
                            <option value="PT">Portugal</option>
                            <option value="GB">Reino Unido</option>
                            <option value="CH">Suiza</option>
                            <option value="AU">Australia</option>
                            <option value="NZ">Nueva Zelanda</option>
                            <option value="CN">China</option>
                            <option value="JP">Japón</option>
                            <option value="IN">India</option>
                            <option value="RU">Rusia</option>
                            <option value="SA">Arabia Saudita</option>
                            <option value="AE">Emiratos Árabes Unidos</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="address1" className="form-label">Dirección (Línea 1)</label>
                          <input
                            type="text"
                            id="address1"
                            name="address1"
                            className="form-control"
                            placeholder="Calle, número, urbanización"
                            value={formData.address1}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Fila 3: Ciudad y Código Postal */}
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="city" className="form-label">Ciudad</label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            className="form-control"
                            placeholder="Ciudad o Municipio"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="zip" className="form-label">Código Postal</label>
                          <input
                            type="text"
                            id="zip"
                            name="zip"
                            className="form-control"
                            placeholder="0000"
                            value={formData.zip}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      {/* Campo RUT / RIF / NIT */}
                      <div className="col-md-12 mb-3">
                        <label htmlFor="idNumber" className="form-label">RUT / RIF / NIT / NTC</label>
                        <input
                          type="text"
                          id="idNumber"
                          name="idNumber"
                          className="form-control"
                          placeholder="Ejemplo: J-12345678-9 o 123456789"
                          value={formData.idNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      {/* reCAPTCHA */}
                      <div className="mt-3">
                        <ReCAPTCHA
                          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LdiV_4rAAAAAAr_73Pwedv9qaLMMNlyjM7ujwEN"}
                          onChange={handleCaptchaChange}
                        />
                      </div>

                      <button className="common__btn w-100 mt-4" type="submit">
                        Verificar Identidad
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="checkout__payment mt-5 p-4 rounded shadow-sm bg-white">
                  <h3 className="mb-4 text-primary">Métodos de Pago</h3>

                  {/* PAYPAL */}
                  <div
                    className={`payment-option-item ${selectedPaymentMethod === 'paypal' ? 'active' : ''}`}
                    onClick={() => setSelectedPaymentMethod('paypal')}
                  >
                    <input type="radio" checked={selectedPaymentMethod === 'paypal'} readOnly />
                    <label><Paypal className="payment-icon me-2" /> PayPal</label>
                    {selectedPaymentMethod === 'paypal' && (
                      <div className="p-3 mt-3 border rounded text-center">
                        <p className="small text-muted">Serás redirigido a PayPal para completar el pago.</p>
                        <form
                          action={paypalLinks[numericPrice]}
                          method="post"
                          target="_blank"
                        >
                          <input type="submit" value="Comprar ahora" className="btn btn-warning fw-bold text-dark" />
                          <img src="https://www.paypalobjects.com/images/Debit_Credit.svg" alt="cards" width="100" />
                        </form>
                      </div>
                    )}
                  </div>

                  {/* TRANSFERENCIA */}
                  <div
                    className={`payment-option-item ${selectedPaymentMethod === 'transfer' ? 'active' : ''}`}
                    onClick={() => setSelectedPaymentMethod('transfer')}
                  >
                    <input type="radio" checked={selectedPaymentMethod === 'transfer'} readOnly />
                    <label><Bank className="payment-icon me-2" /> Transferencia Bancaria (ACH / Zelle)</label>
                    {selectedPaymentMethod === 'transfer' && (
                      <>
                        <p className="small mt-2 text-danger">
                          Realiza tu pago mediante transferencia bancaria. El servicio se activará tras la confirmación del pago.
                        </p>
                        {transferInfo}
                      </>
                    )}
                  </div>

                  {/* CRYPTO */}
                  <div
                    className={`payment-option-item ${selectedPaymentMethod === 'crypto' ? 'active' : ''}`}
                    onClick={() => setSelectedPaymentMethod('crypto')}
                  >
                    <input type="radio" checked={selectedPaymentMethod === 'crypto'} readOnly />
                    <label><CurrencyDollar className="payment-icon me-2" /> Criptomonedas (USDT)</label>
                    {selectedPaymentMethod === 'crypto' && (
                      <>
                        <p className="small mt-2 text-warning">Envía exactamente <strong>${total}</strong> USDT a cualquiera de las siguientes redes:</p>
                        {cryptoInfo}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Columna derecha: resumen */}
            <div className="col-lg-5">
              <div className="order-summary p-4 bg-light rounded shadow-lg sticky-top">
                <h4 className='mb-4'>Resumen de la Orden</h4>
                <div className="d-flex justify-content-between my-3 border-bottom pb-2">
                  <span>Servicio Contratado:</span>
                  <span className='fw-bold'>{selectedPlanName}</span>
                </div>
                <div className="d-flex justify-content-between my-3">
                  <span>Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between my-3">
                  <span>Impuestos:</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5 pt-2">
                  <span>Total:</span>
                  <span className="text-primary">${total}</span>
                </div>
                <p className="small mt-4 text-muted border-top pt-3">
                  Al hacer clic en “Finalizar Compra y Pagar”, aceptas nuestros términos y condiciones de servicio.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Checkout;
