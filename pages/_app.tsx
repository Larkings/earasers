import "../styles/globals.css";
import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <NextThemesProvider attribute="class" defaultTheme="system">
            <NextUIProvider>
                <Component {...pageProps} />
            </NextUIProvider>
        </NextThemesProvider>
    );
}

export default MyApp;
