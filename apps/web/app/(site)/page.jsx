import HomeHero from "../components/home/HomeHero";
import FeaturesGrid from "../components/home/FeaturesGrid";
import SearchBox from "../components/search/SearchBox";
import RecentActivity from "../components/home/RecentActivity";
// import EmailUpdatesCTA from "./components/EmailUpdatesCTA";
import SubjectsTrendSection from "../components/home/SubjectsTrendSection";


export const revalidate = 1800;

export default async function HomePage() {
  const CURRENT_CONGRESS = 119;

  return (
    <div className="container stack-48">
      <HomeHero>
        <div className="stack-16 hero__search-wrap">
          {/* Primary: simple, focused search */}
          <SearchBox />
          {/* 
          <div className="hero__actions">
            <a href="/states" className="btn btn--ghost">Browse states</a>
            <a href="/compare" className="btn btn--ghost">Compare members</a>
          </div>
          */}
        </div>
        {/* Key previews */}
      </HomeHero>
      <FeaturesGrid />
      {/* Key previews */}
      <RecentActivity maxItems={4} />
      {/* */}
      <SubjectsTrendSection congress={CURRENT_CONGRESS} />
    </div >
  );
}
