import { SessionProvider } from "next-auth/react";
import "../styles/globals.css"; // Ensure Tailwind is set up in your project

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}