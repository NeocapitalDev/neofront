import Layout from '../../components/layout/dashboard';

const integrationList = [
    { name: 'Make', href: 'https://docs.wazend.net/wazend/integraciones/make', content: 'Automatiza flujos de trabajo con Make y envía notificaciones a tus clientes vía WhatsApp.', icon: 'https://wazend.net/wp-content/uploads/2025/01/make.svg' },
    { name: 'WooCommerce', href: 'https://docs.wazend.net/wazend/integraciones/woocommerce', content: 'Conecta tu tienda WooCommerce y notifica a tus clientes directamente en WhatsApp.', icon: 'https://wazend.net/wp-content/uploads/2025/01/woo.svg' },
    { name: 'Shopify', href: 'https://docs.wazend.net/wazend/integraciones/shopify', content: 'Sincroniza tu tienda Shopify y envía actualizaciones automáticas a tus clientes por WhatsApp.', icon: 'https://wazend.net/wp-content/uploads/2025/01/shopify.svg' },
    { name: 'n8n', href: 'https://docs.wazend.net/wazend/integraciones/n8n', content: 'Diseña flujos personalizados con n8n para integrar WhatsApp y mejorar la comunicación con tus clientes.', icon: 'https://wazend.net/wp-content/uploads/2025/01/n8n.svg' },
];

export default function Index() {
    return (
        <Layout title="Integraciones">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {integrationList.map((item, index) => (
                    <a
                        key={index}
                        href={item.href}
                        target={item.href.startsWith('http') ? '_blank' : '_self'}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : ''}
                        className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
                    >
                        <div className="flex items-center mb-2">
                            <img
                                src={item.icon}
                                alt={item.name}
                                className="h-10 w-10 mr-4"
                            />
                            <h3 className="text-base font-semibold">{item.name}</h3>
                        </div>
                        <hr className="border-t border-gray-100 mb-4" />
                        <p className="text-sm text-gray-600">{item.content}</p>
                    </a>
                ))}
            </div>
        </Layout>
    );
}
