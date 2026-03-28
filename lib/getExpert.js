import { experts } from "./experts";

export function getExpertById(id) {
  return experts.find((e) => e.id === id);
}
