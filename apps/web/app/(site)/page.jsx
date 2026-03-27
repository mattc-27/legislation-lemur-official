//export const dynamic = "force-dynamic"
import HomeHero from "../components/features/home/HomeHero";
import HomeSections from "../components/features/home/HomeSections";


import "@/app/styles/active/site/ll3.home.css";

export const revalidate = 1800;




export default async function HomePage() {
  return (
    <div className="home">
      <HomeHero />
      <HomeSections />

    </div>
  );
}