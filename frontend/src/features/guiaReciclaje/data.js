import { RefreshCw, Repeat, TrendingDown, Leaf, DollarSign, Users } from "lucide-react";

export const principles = [
  {
    number: "1",
    name: "Reciclar",
    description: "Convertir materiales usados en nuevos productos.",
    Icon: RefreshCw,
  },
  {
    number: "2",
    name: "Reutilizar",
    description: "Dar nueva vida a productos existentes sin modificarlos.",
    Icon: Repeat,
  },
  {
    number: "3",
    name: "Reducir",
    description: "Disminuir el consumo y generación de residuos.",
    Icon: TrendingDown,
  },
];

export const benefits = [
  {
    name: "Ambientales",
    description:
      "Menos contaminación, ahorro de agua y energía, y conservación de recursos naturales.",
    Icon: Leaf,
  },
  {
    name: "Económicos",
    description:
      "Generación de empleo en la industria del reciclaje y reducción de costos de producción.",
    Icon: DollarSign,
  },
  {
    name: "Sociales",
    description:
      "Un entorno más limpio y saludable para todos, así como comunidades con educación ambiental.",
    Icon: Users,
  },
];
