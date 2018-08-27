export class LocalDraftContainer {
  state = {
    drafts: new Set()
  }

  setState = () => {
    return () => void
  }

  addDraft = x =>
    this.setState(prevState => {
      let drafts = prevState.set(x)
      return {
        drafts
      }
    })
}
