import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { rmo: string; officer: string; lot: string } }
) {
  const { rmo, officer, lot } = params;

  try {
    // Full URL to /api/unverify
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/unverify`);
    const data = await res.json();

    if (!data.success || !Array.isArray(data.data)) {
      return NextResponse.json({ success: false, records: [] });
    }

    // Filter by RMO, officer, lot, and verified=false
    const records = data.data
      .filter(
        (item: any) =>
          item.rmo === rmo &&
          item.officer === officer &&
          item.lot === lot &&
          item.verified === false
      )
      .map((item: any) => ({
        id: item._id,
        houseName: item.houseName,
        ownerName: item.ownerName,
        spouseName: item.spouseName || "", // optional
        address: item.address,
        imageUrl: item.image_url,
      }));

    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error("❌ Failed to fetch unverified lots:", error);
    return NextResponse.json({ success: false, records: [] });
  }
}
