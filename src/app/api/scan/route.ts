import { NextRequest, NextResponse } from "next/server";
import { mockConfig, mockSleep } from "@/lib/mock-config";

/* ============================================================
   TYPES
   ============================================================ */

interface PortEntry {
  port: number;
  status: "OPEN" | "CLOSED" | "FILTERED";
  service: string;
  banner?: string;
}

interface ScanResult {
  host: string;
  timestamp: string;
  ports: PortEntry[];
}

/* ============================================================
   MOCK DATA
   ============================================================ */

const MOCK_PORTS: PortEntry[] = [
  { port: 21, status: "OPEN", service: "FTP", banner: "vsftpd 3.0.3" },
  { port: 22, status: "OPEN", service: "SSH", banner: "OpenSSH 8.9p1" },
  { port: 25, status: "FILTERED", service: "SMTP" },
  { port: 80, status: "OPEN", service: "HTTP", banner: "nginx/1.24.0" },
  { port: 110, status: "CLOSED", service: "POP3" },
  { port: 443, status: "OPEN", service: "HTTPS", banner: "nginx/1.24.0" },
  { port: 3306, status: "CLOSED", service: "MYSQL" },
  { port: 5432, status: "FILTERED", service: "POSTGRESQL" },
  { port: 6379, status: "OPEN", service: "REDIS", banner: "Redis 7.2.3" },
  { port: 8080, status: "OPEN", service: "HTTP-PROXY", banner: "Apache Tomcat 10.1" },
  { port: 8443, status: "CLOSED", service: "HTTPS-ALT" },
  { port: 9090, status: "OPEN", service: "PROMETHEUS" },
  { port: 27017, status: "FILTERED", service: "MONGODB" },
];

/* ============================================================
   HANDLER
   ============================================================ */

export async function POST(request: NextRequest) {
  const body = await request.json();
  const host = (body.host as string) || "192.168.1.1";

  if (mockConfig.useMock) {
    await mockSleep(mockConfig.scanDelayMs * 3);

    const result: ScanResult = {
      host,
      timestamp: new Date().toISOString(),
      ports: MOCK_PORTS,
    };

    return NextResponse.json(result);
  }

  // ── Real kernel placeholder ──
  // Replace the block below with actual nmap / masscan integration:
  //
  //   const ports = await runNmap(host);
  //   return NextResponse.json({ host, timestamp: new Date().toISOString(), ports });
  //
  return NextResponse.json(
    { error: "Real scan kernel not implemented. Set CYBERVERSE_MOCK=true." },
    { status: 501 }
  );
}
