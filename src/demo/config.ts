/**
 * Demo mode: a self-contained app with a simulated wallet and synthetic data.
 * Enable with NEXT_PUBLIC_DEMO_MODE=true. Never enable in production.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/** Placeholder address for the simulated wallet — not a real account. */
export const DEMO_ADDRESS = "0xDe00000000000000000000000000000000000001" as const;

/** Demo "now": the start of the current hour, so history stays fresh yet stable within a session. */
export const DEMO_AS_OF = new Date(Math.floor(Date.now() / 3_600_000) * 3_600_000).toISOString();
