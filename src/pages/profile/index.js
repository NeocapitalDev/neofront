import User from './User';
import Layout from '../../components/layout/dashboard';

function Index() {
  return (
    <>
    <Layout title='Perfil' NoTab={true}>
      <User />
    </Layout>
    </>
  );
}

export default Index;
