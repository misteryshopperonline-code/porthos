import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaUserRepository } from "@/infrastructure/repositories/prismaUserRepository";
import { BcryptPasswordService } from "@/infrastructure/adapters/bcryptPasswordService";
import { LoginUserUseCase } from "@/application/useCases/loginUserUseCase";
import { authSecret } from "@/lib/authSecret";

const userRepository = new PrismaUserRepository();
const cryptoService = new BcryptPasswordService();
const loginUseCase = new LoginUserUseCase(userRepository, cryptoService);

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await loginUseCase.execute(credentials.email, credentials.password);
        
        if (!result.success || !result.user) {
          throw new Error(result.error || "Credenciales incorrectas");
        }

        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          contractId: result.user.contractId
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.contractId = (user as any).contractId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).contractId = token.contractId;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', 
  },
  secret: authSecret
};
