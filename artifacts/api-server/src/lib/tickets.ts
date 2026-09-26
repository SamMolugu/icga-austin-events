import { randomBytes } from "node:crypto";

export function createTicketCode(): string {
  return `ICGA-${randomBytes(3).toString("hex").toUpperCase()}`;
}
