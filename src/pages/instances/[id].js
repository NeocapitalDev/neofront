import { useRouter } from 'next/router';
import Layout from '../../components/layout/dashboard';
import LayoutInstance from '../../components/instances/LayoutInstance'; // Asegúrate de que la ruta sea correcta


const InstancePage = () => {
  const router = useRouter();
  const { id } = router.query; // Obtén el id de la ruta

  return (
    <Layout title='Configuración de instancia' NoTab={true}>
      <LayoutInstance instanceId={id} />
    </Layout>
    //<LayoutInstance instanceId={id} />
  );
};

export default InstancePage;
