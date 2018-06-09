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

global.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
}
