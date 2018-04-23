//

global.window = {
  addEventListener: () => {},
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
  },
  matchMedia: () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {}
  })
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
