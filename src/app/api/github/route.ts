import { NextRequest, NextResponse } from "next/server";
import { mockConfig, mockSleep } from "@/lib/mock-config";

/* ============================================================
   TYPES
   ============================================================ */

interface GitHubRepoInfo {
  repo: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  issues: number;
  latestCommit: string;
  topics: string[];
  readme: string;
}

/* ============================================================
   MOCK DATA
   ============================================================ */

const MOCK_GITHUB: GitHubRepoInfo = {
  repo: "https://github.com/example/cybersecurity-toolkit",
  name: "cybersecurity-toolkit",
  description:
    "AI-driven offensive & defensive security toolkit for penetration testers and SOC analysts.",
  language: "TypeScript",
  stars: 12847,
  forks: 2093,
  issues: 3,
  latestCommit: "2025-06-12",
  topics: ["security", "pentesting", "ai", "cybersecurity", "tools", "osint"],
  readme: `# CyberSecurity Toolkit

An AI-powered security toolkit designed for modern penetration testing and defensive operations.

## Features

- **Port Scanner** — High-speed TCP/UDP port scanning with service detection
- **Vulnerability Scanner** — CVE-based vulnerability assessment
- **Packet Analyzer** — Real-time network traffic inspection
- **Subdomain Finder** — DNS enumeration and subdomain discovery
- **AI Analysis** — ML-based threat detection and classification

## Installation

\`\`\`bash
git clone https://github.com/example/cybersecurity-toolkit.git
cd cybersecurity-toolkit
pnpm install
pnpm dev
\`\`\`

## Usage

\`\`\`typescript
import { Scanner } from './src/scanner';

const scanner = new Scanner({ target: '192.168.1.0/24' });
const results = await scanner.run();
console.log(results);
\`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE for details.`,
};

/* ============================================================
   HANDLER
   ============================================================ */

export async function POST(request: NextRequest) {
  const body = await request.json();
  const repoUrl = (body.repo as string) || "";

  if (mockConfig.useMock) {
    await mockSleep(mockConfig.githubDelayMs);

    const result: GitHubRepoInfo = {
      ...MOCK_GITHUB,
      repo: repoUrl || MOCK_GITHUB.repo,
    };

    return NextResponse.json(result);
  }

  // ── Real kernel placeholder ──
  // Replace with GitHub API integration:
  //
  //   const info = await fetchGitHubRepo(repoUrl);
  //   return NextResponse.json(info);
  //
  return NextResponse.json(
    { error: "Real GitHub kernel not implemented. Set CYBERVERSE_MOCK=true." },
    { status: 501 }
  );
}
