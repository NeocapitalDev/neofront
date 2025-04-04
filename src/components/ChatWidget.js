import { useEffect } from "react";

const ChatwootWidget = () => {
    useEffect(() => {
        (function (d, t) {
            const BASE_URL = `${process.env.NEXT_PUBLIC_CHAT_BASE_URL || "https://bot-crm.sitemaster.lat"}`;
            const g = d.createElement(t), s = d.getElementsByTagName(t)[0];
            g.src = `${BASE_URL}/packs/js/sdk.js`;
            g.defer = true;
            g.async = true;
            s.parentNode.insertBefore(g, s);

            g.onload = function () {
                if (window.chatwootSDK) {
                    window.chatwootSDK.run({
                        websiteToken: process.env.NEXT_PUBLIC_WEBSITE_TOKEN || "Z68A2toEvVwFN8NG8tLYcT4n",
                        baseUrl: BASE_URL,
                    });
                }
            };
        })(document, "script");
    }, []);

    return null;
};

export default ChatwootWidget;
