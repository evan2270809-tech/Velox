import { Workflow, Bot, LineChart, type LucideIcon } from "lucide-react";

export interface ServiceMeta {
  key: "automation" | "cost" | "strategy";
  icon: LucideIcon;
}

// Icon mapping only — copy lives in messages/{ko,en}.json under services.items[].
export const services: ServiceMeta[] = [
  { key: "automation", icon: Workflow },
  { key: "cost", icon: Bot },
  { key: "strategy", icon: LineChart },
];
