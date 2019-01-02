export class LocalDraftContainer {
  state = {
    drafts: new Set()
  };

  setState = <T>(state: T) => {
    const updater = (prevState: T): T => Object.assign({}, prevState, state);
    return updater;
  };

  addDraft = (x: any): void => {
    this.setState<any>((state: any) => {
      let drafts = state.set(x);
      return {
        drafts
      };
    });
  };
}
