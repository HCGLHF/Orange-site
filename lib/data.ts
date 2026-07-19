export type Fabric = {
  id: string;
  name: string;
  composition: string;
  weight: number;
  width: number;
  widthLabel?: string;
  weightLabel?: string;
  tags: string[];
  textureImage: string;
  sceneImage: string;
  description: string;
  stockStatus?: string;
  scenarios?: string[];
  images?: string[];
  notionPageId?: string;
  articleNumber?: string;
  series?: string;
};

export const finishedFabricInquiryOptions = [
  { id: "finished-range", name: "Specific finished-fabric article" },
  { id: "finished-air-layer", name: "Air-layer finished knit fabric" },
  { id: "finished-yarn-dyed-wool", name: "Yarn-dyed wool-blend air-layer fabric" },
  { id: "finished-structured", name: "Structured polyester-viscose knit fabric" },
  { id: "finished-faux-cashmere", name: "Faux-cashmere finished knit fabric" },
  { id: "finished-acrylic-wool", name: "Acrylic-wool finished knit fabric" },
  { id: "finished-lyocell-acetate", name: "Lyocell-acetate-wool finished knit fabric" },
  { id: "finished-brushed", name: "Brushed or raised-pile finished knit fabric" },
  { id: "finished-cashmere", name: "Cashmere-blend finished knit fabric" },
  { id: "finished-jacquard", name: "Wool-blend jacquard finished knit fabric" },
  { id: "greige-fabric", name: "Greige fabric requirement" },
  { id: "finished-garment", name: "Finished garment requirement" },
] as const;
