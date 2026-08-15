import type { GroupSummary } from "./api.js";

export function sortedGroups(groups: GroupSummary[]) {
  return [...groups].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}
