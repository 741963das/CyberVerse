import type { Metadata } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const metadata: Metadata = {
  title: 'CyberVerse AI | AI 网络安全学习平台',
  description:
    'CyberVerse AI — 基于人工智能的网络安全学习平台。探索漏洞靶场、AI安全助手、学习路线，掌握赛博世界的核心技能。',
  keywords: [
    'CyberVerse',
    '网络安全',
    'AI安全',
    '漏洞靶场',
    '安全学习',
    'CTF',
    '渗透测试',
  ],
  authors: [{ name: 'CyberVerse AI' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased bg-black text-white">
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}
