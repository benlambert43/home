import { NextRequest, NextResponse } from "next/server";

export default async function proxy(req: NextRequest) {
  return NextResponse.next();
}
