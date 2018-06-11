export default (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)))
