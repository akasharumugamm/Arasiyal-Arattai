"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import mlaDirectory from "@/data/tn-mlas.json";

type Category =
  | "Government"
  | "Ministers"
  | "MLAs"
  | "IAS Officers"
  | "IPS Officers"
  | "Departments"
  | "Schemes & Projects";

type Profile = {
  label: string;
  role: string;
  description: string;
  photoUrl?: string;
  isPerson?: boolean;
  xHandle?: string;
  mlaNumber?: number;
  mlaParty?: string;
  mlaEmail?: string;
  mlaStatus?: string;
};

type ReviewSummary = {
  id: string;
  profile: string;
  name: string;
  type: "Positive" | "Negative" | "Allegation" | "Request";
  title: string;
  body: string;
  image?: string;
  votes?: { up: number; down: number };
  date: string;
};

function InfoNode({ id, data }: NodeProps<Node<Profile>>) {
  const [imageFailed, setImageFailed] = useState(false);
  const showAvatar = !["cm-admin", "cm-home", "cm-special", "cm-other", "council-summary", "mla-summary", "departments", "schemes", "projects"].includes(id);
  const initials = data.label
    .replace(/^(Honourable|Honorable|Thiru|Justice)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        width: 230,
        minHeight: showAvatar ? 150 : 0,
        boxSizing: "border-box",
        padding: showAvatar ? 16 : "10px 12px",
        border: "1px solid #cbd5e1",
        borderRadius: 12,
        background: "white",
        color: "#172554",
        boxShadow: "0 3px 12px #00000012",
        textAlign: "center",
      }}
    >
      <Handle type="target" position={Position.Top} />
      {showAvatar && (data.photoUrl && !imageFailed ? (
        ["governor", "chief-justice"].includes(id) ? (
          <div style={{ width: 88, height: 88, boxSizing: "border-box", overflow: "hidden", borderRadius: 20, border: "4px solid #e5e7eb", margin: "0 auto 10px", background: "#f1f5f9" }}>
            <img
              src={data.photoUrl}
              alt={data.label}
              onError={() => setImageFailed(true)}
              style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%", transform: "scale(1.3)" }}
            />
          </div>
        ) : (
          <img
            src={data.photoUrl}
            alt={data.label}
            onError={() => setImageFailed(true)}
            style={{
              display: "block",
              width: 88,
              height: 88,
              borderRadius: 20,
              objectFit: "cover",
              objectPosition: "center 25%",
              margin: "0 auto 10px",
              border: "4px solid #e5e7eb",
              background: "#f1f5f9",
            }}
          />
        )
      ) : showAvatar ? (
        <div
          aria-label={data.label + " profile image unavailable"}
          title="Official profile image unavailable"
          style={{
            display: "grid",
            placeItems: "center",
            width: 88,
            height: 88,
            boxSizing: "border-box",
            borderRadius: 20,
            margin: "0 auto 10px",
            border: "4px solid #e5e7eb",
            background: "linear-gradient(135deg, #dbeafe, #f8fafc)",
            color: "#1e3a8a",
            fontSize: 24,
            fontWeight: 850,
          }}
        >
          {initials || "TN"}
        </div>
      ) : null)}
      <div style={{ fontWeight: 750, lineHeight: 1.35, overflowWrap: "anywhere" }}>{data.label}</div>
      <div style={{ fontSize: 12, lineHeight: 1.45, marginTop: 6, color: "#64748b" }}>
        {data.role}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}


function RatingGauge({ value }: { value: number | null }) {
  const score = value === null ? null : Math.max(0, Math.min(100, Math.round(value)));
  const sentiment = score === null ? "Awaiting feedback" : score >= 70 ? "Mostly positive" : score >= 45 ? "Mixed feedback" : "Needs improvement";
  const sentimentColor = score === null ? "#64748b" : score >= 70 ? "#15803d" : score >= 45 ? "#b45309" : "#b91c1c";
  const sentimentBg = score === null ? "#f1f5f9" : score >= 70 ? "#dcfce7" : score >= 45 ? "#fef3c7" : "#fee2e2";
  return (
    <div style={{ marginTop: 12, padding: 14, borderRadius: 12, border: "1px solid #e2e8f0", background: "white" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ fontSize: 11, color: "#64748b", fontWeight: 750, letterSpacing: 0.4, textTransform: "uppercase" }}>Public sentiment</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 3 }}>
            <span style={{ fontSize: 30, lineHeight: 1.1, fontWeight: 900, color: "#0f172a" }}>{score === null ? "—" : score}</span>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 700 }}>/ 100</span>
          </div>
        </div>
        <span style={{ padding: "6px 9px", borderRadius: 999, background: sentimentBg, color: sentimentColor, fontSize: 10, fontWeight: 850, whiteSpace: "nowrap" }}>{sentiment}</span>
      </div>
      <div role="progressbar" aria-label="Positive public sentiment score" aria-valuemin={0} aria-valuemax={100} aria-valuenow={score ?? 0} style={{ height: 8, borderRadius: 999, overflow: "hidden", background: "#e2e8f0", marginTop: 12 }}>
        <div style={{ width: `${score ?? 0}%`, height: "100%", borderRadius: 999, background: score === null ? "#cbd5e1" : score >= 70 ? "#16a34a" : score >= 45 ? "#f59e0b" : "#ef4444", transition: "width 220ms ease" }} />
      </div>
      <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 11, lineHeight: 1.5 }}>{score === null ? "No positive or negative reviews yet." : "Calculated from positive and negative reviews only."}</p>
    </div>
  );
}

const nodeTypes = { info: InfoNode };

