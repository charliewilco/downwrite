import { useEffect, useState } from "preact/hooks";
import {
  createDocument,
  createGroup,
  deleteGroup,
  fetchGroups,
  positionDocument,
  updateDocument,
  updateGroup,
  type DocumentRecord,
  type GroupSummary,
} from "./api.js";
import type { MarkdownImport } from "./components/MarkdownImportDialog.js";

export const workspaceToken = undefined;

let cachedGroups: GroupSummary[] | null = null;
let groupsRequest: Promise<GroupSummary[]> | null = null;
const groupSubscribers = new Set<() => void>();

export function getCachedGroups() {
  return cachedGroups ?? [];
}

export function publishGroups(groups: GroupSummary[]) {
  cachedGroups = groups;
  for (const subscriber of groupSubscribers) {
    subscriber();
  }
}

export async function loadGroups() {
  if (cachedGroups) {
    return cachedGroups;
  }

  if (!groupsRequest) {
    groupsRequest = fetchGroups(workspaceToken).finally(() => {
      groupsRequest = null;
    });
  }

  const groups = await groupsRequest;
  publishGroups(groups);
  return groups;
}

export async function refreshGroups() {
  cachedGroups = null;
  return loadGroups();
}

export function useGroups(initialGroups?: GroupSummary[]) {
  const [groups, setGroups] = useState<GroupSummary[]>(
    initialGroups ?? getCachedGroups(),
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialGroups && !cachedGroups);

  async function refresh() {
    setLoading(true);
    setError(null);

    try {
      setGroups(await refreshGroups());
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Unknown API error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialGroups) {
      publishGroups(initialGroups);
    }

    const subscriber = () => setGroups(getCachedGroups());
    groupSubscribers.add(subscriber);

    void loadGroups()
      .then(setGroups)
      .catch((caught: unknown) => {
        setError(
          caught instanceof Error ? caught.message : "Unknown API error",
        );
      })
      .finally(() => setLoading(false));

    return () => {
      groupSubscribers.delete(subscriber);
    };
  }, []);

  return { error, groups, loading, refresh };
}

export function removeDocumentFromGroups(documentId: string) {
  publishGroups(
    getCachedGroups().map((group) => ({
      ...group,
      documents: group.documents.filter(
        (document) => document.id !== documentId,
      ),
    })),
  );
}

export function upsertDocumentInGroups(document: DocumentRecord) {
  publishGroups(
    getCachedGroups().map((group) =>
      group.id === document.groupId
        ? {
            ...group,
            documents: [
              {
                id: document.id,
                groupId: document.groupId,
                title: document.title,
                role: document.role,
                position: document.position,
                revision: document.revision,
                createdAt: document.createdAt,
                updatedAt: document.updatedAt,
              },
              ...group.documents.filter((item) => item.id !== document.id),
            ],
          }
        : {
            ...group,
            documents: group.documents.filter(
              (item) => item.id !== document.id,
            ),
          },
    ),
  );
}

export async function createDocumentInGroup(groupId: string) {
  const document = await createDocument(workspaceToken, groupId);
  upsertDocumentInGroups(document);
  void refreshGroups();
  return document;
}

export async function createGroupInCache(
  input: Pick<GroupSummary, "name" | "description" | "accentColor">,
) {
  const group = await createGroup(workspaceToken, input);
  publishGroups([group, ...getCachedGroups()]);
  void refreshGroups();
  return group;
}

export async function deleteGroupFromCache(groupId: string) {
  await deleteGroup(workspaceToken, groupId);
  publishGroups(getCachedGroups().filter((group) => group.id !== groupId));
  void refreshGroups();
}

export async function updateGroupInCache(
  groupId: string,
  input: Partial<Pick<GroupSummary, "name" | "description" | "accentColor">>,
) {
  const group = await updateGroup(workspaceToken, groupId, input);
  publishGroups(
    getCachedGroups().map((item) => (item.id === group.id ? group : item)),
  );
  void refreshGroups();
}

export async function positionDocumentAndRefresh(
  documentId: string,
  position: number,
  baseRevision: number,
) {
  await positionDocument(workspaceToken, documentId, {
    position,
    baseRevision,
  });
  await refreshGroups();
}

export async function importMarkdownFilesToGroup(
  groupId: string,
  imports: MarkdownImport[],
) {
  let lastImportedDocument: DocumentRecord | null = null;

  for (const item of imports) {
    const created = await createDocument(workspaceToken, groupId);
    const saved = await updateDocument(workspaceToken, created.id, {
      title: item.title,
      content: item.content,
      baseRevision: created.revision,
    });
    upsertDocumentInGroups(saved);
    lastImportedDocument = saved;
  }

  void refreshGroups();
  return lastImportedDocument;
}
