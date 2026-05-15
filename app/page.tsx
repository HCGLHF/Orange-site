import { GeoHomePage } from "@/components/geo/GeoHomePage";
import { getPublicFabrics } from "@/lib/public-catalog";

export const dynamic = "force-static";

export default async function Home() {
  return <GeoHomePage initialFabrics={getPublicFabrics()} />;
}
