import type { ComponentType } from "react";
import {
  Baby,
  Briefcase,
  Circle,
  Home,
  Layers,
  Scissors,
  Shirt,
  Snowflake,
  Sparkles,
  Wind,
} from "lucide-react";

/** 场景关键词 → 图标 key / 颜色 key（与 ScenarioNav、FabricCard 共用） */
export const SCENARIO_KEYWORDS: Record<string, { icon: string; color: string }> =
  {
    T恤: { icon: "shirt", color: "blue" },
    卫衣: { icon: "layers", color: "purple" },
    运动: { icon: "wind", color: "cyan" },
    秋冬: { icon: "snowflake", color: "amber" },
    童装: { icon: "baby", color: "pink" },
    家居: { icon: "home", color: "green" },
    商务: { icon: "briefcase", color: "gray" },
    POLO: { icon: "shirt", color: "indigo" },
    连衣裙: { icon: "sparkles", color: "rose" },
    外套: { icon: "layers", color: "orange" },
    夹克: { icon: "layers", color: "red" },
    内衣: { icon: "scissors", color: "teal" },
    休闲: { icon: "circle", color: "slate" },
  };

export type ScenarioColorConfig = {
  text: string;
  bg: string;
  active: string;
};

export const SCENARIO_COLOR_MAP: Record<string, ScenarioColorConfig> = {
  blue: {
    text: "text-blue-600",
    bg: "bg-blue-50 hover:bg-blue-100",
    active: "bg-blue-500 shadow-md shadow-blue-200/60",
  },
  purple: {
    text: "text-purple-600",
    bg: "bg-purple-50 hover:bg-purple-100",
    active: "bg-purple-500 shadow-md shadow-purple-200/60",
  },
  cyan: {
    text: "text-cyan-600",
    bg: "bg-cyan-50 hover:bg-cyan-100",
    active: "bg-cyan-500 shadow-md shadow-cyan-200/60",
  },
  amber: {
    text: "text-amber-600",
    bg: "bg-amber-50 hover:bg-amber-100",
    active: "bg-amber-500 shadow-md shadow-amber-200/60",
  },
  pink: {
    text: "text-pink-600",
    bg: "bg-pink-50 hover:bg-pink-100",
    active: "bg-pink-500 shadow-md shadow-pink-200/60",
  },
  green: {
    text: "text-green-600",
    bg: "bg-green-50 hover:bg-green-100",
    active: "bg-green-500 shadow-md shadow-green-200/60",
  },
  gray: {
    text: "text-gray-600",
    bg: "bg-gray-50 hover:bg-gray-100",
    active: "bg-gray-500 shadow-md shadow-gray-200/60",
  },
  indigo: {
    text: "text-indigo-600",
    bg: "bg-indigo-50 hover:bg-indigo-100",
    active: "bg-indigo-500 shadow-md shadow-indigo-200/60",
  },
  rose: {
    text: "text-rose-600",
    bg: "bg-rose-50 hover:bg-rose-100",
    active: "bg-rose-500 shadow-md shadow-rose-200/60",
  },
  orange: {
    text: "text-orange-600",
    bg: "bg-orange-50 hover:bg-orange-100",
    active: "bg-orange-500 shadow-md shadow-orange-200/60",
  },
  red: {
    text: "text-red-600",
    bg: "bg-red-50 hover:bg-red-100",
    active: "bg-red-500 shadow-md shadow-red-200/60",
  },
  teal: {
    text: "text-teal-600",
    bg: "bg-teal-50 hover:bg-teal-100",
    active: "bg-teal-500 shadow-md shadow-teal-200/60",
  },
  slate: {
    text: "text-slate-600",
    bg: "bg-slate-50 hover:bg-slate-100",
    active: "bg-slate-500 shadow-md shadow-slate-200/60",
  },
};

export const SCENARIO_ICON_MAP: Record<
  string,
  ComponentType<{ className?: string }>
> = {
  shirt: Shirt,
  baby: Baby,
  wind: Wind,
  snowflake: Snowflake,
  home: Home,
  briefcase: Briefcase,
  sparkles: Sparkles,
  layers: Layers,
  scissors: Scissors,
  circle: Circle,
};

export function detectScenario(scenarioName: string): {
  icon: string;
  color: string;
} {
  for (const [keyword, config] of Object.entries(SCENARIO_KEYWORDS)) {
    if (scenarioName.includes(keyword)) {
      return config;
    }
  }
  const hash = scenarioName
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = Object.keys(SCENARIO_COLOR_MAP);
  const color = colors[hash % colors.length] ?? "slate";
  return { icon: "sparkles", color };
}

/** 导航条里的 `bg` 常带 `hover:*`，卡片标签只保留底色 */
export function scenarioChipBackground(navBg: string): string {
  return navBg.split(/\s+/).filter((c) => !c.startsWith("hover:")).join(" ");
}
