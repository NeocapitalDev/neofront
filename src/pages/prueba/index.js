import { useWooCommerce } from '@/services/useWoo';

export default function Index() {
  const { data, isLoading, error, debug } = useWooCommerce('coupons', {
    // Puedes proporcionar credenciales aquí, o usar las variables de entorno
  });

  console.log('Estado de depuración:', debug);

  if (isLoading) return <div>Cargando...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h1>Cupones</h1>
      <ul>
        {data && data.map(coupon => (
          <li key={coupon.id}>{coupon.code}</li>
        ))}
      </ul>
    </div>
  );
}