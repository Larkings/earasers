import Script from 'next/script'
import { useConsent } from '../../context/consent'

/**
 * Pixel scripts injectie. Laadt ALLEEN als user 'Accept all' heeft geklikt
 * (marketingAllowed). Tot dat moment renderen we niets — geen requests naar
 * Meta/Google/GoAffPro voor consent.
 *
 * Env vars (NEXT_PUBLIC_*, dus client-readable):
 *   NEXT_PUBLIC_META_PIXEL_ID         — Meta Pixel ID
 *   NEXT_PUBLIC_GA4_MEASUREMENT_ID    — GA4 (G-XXXXXXX)
 *   NEXT_PUBLIC_GOOGLE_ADS_ID         — Google Ads (AW-XXXXXXX, of nummer)
 *   NEXT_PUBLIC_GOAFFPRO_TOKEN        — GoAffPro public token
 *   NEXT_PUBLIC_GOAFFPRO_SHOP         — Shopify shop domain (bv. earasers-eu.myshopify.com)
 *
 * NB: NEXT_PUBLIC_* worden bij build-time ingebakken. Voeg ze toe aan Vercel
 * env vars EN aan .env.local voor lokale dev. Zonder env vars renderen
 * we het bijbehorende script gewoon niet — geen crash.
 */

const META_PIXEL_ID    = process.env.NEXT_PUBLIC_META_PIXEL_ID
const GA4_ID           = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
const GOOGLE_ADS_ID_RAW = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
const GOAFFPRO_TOKEN   = process.env.NEXT_PUBLIC_GOAFFPRO_TOKEN
const GOAFFPRO_SHOP    = process.env.NEXT_PUBLIC_GOAFFPRO_SHOP

// Google Ads accepteert het ID met of zonder 'AW-' prefix. We normaliseren.
const GOOGLE_ADS_ID = GOOGLE_ADS_ID_RAW
  ? (GOOGLE_ADS_ID_RAW.startsWith('AW-') ? GOOGLE_ADS_ID_RAW : `AW-${GOOGLE_ADS_ID_RAW}`)
  : null

export function AnalyticsScripts() {
  const { marketingAllowed } = useConsent()
  if (!marketingAllowed) return null

  return (
    <>
      {/* Google: GA4 + Google Ads delen dezelfde gtag.js loader */}
      {(GA4_ID || GOOGLE_ADS_ID) && (
        <>
          <Script
            id="gtag-loader"
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID || GOOGLE_ADS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
${GA4_ID ? `gtag('config', '${GA4_ID}', { send_page_view: false });` : ''}
${GOOGLE_ADS_ID ? `gtag('config', '${GOOGLE_ADS_ID}');` : ''}`}
          </Script>
        </>
      )}

      {/* Meta Pixel */}
      {META_PIXEL_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
        </Script>
      )}

      {/* GoAffPro affiliate tracker */}
      {GOAFFPRO_TOKEN && GOAFFPRO_SHOP && (
        <Script
          id="goaffpro-loader"
          src={`https://api.goaffpro.com/loader.js?shop=${encodeURIComponent(GOAFFPRO_SHOP)}`}
          data-public-token={GOAFFPRO_TOKEN}
          strategy="afterInteractive"
        />
      )}
    </>
  )
}
