import React, { useState } from 'react';
// ✨ IMPORTACIÓN CLAVE: Necesitas useLocation para leer el estado del Link
import { useLocation } from 'react-router-dom'; 
// ⚠️ VERIFICA ESTA RUTA: Asegúrate de que PageHeader exista en esta ruta
import PageHeader from '../../Components/Shared/PageHeader/PageHeader'; 
import './Checkout.scss'; 
// Asegurarse que todos los iconos de Bootstrap se importen desde el mismo lugar
import { CreditCardFill, Paypal, Bank, CurrencyDollar } from 'react-bootstrap-icons'; 

const Checkout = () => {
  // ✨ PASO 1: Obtener la ubicación y los datos del estado
  const location = useLocation();
  // Asignamos valores por defecto si el usuario llega directamente a /checkout
  const { 
      planName: selectedPlanName = "Plan No Seleccionado", 
      price: selectedPrice = "$0.00" 
  } = location.state || {}; // location.state será null si se navega directamente

  // Estado para manejar el método de pago seleccionado
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  
  // ✨ PASO 2: Convertir el precio de string a número para posibles cálculos (si es necesario)
  // Eliminamos el símbolo '$' y las comas para obtener un número.
  const numericPrice = parseFloat(selectedPrice.replace('$', '').replace(',', ''));
  
  // Cálculo simple (puedes añadir impuestos/descuentos aquí)
  const subtotal = isNaN(numericPrice) ? 0 : numericPrice;
  const taxes = 0.00; // Asumiendo 0% de impuesto por ahora
  const total = (subtotal + taxes).toFixed(2); // Mantener el total con 2 decimales


  return (
    <>
      {/* Encabezado genérico para la página de Checkout */}
      <PageHeader
        mainTitle="Proceso de Pago"
        sortTitle="Completa tu Compra"
      />

      {/* Contenedor principal del Checkout */}
      <section className="checkout__section py-120">
        <div className="container">
          <div className="row g-5">
            {/* Columna Izquierda: Formulario de Información y Pago (col-lg-7 para mejor distribución) */}
            <div className="col-lg-7">
              <h3 className="mb-4 text-primary">Información de Contacto y Facturación</h3>
              
              <div className="checkout__form p-4 rounded shadow-sm bg-white">
                <form>
                  {/* Fila 1: Nombre y Correo */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="fullName" className="form-label">Nombre Completo</label>
                      <input type="text" id="fullName" className="form-control" placeholder="Escribe tu nombre" required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">Correo Electrónico</label>
                      <input type="email" id="email" className="form-control" placeholder="tu.correo@ejemplo.com" required />
                    </div>
                  </div>
                  
                  {/* Fila 2: País y Dirección */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="country" className="form-label">País</label>
                      <select id="country" className="form-select" required>
                        <option value="">Selecciona tu país...</option>
                        <option value="VE">Venezuela</option>
                        <option value="US">Estados Unidos</option>
                        {/* Agrega más países relevantes */}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="address1" className="form-label">Dirección (Línea 1)</label>
                      <input type="text" id="address1" className="form-control" placeholder="Calle, número, urbanización" required />
                    </div>
                  </div>

                  {/* Fila 3: Ciudad y Código Postal */}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="city" className="form-label">Ciudad</label>
                      <input type="text" id="city" className="form-control" placeholder="Ciudad o Municipio" required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="zip" className="form-label">Código Postal</label>
                      <input type="text" id="zip" className="form-control" placeholder="0000" />
                    </div>
                  </div>

                  {/* Checkbox: Usar como dirección de envío (si aplica) */}
                  <div className="form-check mt-3">
                    <input className="form-check-input" type="checkbox" value="" id="shippingSame" defaultChecked />
                    <label className="form-check-label" htmlFor="shippingSame">
                      Usar esta información como dirección de contacto principal.
                    </label>
                  </div>
                </form>
              </div>

              {/* SECCIÓN DE MÉTODOS DE PAGO */}
              <div className="checkout__payment mt-5 p-4 rounded shadow-sm bg-white">
                <h3 className="mb-4 text-primary">Métodos de Pago</h3>
                
                {/* Opciones de Pago (Radio Buttons) */}
                <div className="payment-options">
                  
                  {/* Opción 1: Tarjeta de Crédito/Débito */}
                  <div 
                    className={`payment-option-item ${selectedPaymentMethod === 'card' ? 'active' : ''}`}
                    onClick={() => setSelectedPaymentMethod('card')}
                  >
                    <input 
                      type="radio" 
                      id="payCard" 
                      name="paymentMethod" 
                      checked={selectedPaymentMethod === 'card'} 
                      readOnly 
                    />
                    <label htmlFor="payCard">
                      <CreditCardFill className="payment-icon text-muted me-2" /> Tarjeta de Crédito o Débito
                    </label>
                    
                    {selectedPaymentMethod === 'card' && (
                      <div className="card-details-form p-3 mt-2 border rounded">
                        <p className="small text-muted mb-3">Pago seguro procesado por Stripe/Pasarela.</p>
                        {/* Aquí iría el widget o formulario de la pasarela */}
                        <input type="text" className="form-control mb-2" placeholder="Número de tarjeta" />
                        <div className='row'>
                            <div className='col-6'>
                                <input type="text" className="form-control" placeholder="MM/AA" />
                            </div>
                            <div className='col-6'>
                                <input type="text" className="form-control" placeholder="CVC" />
                            </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Opción 2: PayPal */}
                  <div 
                    className={`payment-option-item ${selectedPaymentMethod === 'paypal' ? 'active' : ''}`}
                    onClick={() => setSelectedPaymentMethod('paypal')}
                  >
                    <input 
                      type="radio" 
                      id="payPaypal" 
                      name="paymentMethod" 
                      checked={selectedPaymentMethod === 'paypal'} 
                      readOnly 
                    />
                    <label htmlFor="payPaypal">
                      <Paypal className="payment-icon text-muted me-2" /> PayPal
                    </label>
                    {selectedPaymentMethod === 'paypal' && (
                       <div className="p-3 mt-2 border rounded">
                          <p className="small text-muted">Serás redirigido a la página de PayPal para completar el pago.</p>
                          <button type="button" className="btn btn-primary btn-sm">Continuar con PayPal</button>
                       </div>
                    )}
                  </div>
                  
                  {/* Opción 3: Transferencia (AHC / Zelle) */}
                   <div 
                    className={`payment-option-item ${selectedPaymentMethod === 'transfer' ? 'active' : ''}`}
                    onClick={() => setSelectedPaymentMethod('transfer')}
                  >
                    <input 
                      type="radio" 
                      id="payTransfer" 
                      name="paymentMethod" 
                      checked={selectedPaymentMethod === 'transfer'} 
                      readOnly 
                    />
                    <label htmlFor="payTransfer">
                      <Bank className="payment-icon text-muted me-2" /> Transferencia Bancaria (AHC/Zelle)
                    </label>
                    {selectedPaymentMethod === 'transfer' && (
                       <div className="p-3 mt-2 border rounded">
                          <p className="small text-danger">Instrucciones: Una vez finalizada la compra, se mostrarán los datos bancarios para realizar la transferencia. El servicio se activará tras la confirmación.</p>
                       </div>
                    )}
                  </div>
                  
                  {/* Opción 4: Criptomonedas (USDT) */}
                  <div 
                    className={`payment-option-item ${selectedPaymentMethod === 'crypto' ? 'active' : ''}`}
                    onClick={() => setSelectedPaymentMethod('crypto')}
                  >
                    <input 
                      type="radio" 
                      id="payCrypto" 
                      name="paymentMethod" 
                      checked={selectedPaymentMethod === 'crypto'} 
                      readOnly 
                    />
                    <label htmlFor="payCrypto">
                      <CurrencyDollar className="payment-icon text-muted me-2" /> Criptomonedas (USDT vía Binance Pay)
                    </label>
                    {selectedPaymentMethod === 'crypto' && (
                       <div className="p-3 mt-2 border rounded">
                          <p className="small text-warning">Se te proporcionará una dirección de billetera y un código QR para pagar la cantidad exacta en USDT.</p>
                       </div>
                    )}
                  </div>
                  
                </div>

                {/* Botón de pago final */}
                <button className="common__btn mt-5 w-100" type="submit">
                    Finalizar Compra y Pagar
                </button>
              </div>

            </div>

            {/* Columna Derecha: Resumen del Carrito/Pago (col-lg-5) */}
            <div className="col-lg-5">
              <div className="order-summary p-4 bg-light rounded shadow-lg sticky-top">
                <h4 className='mb-4'>Resumen de la Orden</h4>
                
                {/* Detalles del servicio */}
                <div className="d-flex justify-content-between my-3 border-bottom pb-2">
                  <span>Servicio Contratado:</span>
                  {/* ✨ MUESTRA EL NOMBRE DEL PLAN ENVIADO */}
                  <span className='fw-bold'>{selectedPlanName}</span> 
                </div>

                {/* Subtotal */}
                <div className="d-flex justify-content-between my-3">
                  <span>Subtotal:</span>
                  {/* ✨ MUESTRA EL PRECIO DEL PLAN ENVIADO */}
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                
                {/* Impuestos / Descuentos */}
                <div className="d-flex justify-content-between my-3">
                  <span>Impuestos (0%):</span>
                  <span>${taxes.toFixed(2)}</span>
                </div>
                
                <hr />
                
                {/* Total */}
                <div className="d-flex justify-content-between fw-bold fs-5 pt-2">
                  <span>Total a Pagar:</span>
                  {/* ✨ MUESTRA EL TOTAL CALCULADO */}
                  <span className="text-primary">${total}</span> 
                </div>
                
                {/* Términos */}
                <p className="small mt-4 text-muted border-top pt-3">
                    Al hacer clic en "Finalizar Compra y Pagar", aceptas nuestros términos y condiciones de servicio.
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
