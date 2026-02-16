//export const dynamic = "force-dynamic"
import HomeHero from "../components/features/home/HomeHero";
import FeaturesGrid from "@/app/components/features/home/FeaturesGrid";
import RecentActivity from "@/app/components/features/home/RecentActivity";

import StatsBand from '@/app/components/features/home/StatsBand';

import '@/app/styles/active/home.ll3.css';


export const revalidate = 1800;

export default async function HomePage() {
  const CURRENT_CONGRESS = 119;

  return (
    <div className="home">
      <HomeHero>
        <div className="stack-16 hero__search-wrap">
          {/* Primary: simple, focused search */}

          {/*  <SearchBox />
          <div className="hero__actions">
            <a href="/states" className="btn btn--ghost">Browse states</a>
            <a href="/compare" className="btn btn--ghost">Compare members</a>
          </div>
          */}
        </div>
        {/* Key previews */}
      </HomeHero>
      <StatsBand />
      <FeaturesGrid />
      {/* Key previews */}
      <RecentActivity maxItems={4} />
      {/*    <SubjectsTrendSection congress={CURRENT_CONGRESS} />*/}

    </div >
  );
}
