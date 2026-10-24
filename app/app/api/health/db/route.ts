import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    await query("SELECT 1");
    return NextResponse.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error("Database health check failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { status: "error", database: "disconnected" },
      { status: 503 },
    );
  }
}
