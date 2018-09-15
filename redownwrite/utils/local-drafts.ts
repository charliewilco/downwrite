export class LocalDraftContainer {
  state = {
    drafts: new Set()
  };

  setState = state => {
    return prevState => Object.assign({}, prevState, state);
  };

  addDraft = x =>
    this.setState(state => {
      let drafts = state.set(x);
      return {
        drafts
      };
    });
}
