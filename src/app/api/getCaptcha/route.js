import getCaptcha from "./getCaptcha";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { campus } = await req.json();
  const result = await getCaptcha(campus);

  const res = NextResponse.json(result);

  res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.headers.set("Pragma", "no-cache");
  res.headers.set("Expires", "0");
  res.headers.set("Surrogate-Control", "no-store");

  return res;
}