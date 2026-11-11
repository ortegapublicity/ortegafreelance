import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageHeader from '../../Components/Shared/PageHeader/PageHeader';
import './Checkout.scss';
import { Paypal, Bank } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';
import PaymentNotice from '../../Components/PaymentNotice/PaymentNotice';

// Transferencia en EE. UU. (ACH o wire). El número de cuenta y el de ruta NO
// están en el código (el repo es público): salen de las variables de Netlify
// VITE_ACH_CUENTA y VITE_ACH_RUTA, que pone Raúl. Si faltan, se pide escribir
// por WhatsApp para recibir los datos.
const ACH = {
  titular: 'Raul Alberto Ortega Talavera',
  banco: 'Lead Bank',
  direccion: '1801 Main St., Kansas City, MO 64108',
  cuenta: import.meta.env.VITE_ACH_CUENTA || '',
  ruta: import.meta.env.VITE_ACH_RUTA || '',
};
const ACH_TEXT = {
  es: {
    label: 'Transferencia bancaria en EE. UU. (ACH o Wire)',
    intro: 'Envía el monto exacto desde tu banco en EE. UU. a esta cuenta. Después avísame abajo.',
    titular: 'Titular', banco: 'Banco', tipo: 'Tipo de cuenta', tipoValor: 'Corriente (checking)',
    cuenta: 'Número de cuenta', ruta: 'Número de ruta ACH y Wire', direccion: 'Dirección del banco',
    tiempos: 'ACH: de 1 a 3 días hábiles. Wire: en el día (las wire de terceros pueden tardar hasta 3 días hábiles).',
    copiar: 'Copiar', copiado: 'Copiado',
    faltan: 'Escríbeme por WhatsApp al +58 414 041 9317 y te paso los datos de la cuenta.',
  },
  en: {
    label: 'US bank transfer (ACH or Wire)',
    intro: 'Send the exact amount from your US bank to this account. Then let me know below.',
    titular: 'Account holder', banco: 'Bank', tipo: 'Account type', tipoValor: 'Checking',
    cuenta: 'Account number', ruta: 'ACH and Wire routing number', direccion: 'Bank address',
    tiempos: 'ACH: 1 to 3 business days. Wire: same day (third-party wires can take up to 3 business days).',
    copiar: 'Copy', copiado: 'Copied',
    faltan: 'Message me on WhatsApp at +58 414 041 9317 and I will send you the account details.',
  },
};

const CopyRow = ({ label, value, tx }) => {
  const [done, setDone] = useState(false);
  const copy = async (e) => {
    e.stopPropagation();
    try { await navigator.clipboard.writeText(value); } catch { /* sin permiso: se copia a mano */ }
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };
  return (
    <div className="ach-row">
      <div><span className="ach-row__label">{label}</span><span className="ach-row__value">{value}</span></div>
      <button type="button" className="ach-row__copy" onClick={copy}>{done ? tx.copiado : tx.copiar}</button>
    </div>
  );
};

