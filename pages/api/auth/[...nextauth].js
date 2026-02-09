import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

console.log("--- DEBUG: ENVIRONMENT VARIABLES ---");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("NEXTAUTH_SECRET is set:", !!process.env.NEXTAUTH_SECRET);
if (process.env.NEXTAUTH_SECRET) console.log("NEXTAUTH_SECRET length:", process.env.NEXTAUTH_SECRET.length);
console.log("GOOGLE_CLIENT_ID is set:", !!process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET is set:", !!process.env.GOOGLE_CLIENT_SECRET);
console.log("------------------------------------");

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session }) {
      // Hardened RBAC logic: Strict check for admin emails
      const adminEmails = ['admin@library.com', 'swayam.internship@gmail.com'];
      const isAdmin = adminEmails.includes(session.user.email);
      session.user.role = isAdmin ? 'admin' : 'student';
      return session;
    },
  },
};

export default NextAuth(authOptions);