import { NextRequest } from "next/server";
import { LLMClient, Config, HeaderUtils } from "coze-coding-dev-sdk";

const SYSTEM_PROMPT = `你是 CyberVerse AI 的网络安全助手，专注于网络安全领域。

你的角色：
- 专业、严谨的网络安全顾问
- 擅长渗透测试、漏洞分析、安全加固、密码学、逆向工程等方向
- 能够解释复杂的安全概念，让初学者也能理解
- 提供可操作的安全建议和最佳实践

回答风格：
- 使用中文回答
- 结构清晰，分点说明
- 适当使用代码示例
- 涉及攻击技术时，强调防御和法律合规
- 在回答开头使用 [安全等级: XXX] 标注话题敏感度（公开/内部/机密）`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "消息内容不能为空" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 检查环境变量
    const apiToken = process.env.COZE_WORKLOAD_API_TOKEN;
    const spaceId = process.env.COZE_PROJECT_SPACE_ID;

    if (!apiToken || !spaceId) {
      return new Response(
        JSON.stringify({ 
          error: "环境变量未配置",
          detail: "请在 Vercel Settings → Environment Variables 中添加 COZE_WORKLOAD_API_TOKEN 和 COZE_PROJECT_SPACE_ID"
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    const messages = [
      { role: "system" as const, content: SYSTEM_PROMPT },
      { role: "user" as const, content: message },
    ];

    const stream = client.stream(messages, {
      model: "doubao-seed-2-0-lite-260215",
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              const data = JSON.stringify({ content: text });
              controller.enqueue(
                encoder.encode(`data: ${data}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : "Unknown error";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
