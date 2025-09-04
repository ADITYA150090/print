import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { officer: string } }
) {
  const { officer } = params;
  const lot = req.nextUrl.searchParams.get("lot"); // get lot from query string

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
