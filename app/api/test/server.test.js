const server = require('../src/server')

const mock = jest.fn()
const req = {}

const requestDefaults = {
	method: 'GET',
	url: '/posts',
	payload: {}
}

describe('Server Endpoints Perform', () => {
	it('GET | status code is 400', () => {
		const request = Object.assign({}, requestDefaults)

		server.inject(request).then(r => expect(r.statusCode).isEqual(400))
	})
})
