import { NextResponse } from "next/server";
import { toEnglishFabrics } from "@/lib/english-fabrics";
import { getFabrics } from "@/lib/fabrics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const fabrics = await getFabrics();
  const englishFabrics = toEnglishFabrics(fabrics);

  if (process.env.NODE_ENV === "development") {
    console.log(
      "API response:",
      englishFabrics.map((f) => ({ name: f.name, status: f.stockStatus }))
    );
  }

  return NextResponse.json(englishFabrics);
}
