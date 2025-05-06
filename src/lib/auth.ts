import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        expectedRole: { label: "Expected Role", type: "text" },
      },
      async authorize(credentials) {
        console.log("--- Authorize function started ---");
        const { email, password, expectedRole } = credentials || {};

        if (!email || !password) {
          console.log("Missing email or password");
          throw new Error("Имэйл эсвэл нууц үг дутуу байна.");
        }
        console.log(`Attempting login for: ${email}, expecting role: ${expectedRole || 'any (not specified)'}`);

        const user = await prisma.user.findUnique({
          where: { email: email },
          select: { id: true, email: true, name: true, password: true, role: true },
        });

        if (!user || !user.password) {
          console.log(`User not found or password missing for: ${email}`);
          throw new Error("Имэйл эсвэл нууц үг буруу байна.");
        }
        console.log(`User found: ${user.email}, Actual Role: ${user.role}`);

        const isCorrectPassword = await bcrypt.compare(password, user.password);

        if (!isCorrectPassword) {
          console.log(`Incorrect password for: ${user.email}`);
          throw new Error("Имэйл эсвэл нууц үг буруу байна.");
        }
        console.log(`Password correct for: ${user.email}`);

        if (expectedRole) {
           console.log(`Checking if actual role '${user.role}' matches expected role '${expectedRole}'`);
           if (user.role.toString() !== expectedRole) {
                console.log(`*** ROLE MISMATCH ***: Actual role '${user.role}' does not match expected role '${expectedRole}'. Access denied for ${user.email}.`);
                throw new Error(`Нэвтрэх эрхгүй байна. (${expectedRole} role шаардлагатай)`);
           }
            console.log(`Role check passed: Actual role '${user.role}' matches expected role '${expectedRole}'.`);
        } else {
            console.log("No expectedRole specified by frontend, skipping role check.");
        }

        console.log(`Authorization successful for ${user.email} with role ${user.role}.`);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};
