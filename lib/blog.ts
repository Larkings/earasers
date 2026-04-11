export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dateIso: string;
  category: string;
  img: string;
  content: string; // HTML string — swap with CMS/MDX when integrating Shopify
};

export const POSTS: BlogPost[] = [
  {
    slug: 'award-winning-earasers',
    title: '5-Time Award-Winning: Earasers!',
    excerpt:
      "Discover why Earasers continues to be the industry's trusted choice for hearing protection among musicians and music lovers.",
    date: 'January 30, 2025',
    dateIso: '2025-01-30',
    category: 'Awards',
    img: 'https://earasers-eu.myshopify.com/cdn/shop/articles/DJ_Influencer_post_06638f29-e81c-4a6f-87fd-40af7d7ad98e.png?v=1753958362&width=1200',
    content: `
<p>For the fifth consecutive year, <strong>MusicRadar</strong> has awarded Earasers the title of best music earplugs on the market. It&rsquo;s an honour we don&rsquo;t take lightly.</p>

<p>Earasers were developed with one goal in mind: hearing protection that doesn&rsquo;t sacrifice sound quality. Traditional foam earplugs muffle music, making it difficult for musicians to hear nuance on stage or in a rehearsal space. Earasers use a patented W-shaped canal design combined with a passive filter that attenuates sound evenly across frequencies — preserving the music while protecting your ears.</p>

<h2>What the judges said</h2>

<p>MusicRadar&rsquo;s panel of professional musicians tested dozens of earplugs across five key criteria: sound quality, fit comfort, attenuation accuracy, durability, and value for money. Earasers topped the charts in every category.</p>

<blockquote>"These feel like nothing is in your ear, yet your hearing is fully protected. The sound reproduction is remarkable." — MusicRadar, 2024</blockquote>

<h2>Five years running</h2>

<p>Winning once is validation. Winning five times in a row is consistency. Every year we refine our manufacturing process, improve filter tolerances, and listen closely to feedback from the musicians, DJs, and audiophiles who trust Earasers every night.</p>

<p>Thank you to everyone who has supported us on this journey. The best is still ahead.</p>
`,
  },
  {
    slug: 'trusted-by-top-djs',
    title: "Trusted by the World's Top DJs",
    excerpt:
      'See how professional DJs protect their hearing while delivering incredible performances in Ibiza and beyond.',
    date: 'January 20, 2025',
    dateIso: '2025-01-20',
    category: 'Artists',
    img: 'https://earasers-eu.myshopify.com/cdn/shop/articles/Wade_x_Earasers_Ibiza_adbf0643-af0e-4f87-8633-f0a6feba75f1.jpg?v=1740065316&width=1200',
    content: `
<p>A DJ&rsquo;s ears are their most valuable instrument. Night after night, performing in environments where sound pressure levels regularly exceed 110 dB, the cumulative damage can end a career before it really begins. Yet for years, most hearing protection on the market was designed for construction workers — not artists.</p>

<p>Earasers changed that.</p>

<h2>Why DJs choose Earasers</h2>

<p>DJs need to hear every detail: the transient of a snare, the sub-frequency punch of a kick, the harmonic overtones that tell you two tracks are properly mixed. Standard earplugs destroy this information. Earasers&rsquo; flat-attenuation filter keeps the frequency response even, so the music sounds the same — just quieter and safer.</p>

<ul>
  <li><strong>-19 dB Comfort</strong> — ideal for monitoring in smaller venues and studios</li>
  <li><strong>-26 dB Standard</strong> — the European norm, perfect for most club environments</li>
  <li><strong>-31 dB Max</strong> — maximum protection for festival main stages and warehouse raves</li>
</ul>

<h2>What professionals say</h2>

<p>After widespread adoption across the European touring circuit, Earasers has become the go-to choice for professional DJs who take their long-term health seriously. &ldquo;I put them in the moment I arrive at the venue and don&rsquo;t take them out until I&rsquo;m done,&rdquo; says one resident DJ at a major Amsterdam club. &ldquo;My hearing is as sharp now as it was ten years ago.&rdquo;</p>

<p>Protect your craft. Protect your future. Earasers.</p>
`,
  },
  {
    slug: 'dijkman-music-amsterdam',
    title: 'Now at Dijkman Music Amsterdam',
    excerpt:
      'Visit our retail partner in Amsterdam to try Earasers earplugs in person and find your perfect fit.',
    date: 'November 4, 2024',
    dateIso: '2024-11-04',
    category: 'Retail',
    img: 'https://earasers-eu.myshopify.com/cdn/shop/articles/1.jpg?v=1730732765&width=1200',
    content: `
<p>We&rsquo;re excited to announce that Earasers are now available in-store at <strong>Dijkman Music Amsterdam</strong> — one of the Netherlands&rsquo; most beloved and respected music retailers.</p>

<p>For over 60 years, Dijkman has been the destination for professional musicians, hobbyists, and gear enthusiasts in and around Amsterdam. From vintage guitars to professional PA systems, their knowledgeable staff and curated selection have made them an institution in the Dutch music community.</p>

<h2>Try before you buy</h2>

<p>Hearing protection is a deeply personal purchase. Fit varies from person to person, and the only way to know if Earasers are right for you is to try them. At Dijkman, you can do exactly that — try the full range of sizes and filter strengths with the help of their team.</p>

<h2>Find us in-store</h2>

<p>Earasers are stocked in the accessories section alongside other professional musician essentials. You&rsquo;ll find all three filter variants: Comfort (-19 dB), Standard (-26 dB), and Max (-31 dB), in Small, Medium, and Large.</p>

<p>Can&rsquo;t make it to Amsterdam? The full range is always available online at earasers.shop with free shipping on orders over €39.</p>
`,
  },
  {
    slug: 'hearing-damage-explained',
    title: 'How Noise-Induced Hearing Loss Actually Works',
    excerpt:
      'Sound is vibration. Too much of it, for too long, and the tiny hair cells in your cochlea start dying — permanently.',
    date: 'September 2023',
    dateIso: '2023-09-05',
    category: 'Education',
    img: 'https://earasers-eu.myshopify.com/cdn/shop/files/Earasersuitgezoomd.png',
    content: `
<p>Noise-Induced Hearing Loss (NIHL) is the most preventable form of hearing damage — and yet it affects an estimated 1.1 billion young people worldwide, according to the World Health Organization.</p>

<h2>The anatomy of hearing</h2>

<p>Deep inside your inner ear, inside a fluid-filled spiral structure called the cochlea, there are approximately 15,000 tiny hair cells. These cells convert vibrations — sound — into electrical signals that your brain interprets as music, speech, or any other sound. Once damaged or destroyed, these cells do not regenerate. Ever.</p>

<h2>How loud is too loud?</h2>

<p>Sound is measured in decibels (dB). The relationship isn&rsquo;t linear — every 10 dB increase represents a tenfold increase in sound energy. At 85 dB (a busy restaurant), NIHL risk begins after about 8 hours. At 100 dB (a loud club), damage can occur in under 15 minutes. A festival main stage can easily exceed 115 dB.</p>

<h2>What hearing protection actually does</h2>

<p>Good hearing protection reduces the amplitude of sound waves before they reach your cochlea. The difference between cheap foam plugs and Earasers is that foam plugs attenuate unevenly — cutting highs far more than lows — while Earasers&rsquo; passive filter maintains a flat frequency response. You hear everything, just at a safer level.</p>

<p>NIHL is permanent. Prevention is the only cure. Wear your Earasers.</p>
`,
  },
];

export function getPostBySlug(slug: string): BlogPost | undefined {
  return POSTS.find(p => p.slug === slug);
}

export const CATEGORIES = [...new Set(POSTS.map(p => p.category))];
