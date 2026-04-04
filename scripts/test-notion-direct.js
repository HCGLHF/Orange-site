/**
 * 直接测试 Notion 连接，绕过 Next.js
 * SDK v5：无 databases.query，请用 dataSources.query
 */
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const { Client } = require("@notionhq/client");

console.log("🔑 Token 前10位:", process.env.NOTION_TOKEN?.slice(0, 10));
console.log("🗄️ Database ID:", process.env.NOTION_DATABASE_ID);

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

async function test() {
  try {
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
      console.error("❌ 缺少 NOTION_TOKEN 或 NOTION_DATABASE_ID（检查 .env.local）");
      process.exit(1);
    }

    console.log("\n📡 正在连接 Notion...");

    // 测试 1：验证数据库是否存在
    const db = await notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID,
    });
    console.log("✅ 数据库连接成功！");
    console.log("📋 数据库名:", db.title?.[0]?.plain_text ?? "(无标题)");

    // SDK v5：用 data source id 查询（优先从 retrieve 结果取）
    const dataSourceId =
      db.data_sources?.[0]?.id ?? process.env.NOTION_DATABASE_ID;

    // 测试 2：查询所有条目
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
    });

    console.log(`\n📊 找到 ${response.results.length} 条数据：`);
    response.results.forEach((page, i) => {
      const name =
        page.properties["名称"]?.title?.[0]?.plain_text || "未命名";
      const stock =
        page.properties["状态"]?.select?.name || "无状态";
      const lastEdited = page.last_edited_time;
      console.log(
        `${i + 1}. ${name} | id: ${page.id} | 状态: ${stock} | 最后编辑: ${lastEdited}`
      );
    });

    const fabricIdList = response.results.map((page) => ({
      name: page.properties["名称"]?.title?.[0]?.plain_text || "未命名",
      id: page.id,
    }));
    console.log(
      "\n面料ID列表 (与 getFabricsFromNotion 的 id 一致，用于 POST /api/inquiry 的 fabricIds / items.notionPageId):"
    );
    console.log(JSON.stringify(fabricIdList, null, 2));

    // 测试 3：第一条数据的字段详情
    if (response.results[0]) {
      console.log("\n🔍 第一条数据的所有字段:");
      console.log(JSON.stringify(response.results[0].properties, null, 2));
    }
  } catch (error) {
    console.error("\n❌ 错误:", error.message);
    console.error("错误码:", error.code);
    if (error.code === "object_not_found") {
      console.log(
        "\n💡 解决方案: 去 Notion 数据库页面 → Share → 邀请你的 Integration"
      );
    }
  }
}

test();
