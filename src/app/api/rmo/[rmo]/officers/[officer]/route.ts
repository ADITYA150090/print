import { NextResponse } from "next/server";

// GET one officer details
export async function GET(
  req: Request,
  { params }: { params: { rmo: string; officer: string } }
) {
  const { rmo, officer } = params;

  // TODO: Replace with real DB fetch
  const officerData = {
    officerNumber: officer,
    officerName: `Officer ${officer}`,
    rmo,
    lotsAssigned: ["L1", "L2"], // Example data
  };

  return NextResponse.json({ officer: officerData });
}
