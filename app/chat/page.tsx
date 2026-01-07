// app/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  decryptJson,
  deriveSessionKey,
  encryptJson,
  exportPublicKeyJwk,
  generateIdentityKeyPair,
  importPublicKeyJwk,
} from "@/app/lib/cripto";
import { simulateThreeHopSend } from "@/app/lib/onionSim";

type UserId = "Alice" | "Bob" | "Carol";

type ChatMsg = {
  id: string;
  from: UserId;
  to: UserId;
  text: string;
  ts: number;
};

type Conversations = Record<string, ChatMsg[]>;

type DirectoryEntry = {
  pubJwk: JsonWebKey;
};

type Directory = Record<UserId, DirectoryEntry>;

const USERS: UserId[] = ["Alice", "Bob", "Carol"];

const STORAGE_CONV = "crypto-chat:v3:conversations:shared";
const STORAGE_DIR = "crypto-chat:v3:directory:pubkeys";

const theme = {
  bg: "#0B1220",
  bg2: "#0E172A",
  card: "rgba(17, 24, 39, 0.72)",
  border: "rgba(148, 163, 184, 0.16)",
  text: "#E5E7EB",
  textDim: "rgba(229, 231, 235, 0.72)",
  textFaint: "rgba(229, 231, 235, 0.55)",
  accent: "#22D3EE",
  accent2: "#38BDF8",
  good: "#34D399",
  bubbleMe: "rgba(34, 211, 238, 0.16)",
  bubbleThem: "rgba(148, 163, 184, 0.12)",
  shadow: "0 10px 30px rgba(0,0,0,0.35)",
};

