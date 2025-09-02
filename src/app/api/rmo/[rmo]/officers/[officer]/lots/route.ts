import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { rmo: string; officerId: string } }
) {
  const { rmo, officerId } = params;

  // 🔹 Hardcoded lots for now
  const lots = [
    { id: "LOT1", name: "Lot 1" },
    { id: "LOT2", name: "Lot 2" },
    { id: "LOT3", name: "Lot 3" },
    { id: "LOT4", name: "Lot 4" },
  ];

  return NextResponse.json({
    success: true,
    rmo,
    officerId,
    lots,
  });
}
