import { NextResponse } from "next/server";

// GET all officers for RMO
export async function GET(
  req: Request,
  { params }: { params: { rmo: string } }
) {
  const { rmo } = params;

  // TODO: Replace with DB call
  const officers = [
    { id: "1", officerName: "Aditya", officerNumber: "OFF1" },
    { id: "2", officerName: "Rahul", officerNumber: "OFF2" },
  ];

  return NextResponse.json({ officers });
}
