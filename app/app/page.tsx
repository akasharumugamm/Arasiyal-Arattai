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
};

type ReviewSummary = {
  id: string;
  profile: string;
  name: string;
  type: "Positive" | "Negative" | "Request";
  title: string;
  body: string;
  date: string;
};

function InfoNode({ data }: NodeProps<Node<Profile>>) {
  return (
    <div
      style={{
        width: 220,
        padding: 14,
        border: "1px solid #cbd5e1",
        borderRadius: 12,
        background: "white",
        color: "#172554",
        boxShadow: "0 3px 12px #00000012",
        textAlign: "center",
      }}
    >
      <Handle type="target" position={Position.Top} />
      {data.photoUrl && (
        <img
          src={data.photoUrl}
          alt="Placeholder profile"
          style={{
            width: 84,
            height: 84,
            borderRadius: 22,
            objectFit: "cover",
            objectPosition: "center 25%",
            margin: "0 auto 10px",
            border: "6px solid #e5e7eb",
          }}
        />
      )}
      <div style={{ fontWeight: 700 }}>{data.label}</div>
      <div style={{ fontSize: 12, marginTop: 5, color: "#64748b" }}>
        {data.role}
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}


function RatingGauge({ value }: { value: number | null }) {
  const cx = 160;
  const cy = 158;
  const radius = 132;
  const point = (angle: number, r: number) => ({
    x: cx + r * Math.cos((angle * Math.PI) / 180),
    y: cy + r * Math.sin((angle * Math.PI) / 180),
  });
  const segments = [
    { start: 180, end: 216, color: "#ff533d", face: "☹" },
    { start: 216, end: 252, color: "#ff922b", face: "☹" },
    { start: 252, end: 288, color: "#ffe52e", face: "😐" },
    { start: 288, end: 324, color: "#a5ed50", face: "☺" },
    { start: 324, end: 360, color: "#13c967", face: "☺" },
  ];
  const sectorPath = (start: number, end: number) => {
    const a = point(start, radius);
    const b = point(end, radius);
    return `M ${cx} ${cy} L ${a.x} ${a.y} A ${radius} ${radius} 0 0 1 ${b.x} ${b.y} Z`;
  };
  const needleAngle = value === null ? null : 180 + (Math.max(0, Math.min(100, value)) / 100) * 180;
  const needleTip = needleAngle === null ? null : point(needleAngle, 102);
  return (
    <div style={{ width: "100%", maxWidth: 320, margin: "8px auto 0" }}>
      <svg viewBox="0 0 320 180" role="img" aria-label={value === null ? "Rating gauge; no public ratings yet" : `Average public rating ${value} out of 100`} style={{ width: "100%", display: "block" }}>
        {segments.map((segment) => (
          <path key={segment.start} d={sectorPath(segment.start, segment.end)} fill={segment.color} stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
        ))}
        {segments.map((segment) => {
          const angle = (segment.start + segment.end) / 2;
          const p = point(angle, 88);
          return <text key={`face-${segment.start}`} x={p.x} y={p.y + 7} textAnchor="middle" fontSize="23" fontWeight="700" fill={segment.start === 252 ? "#b88600" : segment.start > 288 ? "#178b43" : "#b83224"}>{segment.face}</text>;
        })}
        {needleTip && <path d={`M ${cx} ${cy} L ${needleTip.x} ${needleTip.y}`} stroke="#10294f" strokeWidth="5" strokeLinecap="round" />}
        <circle cx={cx} cy={cy} r="11" fill="#10294f" />
      </svg>
      <div style={{ textAlign: "center", marginTop: -1 }}>
        <div style={{ fontSize: 27, lineHeight: 1.15, fontWeight: 900, color: "#0f172a" }}>{value === null ? "—" : Math.round(value)}<span style={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}> / 100</span></div>
        <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>{value === null ? "No public ratings yet" : "Average public rating"}</div>
      </div>
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
        "Tamil Nadu's state government and Secretariat are associated with Fort St. George in Chennai. This view shows a high-level overview; verify office responsibilities and portfolio allocations against current official orders.",
      photoUrl: "https://cf-images.assettype.com/thenewsminute/2026-05-30/0mplww47/Secretariat.jpeg?w=1200&h=1200&auto=format%2Ccompress&fit=max&enlarge=true",
    },
  },
  {
    id: "cm",
    type: "info",
    position: { x: 80, y: 220 },
    data: {
      label: "C. Joseph Vijay",
      role: "Chief Minister",
      isPerson: true,
      xHandle: "https://x.com/CMOTamilnadu",
      description:
        "Profile overview. Add verified biography, official orders, current portfolio allocations and source links here.",
      photoUrl: "https://i.ibb.co/0Rv80BLn/HR-9-Y6yb0-AAzx-FY.jpg",
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
      description: "Verify the exact current responsibilities and service-control arrangements against official government orders.",
    },
  },
  {
    id: "cm-home",
    type: "info",
    position: { x: 150, y: 450 },
    data: {
      label: "Home and Police",
      role: "Portfolio area",
      description: "Verify the current Home and Police portfolio allocation using the latest official order.",
    },
  },
  {
    id: "cm-special",
    type: "info",
    position: { x: 400, y: 450 },
    data: {
      label: "Special Programme Implementation",
      role: "Portfolio area",
      description: "Verify current portfolio responsibility and related official records.",
    },
  },
  {
    id: "cm-other",
    type: "info",
    position: { x: 650, y: 450 },
    data: {
      label: "Other retained portfolios",
      role: "To be verified",
      description: "Add only departments confirmed by the latest official portfolio allocation order.",
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
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/024_Anand.png",
      description: "Rural Development, Panchayats and Panchayat Union, Irrigation, and Irrigation Projects including Small Irrigation. Source: Government of Tamil Nadu minister directory.",
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
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/014_Aadhav_Arjuna.png",
      description: "Public Works (Buildings, Highways and Minor Ports) and Sports Development. Source: Government of Tamil Nadu minister directory.",
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
      description: "Health, Medical Education and Family Welfare. Source: Government of Tamil Nadu minister directory.",
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
      description: "Revenue, District Revenue Establishment, Deputy Collectors, Disaster Management, Boodhan, Gramadhan and Legislative Assembly. Source: Government of Tamil Nadu minister directory.",
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
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/025_Venkataramanan.png",
      description: "Food and Civil Supplies, Consumer Protection and Price Control. Source: Government of Tamil Nadu minister directory.",
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
      description: "Minorities Welfare and Wakf Board. Source: Government of Tamil Nadu minister directory.",
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
      description: "Housing, Rural Housing, Town Planning Projects and Housing Development, Accommodation Control, CMDA, Tamil Nadu Urban Habitat Development Board, Urban Planning and Urban Development. Source: Government of Tamil Nadu minister directory.",
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
      description: "Milk and Dairy Development. Source: Government of Tamil Nadu minister directory.",
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
      description: "Human Resources Management and Ex-Servicemen Welfare. Source: Government of Tamil Nadu minister directory.",
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
      description: "Minerals and Mines. Source: Government of Tamil Nadu minister directory.",
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
      description: "Social Welfare including Women Welfare, Orphanages and Correctional Administration, Beggar Homes, Social Reforms and Nutritious Meal Programme. Source: Government of Tamil Nadu minister directory.",
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
      description: "Animal Husbandry. Source: Government of Tamil Nadu minister directory.",
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
      description: "Artificial Intelligence, Information Technology and Digital Services. Source: Government of Tamil Nadu minister directory.",
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
      description: "Commercial Taxes, Registration and Stamp Act, Debt Relief including legislation on Money lending, Chits and Registration of Companies. Source: Government of Tamil Nadu minister directory.",
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
      description: "Handlooms and Textiles, Khadi and Village Industries Board. Source: Government of Tamil Nadu minister directory.",
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
      description: "Rural Industries including Cottage Industries and Small Industries. Source: Government of Tamil Nadu minister directory.",
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
      description: "Labour Welfare, Population, Employment and Training, Census, Weights and Measures, Urban and Rural Employment and Bonded Labour Welfare. Source: Government of Tamil Nadu minister directory.",
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
      description: "Finance, Pensions and Pensionary Benefits, Planning and Development. Source: Government of Tamil Nadu minister directory.",
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
      description: "Higher Education, including Technical Education, Electronics, Science and Technology. Source: Government of Tamil Nadu minister directory.",
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
      description: "Electricity and Non-Conventional Energy Development, Law, Courts, Prisons and Prevention of Corruption, Governor, Elections and Passports. Source: Government of Tamil Nadu minister directory.",
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
      description: "Forests. Source: Government of Tamil Nadu minister directory.",
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
      description: "Environment, Pollution Control Board and Climate Change. Source: Government of Tamil Nadu minister directory.",
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
      description: "Tourism and Tourism Development Corporation. Source: Government of Tamil Nadu minister directory.",
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
      description: "School Education, Archaeology, Tamil Official Language and Tamil Culture, Information and Publicity, Film Technology and Cinematograph Act, Newsprint Control, Stationery and Printing, Government Press. Source: Government of Tamil Nadu minister directory.",
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
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/139_Ramesh.png",
      description: "Hindu Religious and Charitable Endowments. Source: Government of Tamil Nadu minister directory.",
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
      description: "Industries and Investment Promotion. Source: Government of Tamil Nadu minister directory.",
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
      description: "Fisheries and Fisheries Development Corporation. Source: Government of Tamil Nadu minister directory.",
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
      description: "Non-Resident Tamils Welfare, Refugees and evacuees. Source: Government of Tamil Nadu minister directory.",
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
      description: "Co-operation. Source: Government of Tamil Nadu minister directory.",
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
      description: "Backward Classes Welfare, Most Backward Classes Welfare and De-notified Communities Welfare. Source: Government of Tamil Nadu minister directory.",
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
      description: "Adi Dravidar Welfare and Hill Tribes. Source: Government of Tamil Nadu minister directory.",
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
      photoUrl: "https://cms.tn.gov.in/cms_migrated/document/ministers_list/122_vignesh.png",
      description: "Prohibition and Excise. Source: Government of Tamil Nadu minister directory.",
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
      description: "Motor Vehicle Acts administration, Transport, Nationalised Transport and Motor Vehicles Act. Source: Government of Tamil Nadu minister directory.",
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
      description: "Agriculture, Agricultural Engineering, Agro Service Co-operatives, Horticulture, Sugar, Sugarcane Excise, Sugarcane Development and Waste Land Development. Source: Government of Tamil Nadu minister directory.",
    },
  },
  {
    id: "mla-directory",
    type: "info",
    position: { x: 360, y: 200 },
    data: {
      label: "MLA Directory",
      role: "Constituencies and elected representatives",
      description: "Add verified MLA profiles, constituency names, party affiliations and election details with official sources.",
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
      description: "Explore verified IAS officer profiles, department assignments, district postings and transfer orders.",
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
      description: "Explore verified IPS profiles, police leadership roles, postings and transfer orders.",
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
      description: "Confirm the current DGP's name, designation and appointment using the latest official government order.",
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
      description: "Explore verified service history and postings. Confirm the current designation through an official order before publication.",
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
      description: "Explore department responsibilities, reporting structures, ministers and senior officers. Verify each relationship with official sources.",
      photoUrl: "https://i.pravatar.cc/150?img=30",
    },
  },
  {
    id: "schemes",
    type: "info",
    position: { x: 200, y: 180 },
    data: {
      label: "Government Schemes",
      role: "Programmes and public projects",
      description: "Add scheme eligibility, responsible department, official source, implementation status and published outcome evidence.",
      photoUrl: "https://i.pravatar.cc/150?img=31",
    },
  },
  {
    id: "projects",
    type: "info",
    position: { x: 520, y: 180 },
    data: {
      label: "Public Projects",
      role: "Projects and outcomes",
      description: "Document project timelines, budgets where officially published, progress updates and source links.",
      photoUrl: "https://i.pravatar.cc/150?img=32",
    },
  },
];

