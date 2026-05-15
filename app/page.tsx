import { GeoHomePage } from "@/components/geo/GeoHomePage";
import { resolveFabricsFromNotion } from "@/lib/fabrics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const { fabrics, notionEmpty } = await resolveFabricsFromNotion();
  return <GeoHomePage initialFabrics={fabrics} notionEmpty={notionEmpty} />;
}
