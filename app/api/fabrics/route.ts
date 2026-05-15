import { NextResponse } from "next/server";
import { getPublicFabrics } from "@/lib/public-catalog";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(getPublicFabrics());
}
