const server = require('../src/server')

const mock = jest.fn()
const req = {}

const requestDefaults = {
  method: 'GET',
  url: '/posts',
  payload: {}
}

describe('Server Endpoints Perform', () => {
  it('GET | status code is 400', async () => {
    const request = Object.assign({}, requestDefaults)

    const response = await server.inject(request)

    expect(response.statusCode).isEqual(400)
  })

  it('GET | PREVIEW | status code is 200 on a public post', async () => {
    const request = Object.assign(
      {},
      {
        method: 'GET',
        url: '/posts/preview/aa3dd293-2a0e-478c-81e7-a0b9733e8b'
      }
    )

    const response = await server.inject(request)

    expect(response.statusCode).isEqual(200)
  })
})
