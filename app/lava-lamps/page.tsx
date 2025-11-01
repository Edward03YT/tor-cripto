"use client";
import { LavaWall } from "@/app/components/LavaWall";

export default function Home() {
  return (
    <main
      style={{
        background: "black",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "2rem",
      }}
    >
      <h1 style={{ color: "white", fontFamily: "monospace", marginBottom: "1rem" }}>
        <span style={{ color: "#ff6600" }}>Entropy</span> Wall
      </h1>
      <LavaWall lampCount={12} />
    </main>
  );
}