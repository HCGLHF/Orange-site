import type { Config } from "tailwindcss";

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
  plugins: [],
};
export default config;
