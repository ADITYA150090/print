import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { officer: string; lot: string } }
) {
  const { officer, lot } = params;

  try {
    // Fetch all unverified nameplates
    const res = await fetch(`${req.nextUrl.origin}/api/unverify`);
    const data = await res.json();

    // Filter for this officer and lot
    const lotItems = (data.data || []).filter(
      (item: any) =>
        item.officer.toUpperCase() === officer.toUpperCase() &&
        item.lot === lot
    );

    return NextResponse.json({ nameplates: lotItems });
  } catch (err) {
    console.error("Error fetching lot details:", err);
    return NextResponse.json({ nameplates: [] });
  }
}
