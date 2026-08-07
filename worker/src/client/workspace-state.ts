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

export const workspaceToken = undefined;

export interface MarkdownImport {
  title: string;
  content: string;
}

let cachedGroups: GroupSummary[] | null = null;
let groupsRequest: Promise<GroupSummary[]> | null = null;

export function getCachedGroups() {
  return cachedGroups ?? [];
}

export function publishGroups(groups: GroupSummary[]) {
  cachedGroups = groups;
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
