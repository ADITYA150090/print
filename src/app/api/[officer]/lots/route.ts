import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ officer: string }> } // 👈 params ko Promise type do
) {
  const { officer } = await context.params; // 👈 params ko await karo
  const lot = req.nextUrl.searchParams.get("lot");

  try {
    const res = await fetch(`${req.nextUrl.origin}/api/unverify`);
    const data = await res.json();

    const lotItems = (data.data || []).filter(
      (item: any) =>
        item.officer.toUpperCase() === officer.toUpperCase() &&
        (!lot || item.lot === lot)
    );

    return NextResponse.json({ nameplates: lotItems });
  } catch (err) {
    console.error("Error fetching lot details:", err);
    return NextResponse.json({ nameplates: [] });
  }
}
