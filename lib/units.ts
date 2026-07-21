import type { Unit } from "@prisma/client";

// Etiqueta corta de cada unidad para mostrar cantidades.
const UNIT_LABEL: Record<Unit, string> = {
  g: "g",
  kg: "kg",
  ml: "ml",
  l: "l",
  ud: "ud",
  cs: "cda",
  cc: "cdta",
  diente: "diente",
  lata: "lata",
  manojo: "manojo",
  al_gusto: "al gusto",
};

// Unidades que se pluralizan añadiendo "s" cuando la cantidad != 1.
const PLURALIZABLE: Unit[] = ["ud", "cs", "cc", "diente", "lata", "manojo"];

/** Formatea una cantidad + unidad de forma legible: "200 g", "2 dientes", "al gusto". */
export function formatQuantity(quantity: number, unit: Unit): string {
  if (unit === "al_gusto") return "al gusto";
  const qty = Number.isInteger(quantity) ? String(quantity) : quantity.toFixed(1);
  let label = UNIT_LABEL[unit];
  if (quantity !== 1 && PLURALIZABLE.includes(unit)) label += "s";
  return `${qty} ${label}`;
}
