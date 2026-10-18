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

type MainView = Category | "Public Contributions & Ratings" | "Allegations & Investigations";

type Profile = {
  label: string;
  role: string;
  description: string;
  photoUrl?: string;
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
  { id: "g2", source: "government", target: "tvk", label: "Party link" },
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
  const [mainView, setMainView] = useState<MainView>("Government");
  const [selected, setSelected] = useState<Profile>(allNodes[0].data);
  const [contribution, setContribution] = useState({ person: "", title: "", details: "", source: "" });
  const [allegation, setAllegation] = useState({ person: "", title: "", details: "", source: "" });
  const [demoMessage, setDemoMessage] = useState("");

  const layoutPositions: Record<Category, Record<string, { x: number; y: number }>> = {
    Government: {
      government: { x: 360, y: 20 },
      cm: { x: 80, y: 220 },
      tvk: { x: 640, y: 220 },
      "cm-admin": { x: -100, y: 450 },
      "cm-home": { x: 150, y: 450 },
      "cm-special": { x: 400, y: 450 },
      "cm-other": { x: 650, y: 450 },
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
    setMainView(next);
    setDemoMessage("");
    setCategory(next);
    const firstNode = allNodes.find((node) => categoryNodes[next].includes(node.id));
    if (firstNode) setSelected(firstNode.data);
  }

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

      <nav aria-label="Public records" style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18, padding: 12, border: "1px solid #cbd5e1", borderRadius: 12, background: "white" }}>
        <span style={{ alignSelf: "center", fontSize: 12, color: "#64748b", fontWeight: 700, marginRight: 4 }}>SEPARATE PUBLIC SECTIONS</span>
        {(["Public Contributions & Ratings", "Allegations & Investigations"] as MainView[]).map((item) => (
          <button key={item} onClick={() => { setMainView(item); setDemoMessage(""); }} style={{ padding: "10px 14px", borderRadius: 9, border: mainView === item ? "1px solid #1d4ed8" : "1px solid #cbd5e1", background: mainView === item ? "#1d4ed8" : "white", color: mainView === item ? "white" : "#172554", fontWeight: 700, cursor: "pointer" }}>
            {item}
          </button>
        ))}
      </nav>

      {mainView === "Public Contributions & Ratings" ? (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          <div style={{ padding: 22, border: "1px solid #cbd5e1", borderRadius: 14, background: "white" }}>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>Public Contributions & Ratings</h2>
            <p style={{ marginTop: 8, color: "#64748b", lineHeight: 1.6 }}>Share documented public work, service improvements or constituency-level outcomes. Keep this section separate from allegations.</p>
            <form onSubmit={(event) => { event.preventDefault(); setDemoMessage("Contribution draft captured in this page demo only. It has not been published or saved to a server."); }} style={{ display: "grid", gap: 12, marginTop: 18 }}>
              <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700 }}>Minister / MLA / public official<input required value={contribution.person} onChange={(e) => setContribution({ ...contribution, person: e.target.value })} placeholder="Name and constituency/role" style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontWeight: 400 }} /></label>
              <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700 }}>Contribution title<input required value={contribution.title} onChange={(e) => setContribution({ ...contribution, title: e.target.value })} placeholder="e.g. Road repair completed" style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontWeight: 400 }} /></label>
              <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700 }}>Details and outcome<textarea required value={contribution.details} onChange={(e) => setContribution({ ...contribution, details: e.target.value })} rows={4} placeholder="Describe what happened, where, and when" style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontWeight: 400 }} /></label>
              <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700 }}>Evidence / source URL<input required type="url" value={contribution.source} onChange={(e) => setContribution({ ...contribution, source: e.target.value })} placeholder="https://official-source-or-reliable-report..." style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontWeight: 400 }} /></label>
              <button type="submit" style={{ padding: 11, borderRadius: 8, border: 0, background: "#1d4ed8", color: "white", fontWeight: 700, cursor: "pointer" }}>Submit contribution draft</button>
            </form>
          </div>
          <div style={{ padding: 22, border: "1px solid #cbd5e1", borderRadius: 14, background: "white" }}>
            <h3 style={{ fontSize: 19, fontWeight: 800 }}>Community rating guidelines</h3>
            <p style={{ color: "#64748b", lineHeight: 1.7, marginTop: 8 }}>Ratings should reflect public service and documented outcomes—not party loyalty, personal attacks or unverified claims.</p>
            <ul style={{ paddingLeft: 20, lineHeight: 2, marginTop: 12 }}>
              <li>Use one rating per person per review period once accounts are implemented.</li>
              <li>Explain the reason for a rating.</li>
              <li>Require moderation and abuse prevention before publishing.</li>
              <li>Display the number of ratings and date range alongside any score.</li>
              <li>Label community ratings as opinions, not official government assessments.</li>
            </ul>
            <div style={{ marginTop: 18, padding: 12, borderRadius: 8, background: "#eff6ff", color: "#1e40af", fontSize: 13 }}>Prototype note: submissions currently stay in the browser page state only. A database, authentication and moderation workflow are needed for real public submissions and ratings.</div>
          </div>
        </section>
      ) : mainView === "Allegations & Investigations" ? (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          <div style={{ padding: 22, border: "1px solid #cbd5e1", borderRadius: 14, background: "white" }}>
            <h2 style={{ fontSize: 22, fontWeight: 800 }}>Allegations & Investigations</h2>
            <p style={{ marginTop: 8, color: "#64748b", lineHeight: 1.6 }}>Record a claim only with a credible source. An allegation is not proof of wrongdoing; status and any official response must be clearly shown.</p>
            <form onSubmit={(event) => { event.preventDefault(); setDemoMessage("Allegation record draft captured in this page demo only. It has not been published or saved to a server."); }} style={{ display: "grid", gap: 12, marginTop: 18 }}>
              <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700 }}>Person / office concerned<input required value={allegation.person} onChange={(e) => setAllegation({ ...allegation, person: e.target.value })} placeholder="Name and public role" style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontWeight: 400 }} /></label>
              <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700 }}>Record title<input required value={allegation.title} onChange={(e) => setAllegation({ ...allegation, title: e.target.value })} placeholder="Neutral, factual title" style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontWeight: 400 }} /></label>
              <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700 }}>Summary and current status<textarea required value={allegation.details} onChange={(e) => setAllegation({ ...allegation, details: e.target.value })} rows={4} placeholder="State what is alleged, who reported it, date, and whether it is alleged/reported, under investigation, charged, dismissed, or concluded" style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontWeight: 400 }} /></label>
              <label style={{ display: "grid", gap: 6, fontSize: 13, fontWeight: 700 }}>Credible source / official case URL<input required type="url" value={allegation.source} onChange={(e) => setAllegation({ ...allegation, source: e.target.value })} placeholder="https://..." style={{ padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, fontWeight: 400 }} /></label>
              <button type="submit" style={{ padding: 11, borderRadius: 8, border: 0, background: "#b91c1c", color: "white", fontWeight: 700, cursor: "pointer" }}>Save allegation draft</button>
            </form>
          </div>
          <div style={{ padding: 22, border: "1px solid #cbd5e1", borderRadius: 14, background: "white" }}>
            <h3 style={{ fontSize: 19, fontWeight: 800 }}>Publication safeguards</h3>
            <ul style={{ paddingLeft: 20, lineHeight: 1.9, marginTop: 12 }}>
              <li>Use neutral language and link to reliable reporting or official documents.</li>
              <li>Separate allegations from established findings and convictions.</li>
              <li>Show the latest known status, date checked and source.</li>
              <li>Include the person's official response or a note when no response is available.</li>
              <li>Require human review before anything is published.</li>
              <li>Correct or remove records when reliable updates change the status.</li>
            </ul>
            <div style={{ marginTop: 18, padding: 12, borderRadius: 8, background: "#fff1f2", color: "#9f1239", fontSize: 13 }}>Prototype note: this is a draft form, not a public accusation feed. Records are not published or stored on a server.</div>
          </div>
        </section>
      ) : (
        <>
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
            onNodeClick={(_, node) => setSelected(node.data as Profile)}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>

        <aside style={{ width: 280, flexShrink: 0, padding: 18, border: "1px solid #cbd5e1", borderRadius: 12, background: "white", alignSelf: "flex-start" }}>
          <span style={{ fontSize: 11, color: "#2563eb", fontWeight: 700, textTransform: "uppercase" }}>
            Selected profile
          </span>
          {selected.photoUrl && (
            <img src={selected.photoUrl} alt="Profile placeholder" style={{ width: 112, height: 112, borderRadius: 26, objectFit: "cover", objectPosition: "center", margin: "14px 0", border: "6px solid #e5e7eb" }} />
          )}
          <h2 style={{ fontSize: 21, fontWeight: 700, marginTop: 8 }}>{selected.label}</h2>
          <p style={{ color: "#64748b", fontSize: 13 }}>{selected.role}</p>
          <hr style={{ margin: "16px 0", borderColor: "#e2e8f0" }} />
          <p style={{ fontSize: 14, lineHeight: 1.7 }}>{selected.description}</p>
          <h3 style={{ fontWeight: 700, marginTop: 20 }}>Profile information</h3>
          <ul style={{ paddingLeft: 18, fontSize: 13, lineHeight: 2 }}>
            <li>Biography and photo source</li>
            <li>Responsibilities and appointments</li>
            <li>Previous postings and decisions</li>
            <li>Performance and outcome evidence</li>
            <li>Allegations and case status</li>
            <li>Sources and verification dates</li>
          </ul>
        </aside>
      </div>
        </>
      )}

      {demoMessage && <p role="status" style={{ marginTop: 16, padding: 12, borderRadius: 8, background: "#fef3c7", color: "#92400e" }}>{demoMessage}</p>}
    </main>
  );
}
