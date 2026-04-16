import { experts } from "./experts";

const expertMap = new Map(experts.map((e) => [e.id, e]));

export function getExpertById(id) {
  return expertMap.get(id) || null;
}
