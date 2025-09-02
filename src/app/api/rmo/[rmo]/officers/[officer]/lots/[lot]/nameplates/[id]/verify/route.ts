import { NextResponse } from "next/server";

// PATCH verify nameplate
export async function PATCH(
  req: Request,
  { params }: { params: { id: string; rmo: string; officer: string; lot: string } }
) {
  const { id, lot } = params;

  // TODO: Replace with DB update
  return NextResponse.json({
    success: true,
    message: `Nameplate ${id} in lot ${lot} verified ✅`,
  });
}
