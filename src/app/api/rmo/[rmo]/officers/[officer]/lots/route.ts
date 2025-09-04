import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  context: { params: Promise<{ rmo: string; officer: string }> } // 👈 params must be Promise
) {
  // ✅ Await params
  const { rmo, officer } = await context.params;

  try {
    // Build base URL dynamically from the request
    const { origin } = new URL(req.url);

    // Fetch unverified lots
    const res = await fetch(`${origin}/api/unverify`);
    const data = await res.json();

    if (!data.success || !Array.isArray(data.data)) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch unverified lots" },
        { status: 500 }
      );
    }

    // Filter by RMO + officer
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
