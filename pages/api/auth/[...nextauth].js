import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
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