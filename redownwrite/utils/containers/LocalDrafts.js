import { Container } from 'unstated'

export default class LocalDraftContainer extends Container {
  state = {
    drafts: new Set()
  }

  addDraft = x => this.setState({})
}
