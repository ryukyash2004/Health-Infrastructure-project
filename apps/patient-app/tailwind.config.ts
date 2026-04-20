import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-red': '#ff3b30',
        'brand-blue': '#007aff',
        'ios-gray': '#f2f2f7',
      },
    },
  },
  plugins: [],
};
export default config;
