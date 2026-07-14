import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const apiToken = process.env.COZE_WORKLOAD_API_TOKEN;
  const spaceId = process.env.COZE_PROJECT_SPACE_ID;

  return new Response(
    JSON.stringify({
      COZE_WORKLOAD_API_TOKEN: apiToken ? `${apiToken.substring(0, 10)}...${apiToken.substring(apiToken.length - 4)}` : "NOT SET",
      COZE_PROJECT_SPACE_ID: spaceId || "NOT SET",
      allEnv: Object.keys(process.env).filter(k => k.startsWith("COZE_")),
    }),
    { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    }
  );
}
