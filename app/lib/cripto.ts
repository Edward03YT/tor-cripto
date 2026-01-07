// lib/crypto.ts
export type LogFn = (line: string) => void;

const enc = new TextEncoder();
const dec = new TextDecoder();

export async function generateIdentityKeyPair(log?: LogFn) {
  log?.("Generez cheie de identitate ECDH (P-256)...");
  const keyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveKey"]
  );
  log?.("Cheia de identitate generată.");
  return keyPair;
}

export async function exportPublicKeyJwk(pub: CryptoKey) {
  return crypto.subtle.exportKey("jwk", pub);
}

export async function importPublicKeyJwk(jwk: JsonWebKey) {
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDH", namedCurve: "P-256" },
    true,
    []
  );
}

export async function deriveSessionKey(
  myPrivate: CryptoKey,
  theirPublic: CryptoKey,
  log?: LogFn
) {
  log?.("Derivez cheia de sesiune (ECDH -> AES-GCM)...");
  const key = await crypto.subtle.deriveKey(
    { name: "ECDH", public: theirPublic },
    myPrivate,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  log?.("Cheia de sesiune derivată.");
  return key;
}

export function b64u(bytes: ArrayBuffer) {
  const u8 = new Uint8Array(bytes);
  let s = "";
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function fromB64u(s: string) {
  const b64 = s.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((s.length + 3) % 4);
  const bin = atob(b64);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return u8.buffer;
}

export async function encryptJson(
  key: CryptoKey,
  payload: unknown,
  log?: LogFn
) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = enc.encode(JSON.stringify(payload));
  log?.(`Criptez (AES-GCM) | IV=${b64u(iv.buffer)} | bytes=${plaintext.byteLength}`);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plaintext);
  log?.(`Ciphertext bytes=${ct.byteLength}`);
  return { iv: b64u(iv.buffer), ct: b64u(ct) };
}

export async function decryptJson<T>(
  key: CryptoKey,
  packed: { iv: string; ct: string },
  log?: LogFn
): Promise<T> {
  const iv = new Uint8Array(fromB64u(packed.iv));
  const ct = fromB64u(packed.ct);
  log?.(`Decriptez (AES-GCM) | IV=${packed.iv} | bytes=${ct.byteLength}`);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  const text = dec.decode(pt);
  log?.("Decriptare OK.");
  return JSON.parse(text) as T;
}