const allEdges: Edge[] = [
  { id: "g1", source: "government", target: "cm", label: "State leadership" },
  { id: "g2", source: "cm", target: "tvk", label: "Party leader" },
  { id: "g3", source: "cm", target: "cm-admin", label: "Portfolio to verify" },
  { id: "g4", source: "cm", target: "cm-home", label: "Portfolio to verify" },
  { id: "g5", source: "cm", target: "cm-special", label: "Portfolio to verify" },
  { id: "g6", source: "cm", target: "cm-other", label: "Allocation to verify" },
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
  Government: ["government", "cm", "tvk", "cm-admin", "cm-home", "cm-special", "cm-other"],
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
  Government: "Fort St. George, the Chief Minister, party affiliation and portfolios to verify.",
  Ministers: "Explore minister profiles separately from the rest of the graph.",
  MLAs: "Explore elected representatives and constituencies.",
  "IAS Officers": "Explore administrative officers and postings.",
  "IPS Officers": "Explore police leadership and IPS officer profiles.",
  Departments: "Explore department structures and responsibilities.",
  "Schemes & Projects": "Explore schemes, projects and documented outcomes.",
};

export default function Home() {
  const [category, setCategory] = useState<Category>("Government");
  const [selected, setSelected] = useState<Profile>(allNodes[0].data);
  const [reviewScore, setReviewScore] = useState<number | null>(null);
  const [recentReviews, setRecentReviews] = useState<ReviewSummary[]>([]);
  const [homeReviewType, setHomeReviewType] = useState<"All" | "Positive" | "Negative" | "Request">("All");
  const [homeReviewName, setHomeReviewName] = useState("");
  const [homeReviewDateOrder, setHomeReviewDateOrder] = useState<"Newest first" | "Oldest first">("Newest first");

  useEffect(() => {
    const loadReviews = () => {
      try {
        const saved = localStorage.getItem("tn-government-explorer-reviews-v1");
        const reviews = saved ? JSON.parse(saved) as ReviewSummary[] : [];
        setRecentReviews(reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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
      government: { x: 360, y: 20 },
      cm: { x: 360, y: 260 },
      "cm-admin": { x: -40, y: 650 },
      "cm-home": { x: 220, y: 650 },
      "cm-special": { x: 480, y: 650 },
      "cm-other": { x: 740, y: 650 },
      tvk: { x: 1020, y: 650 },
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

  const visibleNodes = useMemo(
    () =>
      allNodes
        .filter((node) => categoryNodes[category].includes(node.id))
        .map((node) => ({
          ...node,
          position: layoutPositions[category][node.id] ?? node.position,
        })),
    [category]
  );
  const visibleIds = useMemo(
    () => new Set(visibleNodes.map((node) => node.id)),
    [visibleNodes]
  );
  const visibleEdges = useMemo(
    () => allEdges.filter((edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target)),
    [visibleIds]
  );

  function changeCategory(next: Category) {
    setCategory(next);
    setProfileAction("none");
    const firstNode = allNodes.find((node) => categoryNodes[next].includes(node.id));
    if (firstNode) setSelected(firstNode.data);
  }

  function selectProfile(profile: Profile) {
    setSelected(profile);
    setProfileAction("none");
  }

  const isPerson = selected.isPerson ?? /Chief Minister|Minister profile|IPS officer|DGP|MLA profile|IAS officer/i.test(selected.role);

  const filteredHomeReviews = recentReviews
    .filter((review) => homeReviewType === "All" || review.type === homeReviewType)
    .filter((review) => !homeReviewName.trim() || review.name.toLowerCase().includes(homeReviewName.trim().toLowerCase()))
    .sort((a, b) => homeReviewDateOrder === "Newest first"
      ? new Date(b.date).getTime() - new Date(a.date).getTime()
      : new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <main style={{ minHeight: "100vh", padding: 24, background: "#f8fafc", color: "#172554" }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Tamil Nadu Government Explorer</h1>
      <p style={{ color: "#64748b", marginBottom: 16 }}>
        Explore people, departments and documented public records.
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

      <div style={{ display: "flex", gap: 16, height: "75vh", minHeight: 520, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0, height: "75vh", border: "1px solid #cbd5e1", borderRadius: 12, overflow: "hidden", background: "#f1f5f9" }}>
          <ReactFlow
            key={category}
            nodes={visibleNodes}
            edges={visibleEdges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.15}
            maxZoom={1.5}
            onNodeClick={(_, node) => selectProfile(node.data as Profile)}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        <aside style={{ width: 320, flexShrink: 0, height: "75vh", overflowY: "auto", boxSizing: "border-box", padding: 18, border: "1px solid #dbe3ef", borderRadius: 16, background: "white", alignSelf: "flex-start", boxShadow: "0 8px 24px #0f172a0a" }}>
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
              <p style={{ color: "#64748b", fontSize: 13, marginTop: 5 }}>{selected.role}</p>
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
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                <a href={`/reviews?profile=${encodeURIComponent(selected.label)}&action=write`} style={{ display: "block", textAlign: "center", textDecoration: "none", padding: "10px 8px", borderRadius: 9, background: "#1d4ed8", color: "white", fontSize: 12, fontWeight: 800 }}>✍ Write a review</a>
                <a href={`/reviews?profile=${encodeURIComponent(selected.label)}`} style={{ display: "block", textAlign: "center", textDecoration: "none", padding: "10px 8px", borderRadius: 9, border: "1px solid #cbd5e1", background: "white", color: "#172554", fontSize: 12, fontWeight: 800 }}>See reviews</a>
              </div>
            </div>
          )}
          <div style={{ marginTop: 18 }}>
            <h3 style={{ fontWeight: 800, fontSize: 14 }}>About this profile</h3>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#475569", marginTop: 7 }}>{selected.description}</p>
          </div>
        </aside>
      </div>

      <section style={{ width: "calc(100% - 336px)", boxSizing: "border-box", margin: "16px 336px 0 0", padding: 22, border: "1px solid #dbe3ef", borderRadius: 16, background: "white", boxShadow: "0 8px 24px #0f172a08" }}>
        <div style={{ marginBottom: 14 }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: "#2563eb", textTransform: "uppercase", letterSpacing: 1 }}>Community voice</p>
          <h2 style={{ margin: "5px 0 0", fontSize: 23, fontWeight: 900 }}>Recently added reviews</h2>
          <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 13 }}>Browse community feedback, newest first.</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginBottom: 14, padding: 12, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(["All", "Positive", "Negative", "Request"] as const).map((type) => (
              <button key={type} onClick={() => setHomeReviewType(type)} style={{ border: homeReviewType === type ? "1px solid #1d4ed8" : "1px solid #cbd5e1", background: homeReviewType === type ? "#dbeafe" : "white", color: homeReviewType === type ? "#1d4ed8" : "#475569", borderRadius: 999, padding: "7px 11px", fontSize: 11, fontWeight: 850, cursor: "pointer" }}>{type}</button>
            ))}
          </div>
          <input aria-label="Filter reviews by reviewer name" value={homeReviewName} onChange={(e) => setHomeReviewName(e.target.value)} placeholder="Search reviewer name" style={{ flex: "1 1 160px", minWidth: 140, border: "1px solid #cbd5e1", borderRadius: 9, padding: "9px 10px", font: "inherit", fontSize: 12, background: "white", color: "#0f172a" }} />
          <select aria-label="Sort reviews by date" value={homeReviewDateOrder} onChange={(e) => setHomeReviewDateOrder(e.target.value as "Newest first" | "Oldest first")} style={{ border: "1px solid #cbd5e1", borderRadius: 9, padding: "9px 10px", fontSize: 12, background: "white", color: "#334155" }}>
            <option>Newest first</option><option>Oldest first</option>
          </select>
        </div>
        {recentReviews.length === 0 ? (
          <div style={{ border: "1px dashed #cbd5e1", borderRadius: 12, padding: "26px 16px", textAlign: "center" }}>
            <p style={{ margin: 0, color: "#475569", fontWeight: 800 }}>No reviews added yet</p>
            <p style={{ margin: "6px 0 14px", color: "#64748b", fontSize: 13 }}>Be the first to share a constructive review.</p>
            <a href="/reviews?action=write" style={{ color: "#1d4ed8", fontSize: 13, fontWeight: 800, textDecoration: "none" }}>Write a review →</a>
          </div>
        ) : filteredHomeReviews.length === 0 ? (
          <p style={{ padding: 20, textAlign: "center", color: "#64748b", fontSize: 13 }}>No reviews match these filters.</p>
        ) : (
          <div style={{ display: "grid", gap: 12, maxHeight: 620, overflowY: "auto", paddingRight: 5, overscrollBehavior: "contain" }}>
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
                  <p style={{ margin: 0, color: "#64748b", fontSize: 11 }}>By <strong>{review.name}</strong> · {review.profile}</p>
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
