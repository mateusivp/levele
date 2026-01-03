import { NextResponse } from "next/server";
import { dbVisits, incrementVisits } from "@/lib/db";

export async function GET() {
  return NextResponse.json({ visits: dbVisits });
}

export async function POST() {
  const newCount = incrementVisits();
  return NextResponse.json({ visits: newCount });
}
