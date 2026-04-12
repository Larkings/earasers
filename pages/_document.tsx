import React from 'react';
import Document, { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from 'next/document';

interface MyDocumentProps extends DocumentInitialProps {
  locale: string;
}

class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext): Promise<MyDocumentProps> {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps, locale: ctx.locale ?? 'en' };
  }

  render() {
    return (
      <Html lang={this.props.locale ?? 'en'}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap"
            rel="stylesheet"
          />
          {/*
            Shopify Analytics / Web Pixels worden NIET via theme.js geladen.
            Die werken via Shopify's eigen extension systeem — configureer in
            Admin → Settings → Customer events. Events in lib/analytics.ts
            worden automatisch opgepikt door actieve Web Pixels.

            De oude Liquid theme.js (earasers-theme/) is voor de legacy
            Shopify storefront — niet voor deze headless Next.js site.
          */}
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
