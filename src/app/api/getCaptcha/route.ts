import { CaptchaResult } from "@/types/data/login";
import getCaptcha from "./getCaptcha";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const { campus } = await req.json();
  const result: CaptchaResult = await getCaptcha(campus);
  return NextResponse.json(result);
}