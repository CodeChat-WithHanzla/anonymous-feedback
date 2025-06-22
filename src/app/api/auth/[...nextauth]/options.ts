import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import userModel from "@/model/User";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Username", type: "text", placeholder: "Muhammad Ali" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials: any, req:any): Promise<any> {
        await dbConnect();
        if (
        !credentials ||
        !credentials.identifier ||
        (!credentials.identifier.email && !credentials.identifier.username) ||
        !credentials.password
        ) 
        {
          throw new Error("Missing credentials. Please enter all fields.");
        }
        try {
          const user = await userModel.findOne({
            $or: [
              { email: credentials.identifier.email },
              {
                username: credentials.identifier.username
              }
            ]
          });
          if (!user)
            throw new Error("No user found with this email or username.");
          if (!user.isVerified)
            throw new Error("Please verify your account before Login.");
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (isPasswordCorrect) return user;
          else
            throw new Error(
              "Incorrect password. Please enter the correct one to continue"
            );
        } catch (error) {
              console.log(error)
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      if(token){
        session.user._id = token._id
        session.user.isVerified = token.isVerified
        session.user.isAcceptingMessage = token.isAcceptingMessage
        session.user.username = token.username
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessage
        token.username= user.username
      }
      return token;
    }
  },
  pages: {
    signIn: "/sign-in"
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXT_AUTH_SECRET
};
