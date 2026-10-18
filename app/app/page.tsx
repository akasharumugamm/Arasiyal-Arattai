"use client";

import { useMemo, useState } from "react";
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
            objectPosition: "center",
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
      role: "Minister profile — verify current details",
      description: "Add verified portfolio, official biography, appointment orders and source links.",
      photoUrl: "https://i.pravatar.cc/150?img=12",
    },
  },
  {
    id: "aadhav",
    type: "info",
    position: { x: 280, y: 100 },
    data: {
      label: "Aadhav Arjuna",
      role: "Minister profile — verify current details",
      description: "Add verified portfolio, official biography, appointment orders and source links.",
      photoUrl: "https://i.pravatar.cc/150?img=13",
    },
  },
  {
    id: "arunraj",
    type: "info",
    position: { x: 560, y: 100 },
    data: {
      label: "Dr. K.G. Arunraj",
      role: "Minister profile — verify current details",
      description: "Add verified portfolio, official biography, appointment orders and source links.",
      photoUrl: "https://i.pravatar.cc/150?img=14",
    },
  },
  {
    id: "sengottaiyan",
    type: "info",
    position: { x: 840, y: 100 },
    data: {
      label: "K.A. Sengottaiyan",
      role: "Minister profile — verify current details",
      description: "Add verified portfolio, official biography, appointment orders and source links.",
      photoUrl: "https://i.pravatar.cc/150?img=15",
    },
  },
  {
    id: "venkataramanan",
    type: "info",
    position: { x: 1120, y: 100 },
    data: {
      label: "P. Venkataramanan",
      role: "Minister profile — verify current details",
      description: "Add verified portfolio, official biography, appointment orders and source links.",
      photoUrl: "https://i.pravatar.cc/150?img=16",
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
  { id: "m1", source: "cm", target: "anand", label: "Minister" },
  { id: "m2", source: "cm", target: "aadhav", label: "Minister" },
  { id: "m3", source: "cm", target: "arunraj", label: "Minister" },
  { id: "m4", source: "cm", target: "sengottaiyan", label: "Minister" },
  { id: "m5", source: "cm", target: "venkataramanan", label: "Minister" },
  { id: "p1", source: "ips", target: "dgp", label: "Police leadership" },
  { id: "p2", source: "ips", target: "amalraj", label: "Officer profile" },
  { id: "s1", source: "departments", target: "schemes", label: "Responsible department" },
  { id: "s2", source: "schemes", target: "projects", label: "Implementation" },
];

const categoryNodes: Record<Category, string[]> = {
  Government: ["government", "cm", "tvk", "cm-admin", "cm-home", "cm-special", "cm-other"],
  Ministers: ["cm", "anand", "aadhav", "arunraj", "sengottaiyan", "venkataramanan"],
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
  const [profileAction, setProfileAction] = useState<"none" | "write" | "reviews">("none");

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
      cm: { x: 560, y: 20 },
      anand: { x: 0, y: 250 },
      aadhav: { x: 280, y: 250 },
      arunraj: { x: 560, y: 250 },
      sengottaiyan: { x: 840, y: 250 },
      venkataramanan: { x: 1120, y: 250 },
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
    setMyRating(0);
    setProfileAction("none");
  }

  const isPerson = selected.isPerson ?? /Chief Minister|Minister profile|IPS officer|DGP|MLA profile|IAS officer/i.test(selected.role);

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

      <div style={{ display: "flex", gap: 16, minHeight: "75vh" }}>
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

        <aside style={{ width: 320, flexShrink: 0, padding: 18, border: "1px solid #dbe3ef", borderRadius: 16, background: "white", alignSelf: "flex-start", boxShadow: "0 8px 24px #0f172a0a" }}>
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
                <a href={selected.xHandle.startsWith("http") ? selected.xHandle : `https://x.com/${selected.xHandle.replace(/^@/, "")}`} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, color: "#2563eb", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>𝕏 View X profile ↗</a>
              ) : <span style={{ display: "block", marginTop: 8, color: "#94a3b8", fontSize: 12 }}>𝕏 Handle not added</span>)}
            </div>
          </div>
          {isPerson && (
            <div style={{ marginTop: 18, padding: 14, borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12, color: "#475569", fontWeight: 700 }}>Community rating</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>Average</span>
              </div>
              <div aria-label="Average community rating out of 100; no reviews yet" style={{ display: "flex", alignItems: "baseline", gap: 5, marginTop: 8 }}>
                <span style={{ fontSize: 30, fontWeight: 900, color: "#0f172a" }}>—</span>
                <span style={{ fontSize: 13, color: "#64748b" }}>/ 100</span>
              </div>
              <p style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>Average of all public review ratings</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 14 }}>
                <button type="button" onClick={() => setProfileAction("write")} style={{ padding: "10px 8px", borderRadius: 9, border: 0, background: "#1d4ed8", color: "white", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>✍ Write a review</button>
                <button type="button" onClick={() => setProfileAction("reviews")} style={{ padding: "10px 8px", borderRadius: 9, border: "1px solid #cbd5e1", background: "white", color: "#172554", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>See reviews</button>
              </div>
              {profileAction !== "none" && (
                <div style={{ marginTop: 12, borderTop: "1px solid #e2e8f0", paddingTop: 12 }}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: "#334155" }}>{profileAction === "write" ? "Review page — next step" : "Community reviews"}</p>
                  <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, marginTop: 5 }}>{profileAction === "write" ? "The profile design is ready. Next, we can build the separate review page with a post type (Positive, Negative or Request), user name, date and star rating." : "No reviews have been published yet. Reviews will appear here after the review page and storage are implemented."}</p>
                </div>
              )}
            </div>
          )}
          <div style={{ marginTop: 18 }}>
            <h3 style={{ fontWeight: 800, fontSize: 14 }}>About this profile</h3>
            <p style={{ fontSize: 13, lineHeight: 1.7, color: "#475569", marginTop: 7 }}>{selected.description}</p>
          </div>
          <h3 style={{ fontWeight: 800, fontSize: 14, marginTop: 18 }}>Profile information</h3>
          <ul style={{ paddingLeft: 18, fontSize: 12, lineHeight: 1.9, color: "#475569", marginTop: 7 }}>
            <li>Biography and photo source</li>
            <li>Responsibilities and appointments</li>
            <li>Previous postings and decisions</li>
            <li>Performance and outcome evidence</li>
            <li>Sources and verification dates</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
