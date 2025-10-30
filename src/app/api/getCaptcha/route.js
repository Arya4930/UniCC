export const runtime = "nodejs";

import getCaptcha from "./getCaptcha";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { campus } = await req.json();
  const result = await getCaptcha(campus);
  return NextResponse.json(result);
}
