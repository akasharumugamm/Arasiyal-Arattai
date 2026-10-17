
"use client";

import { useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

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
            width: 70,
            height: 70,
            borderRadius: "50%",
            objectFit: "cover",
            objectPosition: "center",
            margin: "0 auto 10px",
            border: "2px solid #777e8c",
          }}
        />
      )}

      <div style={{ fontWeight: 700 }}>{data.label}</div>

      <div
        style={{
          fontSize: 12,
          marginTop: 5,
          color: "#64748b",
        }}
      >
        {data.role}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

const nodeTypes = { info: InfoNode };

const initialNodes: Node<Profile>[] = [
  {
    id: "cm",
    type: "info",
    position: { x: 500, y: 20 },
    data: {
      label: "C. Joseph Vijay",
      role: "Chief Minister",
      description:
        "Explore the Chief Minister's portfolios, official orders, appointments and documented outcomes.",
      photoUrl:
        "https://i.ibb.co/0Rv80BLn/HR-9-Y6yb0-AAzx-FY.jpg",
    },
  },
  {
    id: "anand",
    type: "info",
    position: { x: 0, y: 240 },
    data: {
      label: "N. Anand",
      role: "Minister profile",
      description:
        "Explore this minister's verified responsibilities, appointments, official orders and public records.",
      photoUrl: "https://i.pravatar.cc/150?img=12",
    },
  },
  {
    id: "aadhav",
    type: "info",
    position: { x: 280, y: 240 },
    data: {
      label: "Aadhav Arjuna",
      role: "Minister profile",
      description:
        "Explore this minister's verified responsibilities, appointments, official orders and public records.",
      photoUrl: "https://i.pravatar.cc/150?img=13",
    },
  },
  {
    id: "arunraj",
    type: "info",
    position: { x: 560, y: 240 },
    data: {
      label: "Dr. K.G. Arunraj",
      role: "Minister profile",
      description:
        "Explore this minister's verified responsibilities, appointments, official orders and public records.",
      photoUrl: "https://i.pravatar.cc/150?img=14",
    },
  },
  {
    id: "sengottaiyan",
    type: "info",
    position: { x: 840, y: 240 },
    data: {
      label: "K.A. Sengottaiyan",
      role: "Minister profile",
      description:
        "Explore this minister's verified responsibilities, appointments, official orders and public records.",
      photoUrl: "https://i.pravatar.cc/150?img=15",
    },
  },
  {
    id: "venkataramanan",
    type: "info",
    position: { x: 1120, y: 240 },
    data: {
      label: "P. Venkataramanan",
      role: "Minister profile",
      description:
        "Explore this minister's verified responsibilities, appointments, official orders and public records.",
      photoUrl: "https://i.pravatar.cc/150?img=16",
    },
  },
  {
    id: "ias",
    type: "info",
    position: { x: 180, y: 490 },
    data: {
      label: "IAS Officers",
      role: "Indian Administrative Service",
      description:
        "Explore IAS officers, department assignments, district postings, transfer orders and official service records.",
      photoUrl: "https://i.pravatar.cc/150?img=21",
    },
  },
  {
    id: "ips",
    type: "info",
    position: { x: 650, y: 490 },
    data: {
      label: "IPS Officers",
      role: "Indian Police Service",
      description:
        "Explore IPS officers, police leadership, postings, transfers and official service records.",
      photoUrl: "https://i.pravatar.cc/150?img=22",
    },
  },
  {
    id: "dgp",
    type: "info",
    position: { x: 930, y: 490 },
    data: {
      label: "DGP profile",
      role: "Director General of Police — IPS",
      description:
        "Police leadership profile. Verify the current DGP's name and appointment against the latest official order.",
      photoUrl: "https://i.pravatar.cc/150?img=11",
    },
  },
  {
    id: "amalraj",
    type: "info",
    position: { x: 650, y: 740 },
    data: {
      label: "A. Amalraj",
      role: "IPS officer — posting to verify",
      description:
        "Explore service history, previous postings and official orders. Verify the officer's current designation before publication.",
      photoUrl: "https://static.toiimg.com/thumb/resizemode-72,width-1280,height-720,msid-131246759/131246759.jpg",
    },
  },
  {
    id: "records",
    type: "info",
    position: { x: 1120, y: 740 },
    data: {
      label: "Official Records",
      role: "Sources and verification",
      description:
        "Collect official source links, publication dates, appointment orders, responses, audits and final findings. Distinguish allegations from proven findings.",
      photoUrl: "https://i.pravatar.cc/150?img=25",
    },
  },
];