const allNodes: Node<Profile>[] = [
  {
    id: "government",
    type: "info",
    position: { x: 360, y: 20 },
    data: {
      label: "Government of Tamil Nadu",
      role: "Fort St. George, Chennai",
      description:
        "The Government of Tamil Nadu is the state government responsible for public administration, policy and delivery of public services. Its executive operates through the Governor as constitutional head, the Chief Minister and Council of Ministers, and the government departments and civil services. The Secretariat is located at Fort St. George, Chennai. Use this directory to explore officials, portfolios and departments; confirm current appointments and responsibilities against official notifications.",
      photoUrl: "https://cf-images.assettype.com/thenewsminute/2026-05-30/0mplww47/Secretariat.jpeg?w=1200&h=1200&auto=format%2Ccompress&fit=max&enlarge=true",
    },
  },
  {
    id: "governor",
    type: "info",
    position: { x: 360, y: 200 },
    data: {
      photoUrl: "https://cdnbbsr.s3waas.gov.in/s30d73a25092e5c1c9769a9f3255caa65a/uploads/2026/03/202603241234777909.jpg",
      label: "Honourable Governor",
      role: "Constitutional head of Tamil Nadu",
      description:
        "The Governor is the constitutional head of the state. The Governor appoints the Chief Minister and appoints other ministers on the Chief Minister's advice. Under the Constitution, the Council of Ministers headed by the Chief Minister aids and advises the Governor, except in matters where the Constitution provides otherwise. See the official Governor profile for the current office-holder.",
    },
  },
  {
    id: "chief-justice",
    type: "info",
    position: { x: 940, y: 280 },
    data: {
      photoUrl: "https://static.businessworld.in/2025052791_20260307131351_original_image_45.webp",
      label: "Thiru Sushrut Arvind Dharmadhikari",
      role: "Chief Justice, Madras High Court",
      isPerson: true,
      description: "The Chief Justice leads the Madras High Court, which is part of the independent judiciary. The judiciary is institutionally separate from the state executive and does not report to the Chief Minister. Confirm current judicial office-holders through the Madras High Court's official website.",
    },
  },
  {
    id: "cm",
    type: "info",
    position: { x: 360, y: 430 },
    data: {
      label: "Honourable Thiru C. Joseph Vijay",
      role: "Chief Minister",
      isPerson: true,
      xHandle: "https://x.com/CMOTamilnadu",
      description:
        "The Chief Minister heads the elected state government and the Council of Ministers. The Governor appoints the Chief Minister; other ministers are appointed by the Governor on the Chief Minister's advice. The Chief Minister coordinates the Council of Ministers and holds the portfolios allocated in the current official order, including Public, General Administration, IAS, IPS, IFS, Police, Home, Special Programme Implementation, Youth Welfare, Municipal Administration, Urban and Water Supply. Portfolio allocations can change; consult the latest government order for the authoritative list.",
      photoUrl: "https://i.ibb.co/0Rv80BLn/HR-9-Y6yb0-AAzx-FY.jpg",
    },
  },
  {
    id: "council-summary",
    type: "info",
    position: { x: 1020, y: 800 },
    data: {
      label: "Council of Ministers",
      role: "34 ministers + Chief Minister",
      description: "The Council of Ministers is headed by the Chief Minister. The Governor appoints ministers on the Chief Minister's advice. This summary represents the Council without duplicating every minister in the Government view; open the Ministers tab for individual profiles and portfolios. Count checked against the Tamil Nadu Legislative Assembly ministers directory in October 2026.",
    },
  },
  {
    id: "mla-summary",
    type: "info",
    position: { x: -300, y: 250 },
    data: {
      label: "Tamil Nadu Legislative Assembly",
      role: "234 seats · 227 sitting members · 7 vacant",
      description: "MLAs are elected members of the Tamil Nadu Legislative Assembly, not officials who report to the Chief Minister. The Assembly includes members from the governing party and opposition. The state has 234 seats; the cited October 2026 directory lists 227 sitting members and 7 vacant seats. Open the MLAs tab for individual constituency profiles.",
    },
  },
  {
    id: "tvk",
    type: "info",
    position: { x: 640, y: 220 },
    data: {
      label: "TVK",
      role: "Political party affiliation",
      xHandle: "https://x.com/TVKPartyHQ?s=20",
      description:
        "Tamilaga Vettri Kazhagam (TVK). This is a political-party connection, not a government department.",
      photoUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Tamilaga_Vettri_Kazhagam_%28TVK%29_Flag.png?utm_source=hi.wikipedia.org&utm_campaign=index&utm_content=original",
    },
  },
  {
    id: "cm-admin",
    type: "info",
    position: { x: -100, y: 450 },
    data: {
      label: "Public Administration",
      role: "Portfolio / administration",
      description: "Coordinates general administration and public-service matters assigned to the Chief Minister under the current portfolio allocation. The detailed scope and departmental arrangements should be checked against the latest official government order.",
    },
  },
  {
    id: "cm-home",
    type: "info",
    position: { x: 150, y: 450 },
    data: {
      label: "Home and Police",
      role: "Portfolio area",
      description: "Covers Home and Police matters assigned to the Chief Minister, including state policing and internal administration. Consult current government orders for the precise departmental responsibilities and reporting arrangements.",
    },
  },
  {
    id: "cm-special",
    type: "info",
    position: { x: 400, y: 450 },
    data: {
      label: "Special Programme Implementation",
      role: "Portfolio area",
      description: "A portfolio retained by the Chief Minister for coordinating special programmes and implementation priorities. Refer to the latest official portfolio allocation and programme orders for the current scope.",
    },
  },
  {
    id: "cm-other",
    type: "info",
    position: { x: 650, y: 450 },
    data: {
      label: "Other retained portfolios",
      role: "To be verified",
      description: "This node represents any additional portfolios retained by the Chief Minister. The specific departments should be listed only when confirmed by the latest official portfolio allocation order.",
    },
  },
  {
    id: "anand",
    type: "info",
    position: { x: 0, y: 100 },
    data: {
      label: "N. Anand",
      role: "Rural Development and Water Resources",
      isPerson: true,
      xHandle: "https://x.com/BussyAnand",
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/024_Anand.png",
      description: "Minister for Rural Development, Panchayats and Panchayat Union, Irrigation, and Irrigation Projects including Small Irrigation.",
    },
  },
  {
    id: "aadhav",
    type: "info",
    position: { x: 280, y: 100 },
    data: {
      label: "Aadhav Arjuna",
      role: "Public Works and Sports Development",
      isPerson: true,
      xHandle: "https://x.com/AadhavArjuna",
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/014_Aadhav_Arjuna.png",
      description: "Minister for Public Works (Buildings, Highways and Minor Ports) and Sports Development.",
    },
  },
  {
    id: "arunraj",
    type: "info",
    position: { x: 560, y: 100 },
    data: {
      label: "Dr. K.G. Arunraj",
      role: "Health, Medical Education and Family Welfare",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/096_Arunraj.png",
      description: "Minister for Health, Medical Education and Family Welfare.",
    },
  },
  {
    id: "sengottaiyan",
    type: "info",
    position: { x: 840, y: 100 },
    data: {
      label: "K.A. Sengottaiyan",
      role: "Revenue and Disaster Management",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/106_Sengottaiyan.png",
      description: "Minister for Revenue, District Revenue Establishment, Deputy Collectors, Disaster Management, Boodhan, Gramadhan and Legislative Assembly.",
    },
  },
  {
    id: "venkataramanan",
    type: "info",
    position: { x: 1120, y: 100 },
    data: {
      label: "P. Venkataramanan",
      role: "Food and Civil Supplies",
      isPerson: true,
      xHandle: "https://x.com/AdvocateVenkatP",
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/025_Venkataramanan.png",
      description: "Minister for Food and Civil Supplies, Consumer Protection and Price Control.",
    },
  },
  {
    id: "shahjahan",
    type: "info",
    position: { x: 0, y: 340 },
    data: {
      label: "A.M. Shahjahan",
      role: "Minorities Welfare and Wakf Board",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/172_Shahjahan.png",
      description: "Minister for Minorities Welfare and Wakf Board.",
    },
  },
  {
    id: "rajkumar",
    type: "info",
    position: { x: 280, y: 340 },
    data: {
      label: "B. Rajkumar",
      role: "Housing and Urban Development",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/155_Rajkumar.png",
      description: "Minister for Housing, Rural Housing, Town Planning Projects and Housing Development, Accommodation Control, CMDA, Tamil Nadu Urban Habitat Development Board, Urban Planning and Urban Development.",
    },
  },
  {
    id: "vijayalakshmi",
    type: "info",
    position: { x: 560, y: 340 },
    data: {
      label: "C. Vijayalakshmi",
      role: "Milk and Dairy Development",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/097_Vijayalakshmi.png",
      description: "Minister for Milk and Dairy Development.",
    },
  },
  {
    id: "sarathkumar",
    type: "info",
    position: { x: 840, y: 340 },
    data: {
      label: "D. Sarathkumar",
      role: "Human Resources Management",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/031_Sarathkumar.png",
      description: "Minister for Human Resources Management and Ex-Servicemen Welfare.",
    },
  },
  {
    id: "prabhu",
    type: "info",
    position: { x: 1120, y: 340 },
    data: {
      label: "Dr. T.K. Prabhu",
      role: "Natural Resources",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/184_tk_prabhu.png",
      description: "Minister for Minerals and Mines.",
    },
  },
  {
    id: "jegadeshwari",
    type: "info",
    position: { x: 0, y: 580 },
    data: {
      label: "Jegadeshwari K.",
      role: "Social Welfare and Women Empowerment",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/202_Jegadeshwari.jpeg",
      description: "Minister for Social Welfare including Women Welfare, Orphanages and Correctional Administration, Beggar Homes, Social Reforms and Nutritious Meal Programme.",
    },
  },
  {
    id: "kamali",
    type: "info",
    position: { x: 280, y: 580 },
    data: {
      label: "S. Kamali",
      role: "Animal Husbandry",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/112_Kamali.png",
      description: "Minister for Animal Husbandry.",
    },
  },
  {
    id: "kumar",
    type: "info",
    position: { x: 560, y: 580 },
    data: {
      label: "R. Kumar",
      role: "Artificial Intelligence, IT and Digital Services",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/026_Kumar.png",
      description: "Minister for Artificial Intelligence, Information Technology and Digital Services.",
    },
  },
  {
    id: "logesh",
    type: "info",
    position: { x: 840, y: 580 },
    data: {
      label: "D. Logesh Tamilselvan",
      role: "Commercial Taxes and Registration",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/092_Logesh_Tamilselvan.png",
      description: "Minister for Commercial Taxes, Registration and Stamp Act, Debt Relief including legislation on Money lending, Chits and Registration of Companies.",
    },
  },
  {
    id: "vijaybalaji",
    type: "info",
    position: { x: 1120, y: 580 },
    data: {
      label: "M. Vijay Balaji",
      role: "Handlooms, Textiles and Khadi",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/098_Vijay_Balaji.png",
      description: "Minister for Handlooms and Textiles, Khadi and Village Industries Board.",
    },
  },
  {
    id: "mathanraja",
    type: "info",
    position: { x: 0, y: 820 },
    data: {
      label: "P. Mathan Raja",
      role: "MSMEs, Rural, Cottage and Small Industries",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/217_Mathan_Raja.png",
      description: "Minister for Rural Industries including Cottage Industries and Small Industries.",
    },
  },
  {
    id: "farvas",
    type: "info",
    position: { x: 280, y: 820 },
    data: {
      label: "J. Mohamed Farvas",
      role: "Labour Welfare and Skill Development",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/183_Mohamed_Farvas.png",
      description: "Minister for Labour Welfare, Population, Employment and Training, Census, Weights and Measures, Urban and Rural Employment and Bonded Labour Welfare.",
    },
  },
  {
    id: "mariewilson",
    type: "info",
    position: { x: 560, y: 820 },
    data: {
      label: "N. Marie Wilson",
      role: "Finance",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/011_Marie_Wilson.png",
      description: "Minister for Finance, Pensions and Pensionary Benefits, Planning and Development.",
    },
  },
  {
    id: "viswanathan",
    type: "info",
    position: { x: 840, y: 820 },
    data: {
      label: "P. Viswanathan",
      role: "Higher Education",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/188_Viswanathan.png",
      description: "Minister for Higher Education, including Technical Education, Electronics, Science and Technology.",
    },
  },
  {
    id: "nirmalkumar",
    type: "info",
    position: { x: 1120, y: 820 },
    data: {
      label: "R. Nirmalkumar",
      role: "Energy Resources",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/195_Nirmalkumar.png",
      description: "Minister for Electricity and Non-Conventional Energy Development, Law, Courts, Prisons and Prevention of Corruption, Governor, Elections and Passports.",
    },
  },
  {
    id: "ranjithkumar",
    type: "info",
    position: { x: 0, y: 1060 },
    data: {
      label: "R.V. Ranjithkumar",
      role: "Forests",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/037_Ranjithkumar.png",
      description: "Minister for Forests.",
    },
  },
  {
    id: "rajeev",
    type: "info",
    position: { x: 280, y: 1060 },
    data: {
      label: "Rajeev",
      role: "Environment and Climate Change",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/210_Rajeev.png",
      description: "Minister for Environment, Pollution Control Board and Climate Change.",
    },
  },
  {
    id: "rajeshkumar",
    type: "info",
    position: { x: 560, y: 1060 },
    data: {
      label: "S. Rajesh Kumar",
      role: "Tourism",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/234_Rajesh_Kumar.png",
      description: "Minister for Tourism and Tourism Development Corporation.",
    },
  },
  {
    id: "rajmohan",
    type: "info",
    position: { x: 840, y: 1060 },
    data: {
      label: "Rajmohan",
      role: "School Education",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/016_Rajmohan.png",
      description: "Minister for School Education, Archaeology, Tamil Official Language and Tamil Culture, Information and Publicity, Film Technology and Cinematograph Act, Newsprint Control, Stationery and Printing, Government Press.",
    },
  },
  {
    id: "ramesh",
    type: "info",
    position: { x: 1120, y: 1060 },
    data: {
      label: "Ramesh",
      role: "Hindu Religious and Charitable Endowments",
      isPerson: true,
      xHandle: "https://x.com/RameshOffcl",
      photoUrl: "https://d8c4bhp8zz98f.cloudfront.net/candidates/SrirangamTVKRamesh.png",
      description: "Minister for Hindu Religious and Charitable Endowments.",
    },
  },
  {
    id: "keerthana",
    type: "info",
    position: { x: 0, y: 1300 },
    data: {
      label: "S. Keerthana",
      role: "Industries",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/205_Keerthana.png",
      description: "Minister for Industries and Investment Promotion.",
    },
  },
  {
    id: "srinath",
    type: "info",
    position: { x: 280, y: 1300 },
    data: {
      label: "Srinath",
      role: "Fisheries and Fishermen Welfare",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/214_Srinath.png",
      description: "Minister for Fisheries and Fisheries Development Corporation.",
    },
  },
  {
    id: "thennarasu",
    type: "info",
    position: { x: 560, y: 1300 },
    data: {
      label: "K. Thennarasu",
      role: "Non-Resident Tamils Welfare",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/029_Thennarasu.png",
      description: "Minister for Non-Resident Tamils Welfare, Refugees and evacuees.",
    },
  },
  {
    id: "gandhiraj",
    type: "info",
    position: { x: 840, y: 1300 },
    data: {
      label: "V. Gandhiraj",
      role: "Co-operation",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/038_Gandhiraj.png",
      description: "Minister for Co-operation.",
    },
  },
  {
    id: "sampathkumar",
    type: "info",
    position: { x: 1120, y: 1300 },
    data: {
      label: "V. Sampath Kumar",
      role: "Backward Classes Welfare",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/118_Sampath_kumar.png",
      description: "Minister for Backward Classes Welfare, Most Backward Classes Welfare and De-notified Communities Welfare.",
    },
  },
  {
    id: "vanniarasu",
    type: "info",
    position: { x: 0, y: 1540 },
    data: {
      label: "Vanni Arasu",
      role: "Social Justice and Adi Dravidar Welfare",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/072_Vanni_Arasu.png",
      description: "Minister for Adi Dravidar Welfare and Hill Tribes.",
    },
  },
  {
    id: "vignesh",
    type: "info",
    position: { x: 280, y: 1540 },
    data: {
      label: "K. Vignesh",
      role: "Prohibition and Excise",
      isPerson: true,
      xHandle: "https://x.com/VigneshTvkCbe",
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/122_vignesh.png",
      description: "Minister for Prohibition and Excise.",
    },
  },
  {
    id: "vijaytamilan",
    type: "info",
    position: { x: 560, y: 1540 },
    data: {
      label: "A. Vijay Tamilan Parthiban",
      role: "Transport",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/090_Vijay_Tamilan_%20Parthiban.png",
      description: "Minister for Motor Vehicle Acts administration, Transport, Nationalised Transport and Motor Vehicles Act.",
    },
  },
  {
    id: "vinoth",
    type: "info",
    position: { x: 840, y: 1540 },
    data: {
      label: "Vinoth",
      role: "Agriculture and Farmers Welfare",
      isPerson: true,
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/171_Vinoth.png",
      description: "Minister for Agriculture, Agricultural Engineering, Agro Service Co-operatives, Horticulture, Sugar, Sugarcane Excise, Sugarcane Development and Waste Land Development.",
    },
  },
  {
    id: "mla-directory",
    type: "info",
    position: { x: 360, y: 200 },
    data: {
      label: "MLA Directory",
      role: "Constituencies and elected representatives",
      description: "This directory is intended to list elected Members of the Tamil Nadu Legislative Assembly, their constituencies and publicly documented affiliations. Verify each member’s name and constituency against the official Assembly directory and election records.",
      photoUrl: "https://i.pravatar.cc/150?img=25",
    },
  },
  {
    id: "ias",
    type: "info",
    position: { x: 360, y: 200 },
    data: {
      label: "IAS Officers",
      role: "Indian Administrative Service",
      description: "The IAS directory covers civil-service officers serving in state administration, including department and district appointments. Record postings and transfers only when supported by official orders, and include the order date and source.",
      photoUrl: "https://i.pravatar.cc/150?img=21",
    },
  },
  {
    id: "ips",
    type: "info",
    position: { x: 200, y: 180 },
    data: {
      label: "IPS Officers",
      role: "Indian Police Service",
      description: "The IPS directory covers police-service officers and leadership assignments. Use official police and government orders to confirm each officer’s current rank, posting and transfer history.",
      photoUrl: "https://i.pravatar.cc/150?img=22",
    },
  },
  {
    id: "dgp",
    type: "info",
    position: { x: 520, y: 180 },
    data: {
      label: "Director General of Police",
      role: "DGP — current incumbent to verify",
      description: "The Director General of Police is the senior-most police leadership role in the state. Confirm the incumbent, appointment date and current responsibilities against the latest official government order before publishing.",
      photoUrl: "https://i.pravatar.cc/150?img=11",
    },
  },
  {
    id: "amalraj",
    type: "info",
    position: { x: 360, y: 430 },
    data: {
      label: "A. Amalraj",
      role: "IPS officer — current posting to verify",
      description: "Use this profile to document A. Amalraj’s verified service details and postings. Confirm the current designation and appointment from an official government order before treating it as current.",
      photoUrl: "https://i.pravatar.cc/150?img=17",
    },
  },
  {
    id: "departments",
    type: "info",
    position: { x: 360, y: 200 },
    data: {
      label: "Department Directory",
      role: "Government departments",
      description: "Browse state government departments, their published responsibilities and associated ministerial or administrative leadership. Add reporting relationships only when supported by an official department page or government order.",
    },
  },
  {
    id: "schemes",
    type: "info",
    position: { x: 200, y: 180 },
    data: {
      label: "Government Schemes",
      role: "Programmes and public projects",
      description: "Use this section to document public schemes with their official description, eligibility, implementing department, application details and published updates. Link to government sources and distinguish announced plans from active schemes.",
    },
  },
  {
    id: "projects",
    type: "info",
    position: { x: 520, y: 180 },
    data: {
      label: "Public Projects",
      role: "Projects and outcomes",
      description: "Use this section to describe public projects with the responsible department, location, announced timeline and publicly released budget or progress information. Cite official sources and label unconfirmed estimates clearly.",
    },
  },
];

