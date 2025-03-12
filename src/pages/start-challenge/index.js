import { useStrapiData } from '../../services/strapiService';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CheckIcon, ChevronRightIcon, InformationCircleIcon, TicketIcon } from '@heroicons/react/20/solid';
import classNames from 'classnames';

const ChallengeRelations = () => {
  const { data: relations, error, isLoading } = useStrapiData('challenge-relations?populate=*');
  const { data: allproducts, error: allproductserror, isLoading: allproductsisLoading } = useStrapiData('challenge-products');

  // Estados para manejar las selecciones, cupón y términos
  const [selectedStep, setSelectedStep] = useState(null);
  const [selectedRelationId, setSelectedRelationId] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedRelation, setSelectedRelation] = useState(null); // Para manejar las características de la relación
  const [couponCode, setCouponCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [cancellationAccepted, setCancellationAccepted] = useState(false);

  // Procesar los datos para obtener steps únicos y sus relaciones
  const stepsData = relations
    ? [...new Set(relations.map(relation => relation.challenge_step.name))].map(stepName => ({
      step: stepName,
      relations: relations.filter(relation => relation.challenge_step.name === stepName),
    }))
    : [];

  // Seleccionar el primer step, relación y producto por defecto al cargar los datos
  useEffect(() => {
    if (stepsData.length > 0 && selectedStep === null) {
      const firstStep = stepsData[0].step;
      setSelectedStep(firstStep);

      const firstStepRelations = stepsData[0].relations;
      if (firstStepRelations.length > 0) {
        setSelectedRelationId(firstStepRelations[0].id);
        setSelectedRelation(firstStepRelations[0]); // Guardar la relación seleccionada

        const firstRelationProducts = firstStepRelations[0].challenge_products;
        if (firstRelationProducts.length > 0) {
          setSelectedProduct(firstRelationProducts[0]); // Selecciona el primer producto sin importar su estado
        }
      }
    }
  }, [stepsData]);

  if (isLoading || allproductsisLoading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (allproductserror) return <p className="text-red-500">Error: {allproductserror.message}</p>;

  // Función para manejar el clic en un step
  const handleStepClick = (step) => {
    setSelectedStep(step);
    setSelectedRelationId(null);
    setSelectedProduct(null);
    setSelectedRelation(null);

    const stepRelations = stepsData.find(item => item.step === step).relations;
    if (stepRelations.length > 0) {
      setSelectedRelationId(stepRelations[0].id);
      setSelectedRelation(stepRelations[0]);

      const firstRelationProducts = stepRelations[0].challenge_products;
      if (firstRelationProducts.length > 0) {
        setSelectedProduct(firstRelationProducts[0]); // Selecciona el primer producto
      }
    }
  };

  // Función para manejar el clic en una relación (subcategoría)
  const handleRelationClick = (relationId) => {
    setSelectedRelationId(relationId);
    const stepRelations = stepsData.find(item => item.step === selectedStep).relations;
    const relation = stepRelations.find(r => r.id === relationId);
    setSelectedRelation(relation);

    if (relation && relation.challenge_products.length > 0) {
      setSelectedProduct(relation.challenge_products[0]); // Selecciona el primer producto
    } else {
      setSelectedProduct(null);
    }
  };

  // Función para manejar el clic en un producto
  const handleProductClick = (product) => {
    setSelectedProduct(product); // Permite seleccionar cualquier producto
  };

  // Función para manejar el envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedProduct && termsAccepted && cancellationAccepted) {
      console.log('Producto seleccionado:', selectedProduct);
      // Aquí puedes agregar la lógica para continuar con el formulario
    }
  };

  // Función para aplicar el cupón (placeholder)
  const applyCoupon = () => {
    if (couponCode) {
      console.log('Cupón aplicado:', couponCode);
      // Aquí puedes agregar la lógica para aplicar el cupón
    }
  };

  const handleContinue = () => {
    if (selectedProduct && termsAccepted && cancellationAccepted) {
      const woocommerceId = selectedProduct.WoocomerceId || 'default-id'; // Asegura que haya un ID por defecto si no existe
      window.location.href = `https://neocapitalfunding.com/checkout/?add-to-cart=${woocommerceId}&quantity=1`;
      //   const response = await fetch(`https://n8n.neocapitalfunding.com/webhook/purcharse`, {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       product: selectedProduct,
      //       coupon: couponCode,
      //       termsAccepted,
      //       cancellationAccepted,
      //     }),
      //   })
      // }
    };
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header>
        <section className="container mx-auto px-4 py-3 flex items-center">
          <Link href="/">
            <Image src="/images/logo-dark.png" alt="Neocapital logo" width={300} height={40} className="h-9 w-auto" />
          </Link>
        </section>
        <section className="bg-zinc-900 border-b border-zinc-800">
          <div className="container mx-auto px-4 py-4">
            <h2 className="text-lg font-bold text-amber-400">Compra tu producto</h2>
          </div>
        </section>
      </header>

      {/* Contenido principal */}
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

                    // Obtener los nombres de los productos de la relación seleccionada
                    const relationProductNames = selectedRelation?.challenge_products.map(p => p.name) || [];

                    // Si hay productos en allproducts
                    if (allproducts && allproducts.length > 0) {
                      return allproducts.map((product, productIndex) => {
                        // Verificar si el producto está en la relación seleccionada
                        const isInRelation = relationProductNames.includes(product.name);

                        return (
                          <div key={`allproduct-${productIndex}`} className="relative">
                            <input
                              type="radio"
                              id={`allproduct-${productIndex}`}
                              name="product"
                              checked={selectedProduct && selectedProduct.name === product.name}
                              onChange={() => handleProductClick(product)}
                              className="sr-only"
                              disabled={!isInRelation} // Deshabilitar si no está en la relación
                            />
                            <label
                              htmlFor={`allproduct-${productIndex}`}
                              className={classNames(
                                "block p-4 rounded-lg border cursor-pointer transition-all",
                                selectedProduct && selectedProduct.name === product.name
                                  ? "bg-zinc-800 border-amber-500 text-white"
                                  : isInRelation
                                    ? "bg-zinc-900 border-zinc-700 text-zinc-400 hover:bg-zinc-800"

                                    : "bg-gray-900/20 border-gray-700 text-gray-500 opacity-50"
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
                        );
                      });
                    } else {
                      return (
                        <p className="text-zinc-500 col-span-3">
                          No hay productos disponibles
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
            <div className="sticky top-4 space-y-6">
              <div className="bg-zinc-900 rounded-lg shadow-md border border-zinc-800 overflow-hidden">
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
                    {selectedRelation && (
                      <div className="bg-zinc-900 p-5 shadow-md border-zinc-800">
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                          {/* Columna izquierda - Características */}
                          <div>
                            <section>
                              <h3 className="text-lg font-medium text-amber-400 mb-4">Características:</h3>
                              <ul className="space-y-3">
                                <li className="flex items-center text-zinc-300">
                                  <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                                  <span>leverage:</span>
                                  <strong className="ml-auto">{selectedRelation.leverage || "N/A"} %</strong>
                                </li>
                                <li className="flex items-center text-zinc-300">
                                  <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                                  <span>maximumDailyLoss:</span>
                                  <strong className="ml-auto">{selectedRelation.maximumDailyLoss || "N/A"} días</strong>
                                </li>
                                <li className="flex items-center text-zinc-300">
                                  <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                                  <span>maximumLoss:</span>
                                  <strong className="ml-auto">{selectedRelation.maximumLoss || "N/A"} %</strong>
                                </li>
                                <li className="flex items-center text-zinc-300">
                                  <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                                  <span>minimumTradingDays:</span>
                                  <strong className="ml-auto">{selectedRelation.minimumTradingDays || "N/A"} días</strong>
                                </li>
                                <li className="flex items-center text-zinc-300">
                                  <CheckIcon className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0" />
                                  <span>profitTarget:</span>
                                  <strong className="ml-auto">{selectedRelation.profitTarget || "N/A"} %</strong>
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
                                <span>${selectedProduct.precio || "N/A"}</span>
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
                                <p className="text-2xl font-semibold text-amber-400">${selectedProduct.precio || "N/A"}</p>
                              </div>

                              <p className="text-xs text-zinc-500 text-right">*Precio no incluye tarifa de servicio de pago.</p>
                            </section>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Terms and conditions */}
                    <section className="p-5 space-y-4">
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

                    <div className="p-5">
                      <button
                        onClick={handleContinue}
                        type="submit"
                        disabled={!selectedProduct || !termsAccepted || !cancellationAccepted}
                        className={`w-full flex items-center justify-center transition-colors py-3 px-4 rounded ${selectedProduct && termsAccepted && cancellationAccepted
                          ? "bg-amber-500 hover:bg-amber-600 text-black font-bold"
                          : "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                          }`}
                      >
                        <span className="uppercase">Continuar</span>
                        <ChevronRightIcon className="h-5 w-5 ml-2" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChallengeRelations;