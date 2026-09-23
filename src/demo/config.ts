/**
 * Demo mode: a self-contained app with a simulated wallet and synthetic data.
 * Enable with NEXT_PUBLIC_DEMO_MODE=true. Never enable in production.
 */
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/** Placeholder address for the simulated wallet — not a real account. */
export const DEMO_ADDRESS = "0xDe00000000000000000000000000000000000001" as const;

/** Fixed "now" so demo history is reproducible. */
export const DEMO_AS_OF = "2026-09-23T12:00:00Z";