const allEdges: Edge[] = [
  { id: "g1", source: "government", target: "governor", type: "smoothstep" },
  { id: "g1a", source: "governor", target: "cm", label: "appoints", type: "smoothstep" },
  { id: "g2", source: "cm", target: "tvk", label: "Party affiliation", type: "smoothstep" },
  { id: "g2a", source: "cm", target: "council-summary", label: "Heads", type: "smoothstep" },
  { id: "g2b", source: "government", target: "mla-summary", label: "Legislature", type: "smoothstep" },
  { id: "g3", source: "cm", target: "cm-admin", type: "smoothstep" },
  { id: "g4", source: "cm", target: "cm-home", type: "smoothstep" },
  { id: "g5", source: "cm", target: "cm-special", type: "smoothstep" },
  { id: "g6", source: "cm", target: "cm-other", type: "smoothstep" },
  { id: "m-anand", source: "cm", target: "anand", label: "Minister" },
  { id: "m-aadhav", source: "cm", target: "aadhav", label: "Minister" },
  { id: "m-arunraj", source: "cm", target: "arunraj", label: "Minister" },
  { id: "m-sengottaiyan", source: "cm", target: "sengottaiyan", label: "Minister" },
  { id: "m-venkataramanan", source: "cm", target: "venkataramanan", label: "Minister" },
  { id: "m-shahjahan", source: "cm", target: "shahjahan", label: "Minister" },
  { id: "m-rajkumar", source: "cm", target: "rajkumar", label: "Minister" },
  { id: "m-vijayalakshmi", source: "cm", target: "vijayalakshmi", label: "Minister" },
  { id: "m-sarathkumar", source: "cm", target: "sarathkumar", label: "Minister" },
  { id: "m-prabhu", source: "cm", target: "prabhu", label: "Minister" },
  { id: "m-jegadeshwari", source: "cm", target: "jegadeshwari", label: "Minister" },
  { id: "m-kamali", source: "cm", target: "kamali", label: "Minister" },
  { id: "m-kumar", source: "cm", target: "kumar", label: "Minister" },
  { id: "m-logesh", source: "cm", target: "logesh", label: "Minister" },
  { id: "m-vijaybalaji", source: "cm", target: "vijaybalaji", label: "Minister" },
  { id: "m-mathanraja", source: "cm", target: "mathanraja", label: "Minister" },
  { id: "m-farvas", source: "cm", target: "farvas", label: "Minister" },
  { id: "m-mariewilson", source: "cm", target: "mariewilson", label: "Minister" },
  { id: "m-viswanathan", source: "cm", target: "viswanathan", label: "Minister" },
  { id: "m-nirmalkumar", source: "cm", target: "nirmalkumar", label: "Minister" },
  { id: "m-ranjithkumar", source: "cm", target: "ranjithkumar", label: "Minister" },
  { id: "m-rajeev", source: "cm", target: "rajeev", label: "Minister" },
  { id: "m-rajeshkumar", source: "cm", target: "rajeshkumar", label: "Minister" },
  { id: "m-rajmohan", source: "cm", target: "rajmohan", label: "Minister" },
  { id: "m-ramesh", source: "cm", target: "ramesh", label: "Minister" },
  { id: "m-keerthana", source: "cm", target: "keerthana", label: "Minister" },
  { id: "m-srinath", source: "cm", target: "srinath", label: "Minister" },
  { id: "m-thennarasu", source: "cm", target: "thennarasu", label: "Minister" },
  { id: "m-gandhiraj", source: "cm", target: "gandhiraj", label: "Minister" },
  { id: "m-sampathkumar", source: "cm", target: "sampathkumar", label: "Minister" },
  { id: "m-vanniarasu", source: "cm", target: "vanniarasu", label: "Minister" },
  { id: "m-vignesh", source: "cm", target: "vignesh", label: "Minister" },
  { id: "m-vijaytamilan", source: "cm", target: "vijaytamilan", label: "Minister" },
  { id: "m-vinoth", source: "cm", target: "vinoth", label: "Minister" },
  { id: "p1", source: "ips", target: "dgp", label: "Police leadership" },
  { id: "p2", source: "ips", target: "amalraj", label: "Officer profile" },
  { id: "s1", source: "departments", target: "schemes", label: "Responsible department" },
  { id: "s2", source: "schemes", target: "projects", label: "Implementation" },
];

