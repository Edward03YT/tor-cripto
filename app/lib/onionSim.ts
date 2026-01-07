// lib/onionSim.ts
export type Hop = "ENTRY" | "MIDDLE" | "EXIT";

export function simulateThreeHopSend(
  msgLabel: string,
  log: (line: string) => void
) {
  // Nu implementează Tor. Doar explică, în log, transformări conceptuale.
  log(`[SIM] Construiesc traseu: ENTRY -> MIDDLE -> EXIT`);
  log(`[SIM] Împachetez mesajul: ${msgLabel}`);

  log(`[SIM][ENTRY] Văd doar următorul hop (MIDDLE). Reîmpachetez + forward.`);
  log(`[SIM][MIDDLE] Văd doar hop-ul următor (EXIT). Reîmpachetez + forward.`);
  log(`[SIM][EXIT] Scot ultimul strat și trimit către destinație (aplicație).`);
}