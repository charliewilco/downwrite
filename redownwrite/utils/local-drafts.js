export default class LocalDraftContainer {
  state = {
    drafts: new Set()
  }

  addDraft = x =>
    this.setState(prevState => {
      let drafts = prevState.set(x)
      return {
        drafts
      }
    })
}
