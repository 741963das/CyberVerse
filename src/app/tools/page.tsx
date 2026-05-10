"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Radar,
  Github,
  Wifi,
  Search,
  Play,
  Loader2,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Shield,
  AlertTriangle,
  CircleDot,
} from "lucide-react";

/* ============================================================
   TYPES
   ============================================================ */

interface PortResult {
  port: number;
  status: "OPEN" | "CLOSED" | "FILTERED";
  service: string;
  banner?: string;
}

interface PacketRow {
  id: number;
  time: string;
  srcIp: string;
  dstIp: string;
  protocol: string;
  length: number;
  status: string;
  info: string;
}

interface SubdomainResult {
  domain: string;
  ip: string;
  status: number;
  tech: string;
}

interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  updatedAt: string;
  topics: string[];
  readme: string;
}

/* ============================================================
   API HELPERS — call backend simulation kernel
   ============================================================ */

async function apiScan(host: string): Promise<PortResult[]> {
  const res = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ host }),
  });
  if (!res.ok) throw new Error("Scan API error");
  const data = await res.json();
  return (data.ports ?? []) as PortResult[];
}

async function apiPackets(count: number = 10): Promise<PacketRow[]> {
  const res = await fetch("/api/packet", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "start", count }),
  });
  if (!res.ok) throw new Error("Packet API error");
  const data = await res.json();
  return (data.packets ?? []).map(
    (p: Record<string, unknown>, i: number) => ({
      id: i + 1,
      time: (p.time as string) || "00:00:00.000",
      srcIp: (p.source as string) || "0.0.0.0",
      dstIp: (p.destination as string) || "0.0.0.0",
      protocol: (p.proto as string) || "TCP",
      length: (p.length as number) || 0,
      status: (p.status as string) || "OK",
      info: (p.info as string) || "",
    })
  );
}

async function apiGitHub(repoUrl: string): Promise<GitHubRepo> {
  const res = await fetch("/api/github", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repo: repoUrl }),
  });
  if (!res.ok) throw new Error("GitHub API error");
  const data = await res.json();
  return {
    name: data.name,
    description: data.description,
    language: data.language,
    stars: data.stars,
    forks: data.forks,
    updatedAt: data.latestCommit,
    topics: data.topics,
    readme: data.readme,
  };
}

/* ============================================================
   FALLBACK MOCK — only used for Subdomain Finder (no API yet)
   ============================================================ */

const MOCK_SUBDOMAINS: SubdomainResult[] = [
  { domain: "api.example.com", ip: "93.184.216.34", status: 200, tech: "Node.js / Express" },
  { domain: "cdn.example.com", ip: "104.16.132.229", status: 200, tech: "Cloudflare CDN" },
  { domain: "dev.example.com", ip: "10.0.0.12", status: 403, tech: "Nginx" },
  { domain: "staging.example.com", ip: "10.0.0.15", status: 200, tech: "Apache / PHP" },
  { domain: "mail.example.com", ip: "93.184.216.35", status: 200, tech: "Postfix" },
  { domain: "admin.example.com", ip: "10.0.0.20", status: 401, tech: "IIS / ASP.NET" },
  { domain: "db.example.com", ip: "10.0.0.30", status: 0, tech: "MySQL" },
  { domain: "vpn.example.com", ip: "93.184.216.36", status: 200, tech: "OpenVPN" },
  { domain: "git.example.com", ip: "10.0.0.50", status: 200, tech: "Gitea" },
  { domain: "ci.example.com", ip: "10.0.0.55", status: 200, tech: "Jenkins" },
  { domain: "monitor.example.com", ip: "10.0.0.60", status: 200, tech: "Grafana" },
  { domain: "log.example.com", ip: "10.0.0.65", status: 200, tech: "ELK Stack" },
];

/* ============================================================
   COMPONENTS
   ============================================================ */

// --- Scan Background ---
function ScanBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 grid-bg opacity-20" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent animate-h-scan" />
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
    </div>
  );
}