const initialEdges: Edge[] = [
  { id: "e1", source: "cm", target: "anand", label: "Minister" },
  { id: "e2", source: "cm", target: "aadhav", label: "Minister" },
  { id: "e3", source: "cm", target: "arunraj", label: "Minister" },
  { id: "e4", source: "cm", target: "sengottaiyan", label: "Minister" },
  { id: "e5", source: "cm", target: "venkataramanan", label: "Minister" },
  { id: "e6", source: "cm", target: "ias", label: "Administration" },
  { id: "e7", source: "cm", target: "ips", label: "Police portfolio" },
  { id: "e8", source: "ips", target: "dgp", label: "Leadership" },
  { id: "e9", source: "ips", target: "amalraj", label: "Officer profile" },
  { id: "e10", source: "anand", target: "records", label: "Records" },
  { id: "e11", source: "aadhav", target: "records", label: "Records" },
  { id: "e12", source: "arunraj", target: "records", label: "Records" },
  { id: "e13", source: "sengottaiyan", target: "records", label: "Records" },
  { id: "e14", source: "venkataramanan", target: "records", label: "Records" },
  { id: "e15", source: "ias", target: "records", label: "Service records" },
  { id: "e16", source: "dgp", target: "records", label: "Official orders" },
  { id: "e17", source: "amalraj", target: "records", label: "Official orders" },
];

export default function Home() {
  const [selected, setSelected] = useState<Profile>(
    initialNodes[0].data
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 24,
        background: "#f8fafc",
        color: "#172554",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>
        Tamil Nadu Government Explorer
      </h1>

      <p style={{ color: "#64748b", marginBottom: 20 }}>
        Explore people, departments and documented public records.
      </p>

      <div
        style={{
          display: "flex",
          gap: 16,
          minHeight: "75vh",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 0,
            height: "75vh",
            border: "1px solid #cbd5e1",
            borderRadius: 12,
            overflow: "hidden",
            background: "#f1f5f9",
          }}
        >
          <ReactFlow
            nodes={initialNodes}
            edges={initialEdges}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.15}
            maxZoom={1.5}
            onNodeClick={(_, node) =>
              setSelected(node.data as Profile)
            }
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>

        <aside
          style={{
            width: 280,
            flexShrink: 0,
            padding: 18,
            border: "1px solid #cbd5e1",
            borderRadius: 12,
            background: "white",
            alignSelf: "flex-start",
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: "#2563eb",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            Selected profile
          </span>

          {selected.photoUrl && (
            <img
              src={selected.photoUrl}
              alt="Selected profile placeholder"
              style={{
                width: 90,
                height: 90,
                borderRadius: "50%",
                objectFit: "cover",
                margin: "14px 0",
                border: "2px solid #2563eb",
              }}
            />
          )}

          <h2
            style={{
              fontSize: 21,
              fontWeight: 700,
              marginTop: 8,
            }}
          >
            {selected.label}
          </h2>

          <p style={{ color: "#64748b", fontSize: 13 }}>
            {selected.role}
          </p>

          <hr
            style={{
              margin: "16px 0",
              borderColor: "#e2e8f0",
            }}
          />

          <p style={{ fontSize: 14, lineHeight: 1.7 }}>
            {selected.description}
          </p>

          <h3 style={{ fontWeight: 700, marginTop: 20 }}>
            Profile information
          </h3>

          <ul
            style={{
              paddingLeft: 18,
              fontSize: 13,
              lineHeight: 2,
            }}
          >
            <li>Biography and photo source</li>
            <li>Responsibilities and appointments</li>
            <li>Previous postings and decisions</li>
            <li>Performance and outcome evidence</li>
            <li>Allegations and case status</li>
            <li>Sources and verification dates</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
