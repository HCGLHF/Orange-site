import type { Config } from "tailwindcss";
import type { PluginAPI } from "tailwindcss/types/config";

const fabricFlip3dUtilities = ({ addUtilities }: PluginAPI) => {
  addUtilities({
    ".perspective-1000": {
      perspective: "1000px",
    },
    ".transform-style-3d": {
      transformStyle: "preserve-3d",
    },
    ".backface-hidden": {
      backfaceVisibility: "hidden",
    },
    ".rotate-y-180": {
      transform: "rotateY(180deg)",
    },
  });
};

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#E07A5F",
          cream: "#FAF9F6",
          charcoal: "#3D405B",
          soft: "#F4E4DC",
        },
      },
    },
  },
  plugins: [fabricFlip3dUtilities],
};
export default config;
