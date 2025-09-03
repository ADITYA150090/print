import { NextRequest, NextResponse } from "next/server";

// Example mock data for officers (replace with real DB later)
const officerStats: Record<
  string,
  { unverified: number; verified: number; onTransit: number; totalDelivered: number }
> = {
  off11: { unverified: 550, verified: 500, onTransit: 300, totalDelivered: 50000 },
  off12: { unverified: 120, verified: 400, onTransit: 150, totalDelivered: 32000 },
  off13: { unverified: 80, verified: 250, onTransit: 100, totalDelivered: 18000 },
};

export async function GET(req: NextRequest, { params }: { params: { officer: string } }) {
  const { officer } = params;

  if (!officer || !officerStats[officer]) {
    return NextResponse.json({ success: false, error: "Officer not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: officerStats[officer] });
}
