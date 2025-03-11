import { useStrapiData } from '../../services/strapiService';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckIcon, ArrowLeftIcon, TicketIcon, ChevronRightIcon, InformationCircleIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';

const TabTwoContent = ({ selectedProduct, selectedRelation, setCurrentTab }) => {

  
  console.log(selectedProduct)
  console.log(selectedRelation)

  // Función para aplicar el cupón (simulada)
  const applyCoupon = () => {
    // En una aplicación real, aquí harías una llamada a la API
    // para validar el cupón y aplicar el descuento
    alert(`Cupón "${couponCode}" aplicado con éxito`);
  };
  const [couponCode, setCouponCode] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cancellationAccepted, setCancellationAccepted] = useState(false);

  return (

    <div className="min-h-screen bg-black">


      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Back button */}
        <button 
        onClick={() => setCurrentTab(1)}
        className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-6 transition-colors">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          <span>Regresa a configurar tu producto</span>
        </button>

        <main className="bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden shadow-lg">
          <form >
            {/* Product header */}
            <header className="p-6 border-b border-zinc-800">
              <span className="text-zinc-400 text-sm block mb-1">Tu producto es</span>
              <p className="text-2xl font-bold text-amber-400">{selectedProduct.name}</p>
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
                        <span>leverage:</span>
                        <strong className="ml-auto">{selectedRelation.leverage} %</strong>
                      </li>
                      <li className="flex items-center text-zinc-300">
                        <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                        <span>maximumDailyLoss:</span>
                        <strong className="ml-auto">{selectedRelation.maximumDailyLoss} días</strong>
                      </li>
                      <li className="flex items-center text-zinc-300">
                        <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                        <span>maximumLoss:</span>
                        <strong className="ml-auto">{selectedRelation.maximumLoss} %</strong>
                      </li>
                      <li className="flex items-center text-zinc-300">
                        <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                        <span>minimumTradingDays:</span>
                        <strong className="ml-auto">{selectedRelation.minimumTradingDays} %</strong>
                      </li>
                      <li className="flex items-center text-zinc-300">
                        <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                        <span>profitTarget</span>
                        <strong className="ml-auto">{selectedRelation.profitTarget}</strong>
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
                        className={`uppercase px-4 py-2 rounded-r-md font-medium text-sm ${couponCode
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
                      <span>${selectedProduct.precio}</span>
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
                      <p className="text-2xl font-semibold text-amber-400">${selectedProduct.precio}</p>
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
                className={`w-full flex justify-center items-center py-3 px-4 rounded-md uppercase font-bold transition-colors ${termsAccepted && cancellationAccepted
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
};

const ChallengeRelations = () => {
  const { data: relations, error, isLoading } = useStrapiData('challenge-relations?populate=*');

  // Estados para manejar las selecciones y tabs
  const [selectedStep, setSelectedStep] = useState(null);
  const [selectedRelationId, setSelectedRelationId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedRelation, setSelectedRelation] = useState(null);

  const [currentTab, setCurrentTab] = useState(1); // Controla el tab activo (1 o 2)

  // Procesar los datos para obtener steps únicos y sus relaciones
  const stepsData = relations
    ? [...new Set(relations.map(relation => relation.challenge_step.name))].map(stepName => ({
      step: stepName,
      relations: relations.filter(relation => relation.challenge_step.name === stepName),
    }))
    : [];

  // Seleccionar el primer step, relación y producto ACTIVO por defecto al cargar los datos
  useEffect(() => {
    if (stepsData.length > 0 && selectedStep === null) {
      const firstStep = stepsData[0].step;
      setSelectedStep(firstStep);

      const firstStepRelations = stepsData[0].relations;
      if (firstStepRelations.length > 0) {
        setSelectedRelationId(firstStepRelations[0].id);

        const firstRelationProducts = firstStepRelations[0].challenge_products;
        const firstActiveProduct = firstRelationProducts.find(product => product.isActive !== false);
        if (firstActiveProduct) {
          setSelectedProduct(firstActiveProduct);
        }
      }
    }
  }, [stepsData]);

  if (isLoading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;

  // Función para manejar el clic en un step
  const handleStepClick = (step) => {
    setSelectedStep(step);
    setSelectedRelationId(null);
    setSelectedProduct(null);

    const stepRelations = stepsData.find(item => item.step === step).relations;
    if (stepRelations.length > 0) {
      setSelectedRelationId(stepRelations[0].id);

      const firstRelationProducts = stepRelations[0].challenge_products;
      const firstActiveProduct = firstRelationProducts.find(product => product.isActive !== false);
      if (firstActiveProduct) {
        setSelectedProduct(firstActiveProduct);
      }
    }
  };

  // Función para manejar el clic en una relación (subcategoría)
  const handleRelationClick = (relationId) => {
    setSelectedRelationId(relationId);
    const stepRelations = stepsData.find(item => item.step === selectedStep).relations;
    const relation = stepRelations.find(r => r.id === relationId);
    if (relation && relation.challenge_products.length > 0) {
      const firstActiveProduct = relation.challenge_products.find(product => product.isActive !== false);
      if (firstActiveProduct) {
        setSelectedProduct(firstActiveProduct);
      } else {
        setSelectedProduct(null);
      }
    } else {
      setSelectedProduct(null);
    }
  };

  // Función para manejar el clic en un producto
  const handleProductClick = (product) => {
    if (product.isActive !== false) {
      setSelectedProduct(product);
    }
  };

  // Función para manejar el envío del formulario y cambio de tab
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedProduct) {
      setCurrentTab(2); // Cambia al segundo tab al hacer clic en "Continuar"
    }
  };

  // Contenido del primer tab (el original)
  const TabOneContent = () => (
    <form onSubmit={handleSubmit}>
      <div className="container mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda - Configuración */}
        <div className="lg:col-span-2 space-y-6">
          {/* Steps Section */}
          <section className="bg-zinc-900 rounded-lg p-5 shadow-md border border-zinc-800">
            <div className="flex items-center mb-3">
              <h3 className="text-amber-400 font-medium">Steps</h3>
              <div className="relative ml-2 group">
                <InformationCircleIcon className="h-5 w-5 text-zinc-500 hover:text-zinc-300" />
                <div className="absolute z-10 invisible group-hover:visible bg-zinc-800 text-xs text-zinc-200 p-2 rounded-md w-48 top-full left-0 mt-1">
                  Selecciona el paso del proceso que deseas configurar
                </div>
              </div>
            </div>
            <p className="text-zinc-400 mb-4 text-sm">Selecciona el tipo de paso que deseas configurar.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {stepsData.map((item, index) => (
                <div key={index} className="relative">
                  <input
                    type="radio"
                    id={`step-${index}`}
                    name="step"
                    checked={selectedStep === item.step}
                    onChange={() => handleStepClick(item.step)}
                    className="sr-only"
                  />
                  <label
                    htmlFor={`step-${index}`}
                    className={classNames(
                      "block p-4 rounded-lg border cursor-pointer transition-all",
                      selectedStep === item.step
                        ? "bg-zinc-800 border-amber-500 text-white"
                        : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    )}
                  >
                    <div className="product-info">
                      <span className="block font-medium">{item.step}</span>
                      <span className="block text-xs mt-1 text-zinc-500">
                        {item.relations.length} opciones
                      </span>
                    </div>
                    {selectedStep === item.step && (
                      <CheckIcon className="absolute top-4 right-4 h-5 w-5 text-amber-500" />
                    )}
                  </label>
                </div>
              ))}
            </div>
          </section>

          {/* Subcategorías Section */}
          {selectedStep && stepsData.length > 0 && (
            <section className="bg-zinc-900 rounded-lg p-5 shadow-md border border-zinc-800">
              <div className="flex items-center mb-3">
                <h3 className="text-amber-400 font-medium">Subcategorías</h3>
                <div className="relative ml-2 group">
                  <InformationCircleIcon className="h-5 w-5 text-zinc-500 hover:text-zinc-300" />
                  <div className="absolute z-10 invisible group-hover:visible bg-zinc-800 text-xs text-zinc-200 p-2 rounded-md w-48 top-full left-0 mt-1">
                    Elige la subcategoría para tu producto
                  </div>
                </div>
              </div>
              <p className="text-zinc-400 mb-4 text-sm">
                Selecciona la subcategoría para el paso {selectedStep}.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {stepsData
                  .find(item => item.step === selectedStep)
                  .relations.map((relation, index) => (
                    <div key={relation.id} className="relative">
                      <input
                        type="radio"
                        id={`subcategory-${relation.id}`}
                        name="subcategory"
                        checked={selectedRelationId === relation.id}
                        onChange={() => handleRelationClick(relation.id)}
                        className="sr-only"
                      />
                      <label
                        htmlFor={`subcategory-${relation.id}`}
                        className={classNames(
                          "block p-4 rounded-lg border cursor-pointer transition-all",
                          selectedRelationId === relation.id
                            ? "bg-zinc-800 border-amber-500 text-white"
                            : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                        )}
                      >
                        <span className="block font-medium">{relation.challenge_subcategory.name}</span>
                        {selectedRelationId === relation.id && (
                          <CheckIcon className="absolute top-4 right-4 h-5 w-5 text-amber-500" />
                        )}
                      </label>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* Productos Section */}
          {selectedRelationId && (
            <section className="bg-zinc-900 rounded-lg p-5 shadow-md border border-zinc-800">
              <div className="flex items-center mb-3">
                <h3 className="text-amber-400 font-medium">Productos</h3>
                <div className="relative ml-2 group">
                  <InformationCircleIcon className="h-5 w-5 text-zinc-500 hover:text-zinc-300" />
                  <div className="absolute z-10 invisible group-hover:visible bg-zinc-800 text-xs text-zinc-200 p-2 rounded-md w-48 top-full left-0 mt-1">
                    Selecciona el producto que deseas adquirir
                  </div>
                </div>
              </div>
              <p className="text-zinc-400 mb-4 text-sm">
                Elige el producto para{" "}
                {stepsData
                  .find(item => item.step === selectedStep)
                  .relations.find(r => r.id === selectedRelationId)
                  ?.challenge_subcategory.name}.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {(() => {
                  const stepRelations = stepsData.find(item => item.step === selectedStep).relations;
                  const selectedRelation = stepRelations.find(r => r.id === selectedRelationId);
                  setSelectedRelation(selectedRelation);
                  if (selectedRelation && selectedRelation.challenge_products.length > 0) {
                    return selectedRelation.challenge_products.map((product, productIndex) => (
                      <div key={`${selectedRelation.id}-${productIndex}`} className="relative">
                        <input
                          type="radio"
                          id={`product-${selectedRelation.id}-${productIndex}`}
                          name="product"
                          disabled={product.isActive === false}
                          checked={selectedProduct && selectedProduct.name === product.name}
                          onChange={() => handleProductClick(product)}
                          className="sr-only"
                        />
                        <label
                          htmlFor={`product-${selectedRelation.id}-${productIndex}`}
                          className={classNames(
                            "block p-4 rounded-lg border cursor-pointer transition-all",
                            product.isActive === false
                              ? "bg-zinc-800 border-zinc-700 text-zinc-600 opacity-50 cursor-not-allowed"
                              : selectedProduct && selectedProduct.name === product.name
                                ? "bg-zinc-800 border-amber-500 text-white"
                                : "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                          )}
                        >
                          <span className="block font-medium">{product.name}</span>
                          {product.isPremium && (
                            <span className="inline-block bg-amber-500 text-black text-xs px-2 py-1 rounded mt-2 font-semibold">
                              Premium
                            </span>
                          )}
                          {selectedProduct && selectedProduct.name === product.name && (
                            <CheckIcon className="absolute top-4 right-4 h-5 w-5 text-amber-500" />
                          )}
                        </label>
                      </div>
                    ));
                  } else {
                    return (
                      <p className="text-zinc-500 col-span-3">
                        No hay productos disponibles para esta subcategoría
                      </p>
                    );
                  }
                })()}
              </div>
            </section>
          )}
        </div>

        {/* Columna derecha - Resumen del producto */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 bg-zinc-900 rounded-lg shadow-md border border-zinc-800 overflow-hidden">
            <header className="p-5 border-b border-zinc-800">
              <h3 className="text-amber-400 font-medium mb-1">Tu producto es:</h3>
              {selectedProduct ? (
                <>
                  <p className="text-xl font-bold text-white">{selectedProduct.name}</p>
                  {selectedProduct.balance && (
                    <span className="block text-sm text-zinc-400 mt-1">
                      {selectedProduct.balance} USD
                    </span>
                  )}
                </>
              ) : (
                <p className="text-zinc-500">Ningún producto seleccionado</p>
              )}
            </header>

            {selectedProduct && (
              <>
                <section className="p-5 border-b border-zinc-800">
                  <h4 className="text-amber-400 font-medium mb-3">Características:</h4>
                  <ul className="space-y-3">
                    {selectedProduct.profitTarget && (
                      <li className="flex items-center text-sm">
                        <CheckIcon className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-zinc-400">Profit Target:</span>
                        <strong className="ml-auto text-white">{selectedProduct.profitTarget}%</strong>
                      </li>
                    )}
                    {selectedProduct.minTradingDays && (
                      <li className="flex items-center text-sm">
                        <CheckIcon className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-zinc-400">Mínimo de días operados:</span>
                        <strong className="ml-auto text-white">{selectedProduct.minTradingDays} días</strong>
                      </li>
                    )}
                    {selectedProduct.dailyDrawdown && (
                      <li className="flex items-center text-sm">
                        <CheckIcon className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-zinc-400">Drawdown diario:</span>
                        <strong className="ml-auto text-white">{selectedProduct.dailyDrawdown}%</strong>
                      </li>
                    )}
                    {selectedProduct.maxLoss && (
                      <li className="flex items-center text-sm">
                        <CheckIcon className="h-4 w-4 text-amber-500 mr-2" />
                        <span className="text-zinc-400">Pérdida máxima:</span>
                        <strong className="ml-auto text-white">{selectedProduct.maxLoss}%</strong>
                      </li>
                    )}
                    <li className="flex items-center text-sm">
                      <CheckIcon className="h-4 w-4 text-amber-500 mr-2" />
                      <span className="text-zinc-400">Periodo fase única:</span>
                      <strong className="ml-auto text-white">
                        {selectedProduct.phasePeriod || "Unlimited"}
                      </strong>
                    </li>
                  </ul>
                </section>

                <div className="p-5 border-b border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-400">Precio</span>
                    <p className="text-xl font-bold text-amber-400">
                      ${selectedProduct.precio || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="p-5">
                  <button
                    type="submit"
                    disabled={!selectedProduct}
                    className={`w-full flex items-center justify-center transition-colors py-3 px-4 rounded ${selectedProduct
                        ? "bg-amber-500 hover:bg-amber-600 text-black font-bold"
                        : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                      }`}
                  >
                    <span className="uppercase">Continuar</span>
                    <ChevronRightIcon className="h-5 w-5 ml-2" />
                  </button>
                  <p className="text-xs text-zinc-500 mt-3 text-center">
                    *Precio no incluye tarifa de servicio de pago.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Header similar a ImpulseWorld pero con colores de Neocapital */}
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
                <span className={classNames(
                  "flex items-center justify-center w-8 h-8 rounded-full font-bold",
                  currentTab === 1 ? "bg-amber-500 text-black" : "bg-zinc-800 text-zinc-400"
                )}>
                  1
                </span>
                <span className="ml-2 text-amber-100">Configura tu producto</span>
              </div>
              <div className="h-[2px] w-12 bg-zinc-700 mx-4"></div>
              <div className="flex items-center">
                <span className={classNames(
                  "flex items-center justify-center w-8 h-8 rounded-full font-bold",
                  currentTab === 2 ? "bg-amber-500 text-black" : "bg-zinc-800 text-zinc-400"
                )}>
                  2
                </span>
                <span className="ml-2 text-amber-100">Resumen</span>
              </div>
            </div>
          </div>
        </section>
      </header>

      {/* Contenido principal según el tab activo */}
      {currentTab === 1 ? <TabOneContent /> : <TabTwoContent selectedProduct={selectedProduct} selectedRelation={selectedRelation} setCurrentTab={setCurrentTab}/>}
    </div>
  );
};

export default ChallengeRelations;