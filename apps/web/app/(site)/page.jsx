import HomeHero from "../components/features/home/HomeHero";
import HomeSections from "../components/features/home/HomeSections";

import "@/app/styles/active/site/ll3.home.css";
import "@/app/styles/active/core/ll3.global-search.css";

export const revalidate = 1800;

export default async function HomePage() {
  return (
    <div className="home">
      <HomeHero />
      <HomeSections />
    </div>
  );
}
