import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { signIn } from '../../../services/auth'

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    CredentialsProvider({
      name: 'Sign in with Email',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        /**
         * This function is used to define if the user is authenticated or not.
         * If authenticated, the function should return an object contains the user data.
         * If not, the function should return `null`.
         */
        if (credentials == null) return null;
        /**
         * credentials is defined in the config above.
         * We can expect it contains two properties: `email` and `password`
         */
        try {
          const { user, jwt } = await signIn({
            email: credentials.email,
            password: credentials.password,
          });
          return { ...user, jwt };
        } catch (error) {
          // Sign In Fail
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: '/login', // Ruta a tu página de inicio de sesión personalizada
    //signOut: '/ruta-a-tu-pagina-de-cierre-de-sesion', // Ruta a tu página de cierre de sesión personalizada
    //error: '/ruta-a-tu-pagina-de-error', // Ruta a tu página de error personalizada
    //verifyRequest: '/ruta-a-tu-pagina-de-verificacion', // Ruta a tu página de verificación personalizada
    //newUser: null, // No es necesario especificar una ruta si no estás utilizando la creación de nuevos usuarios
  },

  callbacks: {
    session: async ({ session, token }) => {
      session.id = token.id;
      session.jwt = token.jwt;
      session.rol = token.rol;
      session.firstName = token.firstName; // Agregando firstName a la sesión

      return Promise.resolve(session);
    },
    jwt: async ({ token, user }) => {
      const isSignIn = user ? true : false;
      if (isSignIn) {
        token.id = user.id;
        token.jwt = user.jwt;
        token.rol = user.rol;
        token.firstName = user.firstName; // Agregando firstName al token

      }
      return Promise.resolve(token);
    },
  },
});