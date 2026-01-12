import { NextResponse } from "next/server";
import { getVisitsFromDb, incrementVisitsInDb } from "@/lib/db";

export async function GET() {
  const visits = await getVisitsFromDb();
  return NextResponse.json({ visits });
}

export async function POST() {
  await incrementVisitsInDb();
  const visits = await getVisitsFromDb();
  return NextResponse.json({ visits });
}