function pillStyle(active: boolean): React.CSSProperties {
  return {
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${active ? "rgba(34, 211, 238, 0.55)" : theme.border}`,
    background: active ? "rgba(34, 211, 238, 0.10)" : "rgba(15, 23, 42, 0.35)",
    color: active ? theme.text : theme.textDim,
    textAlign: "left",
    cursor: "pointer",
    transition: "border-color 120ms ease, background 120ms ease",
    boxShadow: active ? "0 0 0 3px rgba(34, 211, 238, 0.10)" : "none",
  };
}

function threadId(a: UserId, b: UserId) {
  return [a, b].sort().join("|");
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return (JSON.parse(raw) as T) ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: any) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota
  }
}

export default function Page() {
  const [me, setMe] = useState<UserId>("Alice");
  const [selected, setSelected] = useState<UserId>("Bob");
  const [text, setText] = useState("");

  const [logs, setLogs] = useState<string[]>([]);
  const addLog = (line: string) =>
    setLogs((l) => [`${new Date().toLocaleTimeString()} ${line}`, ...l].slice(0, 260));

  const [conversations, setConversations] = useState<Conversations>({});

  const [directory, setDirectory] = useState<Directory | null>(null);
  const [ready, setReady] = useState(false);

  const myKeysRef = useRef<CryptoKeyPair | null>(null);
  const sessionKeysRef = useRef<Record<string, CryptoKey>>({});

  const otherUsers = useMemo(() => USERS.filter((u) => u !== me), [me]);
  const currentThread = useMemo(() => threadId(me, selected), [me, selected]);
  const visibleChat = useMemo(() => conversations[currentThread] ?? [], [conversations, currentThread]);

  useEffect(() => {
    setConversations(loadJson<Conversations>(STORAGE_CONV, {}));
  }, []);

  useEffect(() => {
    saveJson(STORAGE_CONV, conversations);
  }, [conversations]);

  function pushLocalMessage(msg: ChatMsg) {
    const tid = threadId(msg.from, msg.to);
    setConversations((prev) => {
      const arr = prev[tid] ? [...prev[tid]] : [];
      if (!arr.some((x) => x.id === msg.id)) arr.push(msg);
      arr.sort((a, b) => a.ts - b.ts);
      return { ...prev, [tid]: arr };
    });
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      setReady(false);
      addLog("Inițializez cheile publice locale…");

      const existing = loadJson<Directory | null>(STORAGE_DIR, null);

      if (!existing) {
        addLog("Generez chei pentru identitățile demo…");
        const dir: Partial<Directory> = {};

        for (const u of USERS) {
          const kp = await generateIdentityKeyPair();
          const pubJwk = await exportPublicKeyJwk(kp.publicKey);
          dir[u] = { pubJwk };
        }

        if (!alive) return;
        const finalDir = dir as Directory;
        setDirectory(finalDir);
        saveJson(STORAGE_DIR, finalDir);
        addLog("Cheile publice au fost salvate local.");
      } else {
        setDirectory(existing);
        addLog("Cheile publice au fost încărcate local.");
      }

      if (!alive) return;
      setReady(true);
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      setLogs([]);
      sessionKeysRef.current = {};
      addLog(`Eu sunt: ${me}`);

      const kp = await generateIdentityKeyPair(addLog);
      if (!alive) return;
      myKeysRef.current = kp;

      addLog("Cheia mea privată (ECDH) este în memorie (demo).");
    })();

    return () => {
      alive = false;
    };
  }, [me]);

  async function getOrCreateSessionKey(peer: UserId) {
    const cached = sessionKeysRef.current[peer];
    if (cached) return cached;

    const myKeys = myKeysRef.current;
    if (!myKeys) throw new Error("Missing my keys");

    const dir = directory;
    if (!dir) throw new Error("Directory not ready");

    const peerJwk = dir[peer]?.pubJwk;
    if (!peerJwk) throw new Error("Missing peer public key");

    const peerPub = await importPublicKeyJwk(peerJwk);
    const sessionKey = await deriveSessionKey(myKeys.privateKey, peerPub, addLog);
    sessionKeysRef.current[peer] = sessionKey;
    return sessionKey;
  }

  async function send() {
    if (!ready) {
      addLog("Nu sunt gata încă (chei).");
      return;
    }

    const to = selected;
    const from = me;
    const trimmed = text.trim();
    if (!trimmed) return;

    setText("");

    const key = await getOrCreateSessionKey(to);

    simulateThreeHopSend(`E2E message from ${from} to ${to}`, addLog);

    const body = await encryptJson(key, { from, to, text: trimmed, ts: Date.now() }, addLog);

    await fetch("/api/relay", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ to, from, body }),
    });

    pushLocalMessage({
      id: crypto.randomUUID(),
      from,
      to,
      text: trimmed,
      ts: Date.now(),
    });

    addLog("Trimis către relay (server vede doar ciphertext).");
  }

  useEffect(() => {
    let timer: any;

    const tick = async () => {
      try {
        const res = await fetch(`/api/relay?user=${encodeURIComponent(me)}`, { cache: "no-store" });
        const data = await res.json();
        const messages: Array<{
          from: UserId;
          to: UserId;
          body: { iv: string; ct: string };
          ts: number;
        }> = data.messages ?? [];

        for (const m of messages) {
          addLog(`Primit de la relay: mesaj criptat de la ${m.from}`);

          if (!ready) {
            addLog("Nu sunt gata încă; sar peste decriptare până la următorul poll.");
            continue;
          }

          const key = await getOrCreateSessionKey(m.from);
          const plain = await decryptJson<{ from: UserId; to: UserId; text: string; ts: number }>(
            key,
            m.body,
            addLog
          );

          pushLocalMessage({
            id: crypto.randomUUID(),
            from: plain.from,
            to: plain.to,
            text: plain.text,
            ts: plain.ts,
          });
        }
      } catch (e: any) {
        addLog(`Eroare polling: ${e?.message ?? String(e)}`);
      } finally {
        timer = setTimeout(tick, 1200);
      }
    };

    tick();
    return () => clearTimeout(timer);
  }, [me, ready, directory]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: `radial-gradient(1200px 600px at 20% 0%, rgba(34,211,238,0.12), transparent 60%),
                     radial-gradient(1000px 700px at 90% 20%, rgba(56,189,248,0.10), transparent 55%),
                     linear-gradient(180deg, ${theme.bg}, ${theme.bg2})`,
        color: theme.text,
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, 'Apple Color Emoji','Segoe UI Emoji'",
      }}
    >
      <div style={{ maxWidth: 1240, margin: "0 auto", padding: 18 }}>
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
            gap: 12,
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: theme.textFaint }}>
              Demo chat
            </div>
            <h1 style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 700, letterSpacing: 0.2 }}>
              Chat criptat end‑to‑end
            </h1>
          </div>

          <div
            style={{
              padding: "8px 10px",
              borderRadius: 999,
              border: `1px solid ${theme.border}`,
              background: "rgba(15, 23, 42, 0.35)",
              color: theme.textDim,
              fontSize: 12,
              display: "flex",
              gap: 10,
              alignItems: "center",
              whiteSpace: "nowrap",
            }}
          >
            <span>
              Ready: <span style={{ color: ready ? theme.good : theme.accent2 }}>{ready ? "yes" : "no"}</span>
            </span>
            <span style={{ opacity: 0.55 }}>•</span>
            <span>
              Thread: <code style={{ color: theme.accent2 }}>{currentThread}</code>
            </span>
          </div>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "290px 1fr 420px", gap: 14 }}>
          <aside
            style={{
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              padding: 14,
              background: theme.card,
              boxShadow: theme.shadow,
              backdropFilter: "blur(10px)",
            }}
          >
            <h2 style={{ margin: "0 0 10px", fontSize: 14, color: theme.textDim }}>Identitate</h2>

            <label style={{ display: "block", fontSize: 12, color: theme.textFaint, marginBottom: 8 }}>
              Eu sunt
            </label>
            <select
              value={me}
              onChange={(e) => setMe(e.target.value as UserId)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 12,
                border: `1px solid ${theme.border}`,
                background: "rgba(15, 23, 42, 0.55)",
                color: theme.text,
                outline: "none",
              }}
            >
              {USERS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>

            <div style={{ height: 1, background: theme.border, margin: "14px 0" }} />

            <h3 style={{ margin: "0 0 10px", fontSize: 14, color: theme.textDim }}>Contacte</h3>
            <div style={{ display: "grid", gap: 8 }}>
              {otherUsers.map((u) => (
                <button key={u} onClick={() => setSelected(u)} style={pillStyle(selected === u)}>
                  <div style={{ fontSize: 13, fontWeight: 650 }}>{u}</div>
                  <div style={{ fontSize: 12, color: theme.textFaint, marginTop: 2 }}>
                    Thread: <code style={{ color: theme.accent2 }}>{threadId(me, u)}</code>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main
            style={{
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              padding: 14,
              background: theme.card,
              boxShadow: theme.shadow,
              backdropFilter: "blur(10px)",
              display: "flex",
              flexDirection: "column",
              minHeight: 610,
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: theme.textFaint }}>Chat</div>
                <h2 style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 750 }}>
                  {me} ↔ {selected}
                </h2>
              </div>
              <div style={{ fontSize: 12, color: theme.textFaint }}>Mesaje: {visibleChat.length}</div>
            </div>

            <div
              style={{
                marginTop: 12,
                flex: 1,
                overflow: "auto",
                border: `1px solid ${theme.border}`,
                borderRadius: 14,
                padding: 12,
                background: "linear-gradient(180deg, rgba(2,6,23,0.55), rgba(15,23,42,0.35))",
              }}
            >
              {visibleChat.map((m) => {
                const mine = m.from === me;
                return (
                  <div
                    key={m.id}
                    style={{
                      marginBottom: 10,
                      display: "flex",
                      justifyContent: mine ? "flex-end" : "flex-start",
                    }}
                  >
                    <div
                      style={{
                        maxWidth: "78%",
                        padding: "10px 12px",
                        borderRadius: 14,
                        background: mine ? theme.bubbleMe : theme.bubbleThem,
                        color: theme.text,
                        border: `1px solid ${
                          mine ? "rgba(34, 211, 238, 0.30)" : "rgba(148, 163, 184, 0.20)"
                        }`,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          marginBottom: 6,
                          fontSize: 12,
                          color: theme.textFaint,
                        }}
                      >
                        <span style={{ color: mine ? theme.accent : theme.textDim, fontWeight: 650 }}>{m.from}</span>
                        <span style={{ opacity: 0.75 }}>•</span>
                        <span>{new Date(m.ts).toLocaleTimeString()}</span>
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.45 }}>{m.text}</div>
                    </div>
                  </div>
                );
              })}

              {!visibleChat.length && (
                <div style={{ color: theme.textFaint, fontSize: 13, padding: 10 }}>
                  {ready ? "Nu există mesaje în conversația asta încă." : "Inițializare…"}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <input
                disabled={!ready}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") send();
                }}
                placeholder={ready ? "Scrie un mesaj…" : "Inițializare…"}
                style={{
                  flex: 1,
                  padding: "11px 12px",
                  borderRadius: 14,
                  border: `1px solid ${theme.border}`,
                  background: "rgba(2, 6, 23, 0.45)",
                  color: theme.text,
                  outline: "none",
                  opacity: ready ? 1 : 0.6,
                  cursor: ready ? "text" : "not-allowed",
                }}
              />
              <button
                disabled={!ready}
                onClick={send}
                style={{
                  padding: "11px 14px",
                  borderRadius: 14,
                  border: "1px solid rgba(34, 211, 238, 0.45)",
                  background:
                    "linear-gradient(180deg, rgba(34, 211, 238, 0.25), rgba(34, 211, 238, 0.12))",
                  color: theme.text,
                  cursor: ready ? "pointer" : "not-allowed",
                  fontWeight: 700,
                  letterSpacing: 0.2,
                  opacity: ready ? 1 : 0.6,
                }}
              >
                Trimite
              </button>
            </div>
          </main>

          <section
            style={{
              border: `1px solid ${theme.border}`,
              borderRadius: 16,
              padding: 14,
              background: theme.card,
              boxShadow: theme.shadow,
              backdropFilter: "blur(10px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, color: theme.textFaint }}>Observabilitate</div>
                <h2 style={{ margin: "4px 0 0", fontSize: 16, fontWeight: 750 }}>Loguri</h2>
              </div>

              <button
                onClick={() => setLogs([])}
                style={{
                  padding: "8px 10px",
                  borderRadius: 12,
                  border: `1px solid ${theme.border}`,
                  background: "rgba(15, 23, 42, 0.35)",
                  color: theme.textDim,
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Clear
              </button>
            </div>

            <div
              style={{
                marginTop: 12,
                border: `1px solid ${theme.border}`,
                borderRadius: 14,
                padding: 12,
                background: "rgba(2, 6, 23, 0.55)",
                height: 560,
                overflow: "auto",
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                fontSize: 12,
                lineHeight: 1.45,
                color: "rgba(226, 232, 240, 0.92)",
                whiteSpace: "pre-wrap",
              }}
            >
              {logs.length ? logs.join("\n") : "Nu există loguri încă."}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}