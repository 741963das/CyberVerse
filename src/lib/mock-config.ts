/**
 * Mock Configuration for CyberVerse Simulation Kernel
 *
 * When `useMock` is true, all API routes return simulated data.
 * When `useMock` is false, the routes can be wired to real tools
 * (e.g. nmap, tshark, GitHub API) by replacing the mock branch
 * with actual implementation.
 *
 * Toggle via environment variable CYBERVERSE_MOCK or edit directly.
 */

export const mockConfig = {
  /** Master switch — true = simulation mode, false = real kernel */
  useMock: process.env.CYBERVERSE_MOCK !== "false",

  /** Simulated scan delay per port (ms) */
  scanDelayMs: 200,

  /** Simulated packet capture interval (ms) */
  packetIntervalMs: 600,

  /** Simulated GitHub analysis delay (ms) */
  githubDelayMs: 1200,

  /** Simulated subdomain enumeration delay per entry (ms) */
  subdomainDelayMs: 350,
} as const;

/** Helper: sleep for mock latency */
export function mockSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