const Checkout = () => {
  const { t, i18n } = useTranslation();
  const ach = ACH_TEXT[i18n.language?.startsWith('es') ? 'es' : 'en'];
  const location = useLocation(); // Hook debe ir primero
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 1. CAPTURAR DATOS DE URL (Para tus anuncios/Ads)
  // Busca: domain.com/checkout?price=1650&plan=Plan%20Medio
  const queryParams = new URLSearchParams(location.search);
  const urlPrice = queryParams.get('price'); 
  const urlPlan = queryParams.get('plan');   

  // 2. CAPTURAR DATOS DE NAVEGACIÓN INTERNA (State)
  const state = location.state || {};

  // 3. LÓGICA DE PRIORIDAD: URL > Estado Interno > Defecto
  const selectedPrice = urlPrice || state.price || "1050";
  const selectedPlanName = urlPlan || state.planName || "Plan Básico";
  
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('paypal'); 
  
  // 4. LIMPIEZA DEL PRECIO
  const numericPrice = parseFloat(selectedPrice.toString().replace('$', '').replace(',', ''));
  const finalPrice = isNaN(numericPrice) ? 0 : numericPrice;
  const totalDisplay = finalPrice.toFixed(2);

  // 5. LINKS DE PAYPAL (Configuración)
  const paypalLinks = {
    1050: "https://www.paypal.com/ncp/payment/Z36K9R9B56B9U",
    1650: "https://www.paypal.com/ncp/payment/L74D9ZQ7SL7ZC",
    2250: "https://www.paypal.com/ncp/payment/5D6JJKGL8J6UG"
  };

  // Selecciona el link basado en el precio final. Si no coincide, usa el de 1050 por seguridad.
  const currentPaypalLink = paypalLinks[finalPrice] || paypalLinks[1050];

  // Tracking: evento de comercio electrónico estándar de GA4. Se dispara al
  // pulsar "pagar", que abre PayPal en otra pestaña: es intención de
  // pago, no pago confirmado, por eso no se envía como `purchase`.
  const trackPurchaseEvent = () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ ecommerce: null });
    window.dataLayer.push({
      event: 'add_payment_info',
      ecommerce: {
        currency: 'USD',
        value: finalPrice,
        payment_type: selectedPaymentMethod,
        items: [{ item_name: selectedPlanName, price: finalPrice, quantity: 1 }],
      },
    });
  };

  return (
    <>
      <PageHeader mainTitle={t('checkout.mainTitle')} sortTitle={t('checkout.sortTitle')} />

      <section className="checkout__section py-120">
        <div className="container">
          <div className="row g-5">

            {/* COLUMNA IZQUIERDA: MÉTODOS DE PAGO */}
            <div className="col-lg-7">
                <div className="checkout__payment p-4 rounded shadow-sm bg-white">
                  <h3 className="mb-4 text-primary">{t('checkout.paymentMethods')}</h3>

                  {/* -------------------------
                      OPCIÓN 1: PAYPAL
                  -------------------------- */}
                  <div 
                    className={`payment-option-item ${selectedPaymentMethod === 'paypal' ? 'active' : ''}`}
                    onClick={() => setSelectedPaymentMethod('paypal')}
                    style={{cursor: 'pointer', border: '1px solid #ddd', padding: '20px', marginBottom: '15px', borderRadius: '12px'}}
                  >
                    <div className="d-flex align-items-center mb-2">
                        <input type="radio" checked={selectedPaymentMethod === 'paypal'} readOnly className="me-2" style={{transform: 'scale(1.5)'}} />
                        <label className="fw-bold fs-5">
                            <Paypal className="payment-icon me-2 text-primary" /> {t('checkout.paypalLabel')}
                        </label>
                    </div>
                    
                    {/* Contenido desplegable de PayPal */}
                    {selectedPaymentMethod === 'paypal' && (
                      <div className="mt-3 ps-4 border-start border-4 border-primary bg-light p-3">
                        <p className="mb-3">
                            {t('checkout.paypalSelectedMsg')} <strong>{selectedPlanName}</strong>. 
                            <br />
                            {t('checkout.paypalInstruction')}
                        </p>
                        
                        <form action={currentPaypalLink} method="post" target="_blank" onSubmit={trackPurchaseEvent}>
                          <button type="submit" className="btn btn-warning w-100 fw-bold py-2 shadow-sm" style={{color: '#2c2e2f'}}>
                             {t('checkout.payWithPaypal')} ${totalDisplay}
                          </button>
                          <div className="text-center mt-2">
                             <img src="https://www.paypalobjects.com/webstatic/mktg/logo/AM_mc_vs_dc_ae.jpg" alt="Tarjetas" style={{maxWidth: '150px'}} />
                          </div>
                        </form>
                        <PaymentNotice plan={selectedPlanName} amount={finalPrice} defaultMethod="paypal" methods={['paypal']} />
                      </div>
                    )}
                  </div>

                  {/* -------------------------
                      OPCIÓN 2: TRANSFERENCIA EN EE. UU. (ACH / WIRE)
                  -------------------------- */}
                  <div 
                    className={`payment-option-item ${selectedPaymentMethod === 'ach' ? 'active' : ''}`}
                    onClick={() => { if (selectedPaymentMethod !== 'ach') { setSelectedPaymentMethod('ach'); } }}
                    style={{cursor: 'pointer', border: '1px solid #ddd', padding: '20px', marginBottom: '15px', borderRadius: '12px'}}
                  >
                    <div className="d-flex align-items-center mb-2">
                        <input type="radio" checked={selectedPaymentMethod === 'ach'} readOnly className="me-2" style={{transform: 'scale(1.5)'}} />
                        <label className="fw-bold fs-5">
                            <Bank className="payment-icon me-2 text-success" /> {ach.label}
                        </label>
                    </div>

                    {selectedPaymentMethod === 'ach' && (
                      <div className="mt-3 ps-4 border-start border-4 border-success bg-light p-3">
                        <p className="mb-3">{ach.intro}</p>
                        <h2 className="text-center text-success fw-bold my-3">${totalDisplay} USD</h2>
                        {ACH.cuenta && ACH.ruta ? (
                          <div className="ach-box">
                            <CopyRow label={ach.titular} value={ACH.titular} tx={ach} />
                            <CopyRow label={ach.banco} value={ACH.banco} tx={ach} />
                            <div className="ach-row"><div><span className="ach-row__label">{ach.tipo}</span><span className="ach-row__value">{ach.tipoValor}</span></div></div>
                            <CopyRow label={ach.cuenta} value={ACH.cuenta} tx={ach} />
                            <CopyRow label={ach.ruta} value={ACH.ruta} tx={ach} />
                            <CopyRow label={ach.direccion} value={ACH.direccion} tx={ach} />
                            <p className="small text-muted mt-2 mb-0">{ach.tiempos}</p>
                          </div>
                        ) : (
                          <div className="alert alert-info small mb-0">{ach.faltan}</div>
                        )}
                        <PaymentNotice plan={selectedPlanName} amount={finalPrice} defaultMethod="ach" methods={['ach', 'wire']} />
                      </div>
                    )}
                  </div>

                </div>
            </div>

            {/* COLUMNA DERECHA: RESUMEN */}
            <div className="col-lg-5">
              <div className="order-summary p-4 bg-light rounded shadow-lg sticky-top">
                <h4 className='mb-4 text-secondary'>{t('checkout.orderSummary')}</h4>
                <div className="d-flex justify-content-between my-3 border-bottom pb-3">
                  <span className="text-muted">{t('checkout.serviceHired')}:</span>
                  <span className='fw-bold text-dark'>{selectedPlanName}</span>
                </div>
                
                <div className="d-flex justify-content-between align-items-center fw-bold fs-4 pt-2">
                  <span>{t('checkout.total')}:</span>
                  <span className="text-primary">${totalDisplay}</span>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded border small text-muted">
                    <p className="mb-1"><strong>{t('checkout.securityTitle')}</strong></p>
                    <p className="mb-0">{t('checkout.securityBody')}</p>
                </div>
                <p className="mt-3 mb-0 small text-muted">
                    {t('checkout.legalNotice')}{" "}
                    <Link to="/terms">{t('footer.terms')}</Link>{" "}
                    {t('checkout.legalAnd')}{" "}
                    <Link to="/privacy-policy">{t('footer.privacy')}</Link>.
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