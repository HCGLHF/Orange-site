import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export interface FabricData {
  id: string | number;
  name: string;
  composition: string;
  weight: number;
  width: number;
  description?: string;
  stockStatus: string;
  images?: string[];
}

const SITE_ORIGIN =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")
    : "https://www.orange-textile.com";

const BRAND_ORANGE = "#E07A5F";

function fabricIdLabel(id: string | number): string {
  const s = String(id).replace(/-/g, "");
  return s.slice(0, 8).toUpperCase();
}

function safePdfFileName(name: string) {
  return name.replace(/[/\\?%*:|"<>]/g, "-").trim() || "fabric";
}

function escHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function stockStatusColor(status: string): string {
  const s = status.trim();
  if (s === "现货") return "#059669";
  if (s === "预定" || s === "预订") return "#d97706";
  if (s === "缺货") return "#dc2626";
  if (s === "停产") return "#6b7280";
  return "#374151";
}

/**
 * 在浏览器中通过 HTML → html2canvas → jsPDF 生成面料卡 PDF（中文排版更可靠）。
 * 需在客户端调用。
 */
export async function generateFabricPDF(fabric: FabricData): Promise<void> {
  const idLabel = fabricIdLabel(fabric.id);
  const name = escHtml(fabric.name);
  const composition = escHtml(fabric.composition);
  const description = fabric.description ? escHtml(fabric.description) : "";
  const stockStatus = escHtml(fabric.stockStatus?.trim() || "现货");
  const stockColor = stockStatusColor(fabric.stockStatus?.trim() || "现货");

  const qrUrl = `${SITE_ORIGIN}/fabrics?id=${encodeURIComponent(String(fabric.id))}`;
  const shortHost = SITE_ORIGIN.replace(/^https?:\/\//, "");
  const qrApiUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrUrl)}&size=150`;
  const qrApiUrlAttr = escHtml(qrApiUrl);

  const element = document.createElement("div");
  element.style.width = "794px";
  element.style.height = "1123px";
  element.style.position = "fixed";
  element.style.left = "-9999px";
  element.style.top = "0";
  element.style.backgroundColor = "#ffffff";
  element.style.fontFamily =
    'system-ui, -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif';

  element.innerHTML = `
    <div style="width: 794px; height: 1123px; padding: 76px; box-sizing: border-box; position: relative; background: linear-gradient(to bottom, #fff7ed 0%, #ffffff 32%);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px;">
        <div>
          <h1 style="font-size: 22px; font-weight: bold; color: ${BRAND_ORANGE}; margin: 0; letter-spacing: -0.3px; line-height: 1.25;">绍兴诗橙纺织品有限公司</h1>
          <p style="font-size: 9px; color: #9ca3af; margin: 6px 0 0 0; letter-spacing: 0.12em; text-transform: uppercase;">SHAOXING SHICHENG TEXTILE PRODUCTS CO., LTD.</p>
        </div>
        <div style="text-align: right;">
          <p style="font-size: 11px; color: #9ca3af; margin: 0;">面料卡编号</p>
          <p style="font-size: 14px; color: #374151; font-weight: 600; margin: 4px 0 0 0;">NO.${idLabel}</p>
        </div>
      </div>

      <div style="margin-bottom: 28px; padding-right: 140px;">
        <h2 style="font-size: 24px; font-weight: bold; color: #1f2937; margin: 0 0 8px 0;">${name}</h2>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">${composition}</p>
      </div>

      <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 22px; padding-right: 140px;">
        <h3 style="font-size: 12px; font-weight: 600; color: #374151; margin: 0 0 16px 0; letter-spacing: 0.5px;">规格参数</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px;">
            <span style="font-size: 13px; color: #6b7280;">⚖️ 克重</span>
            <span style="font-size: 14px; font-weight: 600; color: #1f2937;">${fabric.weight} g/m²</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px;">
            <span style="font-size: 13px; color: #6b7280;">📏 门幅</span>
            <span style="font-size: 14px; font-weight: 600; color: #1f2937;">${fabric.width} cm</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px;">
            <span style="font-size: 13px; color: #6b7280;">📦 库存状态</span>
            <span style="font-size: 14px; font-weight: 600; color: ${stockColor};">${stockStatus}</span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: white; border-radius: 8px;">
            <span style="font-size: 13px; color: #6b7280;">👕 适用场景</span>
            <span style="font-size: 14px; font-weight: 600; color: #1f2937;">T恤、卫衣、运动服</span>
          </div>
        </div>
      </div>

      ${
        description
          ? `
      <div style="margin-bottom: 22px; padding-right: 140px;">
        <h3 style="font-size: 12px; font-weight: 600; color: #374151; margin: 0 0 12px 0;">产品描述</h3>
        <p style="font-size: 13px; color: #4b5563; line-height: 1.6; margin: 0; white-space: pre-wrap;">${description}</p>
      </div>
      `
          : ""
      }

      <div style="position: absolute; right: 76px; top: 50%; transform: translateY(-50%); text-align: center;">
        <div style="background: #fff7ed; padding: 16px; border-radius: 12px; display: inline-block;">
          <img src="${qrApiUrlAttr}" alt="" crossorigin="anonymous" style="width: 80px; height: 80px; display: block; margin: 0 auto;" />
          <p style="font-size: 11px; color: #6b7280; margin: 8px 0 0 0;">扫码查看详情</p>
          <p style="font-size: 9px; color: #9ca3af; margin: 4px 0 0 0; word-break: break-all; max-width: 100px;">${escHtml(shortHost)}</p>
        </div>
      </div>

      <div style="position: absolute; bottom: 76px; left: 76px; right: 76px; border-top: 2px solid ${BRAND_ORANGE}; padding-top: 16px;">
        <h4 style="font-size: 13px; font-weight: 600; color: #374151; margin: 0 0 8px 0;">绍兴诗橙纺织品有限公司</h4>
        <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px 0;">📍 浙江省绍兴市柯桥区</p>
        <p style="font-size: 11px; color: #6b7280; margin: 0;">📞 +86 13867550307 / +86 13867557317 / +86 13989587635  &nbsp;|&nbsp;  ✉️ folenchen0401@outlook.com</p>
      </div>
    </div>
  `;

  document.body.appendChild(element);

  const root = element.firstElementChild as HTMLElement | null;
  const qrImg = root?.querySelector("img");
  if (qrImg) {
    await new Promise<void>((resolve) => {
      const timer = window.setTimeout(resolve, 8000);
      const finish = () => {
        window.clearTimeout(timer);
        resolve();
      };
      if (qrImg.complete && qrImg.naturalWidth > 0) {
        finish();
        return;
      }
      qrImg.onload = finish;
      qrImg.onerror = finish;
    });
  }

  await new Promise((r) => setTimeout(r, 300));

  try {
    const canvas = await html2canvas(element.firstElementChild as HTMLElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      width: 794,
      height: 1123,
      imageTimeout: 5000,
    });

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
    pdf.save(`绍兴诗橙纺织品面料卡-${safePdfFileName(fabric.name)}.pdf`);
  } finally {
    document.body.removeChild(element);
  }
}
