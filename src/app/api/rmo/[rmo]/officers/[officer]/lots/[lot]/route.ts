import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ rmo: string; officer: string; lot: string }> }
) {
  // ✅ Await params before destructuring
  const { rmo, officer, lot } = await context.params;

  try {
    const { origin } = new URL(req.url);

    const res = await fetch(`${origin}/api/unverify`);
    const data = await res.json();

    if (!data.success || !Array.isArray(data.data)) {
      return NextResponse.json({ success: false, records: [] });
    }

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
        spouseName: item.spouseName || "",
        address: item.address,
        imageUrl: item.image_url,
      }));

    return NextResponse.json({ success: true, records });
  } catch (error) {
    console.error("❌ Failed to fetch unverified lots:", error);
    return NextResponse.json({ success: false, records: [] });
  }
}
