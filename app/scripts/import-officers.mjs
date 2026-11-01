#!/usr/bin/env node
// Import standardized IAS/IPS CSV. Uses the app's existing pg dependency.
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

function parseCsv(input) {
  const rows=[]; let row=[], field="", quoted=false;
  const s=input.replace(/^\uFEFF/,"");
  for(let i=0;i<s.length;i++){
    const c=s[i];
    if(quoted){
      if(c==='"' && s[i+1]==='"'){field+='"';i++;}
      else if(c==='"') quoted=false;
      else field+=c;
    } else if(c==='"' && field==="") quoted=true;
    else if(c===","){row.push(field);field="";}
    else if(c==="\n"){row.push(field);if(row.some(v=>v!==""))rows.push(row);row=[];field="";}
    else if(c!=="\r") field+=c;
  }
  row.push(field);if(row.some(v=>v!==""))rows.push(row);
  if(!rows.length)return [];
  const headers=rows.shift().map(v=>v.trim());
  return rows.map(values=>Object.fromEntries(headers.map((h,i)=>[h,(values[i]??"").trim()])));
}
const val=v=>v?.trim()?v.trim():null;
function date(v){
  if(!v?.trim())return null;
  const s=v.trim();let m=s.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if(m)return `${m[3]}-${m[2]}-${m[1]}`;
  if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;
  throw new Error(`Unsupported date: ${s}`);
}
function poolOptions(){
  if(!process.env.DATABASE_URL)throw new Error("DATABASE_URL is not configured");
  const url=new URL(process.env.DATABASE_URL);
  const mode=url.searchParams.get("sslmode"), root=url.searchParams.get("sslrootcert");
  for(const k of ["sslmode","sslrootcert","sslcert","sslkey"])url.searchParams.delete(k);
  const ca=root||process.env.RDS_CA_CERT_PATH||"/etc/ssl/certs/rds/global-bundle.pem";
  let ssl;
  if(fs.existsSync(ca))ssl={ca:fs.readFileSync(ca,"utf8"),rejectUnauthorized:true};
  else if(url.hostname.endsWith(".rds.amazonaws.com"))throw new Error(`RDS CA bundle missing: ${ca}. Set RDS_CA_CERT_PATH.`);
  else if(mode)ssl={rejectUnauthorized:true};
  return {connectionString:url.toString(),...(ssl?{ssl}:{}),max:3,connectionTimeoutMillis:10000};
}
const csv=process.argv[2];
if(!csv){console.error("Usage: node scripts/import-officers.mjs <csv-path>");process.exit(1);}
const csvPath=path.resolve(csv);
if(!fs.existsSync(csvPath))throw new Error(`CSV not found: ${csvPath}`);
const rows=parseCsv(fs.readFileSync(csvPath,"utf8"));
const pool=new Pool(poolOptions());const client=await pool.connect();
const sql=`INSERT INTO government_officers (
full_name,service_type,batch_year,cadre,employee_id,current_designation,current_department,
posting_location,date_of_birth,recruitment_type,education,home_state_or_domicile,gender,
pay_level,posting_effective_date,source_name,source_url,source_snapshot_date,source_page,
last_verified,verification_status,source_specific_data,updated_at
) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22::jsonb,NOW())
ON CONFLICT(service_type,employee_id) DO UPDATE SET
full_name=EXCLUDED.full_name,batch_year=EXCLUDED.batch_year,cadre=EXCLUDED.cadre,
current_designation=EXCLUDED.current_designation,current_department=EXCLUDED.current_department,
posting_location=EXCLUDED.posting_location,date_of_birth=EXCLUDED.date_of_birth,
recruitment_type=EXCLUDED.recruitment_type,education=EXCLUDED.education,
home_state_or_domicile=EXCLUDED.home_state_or_domicile,gender=EXCLUDED.gender,
pay_level=EXCLUDED.pay_level,posting_effective_date=EXCLUDED.posting_effective_date,
source_name=EXCLUDED.source_name,source_url=EXCLUDED.source_url,
source_snapshot_date=EXCLUDED.source_snapshot_date,source_page=EXCLUDED.source_page,
last_verified=EXCLUDED.last_verified,verification_status=EXCLUDED.verification_status,
source_specific_data=EXCLUDED.source_specific_data,updated_at=NOW()`;
let imported=0,skipped=0;
try{
 await client.query("BEGIN");
 for(const r of rows){
  const name=val(r.full_name),service=val(r.service_type),employeeId=val(r.employee_id);
  if(!name||!employeeId||!["IAS","IPS"].includes(service)){skipped++;continue;}
  const batch=val(r.batch_year),page=val(r.source_page);
  const raw=val(r.source_specific_data);
  let json={};if(raw){try{json=JSON.parse(raw);}catch{json={raw};}}
  const p=[name,service,batch&&/^\d{4}$/.test(batch)?Number(batch):null,val(r.cadre),employeeId,
   val(r.current_designation),val(r.current_department),val(r.posting_location),date(r.date_of_birth),
   val(r.recruitment_type),val(r.education),val(r.home_state_or_domicile),val(r.gender),val(r.pay_level),
   date(r.posting_effective_date),val(r.source_name),val(r.source_url),date(r.source_snapshot_date),
   page&&/^\d+$/.test(page)?Number(page):null,date(r.last_verified),val(r.verification_status),JSON.stringify(json)];
  await client.query(sql,p);imported++;
 }
 await client.query("COMMIT");
 console.log(`Import complete: ${imported} inserted/updated, ${skipped} skipped, ${rows.length} CSV rows.`);
}catch(e){await client.query("ROLLBACK");console.error("Import failed; transaction rolled back:",e.message);process.exitCode=1;}
finally{client.release();await pool.end();}
