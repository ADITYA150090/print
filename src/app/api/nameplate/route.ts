import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("nameplates")
      .insert(body.map((np) => ({
        logo: np.logo,
        background: np.background,
        language: np.language,
        font: np.font,
        houseName: np.houseName,
        ownerName: np.ownerName,
        address: np.address,
        styles: np.styles,
        officerName: np.officerName,
        email: np.email,
      })));

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
