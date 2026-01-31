import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageHeader from '../../Components/Shared/PageHeader/PageHeader';
import './Checkout.scss';
import { Paypal, Globe } from 'react-bootstrap-icons';
import { useTranslation } from 'react-i18next';

const Checkout = () => {
  const { t } = useTranslation();
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

  // Tracking
  const trackPurchaseEvent = () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'event': 'purchase_completed',
      'transactionValue': finalPrice,
      'transactionCurrency': 'USD',
      'productName': selectedPlanName,
      'paymentMethod': selectedPaymentMethod
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
                      </div>
                    )}
                  </div>

                  {/* -------------------------
                      OPCIÓN 2: REMESAS BNC
                  -------------------------- */}
                  <div 
                    className={`payment-option-item ${selectedPaymentMethod === 'bnc' ? 'active' : ''}`}
                    onClick={() => setSelectedPaymentMethod('bnc')}
                    style={{cursor: 'pointer', border: '1px solid #ddd', padding: '20px', marginBottom: '15px', borderRadius: '12px'}}
                  >
                    <div className="d-flex align-items-center mb-2">
                        <input type="radio" checked={selectedPaymentMethod === 'bnc'} readOnly className="me-2" style={{transform: 'scale(1.5)'}} />
                        <label className="fw-bold fs-5">
                            <Globe className="payment-icon me-2 text-success" /> {t('checkout.bncLabel')}
                        </label>
                    </div>

                    {/* Contenido desplegable de BNC */}
                    {selectedPaymentMethod === 'bnc' && (
                       <div className="mt-3 ps-4 border-start border-4 border-success bg-light p-3">
                        <div className="alert alert-info small">
                            <i className="bi bi-info-circle-fill me-1"></i>
                            <strong>{t('checkout.bncNoteTitle')}</strong> {t('checkout.bncNoteBody')}
                        </div>
                        
                        <p className="mb-2">{t('checkout.bncInstruction')}</p>
                        <h2 className="text-center text-success fw-bold my-3">${totalDisplay} USD</h2>
                        
                        <a 
                            href="https://remesas.bncenlinea.com/l/Cg2g4QpN" 
                            target="_blank" 
                            rel="noreferrer"
                            className="btn btn-success w-100 fw-bold py-2 shadow-sm"
                            onClick={() => trackPurchaseEvent()}
                        >
                            {t('checkout.goToBnc')} <i className="bi bi-box-arrow-up-right ms-2"></i>
                        </a>
                        <p className="text-muted small text-center mt-2">
                            {t('checkout.newTabInfo')}
                        </p>
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
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Checkout;