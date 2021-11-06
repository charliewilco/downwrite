import { useCallback } from "react";
import { useRouter } from "next/router";
import { ContentState, EditorState, convertToRaw } from "draft-js";
import { draftjsToMd } from "draftjs-md-converter";
import { useNotifications, NotificationType } from "@reducers/app";
import { dwClient } from "@lib/client";

export interface INewEditorValues {
  title: string;
}

export function useNewEntry() {
  const [, actions] = useNotifications();
  const router = useRouter();

  const onSubmit = useCallback(
    async (title: string, editorState: EditorState) => {
      const ContentState: ContentState = editorState.getCurrentContent();
      const state = convertToRaw(ContentState);
      const content = draftjsToMd(state);

      await dwClient
        .CreateEntry({
          title,
          content
        })
        .then((data) => {
          if (!!data) {
            router.push(`/${data.createEntry?.id}/edit`);
          }
        })
        .catch((err) =>
          actions.addNotification(err.message, NotificationType.ERROR)
        );
    },
    [actions]
  );

  return [onSubmit] as const;
}
