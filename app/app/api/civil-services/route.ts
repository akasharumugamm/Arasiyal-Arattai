import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const service = params.get("service") === "IAS" ? "IAS" : "IPS";
    const search = params.get("q")?.trim() ?? "";
    const cadre = params.get("cadre")?.trim() ?? "Tamil Nadu";
    const source = params.get("source")?.trim() ?? "";
    const pay = params.get("pay")?.trim() ?? "";
    const batchFrom = Number(params.get("batchFrom")) || null;
    const batchTo = Number(params.get("batchTo")) || null;
    const senior = params.get("senior") === "true";
    const sortSeniorFirst = params.get("sort") !== "junior";
    const limit = Math.min(Math.max(Number(params.get("limit")) || 20, 1), 100);
    const offset = Math.max(Number(params.get("offset")) || 0, 0);
    const result = await query(
      `SELECT id, full_name, service_type, batch_year, cadre, employee_id,
              current_designation, current_department, posting_location,
              recruitment_type, education, pay_level, source_name,
              source_snapshot_date, verification_status, date_of_birth,
              posting_effective_date, source_specific_data
       FROM government_officers
       WHERE service_type = $1
         AND ($2 = '' OR full_name ILIKE '%' || $2 || '%' OR employee_id ILIKE '%' || $2 || '%' OR COALESCE(current_designation, '') ILIKE '%' || $2 || '%' OR COALESCE(posting_location, '') ILIKE '%' || $2 || '%')
         AND ($3 = '' OR cadre ILIKE '%' || $3 || '%')
         AND ($4 = '' OR COALESCE(source_name, '') = $4)
         AND ($5 = '' OR COALESCE(pay_level, '') = $5)
         AND ($6::int IS NULL OR batch_year >= $6)
         AND ($7::int IS NULL OR batch_year <= $7)
         AND ($8 = false OR batch_year <= EXTRACT(YEAR FROM CURRENT_DATE)::int - 25)
       ORDER BY
         CASE WHEN $9 = true THEN batch_year END ASC NULLS LAST,
         CASE WHEN $9 = false THEN batch_year END DESC NULLS LAST,
         full_name ASC
       LIMIT $10 OFFSET $11`,
      [service, search, cadre === "All Cadres" ? "" : cadre, source, pay, batchFrom, batchTo, senior, sortSeniorFirst, limit, offset],
    );
    return NextResponse.json({ officers: result.rows, hasMore: result.rows.length === limit });
  } catch (error) {
    console.error("Civil services directory error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "Unable to load officer directory. Check that the officer database schema is installed." }, { status: 500 });
  }
}
