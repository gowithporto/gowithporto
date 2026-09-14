import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { sendAdminNewUserEmail, sendWelcomeEmail } from "@/lib/email";
import { connectDB } from "@/lib/mongodb";
import {
  checkLoginLock,
  clearLoginAttempts,
  getClientIp,
  LoginLockCheck,
  recordLoginFailure,
} from "@/lib/rateLimit";
import Store from "@/models/Store";
import User from "@/models/User";

// Encodes a lockout as `LOCKED_STAGE<1|2>|<minutesLeft>[|<ip>]` — thrown from
// authorize() below, this Error's message survives to the client as
// `res.error` (verified against the installed next-auth@4.24.13 source: it
// passes `error.message` through unchanged via the redirect's `error` query
// param, which signIn(..., {redirect:false}) then reads back). `|` is used
// instead of `:` so an IPv6 address in the ip segment can't be mistaken for
// an extra field. Shared by both the admin and store-owner credential flows.
function lockoutMessage(check: LoginLockCheck & { allowed: false }, ip: string): string {
  const minutesLeft = Math.ceil((check.lockedUntilMs - Date.now()) / 60000);
  return check.stage === 1
    ? `LOCKED_STAGE1|${minutesLeft}`
    : `LOCKED_STAGE2|${minutesLeft}|${ip}`;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },

  // Without this, any callback error (e.g. a transient DB blip during the
  // signIn callback) falls back to NextAuth's built-in dark sign-in page,
  // which also exposes the raw admin/store-owner credential forms. Sending
  // both signIn and error back to "/" keeps users on our own UI; Header.tsx
  // reads the `error` query param there and shows a toast instead.
  pages: {
    signIn: "/",
    error: "/",
  },

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      id: "admin-login",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip = getClientIp(req?.headers);
        const key = `admin-login:${ip}:${credentials.email}`;

        const lock = checkLoginLock(key);
        if (!lock.allowed) {
          throw new Error(lockoutMessage(lock, ip));
        }

        await connectDB();

        const user = await User.findOne({
          email: credentials.email,
        }).select("+password +role");

        const isValid =
          !!user &&
          user.role === "ADMIN" &&
          !!user.password &&
          (await bcrypt.compare(credentials.password, user.password));

        if (!isValid) {
          const result = recordLoginFailure(key);
          if (!result.allowed) {
            throw new Error(lockoutMessage(result, ip));
          }
          return null;
        }

        clearLoginAttempts(key);

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: "ADMIN",
          image: user.image,
        };
      },
    }),

    CredentialsProvider({
      id: "store-owner-login",
      name: "StoreOwner",
      credentials: {
        storeCode: { label: "Store Code", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, req) {
        if (!credentials) return null;

        const ip = getClientIp(req?.headers);
        const key = `store-owner-login:${ip}:${credentials.storeCode}`;

        const lock = checkLoginLock(key);
        if (!lock.allowed) {
          throw new Error(lockoutMessage(lock, ip));
        }

        await connectDB();

        const store = await Store.findOne({
          storeCode: credentials.storeCode,
          role: "STORE_OWNER",
          active: true,
        });

        const valid =
          !!store && (await bcrypt.compare(credentials.password, store.passwordHash));

        if (!valid) {
          const result = recordLoginFailure(key);
          if (!result.allowed) {
            throw new Error(lockoutMessage(result, ip));
          }
          return null;
        }

        clearLoginAttempts(key);

        return {
          id: store._id.toString(),
          role: "STORE_OWNER",
          storeId: store._id.toString(),
          storeName: store.name,
        };
      },
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        await connectDB();

        const existing = await User.findOne({ email: user.email });

        if (!existing) {
          await User.create({
            email: user.email,
            name: user.name,
            image: user.image,
            role: "USER",
          });

          await sendWelcomeEmail(user.email, {
            recipientName: user.name || user.email.split("@")[0],
          });

          await sendAdminNewUserEmail({
            name: user.name || user.email.split("@")[0],
            email: user.email,
          });
        }
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role ?? "USER";
        token.storeId = user.storeId;
        token.storeName = user.storeName;
      }
      
      if (trigger === "update" && session?.user) {
          if (session.user.role) token.role = session.user.role;
          if (session.user.name) token.name = session.user.name;
          if (session.user.image) token.picture = session.user.image;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
          session.user.role = token.role;
          session.user.storeId = token.storeId;
          session.user.storeName = token.storeName;
      }
      return session;
    },
  },
};
