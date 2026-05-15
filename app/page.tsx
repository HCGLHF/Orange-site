import { GeoHomePage } from "@/components/geo/GeoHomePage";
import { toEnglishFabrics } from "@/lib/english-fabrics";
import { resolveFabricsFromNotion } from "@/lib/fabrics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const { fabrics, notionEmpty } = await resolveFabricsFromNotion();
  return (
    <GeoHomePage
      initialFabrics={toEnglishFabrics(fabrics)}
      notionEmpty={notionEmpty}
    />
  );
}