// --- Port Scanner ---
function PortScanner() {
  const [target, setTarget] = useState("192.168.1.1");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<PortResult[]>([]);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const startScan = useCallback(async () => {
    if (scanning) return;
    setScanning(true);
    setResults([]);
    setProgress(0);
    setError("");
    try {
      const allPorts = await apiScan(target);
      // Animate results appearing one by one
      for (let i = 0; i < allPorts.length; i++) {
        await new Promise((r) => setTimeout(r, 200));
        setResults((prev) => [...prev, allPorts[i]]);
        setProgress(Math.round(((i + 1) / allPorts.length) * 100));
      }
    } catch {
      setError("Scan failed. API unreachable.");
    } finally {
      setScanning(false);
    }
  }, [scanning, target]);

  const resetScan = useCallback(() => {
    setScanning(false);
    setResults([]);
    setProgress(0);
    setError("");
  }, []);

  const copyResults = useCallback(() => {
    const text = results
      .map((r) => `${r.port}\t${r.status}\t${r.service}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [results]);

  return (
    <div className="cyber-card p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
          <Radar className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white font-mono">
            Port Scanner
          </h3>
          <p className="text-xs text-zinc-500">TCP/UDP Service Detection</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Target IP (e.g. 192.168.1.1)"
          className="flex-1 bg-black/60 border border-cyan-500/20 rounded-lg px-3 py-2 text-sm text-cyan-300 font-mono placeholder-zinc-600 focus:outline-none focus:border-cyan-400/50 transition"
        />
        <button
          onClick={startScan}
          disabled={scanning}
          className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm font-mono hover:bg-cyan-500/20 transition flex items-center gap-2 disabled:opacity-50"
        >
          {scanning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {scanning ? "Scanning" : "Scan"}
        </button>
        {results.length > 0 && !scanning && (
          <button
            onClick={resetScan}
            className="px-3 py-2 border border-zinc-700 rounded-lg text-zinc-400 text-sm font-mono hover:border-zinc-500 transition"
          >
            Reset
          </button>
        )}
      </div>

      {scanning && (
        <div className="mb-4">
          <div className="flex justify-between text-xs font-mono text-zinc-500 mb-1">
            <span>Scanning {target}...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyan-300 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 text-xs font-mono text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-zinc-500">
              Scan Results
            </span>
            <button
              onClick={copyResults}
              className="text-xs font-mono text-zinc-500 hover:text-cyan-400 transition flex items-center gap-1"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="bg-black/80 border border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500">
                  <th className="text-left py-2 px-3">PORT</th>
                  <th className="text-left py-2 px-3">STATE</th>
                  <th className="text-left py-2 px-3">SERVICE</th>
                  <th className="text-left py-2 px-3">BANNER</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr
                    key={r.port}
                    className="border-b border-zinc-800/50 hover:bg-cyan-500/5 transition"
                    style={{
                      animation: `fadeIn 0.3s ease-out ${i * 0.05}s both`,
                    }}
                  >
                    <td className="py-1.5 px-3 text-cyan-300">{r.port}</td>
                    <td className="py-1.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 ${
                          r.status === "OPEN"
                            ? "text-green-400"
                            : r.status === "CLOSED"
                              ? "text-red-400"
                              : "text-yellow-400"
                        }`}
                      >
                        <CircleDot className="w-2.5 h-2.5" />
                        {r.status}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-zinc-300">{r.service}</td>
                    <td className="py-1.5 px-3 text-zinc-600 truncate max-w-[180px]">
                      {r.banner || "\u2014"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// --- GitHub Analyzer ---
function GitHubAnalyzer() {
  const [repoUrl, setRepoUrl] = useState(
    "https://github.com/example/cybersecurity-toolkit"
  );
  const [loading, setLoading] = useState(false);
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [expandedReadme, setExpandedReadme] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const analyze = useCallback(async () => {
    setLoading(true);
    setRepo(null);
    setError("");
    try {
      const data = await apiGitHub(repoUrl);
      setRepo(data);
    } catch {
      setError("GitHub analysis failed. API unreachable.");
    } finally {
      setLoading(false);
    }
  }, [repoUrl]);

  const copyRepoInfo = useCallback(() => {
    if (!repo) return;
    const text = `${repo.name}\n${repo.description}\n\u2B50 ${repo.stars} | \uD83C\uDF74 ${repo.forks}\nLanguage: ${repo.language}\nUpdated: ${repo.updatedAt}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [repo]);

  const langColors: Record<string, string> = {
    TypeScript: "bg-blue-500",
    JavaScript: "bg-yellow-400",
    Python: "bg-green-500",
    Rust: "bg-orange-500",
    Go: "bg-cyan-500",
  };

  return (
    <div className="cyber-card p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent" />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
          <Github className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white font-mono">
            GitHub Analyzer
          </h3>
          <p className="text-xs text-zinc-500">Repository Intelligence</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="GitHub repo URL"
          className="flex-1 bg-black/60 border border-purple-500/20 rounded-lg px-3 py-2 text-sm text-purple-300 font-mono placeholder-zinc-600 focus:outline-none focus:border-purple-400/50 transition"
        />
        <button
          onClick={analyze}
          disabled={loading}
          className="px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-400 text-sm font-mono hover:bg-purple-500/20 transition flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {loading ? "Analyzing" : "Analyze"}
        </button>
      </div>

      {error && (
        <div className="mb-4 text-xs font-mono text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      {repo && (
        <div
          className="space-y-4"
          style={{ animation: "fadeIn 0.4s ease-out" }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-mono font-bold">{repo.name}</h4>
              <p className="text-sm text-zinc-400 mt-1">{repo.description}</p>
            </div>
            <button
              onClick={copyRepoInfo}
              className="text-xs font-mono text-zinc-500 hover:text-purple-400 transition flex items-center gap-1 shrink-0 ml-2"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-black/60 border border-zinc-800 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white font-mono">
                {repo.stars.toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500">Stars</div>
            </div>
            <div className="bg-black/60 border border-zinc-800 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-white font-mono">
                {repo.forks.toLocaleString()}
              </div>
              <div className="text-xs text-zinc-500">Forks</div>
            </div>
            <div className="bg-black/60 border border-zinc-800 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${langColors[repo.language] || "bg-zinc-400"}`}
                />
                <span className="text-sm font-bold text-white font-mono">
                  {repo.language}
                </span>
              </div>
              <div className="text-xs text-zinc-500">Language</div>
            </div>
            <div className="bg-black/60 border border-zinc-800 rounded-lg p-3 text-center">
              <div className="text-sm font-bold text-white font-mono">
                {repo.updatedAt}
              </div>
              <div className="text-xs text-zinc-500">Updated</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {repo.topics.map((t: string) => (
              <span
                key={t}
                className="px-2 py-0.5 text-xs font-mono bg-purple-500/10 border border-purple-500/20 rounded text-purple-300"
              >
                {t}
              </span>
            ))}
          </div>

          <div>
            <button
              onClick={() => setExpandedReadme(!expandedReadme)}
              className="flex items-center gap-1 text-xs font-mono text-zinc-500 hover:text-cyan-400 transition mb-2"
            >
              {expandedReadme ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              README.md
            </button>
            {expandedReadme && (
              <div className="bg-black/80 border border-zinc-800 rounded-lg p-4 max-h-64 overflow-auto">
                <pre className="text-xs text-zinc-300 font-mono whitespace-pre-wrap">
                  {repo.readme}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Packet Analyzer ---
function PacketAnalyzer() {
  const [capturing, setCapturing] = useState(false);
  const [packets, setPackets] = useState<PacketRow[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startCapture = useCallback(() => {
    setCapturing(true);
    setPackets([]);
    setError("");
    timerRef.current = setInterval(async () => {
      try {
        const newPackets = await apiPackets(3);
        setPackets((prev) => {
          const merged = [...prev, ...newPackets.map((p, i) => ({
            ...p,
            id: prev.length + i + 1,
          }))];
          return merged.slice(-50);
        });
      } catch {
        setError("Packet capture failed.");
        if (timerRef.current) clearInterval(timerRef.current);
        setCapturing(false);
      }
    }, 1200);
  }, []);

  const stopCapture = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCapturing(false);
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [packets]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const protoColor: Record<string, string> = {
    TCP: "text-cyan-400",
    UDP: "text-green-400",
    HTTP: "text-orange-400",
    DNS: "text-yellow-400",
    TLS: "text-purple-400",
    ICMP: "text-red-400",
    ARP: "text-pink-400",
  };

  return (
    <div className="cyber-card p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-green-400 to-transparent" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
            <Wifi className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-mono">
              Packet Analyzer
            </h3>
            <p className="text-xs text-zinc-500">Real-time Traffic Capture</p>
          </div>
        </div>
        <button
          onClick={capturing ? stopCapture : startCapture}
          className={`px-4 py-2 rounded-lg text-sm font-mono flex items-center gap-2 transition ${
            capturing
              ? "bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20"
              : "bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20"
          }`}
        >
          {capturing ? (
            <>
              <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Capture
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-3 text-xs font-mono text-red-400 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </div>
      )}

      <div
        ref={containerRef}
        className="bg-black/80 border border-zinc-800 rounded-lg overflow-auto max-h-[340px]"
      >
        <table className="w-full text-xs font-mono">
          <thead className="sticky top-0 bg-zinc-900/95 backdrop-blur z-10">
            <tr className="border-b border-zinc-800 text-zinc-500">
              <th className="text-left py-2 px-2 w-8">#</th>
              <th className="text-left py-2 px-2 w-24">Time</th>
              <th className="text-left py-2 px-2">Source</th>
              <th className="text-left py-2 px-2">Destination</th>
              <th className="text-left py-2 px-2 w-16">Proto</th>
              <th className="text-left py-2 px-2 w-12">Len</th>
              <th className="text-left py-2 px-2 w-16">Status</th>
            </tr>
          </thead>
          <tbody>
            {packets.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-8 text-zinc-600"
                >
                  {capturing
                    ? "Waiting for packets..."
                    : "Click Capture to start"}
                </td>
              </tr>
            )}
            {packets.map((pkt, i) => (
              <tr
                key={`${pkt.id}-${i}`}
                onClick={() => setSelectedIdx(i)}
                className={`border-b border-zinc-800/50 cursor-pointer transition ${
                  selectedIdx === i
                    ? "bg-cyan-500/10"
                    : "hover:bg-zinc-800/50"
                }`}
              >
                <td className="py-1 px-2 text-zinc-600">{pkt.id}</td>
                <td className="py-1 px-2 text-zinc-400">{pkt.time}</td>
                <td className="py-1 px-2 text-cyan-300">{pkt.srcIp}</td>
                <td className="py-1 px-2 text-cyan-300">{pkt.dstIp}</td>
                <td
                  className={`py-1 px-2 ${protoColor[pkt.protocol] || "text-zinc-300"}`}
                >
                  {pkt.protocol}
                </td>
                <td className="py-1 px-2 text-zinc-400">{pkt.length}</td>
                <td className="py-1 px-2 text-zinc-500">{pkt.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedIdx !== null && packets[selectedIdx] && (
        <div
          className="mt-3 bg-black/60 border border-zinc-800 rounded-lg p-3"
          style={{ animation: "fadeIn 0.2s ease-out" }}
        >
          <div className="text-xs font-mono text-zinc-500 mb-1">
            Packet Detail #{packets[selectedIdx].id}
          </div>
          <div className="text-xs font-mono text-cyan-300">
            {packets[selectedIdx].info}
          </div>
          <div className="grid grid-cols-2 gap-x-4 mt-2 text-xs font-mono">
            <div>
              <span className="text-zinc-500">SRC:</span>{" "}
              <span className="text-cyan-300">
                {packets[selectedIdx].srcIp}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">DST:</span>{" "}
              <span className="text-cyan-300">
                {packets[selectedIdx].dstIp}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">PROTO:</span>{" "}
              <span className={protoColor[packets[selectedIdx].protocol]}>
                {packets[selectedIdx].protocol}
              </span>
            </div>
            <div>
              <span className="text-zinc-500">STATUS:</span>{" "}
              <span className="text-zinc-300">
                {packets[selectedIdx].status}
              </span>
            </div>
          </div>
        </div>
      )}

      {capturing && (
        <div className="mt-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-mono text-green-400">
            Capturing... {packets.length} packets
          </span>
        </div>
      )}
    </div>
  );
}

// --- Subdomain Finder ---
function SubdomainFinder() {
  const [domain, setDomain] = useState("example.com");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<SubdomainResult[]>([]);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startFind = useCallback(() => {
    setScanning(true);
    setResults([]);
    let idx = 0;
    timerRef.current = setInterval(() => {
      if (idx < MOCK_SUBDOMAINS.length) {
        const sub = MOCK_SUBDOMAINS[idx];
        setResults((prev) => [
          ...prev,
          { ...sub, domain: sub.domain.replace("example.com", domain) },
        ]);
        idx++;
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
        setScanning(false);
      }
    }, 400);
  }, [domain]);

  const copyResults = useCallback(() => {
    const text = results
      .map((r) => `${r.domain}\t${r.ip}\t${r.status}\t${r.tech}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [results]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const statusColor = (s: number) => {
    if (s === 200) return "text-green-400";
    if (s === 403) return "text-yellow-400";
    if (s === 401) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="cyber-card p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-400 to-transparent" />

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
          <Search className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white font-mono">
            Subdomain Finder
          </h3>
          <p className="text-xs text-zinc-500">DNS Enumeration Engine</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="Domain (e.g. example.com)"
          className="flex-1 bg-black/60 border border-orange-500/20 rounded-lg px-3 py-2 text-sm text-orange-300 font-mono placeholder-zinc-600 focus:outline-none focus:border-orange-400/50 transition"
        />
        <button
          onClick={startFind}
          disabled={scanning}
          className="px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-orange-400 text-sm font-mono hover:bg-orange-500/20 transition flex items-center gap-2 disabled:opacity-50"
        >
          {scanning ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {scanning ? "Scanning" : "Find"}
        </button>
      </div>

      {results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-zinc-500">
              Found {results.length} subdomain
              {results.length > 1 ? "s" : ""}
            </span>
            <button
              onClick={copyResults}
              className="text-xs font-mono text-zinc-500 hover:text-orange-400 transition flex items-center gap-1"
            >
              {copied ? (
                <Check className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="space-y-1.5">
            {results.map((r, i) => (
              <div
                key={r.domain}
                className="flex items-center justify-between bg-black/60 border border-zinc-800 rounded-lg px-3 py-2 hover:border-orange-500/20 transition group"
                style={{
                  animation: `fadeIn 0.3s ease-out ${i * 0.06}s both`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-orange-400/60 group-hover:bg-orange-400 transition" />
                  <span className="text-sm font-mono text-white">
                    {r.domain}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-zinc-500 hidden sm:inline">
                    {r.ip}
                  </span>
                  <span className={statusColor(r.status)}>
                    {r.status || "TIMEOUT"}
                  </span>
                  <span className="text-zinc-600 hidden md:inline">
                    {r.tech}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {scanning && (
        <div className="mt-3 flex items-center gap-2">
          <Loader2 className="w-3 h-3 animate-spin text-orange-400" />
          <span className="text-xs font-mono text-orange-400">
            Enumerating DNS records...
          </span>
        </div>
      )}
    </div>
  );
}

// --- Stats Bar ---
function StatsBar() {
  const stats = [
    { label: "Tools Online", value: 4, icon: Shield, color: "text-cyan-400" },
    { label: "Active Scans", value: 17, icon: Radar, color: "text-green-400" },
    {
      label: "Packets Captured",
      value: 1247,
      icon: Wifi,
      color: "text-purple-400",
    },
    {
      label: "Subdomains Found",
      value: 384,
      icon: Search,
      color: "text-orange-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {stats.map((s, i) => (
        <div
          key={s.label}
          className="cyber-card p-4 text-center"
          style={{ animation: `fadeIn 0.4s ease-out ${i * 0.1}s both` }}
        >
          <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
          <div className="text-2xl font-bold text-white font-mono">
            {s.value}
          </div>
          <div className="text-xs text-zinc-500 font-mono">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// --- Alert Banner ---
function AlertBanner() {
  return (
    <div className="mb-6 flex items-center gap-3 px-4 py-2.5 bg-yellow-500/5 border border-yellow-500/20 rounded-lg">
      <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
      <p className="text-xs font-mono text-yellow-400/80">
        Authorized use only. All scanning activities are simulated via backend
        kernel. No real network traffic is generated.
      </p>
    </div>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */

export default function ToolsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
          <span className="text-cyan-400 font-mono text-sm">
            INITIALIZING TOOLKIT...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white relative page-enter-animation">
      {/* Hero */}
      <section className="relative py-12 px-6 overflow-hidden border-b border-cyan-500/10">
        <ScanBackground />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
              Security Toolkit
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white font-mono tracking-tight">
            Security <span className="text-cyan-400">Toolkit</span>
          </h1>
          <p className="text-zinc-400 mt-3 text-sm md:text-base max-w-2xl">
            AI-driven offensive &amp; defensive security utilities. All tools
            run in sandboxed environment with simulated data.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-8 max-w-5xl mx-auto">
        <AlertBanner />
        <StatsBar />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PortScanner />
          <GitHubAnalyzer />
          <PacketAnalyzer />
          <SubdomainFinder />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-6 px-6 text-center">
        <p className="text-xs font-mono text-zinc-600">
          CyberVerse Security Toolkit &middot; All tools are for educational
          purposes only
        </p>
      </footer>
    </div>
  );
}
