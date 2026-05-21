/** Whether this role may post/manage owner listings (quick capability until a dedicated field exists). */
export function userCanList(role: string): boolean {
  return role === "OWNER" || role === "BROKER" || role === "ADMIN";
}

export function profileNeedsCompletion(name: string | null | undefined): boolean {
  return !name?.trim();
}
