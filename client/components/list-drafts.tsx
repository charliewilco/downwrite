import * as React from "react";

interface LocalDraftTypes {
  drafts: any[];
}

export default class extends React.Component<void, LocalDraftTypes> {
  public readonly state: LocalDraftTypes = {
    drafts: []
  };

  private searchLocalStorage = () => {
    return localStorage.forEach(
      (item: any, iterator: number) =>
        localStorage.key(iterator).includes("Draft") && item
    );
  };

  public componentDidMount(): void {
    let storage = this.searchLocalStorage();

    return storage.forEach((item: any) => item);
  }

  public render(): JSX.Element {
    return <span>I should be a list and i'm not</span>;
  }
}
