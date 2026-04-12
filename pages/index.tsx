import type { NextPage, GetStaticProps } from 'next';
import { useTranslation } from 'react-i18next';
import { serverSideTranslations } from '../lib/i18n';
import { Layout }              from '../components/layout';
import { SEO, type StructuredData } from '../components/seo';
import { Hero }                from '../components/hero';
import { TrustBand }           from '../components/trust-band';
import { UseCases }            from '../components/use-cases';
import { BestSellers }         from '../components/best-sellers';
import { SizeQuiz }            from '../components/size-quiz';
import { AwardSection }        from '../components/award-section';
import { CompareTable }        from '../components/compare-table';
import { HowItWorks }          from '../components/how-it-works';
import { Reviews }             from '../components/reviews';
import { VideoSection }        from '../components/video-section';
import { Influencers }         from '../components/influencers';
import { BlogSection }         from '../components/BlogSection';

const Home: NextPage = () => {
  const { t } = useTranslation('home');
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.earasers.shop';
  const structuredData: StructuredData[] = [
    {
      type: 'Organization',
      name: 'Earasers',
      url: baseUrl,
      logo: `${baseUrl}/Test_Logo_Earasres_2.png`,
      sameAs: [
        'https://www.instagram.com/earasers',
        'https://www.facebook.com/earasers',
      ],
    },
  ];

  return (
    <Layout>
      <SEO
        title={t('seo.homeTitle', { defaultValue: 'Earasers — HiFi Earplugs for Musicians, DJs & Professionals' })}
        description={t('seo.homeDescription', { defaultValue: 'Award-winning HiFi earplugs that protect your hearing without changing how you hear. For musicians, DJs, dentists, motorcyclists and more.' })}
        type="website"
        structuredData={structuredData}
      />
      <Hero />
      <TrustBand />
      <UseCases />
      <BestSellers />
      <VideoSection />
      <Influencers />
      <SizeQuiz />
      <AwardSection />
      <CompareTable />
      <HowItWorks />
      <Reviews />
      <BlogSection />
    </Layout>
  );
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? 'en', ['common', 'home'])),
  },
});

export default Home;
