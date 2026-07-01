import { NextResponse } from "next/server";

export async function POST(request: Request) {
  return NextResponse.json(
    {
      success: false,
      message: "Quotation email route is not implemented yet.",
    },
    { status: 501 }
  );
}