const categoryNodes: Record<Category, string[]> = {
  Government: ["government", "governor", "cm", "chief-justice", "tvk", "council-summary", "mla-summary", "cm-admin", "cm-home", "cm-special", "cm-other"],
  Ministers: ["cm", "anand", "aadhav", "arunraj", "sengottaiyan", "venkataramanan", "shahjahan", "rajkumar", "vijayalakshmi", "sarathkumar", "prabhu", "jegadeshwari", "kamali", "kumar", "logesh", "vijaybalaji", "mathanraja", "farvas", "mariewilson", "viswanathan", "nirmalkumar", "ranjithkumar", "rajeev", "rajeshkumar", "rajmohan", "ramesh", "keerthana", "srinath", "thennarasu", "gandhiraj", "sampathkumar", "vanniarasu", "vignesh", "vijaytamilan", "vinoth"],
  MLAs: ["mla-directory"],
  "IAS Officers": ["ias"],
  "IPS Officers": ["ips", "dgp", "amalraj"],
  Departments: ["departments"],
  "Schemes & Projects": ["schemes", "projects"],
};

const categories: Category[] = [
  "Government",
  "Ministers",
  "MLAs",
  "IAS Officers",
  "IPS Officers",
  "Departments",
  "Schemes & Projects",
];

const categoryDescriptions: Record<Category, string> = {
  Government: "Governor, Chief Minister, Council of Ministers and the state executive structure.",
  Ministers: "Meet the Chief Minister and ministers, and explore their portfolios and profiles.",
  MLAs: "Explore all 234 Assembly constituencies. Select a party group to expand its member profiles; search by name or constituency.",
  "IAS Officers": "Explore administrative officers and postings.",
  "IPS Officers": "Explore police leadership and IPS officer profiles.",
  Departments: "Explore department structures and responsibilities.",
  "Schemes & Projects": "Explore schemes, projects and documented outcomes.",
};

