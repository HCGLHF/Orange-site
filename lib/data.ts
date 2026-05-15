export type Fabric = {
  id: string;
  name: string;
  composition: string;
  weight: number;
  width: number;
  tags: string[];
  textureImage: string;
  sceneImage: string;
  description: string;
  stockStatus?: string;
  scenarios?: string[];
  images?: string[];
  notionPageId?: string;
};

export const fabrics: Fabric[] = [
  {
    id: "1",
    name: "32S combed cotton spandex jersey",
    composition: "95% cotton / 5% spandex",
    weight: 180,
    width: 170,
    stockStatus: "In stock",
    tags: ["In stock", "T-shirt favorite", "Soft stretch"],
    textureImage: "",
    sceneImage: "",
    description: "Soft worn-in hand feel with reliable recovery for fitted tees.",
  },
  {
    id: "2",
    name: "40S pure cotton single jersey",
    composition: "100% combed cotton",
    weight: 160,
    width: 175,
    stockStatus: "In stock",
    tags: ["Basics", "Breathable", "Natural white in stock"],
    textureImage: "",
    sceneImage: "",
    description: "Light, breathable and clean for summer white tee programs.",
  },
  {
    id: "3",
    name: "Poly-cotton scuba air-layer knit",
    composition: "65% polyester / 35% cotton",
    weight: 260,
    width: 165,
    stockStatus: "Out of stock",
    tags: ["Structured", "Sweatshirt fabric", "Warm"],
    textureImage: "",
    sceneImage: "",
    description: "Structured air-layer knit with a stable body for hoodies.",
  },
];
