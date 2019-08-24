export class LocalDraftContainer {
  public state = {
    drafts: new Set()
  };

  public setState = <T>(state: T) => {
    const updater = (prevState: T): T => Object.assign({}, prevState, state);
    return updater;
  };

  public addDraft = (x: any): void => {
    this.setState<any>((state: any) => {
      let drafts = state.set(x);
      return {
        drafts
      };
    });
  };
}
