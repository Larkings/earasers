export interface FilterOption {
  db: string           // e.g. "-19dB"
  snr: string          // e.g. "SNR 14"
  name: string         // e.g. "Light"
  description: string  // e.g. "Light filter"
  shopifyValue: string // exact value as Shopify returns it
}

export const FILTERS_BY_GENRE: Record<string, FilterOption[]> = {

  musician: [
    {
      db: '-19dB',
      snr: 'SNR 14',
      name: 'Light',
      description: 'Light filter',
      shopifyValue: 'SNR 14 | Light filter (-19dB Peak)',
    },
    {
      db: '-26dB',
      snr: 'SNR 20',
      name: 'Medium',
      description: 'Medium filter',
      shopifyValue: 'SNR 20 | Medium filter (-26dB Peak)',
    },
    {
      db: '-31dB',
      snr: 'SNR 22',
      name: 'Max',
      description: 'Max filter',
      shopifyValue: 'SNR 22 | Max filter (-31dB Peak)',
    },
  ],

  dj: [
    {
      db: '-19dB',
      snr: 'SNR 14',
      name: 'Light',
      description: 'Light Filter',
      shopifyValue: 'SNR 14 | Light Filter (-19dB Peak)',
    },
    {
      db: '-26dB',
      snr: 'SNR 20',
      name: 'Booth',
      description: 'Best for in the DJ Booth',
      shopifyValue: 'SNR 20 | Best for in the DJ Booth (-26dB Peak)',
    },
    {
      db: '-31dB',
      snr: 'SNR 22',
      name: 'Tinnitus',
      description: 'If you already experience tinnitus',
      shopifyValue: 'SNR 22 | If you already experience tinnitus (-31dB Peak)',
    },
  ],

  dentist: [
    {
      db: '-19dB',
      snr: 'SNR 14',
      name: 'Standard',
      description: 'Gentle Dentist Standard filter',
      shopifyValue: 'SNR 14 | Gentle Dentist Standard filter (-19dB Peak)',
    },
    {
      db: '-26dB',
      snr: 'SNR 20',
      name: 'Clinical',
      description: 'Clinical Balance — Noise Sensitivity & Tinnitus',
      shopifyValue: 'SNR 20 | Dentist Clinical Balance Noise Sensitivity & Tinnitus (-26dB Peak)',
    },
  ],

  sleeping: [
    {
      db: '-36dB',
      snr: 'SNR 26',
      name: 'Peace & Quiet',
      description: 'Peace and Quiet filter',
      shopifyValue: '-36dB Peak (SNR 26 | Peace and Quiet filter)',
    },
  ],

  motorsport: [
    {
      db: '-19dB',
      snr: 'SNR 14',
      name: 'Closed Helmet',
      description: 'Ideal for closed helmet riders',
      shopifyValue: '-19dB Peak (SNR 14 | Closed Helmet)',
    },
    {
      db: '-31dB',
      snr: 'SNR 22',
      name: 'Open Helmet',
      description: 'Ideal for open helmet riders',
      shopifyValue: '-31dB Peak (SNR 22 | Open Helmet)',
    },
  ],

  sensitivity: [
    {
      db: '-19dB',
      snr: 'SNR 14',
      name: 'Gentle',
      description: 'Gentle Comfort filter',
      shopifyValue: '-19dB Peak (SNR 14 | Gentle Comfort filter)',
    },
    {
      db: '-26dB',
      snr: 'SNR 20',
      name: 'Balanced',
      description: 'Balanced filter',
      shopifyValue: '-26dB Peak (SNR 20 | Balanced filter)',
    },
    {
      db: '-31dB',
      snr: 'SNR 22',
      name: 'Strong',
      description: 'Strong filter',
      shopifyValue: '-31dB Peak (SNR 22 | Strong filter)',
    },
    {
      db: '-36dB',
      snr: 'SNR 26',
      name: 'Peace & Quiet',
      description: 'Peace and Quiet filter',
      shopifyValue: '-36dB Peak (SNR 26 | Peace and Quiet filter)',
    },
  ],
}
