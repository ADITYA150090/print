import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Nameplate from "@/models/Nameplate";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();

    const nameplate = await Nameplate.create(data);

    return NextResponse.json({ success: true, id: nameplate._id });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
