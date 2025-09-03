import { NextResponse } from "next/server";

// simple in-memory storage
let lotsByOfficer: Record<string, any[]> = {};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const officer = url.searchParams.get("officer")!;
  return NextResponse.json(lotsByOfficer[officer] || []);
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const officer = url.searchParams.get("officer")!;
  const newLot = await req.json();

  if (!lotsByOfficer[officer]) lotsByOfficer[officer] = [];
  lotsByOfficer[officer].push(newLot);

  return NextResponse.json(newLot, { status: 201 });
}
