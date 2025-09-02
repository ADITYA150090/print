import { NextResponse } from "next/server";

// GET all lots for officer
export async function GET(
  req: Request,
  { params }: { params: { rmo: string; officer: string } }
) {
  const { officer } = params;

  // TODO: Replace with DB call
  const lots = [
    { id: "L1", name: `Lot 1 for ${officer}` },
    { id: "L2", name: `Lot 2 for ${officer}` },
  ];

  return NextResponse.json({ lots });
}
