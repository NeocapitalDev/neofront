import React, { useEffect, useState } from 'react';

const Recaptcha = ({ onVerify }) => {
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (isLoaded) return;

        const loadTurnstile = () => {
            if (window.turnstile) {
                window.turnstile.render('#turnstile-container', {
                    sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
                    callback: (token) => {
                        onVerify(token);
                    }
                });
                setIsLoaded(true);
            }
        };

        const scriptExists = document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
        if (!scriptExists) {
            const script = document.createElement('script');
            script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
            script.async = true;
            script.defer = true;
            script.onload = loadTurnstile;
            document.head.appendChild(script);
        } else {
            loadTurnstile();
        }
    }, [isLoaded, onVerify]);

    return <div id="turnstile-container" className="my-4"></div>;
};

export default Recaptcha;
