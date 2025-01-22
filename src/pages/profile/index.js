import Layout from '../../components/layout/dashboard';
import User from './User';
import Account from './account';
import Identity from './identity';
import Security from './security';

function Index() {
  return (
    <Layout title="Perfil">
      <div className="space-y-6">
        {/* Sección: Información Personal */}
        <div className="p-6 dark:bg-zinc-800 border-gray-200 border-2 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-800 dark:shadow-black">
          <h2 className="text-xl font-semibold border-b pb-4">Información Personal</h2>
          <User />
        </div>

        {/* Sección: Información de Cuenta */}
        <div className="p-6 dark:bg-zinc-800 border-gray-200 border-2 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-800 dark:shadow-black">
          <h2 className="text-xl font-semibold border-b pb-4">Información de Cuenta</h2>
          <Account />
        </div>

        {/* Sección: Seguridad */}
        <div className="p-6 dark:bg-zinc-800 border-gray-200 border-2 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-800 dark:shadow-black">
          <h2 className="text-xl font-semibold border-b pb-4">Seguridad</h2>
          <Security />
        </div>

        {/* Sección: FTMO Identity */}
        <div className="p-6 dark:bg-zinc-800 border-gray-200 border-2 bg-white shadow-md rounded-lg dark:text-white dark:border-zinc-800 dark:shadow-black">
          <h2 className="text-xl font-semibold border-b pb-4">FTMO Identity</h2>
          <Identity />
        </div>
      </div>
    </Layout>
  );
}

export default Index;
