import type { Goal } from "@prisma/client";

// Etiquetas de objetivo (sin "server-only": se usan también en cliente).
export const GOALS: Goal[] = ["PERDER_PESO", "MANTENER", "GANAR_MUSCULO"];

export const GOAL_LABEL: Record<Goal, string> = {
  PERDER_PESO: "Perder peso",
  MANTENER: "Equilibrado",
  GANAR_MUSCULO: "Ganar músculo",
};

// Una línea, tono de marca (cálido, sin jerga clínica).
export const GOAL_HELP: Record<Goal, string> = {
  PERDER_PESO: "Platos más ligeros y con proteína, para no pasar hambre.",
  MANTENER: "Comida equilibrada; solo quiero ver las calorías.",
  GANAR_MUSCULO: "Raciones completas y con más proteína.",
};
