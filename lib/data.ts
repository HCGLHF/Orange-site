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

const TEXTURE_PLACEHOLDER =
  "https://placehold.co/600x600/FAF9F6/E07A5F?text=面料纹理+待上传";
const SCENE_PLACEHOLDER =
  "https://placehold.co/600x600/F4E4DC/3D405B?text=成衣效果+待展示";

export const fabrics: Fabric[] = [
  {
    id: 1,
    name: "32S精梳棉氨纶",
    composition: "95%棉 5%氨纶",
    weight: 180,
    width: 170,
    tags: ["现货", "T恤首选", "柔软弹力"],
    textureImage: TEXTURE_PLACEHOLDER,
    sceneImage: SCENE_PLACEHOLDER,
    description: "手感像洗过的旧T恤，回弹好，适合做修身款",
  },
  {
    id: 2,
    name: "40S纯棉汗布",
    composition: "100%精梳棉",
    weight: 160,
    width: 175,
    tags: ["基础款", "透气", "本白现货"],
    textureImage: TEXTURE_PLACEHOLDER,
    sceneImage: SCENE_PLACEHOLDER,
    description: "轻薄透气，夏日白T的最佳选择",
  },
  {
    id: 3,
    name: "涤棉空气层",
    composition: "65%涤纶 35%棉",
    weight: 260,
    width: 165,
    tags: ["挺括", "卫衣面料", "保暖"],
    textureImage: TEXTURE_PLACEHOLDER,
    sceneImage: SCENE_PLACEHOLDER,
    description: "空气层结构，挺括有型，做卫衣显质感",
  },
];
