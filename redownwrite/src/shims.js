//

global.window = {
  navigator: {
    onLine: false
  },
  location: {
    protocol: 'https:',
    host: 'downwrite.us',
    hash: ''
  },
  saveAs: {
    createElementNS: () => {}
  }
}

global.FileReader = class {
  constructor() {
    return {
      result: '',
      onload: () => {},
      readAsText: () => {}
    }
  }
}

global.factory = {
  createElementNS: () => {}
}

global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
}
global.navigator = {
  userAgent: ''
}