export default function Home() {
  const [category, setCategory] = useState<Category>("Government");
  const [expandedMlaParty, setExpandedMlaParty] = useState<string | null>(null);
  const [mlaSearch, setMlaSearch] = useState("");
  const [mlaPartyFilter, setMlaPartyFilter] = useState("All parties");
  const [selected, setSelected] = useState<Profile>(allNodes[0].data);
  const [reviewScore, setReviewScore] = useState<number | null>(null);
  const [recentReviews, setRecentReviews] = useState<ReviewSummary[]>([]);
  const [homeVotes, setHomeVotes] = useState<Record<string, "up" | "down">>({});
  const [homeReviewType, setHomeReviewType] = useState<"All" | "Positive" | "Negative" | "Request">("All");
  const [homeReviewName, setHomeReviewName] = useState("");
  const [homeReviewDateOrder, setHomeReviewDateOrder] = useState<"Newest first" | "Oldest first" | "Highest upvotes" | "Highest downvotes">("Newest first");

  useEffect(() => {
    const loadReviews = () => {
      try {
        const saved = localStorage.getItem("tn-government-explorer-reviews-v1");
        const reviews = saved ? JSON.parse(saved) as ReviewSummary[] : [];
        setRecentReviews(reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        const savedVotes = localStorage.getItem("tn-government-explorer-review-votes-v1");
        setHomeVotes(savedVotes ? JSON.parse(savedVotes) as Record<string, "up" | "down"> : {});
        const relevant = reviews.filter((review) => review.profile === selected.label && (review.type === "Positive" || review.type === "Negative"));
        const positive = relevant.filter((review) => review.type === "Positive").length;
        setReviewScore(relevant.length ? (positive / relevant.length) * 100 : null);
      } catch {
        setRecentReviews([]);
        setReviewScore(null);
      }
    };
    loadReviews();
    window.addEventListener("storage", loadReviews);
    return () => window.removeEventListener("storage", loadReviews);
  }, [selected.label]);

  const layoutPositions: Record<Category, Record<string, { x: number; y: number }>> = {
    Government: {
      government: { x: 360, y: 0 },
      "mla-summary": { x: -320, y: 240 },
      governor: { x: 360, y: 260 },
      "chief-justice": { x: 980, y: 260 },
      cm: { x: 360, y: 560 },
      tvk: { x: 980, y: 560 },
      "cm-admin": { x: -80, y: 900 },
      "cm-home": { x: 190, y: 900 },
      "cm-special": { x: 460, y: 900 },
      "cm-other": { x: 730, y: 900 },
      "council-summary": { x: 1000, y: 900 },
    },
    Ministers: {
      cm: { x: 1375, y: -80 },
      anand: { x: 0, y: 180 },
      aadhav: { x: 250, y: 180 },
      arunraj: { x: 500, y: 180 },
      sengottaiyan: { x: 750, y: 180 },
      venkataramanan: { x: 1000, y: 180 },
      shahjahan: { x: 1250, y: 180 },
      rajkumar: { x: 1500, y: 180 },
      vijayalakshmi: { x: 1750, y: 180 },
      sarathkumar: { x: 2000, y: 180 },
      prabhu: { x: 2250, y: 180 },
      jegadeshwari: { x: 2500, y: 180 },
      kamali: { x: 2750, y: 180 },
      kumar: { x: 0, y: 430 },
      logesh: { x: 250, y: 430 },
      vijaybalaji: { x: 500, y: 430 },
      mathanraja: { x: 750, y: 430 },
      farvas: { x: 1000, y: 430 },
      mariewilson: { x: 1250, y: 430 },
      viswanathan: { x: 1500, y: 430 },
      nirmalkumar: { x: 1750, y: 430 },
      ranjithkumar: { x: 2000, y: 430 },
      rajeev: { x: 2250, y: 430 },
      rajeshkumar: { x: 2500, y: 430 },
      rajmohan: { x: 2750, y: 430 },
      ramesh: { x: 0, y: 680 },
      keerthana: { x: 250, y: 680 },
      srinath: { x: 500, y: 680 },
      thennarasu: { x: 750, y: 680 },
      gandhiraj: { x: 1000, y: 680 },
      sampathkumar: { x: 1250, y: 680 },
      vanniarasu: { x: 1500, y: 680 },
      vignesh: { x: 1750, y: 680 },
      vijaytamilan: { x: 2000, y: 680 },
      vinoth: { x: 2250, y: 680 },
    },
    MLAs: { "mla-directory": { x: 300, y: 150 } },
    "IAS Officers": { ias: { x: 300, y: 150 } },
    "IPS Officers": {
      ips: { x: 300, y: 20 },
      dgp: { x: 0, y: 260 },
      amalraj: { x: 600, y: 260 },
    },
    Departments: { departments: { x: 300, y: 150 } },
    "Schemes & Projects": {
      schemes: { x: 300, y: 20 },
      projects: { x: 300, y: 280 },
    },
  };

  const mlaRecords = mlaDirectory.members as Array<{
    number: number;
    constituency: string;
    name: string;
    party: string;
    email: string;
    status: string;
    source: string;
  }>;
  const mlaParties = useMemo(
    () => [...new Set(mlaRecords.map((member) => member.party || "Vacant"))].sort((a, b) => {
      const order = ["TVK", "DMK", "AIADMK", "INC", "PMK", "VCK", "IUML", "CPI", "CPI (M)", "BJP", "DMDK", "AMMK", "Vacant"];
      return (order.indexOf(a) < 0 ? 999 : order.indexOf(a)) - (order.indexOf(b) < 0 ? 999 : order.indexOf(b)) || a.localeCompare(b);
    }),
    []
  );
  const filteredMlaRecords = useMemo(() => {
    const query = mlaSearch.trim().toLowerCase();
    return mlaRecords.filter((member) => {
      const matchesSearch = !query || member.name.toLowerCase().includes(query) || member.constituency.toLowerCase().includes(query) || String(member.number) === query;
      const matchesParty = mlaPartyFilter === "All parties" || (member.party || "Vacant") === mlaPartyFilter;
      return matchesSearch && matchesParty;
    });
  }, [mlaSearch, mlaPartyFilter]);
  const mlaGraphNodes = useMemo((): Node<Profile>[] => {
    const groupNodes: Node<Profile>[] = [];
    const memberNodes: Node<Profile>[] = [];
    const showSearchResults = Boolean(mlaSearch.trim()) || mlaPartyFilter !== "All parties";
    if (showSearchResults) {
      const results = filteredMlaRecords;
      results.forEach((member, index) => {
        const vacant = member.status === "Vacant";
        memberNodes.push({
          id: `mla-${member.number}`,
          type: "info",
          position: { x: (index % 6) * 320, y: 100 + Math.floor(index / 6) * 250 },
          data: {
            label: vacant ? `${member.constituency} — Vacant` : member.name,
            role: `${member.constituency} · ${member.party || "No party listed"}`,
            description: vacant
              ? `Constituency: ${member.constituency}. The Assembly directory marks this seat as vacant. Verify current vacancy status before publication. Source: ${member.source}`
              : `Member listed by the Tamil Nadu Legislative Assembly for constituency ${member.constituency}. Party: ${member.party || "Not listed"}. Official Assembly email: ${member.email || "Not listed"}. This dataset transcribes the Assembly directory; verify changes against the official source. Source: ${member.source}`,
            isPerson: !vacant,
            mlaNumber: member.number,
            mlaParty: member.party,
            mlaEmail: member.email,
            mlaStatus: member.status,
          },
        });
      });
      return memberNodes;
    }
    const partyCount = new Map<string, number>();
    mlaRecords.forEach((member) => {
      const party = member.party || "Vacant";
      partyCount.set(party, (partyCount.get(party) ?? 0) + 1);
    });
    const cols = 6;
    const groupWidth = 360;
    const groupHeight = 230;
    mlaParties.forEach((party, index) => {
      if (expandedMlaParty && party !== expandedMlaParty) return;
      const x = (index % cols) * groupWidth;
      const y = Math.floor(index / cols) * groupHeight;
      const expanded = expandedMlaParty === party;
      groupNodes.push({
        id: `mla-party-${party.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
        type: "info",
        position: { x, y },
        data: {
          label: party === "Vacant" ? "Vacant seat" : party,
          role: `${partyCount.get(party) ?? 0} constituency ${(partyCount.get(party) ?? 0) === 1 ? "entry" : "entries"} · ${expanded ? "Click to collapse" : "Click to expand"}`,
          description: `${party === "Vacant" ? "Vacant constituencies" : party + " members"} in the Assembly directory provided for this project. Select this group to explore the listed constituencies and member profiles. Source: ${mlaDirectory.sourceUrl}`,
          mlaParty: party,
        },
      });
    });
    if (expandedMlaParty) {
      const groupIndex = mlaParties.indexOf(expandedMlaParty);
      const groupX = (groupIndex % cols) * groupWidth;
      const groupY = Math.floor(groupIndex / cols) * groupHeight;
      const members = mlaRecords.filter((member) => (member.party || "Vacant") === expandedMlaParty);
      members.forEach((member, index) => {
        const vacant = member.status === "Vacant";
        memberNodes.push({
          id: `mla-${member.number}`,
          type: "info",
          position: { x: groupX + (index % 6) * 320, y: groupY + 210 + Math.floor(index / 6) * 250 },
          data: {
            label: vacant ? `${member.constituency} — Vacant` : member.name,
            role: `${member.constituency} · ${member.party || "No party listed"}`,
            description: vacant
              ? `Constituency: ${member.constituency}. The Assembly directory marks this seat as vacant. Verify current vacancy status before publication. Source: ${member.source}`
              : `Member listed by the Tamil Nadu Legislative Assembly for constituency ${member.constituency}. Party: ${member.party || "Not listed"}. Official Assembly email: ${member.email || "Not listed"}. This dataset transcribes the Assembly directory; verify changes against the official source. Source: ${member.source}`,
            isPerson: !vacant,
            mlaNumber: member.number,
            mlaParty: member.party,
            mlaEmail: member.email,
            mlaStatus: member.status,
          },
        });
      });
    }
    return [...groupNodes, ...memberNodes];
  }, [mlaRecords, mlaParties, expandedMlaParty, mlaSearch, mlaPartyFilter, filteredMlaRecords]);

  const visibleNodes = useMemo(
    () => category === "MLAs"
      ? mlaGraphNodes
      : allNodes
          .filter((node) => categoryNodes[category].includes(node.id))
          .map((node) => ({
            ...node,
            position: layoutPositions[category][node.id] ?? node.position,
          })),
    [category, mlaGraphNodes]
  );
  const visibleIds = useMemo(
    () => new Set(visibleNodes.map((node) => node.id)),
    [visibleNodes]
  );
  const visibleEdges = useMemo(() => {
    if (category === "MLAs") {
      // Keep MLA cards independent; do not draw connecting edges in this view.
      return [];
    }
    return allEdges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target));
  }, [category, visibleIds, expandedMlaParty, mlaParties, mlaRecords, mlaSearch, mlaPartyFilter]);

  function changeCategory(next: Category) {
    setCategory(next);
    if (next !== "MLAs") { setExpandedMlaParty(null); setMlaSearch(""); setMlaPartyFilter("All parties"); }
    const firstNode = allNodes.find((node) => categoryNodes[next].includes(node.id));
    if (firstNode) setSelected(firstNode.data);
  }

  function selectProfile(profile: Profile) {
    setSelected(profile);
  }

  const isPerson = selected.isPerson ?? /Chief Minister|Minister profile|IPS officer|DGP|MLA profile|IAS officer/i.test(selected.role);

  function voteHomeReview(id: string, direction: "up" | "down") {
    const previous = homeVotes[id];
    const nextDirection = previous === direction ? undefined : direction;
    const nextVotes = { ...homeVotes };
    if (nextDirection) nextVotes[id] = nextDirection;
    else delete nextVotes[id];
    const updated = recentReviews.map((review) => {
      if (review.id !== id) return review;
      const counts = { up: review.votes?.up ?? 0, down: review.votes?.down ?? 0 };
      if (previous === "up") counts.up = Math.max(0, counts.up - 1);
      if (previous === "down") counts.down = Math.max(0, counts.down - 1);
      if (nextDirection === "up") counts.up += 1;
      if (nextDirection === "down") counts.down += 1;
      return { ...review, votes: counts };
    });
    setHomeVotes(nextVotes);
    setRecentReviews(updated);
    try {
      localStorage.setItem("tn-government-explorer-review-votes-v1", JSON.stringify(nextVotes));
      localStorage.setItem("tn-government-explorer-reviews-v1", JSON.stringify(updated));
    } catch { /* Keep current UI state. */ }
  }

  const filteredHomeReviews = recentReviews
    .filter((review) => homeReviewType === "All" || (homeReviewType === "Negative" ? review.type === "Negative" || review.type === "Allegation" : review.type === homeReviewType))
    .filter((review) => !homeReviewName.trim() || review.profile.toLowerCase().includes(homeReviewName.trim().toLowerCase()))
    .sort((a, b) => {
      if (homeReviewDateOrder === "Highest upvotes") return (b.votes?.up ?? 0) - (a.votes?.up ?? 0) || new Date(b.date).getTime() - new Date(a.date).getTime();
      if (homeReviewDateOrder === "Highest downvotes") return (b.votes?.down ?? 0) - (a.votes?.down ?? 0) || new Date(b.date).getTime() - new Date(a.date).getTime();
      return homeReviewDateOrder === "Newest first" ? new Date(b.date).getTime() - new Date(a.date).getTime() : new Date(a.date).getTime() - new Date(b.date).getTime();
    });

  return (
    <main style={{ minHeight: "100vh", padding: 24, background: "#f8fafc", color: "#172554" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <img src="/tvk-logo.png" alt="TVK Government Explorer logo" style={{ width: 52, height: 52, objectFit: "contain", borderRadius: 10 }} />
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>TVK Government Explorer</h1>
      </div>
      <p style={{ color: "#64748b", marginBottom: 16 }}>
        Explore Tamil Nadu’s government, leaders, departments, schemes and public feedback.
      </p>

      <nav style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => changeCategory(item)}
            style={{
              padding: "10px 14px",
              borderRadius: 9,
              border: category === item ? "1px solid #1d4ed8" : "1px solid #cbd5e1",
              background: category === item ? "#1d4ed8" : "white",
              color: category === item ? "white" : "#172554",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {item}
          </button>
        ))}
      </nav>

      <p style={{ color: "#64748b", fontSize: 13, marginBottom: 12 }}>
        {categoryDescriptions[category]}
      </p>

      {category === "MLAs" && (
        <section aria-label="MLA graph controls" style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 14, padding: 12, width: "calc(100% - 336px)", boxSizing: "border-box", border: "1px solid #dbe3ef", borderRadius: 12, background: "white" }}>
          <input
            aria-label="Search MLA name or constituency"
            value={mlaSearch}
            onChange={(event) => { setMlaSearch(event.target.value); setExpandedMlaParty(null); }}
            placeholder="Search MLA or constituency…"
            style={{ flex: "1 1 240px", minWidth: 180, padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 9, background: "white", color: "#172554", font: "inherit", fontSize: 13 }}
          />
          <select
            aria-label="Filter MLAs by party"
            value={mlaPartyFilter}
            onChange={(event) => { setMlaPartyFilter(event.target.value); setExpandedMlaParty(null); }}
            style={{ flex: "0 1 200px", minWidth: 160, padding: "10px 12px", border: "1px solid #cbd5e1", borderRadius: 9, background: "white", color: "#172554", fontSize: 13 }}
          >
            <option>All parties</option>
            {mlaParties.map((party) => <option key={party} value={party}>{party}</option>)}
          </select>
          <button
            type="button"
            onClick={() => { setMlaSearch(""); setMlaPartyFilter("All parties"); setExpandedMlaParty(null); }}
            style={{ padding: "10px 13px", border: "1px solid #cbd5e1", borderRadius: 9, background: "#f8fafc", color: "#172554", fontWeight: 750, cursor: "pointer" }}
          >Reset graph</button>
          <span style={{ color: "#64748b", fontSize: 12, flexBasis: "100%" }}>
            {mlaSearch.trim() || mlaPartyFilter !== "All parties"
              ? `${filteredMlaRecords.length} matching constituency entries`
              : expandedMlaParty
                ? `Showing ${expandedMlaParty} entries. Click the group heading to collapse it.`
                : `234 constituency entries · ${mlaParties.length} party/status groups · select a group to expand`}
          </span>
        </section>
      )}

      <div style={{ display: "flex", gap: 16, height: "75vh", minHeight: 520, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0, height: "75vh", border: "1px solid #cbd5e1", borderRadius: 12, overflow: "hidden", background: "#f1f5f9" }}>
          <ReactFlow
            key={category === "MLAs" ? `${category}-${expandedMlaParty ?? "all"}-${mlaSearch}-${mlaPartyFilter}` : category}
            nodes={visibleNodes}
            edges={visibleEdges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.12, minZoom: 0.28, maxZoom: 0.9 }}
            minZoom={0.15}
            maxZoom={1.5}
            onNodeClick={(_, node) => {
              if (node.id === "council-summary") { changeCategory("Ministers"); return; }
              if (category === "MLAs" && node.id.startsWith("mla-party-")) {
                const party = (node.data as Profile).mlaParty ?? null;
                setExpandedMlaParty((current) => current === party ? null : party);
                setSelected(node.data as Profile);
                return;
              }
              selectProfile(node.data as Profile);
            }}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        <aside style={{ width: 320, flexShrink: 0, boxSizing: "border-box", padding: 18, border: "1px solid #dbe3ef", borderRadius: 16, background: "white", alignSelf: "flex-start", boxShadow: "0 8px 24px #0f172a0a" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 800, textTransform: "uppercase", letterSpacing: 1 }}>Selected profile</span>
            <span style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", padding: "5px 8px", borderRadius: 999 }}>{isPerson ? "PERSON" : "PUBLIC RECORD"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 18 }}>
            {selected.photoUrl ? (
              <img src={selected.photoUrl} alt={selected.label} style={{ width: 96, height: 96, flexShrink: 0, borderRadius: 22, objectFit: "cover", objectPosition: "center", border: "4px solid #e2e8f0" }} />
            ) : (
              <div style={{ width: 96, height: 96, flexShrink: 0, borderRadius: 22, background: "#eff6ff", display: "grid", placeItems: "center", color: "#2563eb", fontSize: 28, fontWeight: 800 }}>{selected.label.slice(0, 1)}</div>
            )}
            <div style={{ minWidth: 0 }}>
              <h2 style={{ fontSize: 20, fontWeight: 800, lineHeight: 1.25 }}>{selected.label}</h2>
              <p style={{ color: "#64748b", fontSize: 13, marginTop: 5 }}>{selected.description?.startsWith("Minister for ") ? "Minister" : selected.role}</p>
              {isPerson && (selected.xHandle ? (
                <a href={selected.xHandle.startsWith("http") ? selected.xHandle : `https://x.com/${selected.xHandle.replace(/^@/, "")}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, color: "#2563eb", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>View 𝕏 profile ↗</a>
              ) : <span style={{ display: "block", marginTop: 8, color: "#94a3b8", fontSize: 12 }}>𝕏 Handle not added</span>)}
            </div>
          </div>
          {isPerson && (
            <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#475569", fontWeight: 700 }}>Community rating</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>Average</span>
              </div>
              <RatingGauge value={reviewScore} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
                <a href={`/reviews?profile=${encodeURIComponent(selected.label)}&action=write`} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, textAlign: "center", textDecoration: "none", padding: "11px 8px", borderRadius: 10, background: "#1d4ed8", color: "white", fontSize: 11, lineHeight: 1.3, fontWeight: 850, boxShadow: "0 2px 5px #1d4ed822" }}><span aria-hidden="true">＋</span> Share feedback</a>
                <a href={`/reviews?profile=${encodeURIComponent(selected.label)}`} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, textAlign: "center", textDecoration: "none", padding: "11px 8px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#f8fafc", color: "#172554", fontSize: 11, lineHeight: 1.3, fontWeight: 850 }}><span aria-hidden="true">☰</span> Browse feedback</a>
              </div>
            </div>
          )}
          <div style={{ marginTop: 18 }}>
            <h3 style={{ fontWeight: 800, fontSize: 14 }}>About</h3>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#475569", marginTop: 7 }}>{selected.description}</p>
          </div>
        </aside>
      </div>

      <section style={{ width: "calc(100% - 336px)", boxSizing: "border-box", margin: "16px 336px 0 0", padding: 22, border: "1px solid #dbe3ef", borderRadius: 16, background: "white", boxShadow: "0 8px 24px #0f172a08" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: "#2563eb", textTransform: "uppercase", letterSpacing: 1 }}>Community voice</p>
            <h2 style={{ margin: "5px 0 0", fontSize: 23, fontWeight: 900 }}>Recently added feedback</h2>
            <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 13 }}>Browse community feedback.</p>
          </div>
          <a href="/reviews?action=write" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px 15px", borderRadius: 10, background: "#1d4ed8", color: "white", fontSize: 12, fontWeight: 850, textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 2px 5px #1d4ed822" }}>＋ Share feedback</a>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 14, padding: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(["All", "Positive", "Negative", "Allegation", "Request"] as const).map((type) => (
              <button key={type} onClick={() => setHomeReviewType(type)} style={{ border: homeReviewType === type ? "1px solid #1d4ed8" : "1px solid #cbd5e1", background: homeReviewType === type ? "#dbeafe" : "white", color: homeReviewType === type ? "#1d4ed8" : "#475569", borderRadius: 999, padding: "7px 11px", fontSize: 11, fontWeight: 850, cursor: "pointer" }}>{type}</button>
            ))}
          </div>
          <input aria-label="Filter reviews by official name" value={homeReviewName} onChange={(e) => setHomeReviewName(e.target.value)} placeholder="Search official name" style={{ flex: "1 1 160px", minWidth: 140, border: "1px solid #cbd5e1", borderRadius: 9, padding: "9px 10px", font: "inherit", fontSize: 12, background: "white", color: "#0f172a" }} />
          <select aria-label="Sort reviews by date" value={homeReviewDateOrder} onChange={(e) => setHomeReviewDateOrder(e.target.value as "Newest first" | "Oldest first")} style={{ border: "1px solid #cbd5e1", borderRadius: 9, padding: "9px 10px", fontSize: 12, background: "white", color: "#334155" }}>
            <option>Newest first</option><option>Oldest first</option><option>Highest upvotes</option><option>Highest downvotes</option>
          </select>
        </div>
        {recentReviews.length === 0 ? (
          <div style={{ height: 620, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", border: "1px dashed #cbd5e1", borderRadius: 12, padding: "26px 16px", textAlign: "center" }}>
            <p style={{ margin: 0, color: "#475569", fontWeight: 800 }}>No feedback added yet</p>
            <p style={{ margin: "6px 0 14px", color: "#64748b", fontSize: 13 }}>Be the first to share a constructive review.</p>
            <a href="/reviews?action=write" style={{ color: "#1d4ed8", fontSize: 13, fontWeight: 800, textDecoration: "none" }}>Share feedback →</a>
          </div>
        ) : filteredHomeReviews.length === 0 ? (
          <div style={{ height: 620, boxSizing: "border-box", display: "grid", placeItems: "center", padding: 20, textAlign: "center", color: "#64748b", fontSize: 13 }}>No feedback matches these filters.</div>
        ) : (
          <div style={{ display: "grid", alignContent: "start", gap: 12, height: 620, overflowY: "auto", paddingRight: 5, overscrollBehavior: "contain", overflowAnchor: "none" }}>
            {filteredHomeReviews.map((review) => {
              const style = review.type === "Positive"
                ? { color: "#166534", background: "#dcfce7" }
                : review.type === "Negative"
                  ? { color: "#991b1b", background: "#fee2e2" }
                  : { color: "#1d4ed8", background: "#dbeafe" };
              return (
                <article key={review.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 15, minWidth: 0, background: "white" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 900, color: style.color, background: style.background, borderRadius: 999, padding: "5px 9px" }}>{review.type}</span>
                    <span style={{ color: "#64748b", fontSize: 11 }}>{new Date(review.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                  <h3 style={{ margin: "12px 0 5px", fontSize: 16, lineHeight: 1.4, fontWeight: 900 }}>{review.title}</h3>
                  <p style={{ margin: "0 0 8px", color: "#475569", fontSize: 13, lineHeight: 1.6, overflowWrap: "anywhere" }}>{review.body}</p>
                  {review.image && <img src={review.image} alt={`Image attached to review: ${review.title}`} style={{ display: "block", margin: "10px 0", maxWidth: "100%", maxHeight: 360, borderRadius: 12, border: "1px solid #e2e8f0", objectFit: "contain" }} />}
                  <p style={{ margin: 0, color: "#64748b", fontSize: 11 }}>By <strong>{review.name}</strong> · {review.profile}</p>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, marginTop: 13, paddingTop: 12, borderTop: "1px solid #e2e8f0" }}>
                    <div style={{ display: "inline-flex", alignItems: "stretch", gap: 0, padding: 1, border: "1px solid #dbe4ef", borderRadius: 999, background: "#f8fafc", overflow: "hidden" }}>
                      <button type="button" aria-label="Upvote review" title="Upvote" aria-pressed={homeVotes[review.id] === "up"} onClick={() => voteHomeReview(review.id, "up")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, minWidth: 48, border: 0, borderRadius: 999, background: homeVotes[review.id] === "up" ? "#dbeafe" : "transparent", color: homeVotes[review.id] === "up" ? "#2563eb" : "#475569", padding: "4px 8px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}><span style={{ fontSize: 14, lineHeight: 1 }}>↑</span><span>{review.votes?.up ?? 0}</span></button>
                      <button type="button" aria-label="Downvote review" title="Downvote" aria-pressed={homeVotes[review.id] === "down"} onClick={() => voteHomeReview(review.id, "down")} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 4, minWidth: 48, border: 0, borderRadius: 999, background: homeVotes[review.id] === "down" ? "#ffedd5" : "transparent", color: homeVotes[review.id] === "down" ? "#c2410c" : "#475569", padding: "4px 8px", fontSize: 11, fontWeight: 800, cursor: "pointer" }}><span style={{ fontSize: 14, lineHeight: 1 }}>↓</span><span>{review.votes?.down ?? 0}</span></button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <p style={{ margin: "14px 0 0", fontSize: 11, color: "#94a3b8", lineHeight: 1.6 }}>Reviews are currently saved in this browser only. A shared public feed needs a server database.</p>
      </section>
    </main>
  );
}
