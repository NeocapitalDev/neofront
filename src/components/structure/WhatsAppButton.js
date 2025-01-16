import { useEffect, useState } from "react";
import { ChatBubbleOvalLeftIcon } from "@heroicons/react/24/solid";

const WhatsAppButton = () => {
  const [whatsAppUrl, setWhatsAppUrl] = useState("");

  useEffect(() => {
    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER; // Obtiene el número de WhatsApp de la variable de entorno
    if (!phoneNumber) {
      console.error("NEXT_PUBLIC_WHATSAPP_NUMBER no está configurada.");
      return;
    }

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobile = /android|iPad|iPhone|iPod/i.test(userAgent);

    const message = encodeURIComponent("Hola, soy cliente. Necesito soporte.");
    const baseUrl = isMobile
      ? `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${message}`
      : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;

    setWhatsAppUrl(baseUrl);
  }, []);

  return (
    <a
      href={whatsAppUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
    >
      <ChatBubbleOvalLeftIcon className="h-8 w-auto" />
    </a>
  );
};

export default WhatsAppButton;