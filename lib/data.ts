export type Fabric = {
  /** 展示/购物车主键：本地示例为 "1"…；Notion 来源为页面 UUID */
  id: string;
  name: string;
  composition: string;
  weight: number;
  width: number;
  tags: string[];
  textureImage: string;
  sceneImage: string;
  description: string;
  /** Notion「工艺故事」；本地示例可省略 */
  craftStory?: string;
  stockStatus?: string;
  scenarios?: string[];
  images?: string[];
  /** Notion 面料页 id（与 `id` 在 Notion 数据上相同；本地示例无） */
  notionPageId?: string;
};

export const fabrics: Fabric[] = [
  {
    id: "1",
    name: "32S精梳棉氨纶",
    composition: "95%棉 5%氨纶",
    weight: 180,
    width: 170,
    tags: ["现货", "T恤首选", "柔软弹力"],
    textureImage: "",
    sceneImage: "",
    description: "手感像洗过的旧T恤，回弹好，适合做修身款",
  },
  {
    id: "2",
    name: "40S纯棉汗布",
    composition: "100%精梳棉",
    weight: 160,
    width: 175,
    tags: ["基础款", "透气", "本白现货"],
    textureImage: "",
    sceneImage: "",
    description: "轻薄透气，夏日白T的最佳选择",
  },
  {
    id: "3",
    name: "涤棉空气层",
    composition: "65%涤纶 35%棉",
    weight: 260,
    width: 165,
    tags: ["挺括", "卫衣面料", "保暖"],
    textureImage: "",
    sceneImage: "",
    description: "空气层结构，挺括有型，做卫衣显质感",
  },
];
