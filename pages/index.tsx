import type { NextPage } from 'next';
import { Layout }       from '../components/layout';
import { Hero }         from '../components/hero';
import { TrustBand }    from '../components/trust-band';
import { UseCases }     from '../components/use-cases';
import { BestSellers }  from '../components/best-sellers';
import { SizeQuiz }     from '../components/size-quiz';
import { AwardSection } from '../components/award-section';
import { CompareTable } from '../components/compare-table';
import { HowItWorks }   from '../components/how-it-works';
import { Reviews }      from '../components/reviews';
import { Influencers }  from '../components/influencers';
import { BlogTeaser }   from '../components/blog-teaser';

const Home: NextPage = () => (
  <Layout>
    <Hero />
    <TrustBand />
    <UseCases />
    <BestSellers />
    <Influencers />
    <SizeQuiz />
    <AwardSection />
    <CompareTable />
    <HowItWorks />
    <Reviews />
    <BlogTeaser />
  </Layout>
);

export default Home;
