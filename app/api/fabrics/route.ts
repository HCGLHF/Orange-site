import { NextResponse } from "next/server";
import { getFabrics } from "@/lib/fabrics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const fabrics = await getFabrics();

  if (process.env.NODE_ENV === "development") {
    console.log(
      "API 返回:",
      fabrics.map((f) => ({ name: f.name, status: f.stockStatus }))
    );
  }

  return NextResponse.json(fabrics);
}
