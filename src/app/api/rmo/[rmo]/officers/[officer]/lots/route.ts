import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { rmo: string; officer: string } }
) {
  const { rmo, officer } = params;

  try {
    // Fetch unverified lots from /api/unverify
    const res = await fetch(`${req.url.split("/api/rmo/")[0]}/api/unverify`);
    const data = await res.json();

    if (!data.success || !Array.isArray(data.data)) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch unverified lots" },
        { status: 500 }
      );
    }

    // Filter lots by RMO and officer number
    const filteredLots = data.data
      .filter((item: any) => item.rmo === rmo && item.officer === officer)
      .map((item: any) => ({
        id: item.lot,
        name: item.houseName || item.lot,
      }));

    return NextResponse.json({
      success: true,
      rmo,
      officer,
      lots: filteredLots,
    });
  } catch (err: any) {
    console.error("❌ GET /api/rmo/[rmo]/officers/[officer]/lots error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
