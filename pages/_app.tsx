import "../styles/globals.css";
import type { AppProps } from "next/app";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

// Suppress React 18.3+ defaultProps deprecation warnings from @nextui-org/react v1
const originalError = console.error;
console.error = (...args: Parameters<typeof console.error>) => {
    if (typeof args[0] === "string" && args[0].includes("Support for defaultProps will be removed")) return;
    originalError(...args);
};

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
