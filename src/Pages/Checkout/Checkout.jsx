import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '../../Components/Shared/PageHeader/PageHeader';
import './Checkout.scss';
// Necesitas tu propia librería/componente de reCAPTCHA. 
// Asumo que 'ReCAPTCHA' ya está configurado para usarse.
import ReCAPTCHA from "react-google-recaptcha"; 
import { Paypal, Bank, CurrencyDollar, } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

const Checkout = () => {
  const { t } = useTranslation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const location = useLocation();
  // Se obtiene el plan y el precio del estado de la ruta, o valores por defecto
  const { planName: selectedPlanName = t('checkout.planNotSelected'), price: selectedPrice = "$0.00" } = location.state || {};
  
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

  // ---------------------------------------------------------
  // 🟢 AQUÍ COMIENZA LA NUEVA FUNCIÓN DE RASTREO (TRACKING)
  // ---------------------------------------------------------
  const trackPurchaseEvent = () => {
    // 1. Verificamos que dataLayer exista
    window.dataLayer = window.dataLayer || [];
    
    // 2. Enviamos el evento a Google Tag Manager
    window.dataLayer.push({
      'event': 'purchase_completed', // Este nombre es clave para GTM
      'transactionValue': parseFloat(total), // El valor numérico ($)
      'transactionCurrency': 'USD',
      'productName': selectedPlanName,
      'paymentMethod': selectedPaymentMethod
    });
    
    console.log("Evento de compra enviado a GTM:", total, selectedPaymentMethod);
  };
  // ---------------------------------------------------------

  // 🎯 Bank Transfer Info
  const transferInfo = (
    <div className="p-3 mt-3 border rounded bg-light small">
      <p><strong>{t('checkout.bankNameLabel')}</strong> {t('checkout.bankName')}</p>
      <p><strong>{t('checkout.accountNumberLabel')}</strong> {t('checkout.accountNumber')}</p>
      <p><strong>{t('checkout.accountTypeLabel')}</strong> {t('checkout.accountType')}</p>
      <p><strong>{t('checkout.swiftCodeLabel')}</strong> {t('checkout.swiftCode')}</p>
      <p><strong>{t('checkout.accountHolderLabel')}</strong> {t('checkout.accountHolder')}</p>
      <p><strong>{t('checkout.bankAddressLabel')}</strong> {t('checkout.bankAddress')}</p>
      
      {/* Botón agregado para confirmar Transferencia */}
      <button 
        className="btn btn-primary w-100 mt-3"
        onClick={() => {
            trackPurchaseEvent(); // Dispara el evento al hacer clic
            alert("¡Gracias! Hemos registrado tu intención de pago. Por favor envía el comprobante a nuestro correo/WhatsApp.");
        }}
      >
        {t('checkout.confirmTransfer') || "Ya realicé la transferencia"}
      </button>
    </div>
  );

  // 🎯 Crypto Wallets
  const cryptoInfo = (
    <div className="p-3 mt-3 border rounded bg-light small">
      <p><strong>{t('checkout.ethNetworkLabel')}</strong> {t('checkout.ethNetwork')}</p>
      <p><strong>{t('checkout.tronNetworkLabel')}</strong> {t('checkout.tronNetwork')}</p>
      <p><strong>{t('checkout.bnbNetworkLabel')}</strong> {t('checkout.bnbNetwork')}</p>
      <p><strong>{t('checkout.solanaNetworkLabel')}</strong> {t('checkout.solanaNetwork')}</p>
      <p><strong>{t('checkout.polygonNetworkLabel')}</strong> {t('checkout.polygonNetwork')}</p>
      
      {/* Botón agregado para confirmar Cripto */}
      <button 
        className="btn btn-warning w-100 mt-3 text-dark fw-bold"
        onClick={() => {
            trackPurchaseEvent(); // Dispara el evento al hacer clic
            alert("¡Gracias! Hemos registrado tu intención de pago. Envíanos el Hash de la transacción.");
        }}
      >
        {t('checkout.confirmCrypto') || "Ya realicé el pago Cripto"}
      </button>
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
      // Pasamos a la fase de pago
      setIsVerified(true); 
    } else {
      console.error(t('checkout.formError'));
      alert(t('checkout.formError'));
    }
  };
  
  return (
    <>
      <PageHeader mainTitle={t('checkout.mainTitle')} sortTitle={t('checkout.sortTitle')} />

      <section className="checkout__section py-120">
        <div className="container">
          <div className="row g-5">

            {/* Columna izquierda: Información o Pago */}
            <div className="col-lg-7">
              {!isVerified ? (
                <>
                  <h3 className="mb-4 text-primary">{t('checkout.contactAndBilling')}</h3>
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
                          <label htmlFor="fullName" className="form-label">{t('checkout.fullName')}</label>
                          <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            className="form-control"
                            placeholder={t('checkout.fullNamePlaceholder')}
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="email" className="form-label">{t('checkout.email')}</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-control"
                            placeholder={t('checkout.emailPlaceholder')}
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Fila 2: País y Dirección */}
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="country" className="form-label">{t('checkout.country')}</label>
                          <select
                            id="country"
                            name="country"
                            className="form-select"
                            value={formData.country}
                            onChange={handleInputChange}
                            required
                          >
                            <option value="">{t('checkout.countryPlaceholder')}</option>
                            <option value="VE">{t('checkout.countries.ve')}</option>
                            <option value="US">{t('checkout.countries.us')}</option>
                            <option value="COL">{t('checkout.countries.co')}</option>
                            <option value="MEX">{t('checkout.countries.mx')}</option>
                            <option value="UY">{t('checkout.countries.uy')}</option>
                            <option value="AR">{t('checkout.countries.ar')}</option>
                            <option value="BR">{t('checkout.countries.br')}</option>
                            <option value="CL">{t('checkout.countries.cl')}</option>
                            <option value="PE">{t('checkout.countries.pe')}</option>
                            <option value="EC">{t('checkout.countries.ec')}</option>
                            <option value="PY">{t('checkout.countries.py')}</option>
                            <option value="BO">{t('checkout.countries.bo')}</option>
                            <option value="HN">{t('checkout.countries.hn')}</option>
                            <option value="GT">{t('checkout.countries.gt')}</option>
                            <option value="CR">{t('checkout.countries.cr')}</option>
                            <option value="PA">{t('checkout.countries.pa')}</option>
                            <option value="SV">{t('checkout.countries.sv')}</option>
                            <option value="NI">{t('checkout.countries.ni')}</option>
                            <option value="DO">{t('checkout.countries.do')}</option>
                            <option value="IT">{t('checkout.countries.it')}</option>
                            <option value="ES">{t('checkout.countries.es')}</option>
                            <option value="FR">{t('checkout.countries.fr')}</option>
                            <option value="DE">{t('checkout.countries.de')}</option>
                            <option value="PT">{t('checkout.countries.pt')}</option>
                            <option value="GB">{t('checkout.countries.gb')}</option>
                            <option value="CH">{t('checkout.countries.ch')}</option>
                            <option value="AU">{t('checkout.countries.au')}</option>
                            <option value="NZ">{t('checkout.countries.nz')}</option>
                            <option value="CN">{t('checkout.countries.cn')}</option>
                            <option value="JP">{t('checkout.countries.jp')}</option>
                            <option value="IN">{t('checkout.countries.in')}</option>
                            <option value="RU">{t('checkout.countries.ru')}</option>
                            <option value="SA">{t('checkout.countries.sa')}</option>
                            <option value="AE">{t('checkout.countries.ae')}</option>
                          </select>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="address1" className="form-label">{t('checkout.address')}</label>
                          <input
                            type="text"
                            id="address1"
                            name="address1"
                            className="form-control"
                            placeholder={t('checkout.addressPlaceholder')}
                            value={formData.address1}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      {/* Fila 3: Ciudad y Código Postal */}
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label htmlFor="city" className="form-label">{t('checkout.city')}</label>
                          <input
                            type="text"
                            id="city"
                            name="city"
                            className="form-control"
                            placeholder={t('checkout.cityPlaceholder')}
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="col-md-6 mb-3">
                          <label htmlFor="zip" className="form-label">{t('checkout.zip')}</label>
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
                        <label htmlFor="idNumber" className="form-label">{t('checkout.idNumber')}</label>
                        <input
                          type="text"
                          id="idNumber"
                          name="idNumber"
                          className="form-control"
                          placeholder={t('checkout.idNumberPlaceholder')}
                          value={formData.idNumber}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      {/* reCAPTCHA */}
                      <div className="mt-3">
                        <ReCAPTCHA
                          sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LcQ2v8rAAAAAFqiyZqI8lETPeC9fi_3_3BvQXji"}
                          onChange={handleCaptchaChange}
                        />
                      </div>

                      <button className="common__btn w-100 mt-4" type="submit">
                        {t('checkout.verifyIdentity')}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="checkout__payment mt-5 p-4 rounded shadow-sm bg-white">
                  <h3 className="mb-4 text-primary">{t('checkout.paymentMethods')}</h3>

                  {/* PAYPAL */}
                  <div
                    className={`payment-option-item ${selectedPaymentMethod === 'paypal' ? 'active' : ''}`}
                    onClick={() => setSelectedPaymentMethod('paypal')}
                  >
                    <input type="radio" checked={selectedPaymentMethod === 'paypal'} readOnly />
                    <label><Paypal className="payment-icon me-2" /> {t('checkout.paypal')}</label>
                    {selectedPaymentMethod === 'paypal' && (
                      <div className="p-3 mt-3 border rounded text-center">
                        <p className="small text-muted">{t('checkout.paypalRedirect')}</p>
                        <form
                          action={paypalLinks[numericPrice]}
                          method="post"
                          target="_blank"
                          onSubmit={trackPurchaseEvent} // 🟢 AQUÍ SE AGREGA EL RASTREO
                        >
                          <input type="submit" value={t('checkout.buyNow')} className="btn btn-warning fw-bold text-dark" />
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
                    <label><Bank className="payment-icon me-2" /> {t('checkout.bankTransfer')}</label>
                    {selectedPaymentMethod === 'transfer' && (
                      <>
                        <p className="small mt-2 text-danger">
                          {t('checkout.bankTransferInfo')}
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
                    <label><CurrencyDollar className="payment-icon me-2" /> {t('checkout.crypto')}</label>
                    {selectedPaymentMethod === 'crypto' && (
                      <>
                        <p className="small mt-2 text-warning">{t('checkout.cryptoInfo')} <strong>${total}</strong> {t('checkout.usdt')}</p>
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
                <h4 className='mb-4'>{t('checkout.orderSummary')}</h4>
                <div className="d-flex justify-content-between my-3 border-bottom pb-2">
                  <span>{t('checkout.serviceHired')}:</span>
                  <span className='fw-bold'>{selectedPlanName}</span>
                </div>
                <div className="d-flex justify-content-between my-3">
                  <span>{t('checkout.subtotal')}:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between my-3">
                  <span>{t('checkout.taxes')}:</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5 pt-2">
                  <span>{t('checkout.total')}:</span>
                  <span className="text-primary">${total}</span>
                </div>
                <p className="small mt-4 text-muted border-top pt-3">
                  {t('checkout.terms')}
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