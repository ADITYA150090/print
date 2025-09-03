import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import UnverifiedNameplate from "@/models/unverifiedNameplate";

export async function GET(
  req: Request,
  { params }: { params: { rmo: string; officerId: string } }
) {
  const { rmo, officerId } = params;

  try {
    await dbConnect();

    // Fetch only relevant records for this RMO + Officer
    const records = await UnverifiedNameplate.find(
      { rmo, officer: officerId },
      { lot: 1 } // fetch only lot field for efficiency
    );

    // Extract unique lot IDs
    const uniqueLots = Array.from(new Set(records.map((r) => r.lot)));

    // Convert into { id, name } format
    const lots = uniqueLots.map((lot) => ({
      id: lot,
      name: lot.toUpperCase(), // optional formatting
    }));

    return NextResponse.json({
      success: true,
      rmo,
      officerId,
      count: lots.length,
      lots,
    });
  } catch (err: any) {
    console.error("❌ Error in GET lots:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
