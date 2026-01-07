// app/api/relay/route.ts
import { NextRequest, NextResponse } from "next/server";

type StoredMsg = {
  to: string;
  from: string;
  body: any; // payload criptat
  ts: number;
};

const inbox = new Map<string, StoredMsg[]>();

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { to, from, body } = data ?? {};
  if (!to || !from || !body) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const arr = inbox.get(to) ?? [];
  arr.push({ to, from, body, ts: Date.now() });
  inbox.set(to, arr);
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user = searchParams.get("user");
  if (!user) return NextResponse.json({ error: "Missing user" }, { status: 400 });

  const arr = inbox.get(user) ?? [];
  inbox.set(user, []); // “consume”
  return NextResponse.json({ messages: arr });
}