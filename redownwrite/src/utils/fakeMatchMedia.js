const fakeMedia = {
  matchMedia: () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {}
  })
}

export default fakeMedia
