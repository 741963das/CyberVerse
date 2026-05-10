import { NextRequest, NextResponse } from "next/server";
import { mockConfig, mockSleep } from "@/lib/mock-config";

/* ============================================================
   TYPES
   ============================================================ */

interface PacketEntry {
  time: string;
  source: string;
  destination: string;
  proto: string;
  length: number;
  status: string;
  info: string;
}

/* ============================================================
   MOCK DATA
   ============================================================ */

const PROTOCOLS = ["TCP", "UDP", "HTTP", "DNS", "TLS", "ICMP", "ARP"];
const STATUSES = ["OK", "OK", "OK", "RST", "TIMEOUT", "SYN-ACK"];
const PACKET_INFOS = [
  "GET /api/v1/users HTTP/1.1",
  "DNS A query example.com",
  "TLS Client Hello",
  "TCP SYN → SYN-ACK",
  "HTTP 200 OK (1.2KB)",
  "ICMP Echo Request",
  "ARP Who has 192.168.1.1?",
  "TCP FIN, ACK",
  "DNS AAAA query api.example.com",
  "TLS Certificate Verify",
  "HTTP 301 Moved Permanently",
  "TCP RST from 10.0.0.5",
  "UDP DNS Response 93.184.216.34",
  "ICMP Destination Unreachable",
  "ARP Reply 192.168.1.1 is at aa:bb:cc:dd:ee:ff",
];

function randomIp(): string {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
}

function randomTime(): string {
  const s = Math.floor(Math.random() * 59) + 1;
  const ms = Math.floor(Math.random() * 999);
  return `00:00:${String(s).padStart(2, "0")}.${String(ms).padStart(3, "0")}`;
}

function generatePackets(count: number): PacketEntry[] {
  const packets: PacketEntry[] = [];
  for (let i = 0; i < count; i++) {
    packets.push({
      time: randomTime(),
      source: randomIp(),
      destination: randomIp(),
      proto: PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
      length: Math.floor(Math.random() * 1400) + 40,
      status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
      info: PACKET_INFOS[Math.floor(Math.random() * PACKET_INFOS.length)],
    });
  }
  return packets;
}

/* ============================================================
   HANDLER
   ============================================================ */

export async function POST(request: NextRequest) {
  const body = await request.json();
  const action = (body.action as string) || "start";
  const count = (body.count as number) || 20;

  if (mockConfig.useMock) {
    await mockSleep(mockConfig.packetIntervalMs);

    if (action === "stop") {
      return NextResponse.json({ status: "stopped", packets: [] });
    }

    // action === "start" or "poll"
    const packets = generatePackets(count);
    return NextResponse.json({ status: "capturing", packets });
  }

  // ── Real kernel placeholder ──
  // Replace with tshark / libpcap integration:
  //
  //   const packets = await capturePackets(count);
  //   return NextResponse.json({ status: "capturing", packets });
  //
  return NextResponse.json(
    { error: "Real packet kernel not implemented. Set CYBERVERSE_MOCK=true." },
    { status: 501 }
  );
}
