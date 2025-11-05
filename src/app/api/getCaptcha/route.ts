import { CaptchaResult } from "@/types/data/login";
import getCaptcha from "./getCaptcha";
import { NextRequest, NextResponse } from "next/server";

export async function POST(): Promise<NextResponse> {
  const result: CaptchaResult = await getCaptcha();
  return NextResponse.json(result);
}