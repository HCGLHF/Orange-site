const { Client } = require("@notionhq/client");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function main() {
  try {
    if (!process.env.NOTION_TOKEN || !process.env.NOTION_DATABASE_ID) {
      console.log("❌ 缺少环境变量：NOTION_TOKEN / NOTION_DATABASE_ID");
      process.exit(1);
    }

    // 1) 测试数据库连接
    const db = await notion.databases.retrieve({
      database_id: process.env.NOTION_DATABASE_ID,
    });
    console.log("✅ 数据库连接成功！");
    console.log("数据库名:", db.title?.[0]?.plain_text || "未命名");

    const dataSourceId = db.data_sources?.[0]?.id;
    if (!dataSourceId) {
      console.log("❌ 未找到 data source，请检查数据库结构。");
      process.exit(1);
    }

    // 2) 查询数据（SDK v5 使用 dataSources.query）
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
    });
    console.log(`\n📊 共 ${response.results.length} 条面料：`);

    response.results.forEach((page, i) => {
      const props = page.properties || {};
      const name = props["名称"]?.title?.[0]?.plain_text || "未命名";
      const comp = props["成分"]?.rich_text?.[0]?.plain_text || "";
      const weight = props["克重"]?.number || "";
      console.log(`${i + 1}. ${name} | ${comp} | ${weight}g`);
    });
  } catch (e) {
    console.error("❌ 错误:", e.message);
    if (e.code === "object_not_found") {
      console.log("\n💡 提示：需要在 Notion 里给数据库添加权限！");
      console.log('   去 Notion「面料库」数据库页面 → 共享 → 邀请 Orange Website');
    }
  }
}

main();
