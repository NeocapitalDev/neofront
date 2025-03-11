"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

// Icons
import { ArrowLeftIcon, CheckIcon, ChevronRightIcon, TicketIcon } from "@heroicons/react/24/solid";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function ReviewOrder() {
  const router = useRouter();
  const [couponCode, setCouponCode] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cancellationAccepted, setCancellationAccepted] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Cargar los datos del producto desde localStorage cuando la página se monta
  useEffect(() => {
    const loadProductData = () => {
      try {
        const storedProduct = localStorage.getItem('selectedProduct');
        
        if (storedProduct) {
          setSelectedProduct(JSON.parse(storedProduct));
        } else {
          // Si no hay producto seleccionado, redirigir a la página de configuración
          router.push('/start-challenge');
        }
      } catch (error) {
        console.error("Error loading product data:", error);
        router.push('/start-challenge');
      } finally {
        setIsLoading(false);
      }
    };

    loadProductData();
  }, [router]);

  // Manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (termsAccepted && cancellationAccepted) {
      // Guardar información adicional del pedido
      const orderData = {
        product: selectedProduct,
        couponCode: couponCode,
        termsAccepted: termsAccepted,
        cancellationAccepted: cancellationAccepted,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem('orderData', JSON.stringify(orderData));
      
      // Elimina el producto del localStorage para evitar duplicar en futuras visitas
      localStorage.removeItem('selectedProduct');
      
      // Redirigir a la página de pago
      router.push(`https://neocapitalfunding.com/checkout/?add-to-cart=9773&quantity=1`);
    }
  };
  

  // Función para aplicar el cupón (simulada)
  const applyCoupon = () => {
    // En una aplicación real, aquí harías una llamada a la API
    // para validar el cupón y aplicar el descuento
    alert(`Cupón "${couponCode}" aplicado con éxito`);
  };

  // Mostrar spinner de carga mientras se obtienen los datos
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Si no hay producto seleccionado después de cargar
  if (!selectedProduct) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-black text-amber-400">
        <p className="mb-4">No hay producto seleccionado</p>
        <Link 
          href="/start-challenge" 
          className="px-4 py-2 bg-amber-500 text-black rounded-md hover:bg-amber-600 transition-colors"
        >
          Volver a la configuración
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <header>
        <section className="container mx-auto px-4 py-3 flex items-center">
          <Link href="/">
            <Image src="/images/logo-dark.png" alt="Neocapital logo" width={236} height={60} className="h-10 w-auto" />
          </Link>
        </section>
        <section className="bg-zinc-900 border-b border-zinc-800">
          <div className="container mx-auto px-4 py-4">
            <h2 className="text-2xl font-bold text-amber-400">Compra tu producto</h2>
            <div className="flex items-center mt-4 mb-2">
              <div className="flex items-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-black">
                  <CheckIcon className="h-5 w-5" />
                </span>
              </div>
              <div className="h-[2px] w-12 bg-zinc-700 mx-4"></div>
              <div className="flex items-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-black font-bold">2</span>
                <span className="ml-2 text-amber-100">Revisa tu orden</span>
              </div>
              {/* Divider
              <div className="h-[2px] w-12 bg-zinc-700 mx-4"></div>
              <div className="flex items-center">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 font-bold">3</span>
              </div>
              */}
            </div>
          </div>
        </section>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Back button */}
        <Link href="/start-challenge" className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-6 transition-colors">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          <span>Regresa a configurar tu producto</span>
        </Link>
        
        <main className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden shadow-lg">
          <form onSubmit={handleSubmit}>
            {/* Product header */}
            <header className="p-6 border-b border-zinc-800">
              <span className="text-zinc-400 text-sm block mb-1">Tu producto es</span>
              <p className="text-2xl font-bold text-amber-400">{selectedProduct.name}</p>
              <span className="text-zinc-300 block">{selectedProduct.balance}</span>
            </header>
            
            {/* Contenido dividido en dos columnas */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-32">
                {/* Columna izquierda - Características */}
                <div>
                  <section>
                    <h3 className="text-lg font-medium text-amber-400 mb-4">Características:</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center text-zinc-300">
                        <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                        <span>Profit Target:</span>
                        <strong className="ml-auto">{selectedProduct.profitTarget} %</strong>
                      </li>
                      <li className="flex items-center text-zinc-300">
                        <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                        <span>Mínimo de días operados:</span>
                        <strong className="ml-auto">{selectedProduct.minTradingDays} días</strong>
                      </li>
                      <li className="flex items-center text-zinc-300">
                        <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                        <span>Drawdown diario:</span>
                        <strong className="ml-auto">{selectedProduct.dailyDrawdown} %</strong>
                      </li>
                      <li className="flex items-center text-zinc-300">
                        <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                        <span>Pérdida máxima:</span>
                        <strong className="ml-auto">{selectedProduct.maxLoss} %</strong>
                      </li>
                      <li className="flex items-center text-zinc-300">
                        <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                        <span>Periodo fase única:</span>
                        <strong className="ml-auto">{selectedProduct.phasePeriod}</strong>
                      </li>
                    </ul>
                  </section>
                </div>
                
                {/* Columna derecha - Cupón y Pricing */}
                <div className="space-y-6">
                  {/* Coupon section */}
                  <section>
                    <span className="block text-amber-400 font-medium mb-3">Ingresa tu cupón</span>
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Escribe tu cupón aquí"
                        className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-l-md text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <button
                        type="button"
                        disabled={!couponCode}
                        onClick={applyCoupon}
                        className={`uppercase px-4 py-2 rounded-r-md font-medium text-sm ${
                          couponCode
                            ? "bg-amber-500 text-black hover:bg-amber-600 transition-colors"
                            : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                        }`}
                      >
                        Aplicar
                      </button>
                    </div>
                  </section>

                  <div className="h-px bg-zinc-800"></div>

                  {/* Pricing section */}
                  <section>
                    <h4 className="text-zinc-300 font-medium mb-4">Subtotal</h4>
                    
                    <div className="flex justify-between mb-2 text-zinc-300">
                      <span>{selectedProduct.name}</span>
                      <span>${selectedProduct.price.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between mb-2 text-zinc-400">
                      <div className="flex items-center">
                        <span>Cupón</span>
                        <TicketIcon className="h-4 w-4 ml-1" />
                      </div>
                      <span>-$0.00</span>
                    </div>
                    
                    <div className="h-px bg-zinc-800 my-4"></div>
                    
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-zinc-300">Total</span>
                      <p className="text-2xl font-semibold text-amber-400">${selectedProduct.price.toFixed(2)}</p>
                    </div>
                    
                    <p className="text-xs text-zinc-500 text-right">*Precio no incluye tarifa de servicio de pago.</p>
                  </section>
                </div>
              </div>
              
              <div className="h-px bg-zinc-800 my-6"></div>

              {/* Terms and conditions */}
              <section className="space-y-4 mb-8">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    className="mt-1 h-4 w-4 border-zinc-700 rounded bg-zinc-800 text-amber-500 focus:ring-amber-500"
                    checked={termsAccepted}
                    onChange={() => setTermsAccepted(!termsAccepted)}
                  />
                  <label htmlFor="acceptTerms" className="ml-2 text-sm text-zinc-300">
                    Declaro que he leído y estoy de acuerdo con los{" "}
                    <span className="font-bold text-amber-400 cursor-pointer">Términos y Condiciones</span>,{" "}
                    <span className="font-bold text-amber-400 cursor-pointer">Política de Privacidad</span> y{" "}
                    <span className="font-bold text-amber-400 cursor-pointer">Política de Cookies</span>
                  </label>
                </div>
                
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="acceptCancelation"
                    className="mt-1 h-4 w-4 border-zinc-700 rounded bg-zinc-800 text-amber-500 focus:ring-amber-500"
                    checked={cancellationAccepted}
                    onChange={() => setCancellationAccepted(!cancellationAccepted)}
                  />
                  <label htmlFor="acceptCancelation" className="ml-2 text-sm text-zinc-300">
                    Declaro que he leído y estoy de acuerdo con las Políticas de Cancelación y Reembolso.
                  </label>
                </div>
              </section>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!termsAccepted || !cancellationAccepted}
                className={`w-full flex justify-center items-center py-3 px-4 rounded-md uppercase font-bold transition-colors ${
                  termsAccepted && cancellationAccepted
                    ? "bg-amber-500 hover:bg-amber-600 text-black"
                    : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                }`}
              >
                <span>Ir a pagar</span>
                <ChevronRightIcon className="h-5 w-5 ml-2" />
              </button>

              {/* Payment methods */}
              <div className="mt-6">
                <span className="block text-zinc-400 text-sm mb-3">Métodos de pago:</span>
                <div className="flex items-center space-x-4">
                  <img src="/images/visa.png" alt="Visa" className="h-8" />
                  <img src="/images/mastercard.png" alt="Mastercard" className="h-8" />
                  <div className="flex items-center">
                    <img src="/images/tron-logo.png" alt="Tron" className="h-6 mr-2" />
                    <span className="text-zinc-300 text-sm">USDT TRC-20</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </main>

        {/* Security badges */}
        <section className="flex justify-center space-x-4 mt-6">
          <img src="/images/secure-checkout.png" alt="Secure Checkout" className="h-16" />
          <img src="/images/guarantee.png" alt="Guarantee" className="h-16" />
        </section>
      </div>
    </div>
  );
}