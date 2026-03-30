export type Fabric = {
  id: number;
  name: string;
  composition: string;
  weight: number;
  width: number;
  tags: string[];
  textureImage: string;
  sceneImage: string;
  description: string;
};

export const fabrics: Fabric[] = [
  {
    id: 1,
    name: "32S精梳棉氨纶",
    composition: "95%棉 5%氨纶",
    weight: 180,
    width: 170,
    tags: ["现货", "T恤首选", "柔软弹力"],
    textureImage:
      "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80",
    sceneImage:
      "https://images.unsplash.com/photo-1521572163474-6864f6cf17ab?w=800&q=80",
    description: "手感像洗过的旧T恤，回弹好，适合做修身款",
  },
  {
    id: 2,
    name: "40S纯棉汗布",
    composition: "100%精梳棉",
    weight: 160,
    width: 175,
    tags: ["基础款", "透气", "本白现货"],
    textureImage:
      "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80",
    sceneImage:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&q=80",
    description: "轻薄透气，夏日白T的最佳选择",
  },
  {
    id: 3,
    name: "涤棉空气层",
    composition: "65%涤纶 35%棉",
    weight: 260,
    width: 165,
    tags: ["挺括", "卫衣面料", "保暖"],
    textureImage:
      "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=800&q=80",
    sceneImage:
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800&q=80",
    description: "空气层结构，挺括有型，做卫衣卫裤显质感",
  },
];
