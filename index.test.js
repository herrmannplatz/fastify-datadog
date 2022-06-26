/* eslint-env jest */
const Fastify = require('fastify')
const fastifyDatatog = require('./index')

const dogstatsdMock = {
  increment: jest.fn(),
  histogram: jest.fn()
}

describe('fastify-datadog', () => {
  let fastify

  beforeEach(() => {
    fastify = Fastify()
  })

  afterEach(() => {
    fastify.close()
    jest.clearAllMocks()
  })

  it('should throw error if dogstatsd option is missing', async () => {
    await expect(fastify.register(fastifyDatatog, { dogstatsd: undefined }))
      .rejects.toEqual(Error('Missing dogstatsd option.'))
  })

  it('should track response time', async () => {
    fastify.register(fastifyDatatog, { dogstatsd: dogstatsdMock })

    fastify.get('/users/:id', async () => 200)

    await fastify.inject('/users/123456')

    expect(dogstatsdMock.histogram.mock.calls.length).toEqual(1)
    expect(dogstatsdMock.histogram.mock.calls[0][0]).toEqual('node.fastify.router.response_time')
    expect(dogstatsdMock.histogram.mock.calls[0][1]).toBeGreaterThan(0)
    expect(dogstatsdMock.histogram.mock.calls[0][3][0]).toEqual('route:/users/:id')
  })

  it('should track method', async () => {
    fastify.register(fastifyDatatog, { dogstatsd: dogstatsdMock, method: true })

    fastify.get('/users/:id', async () => 200)

    await fastify.inject('/users/123456')

    expect(dogstatsdMock.histogram.mock.calls.length).toEqual(1)
    expect(dogstatsdMock.histogram.mock.calls[0][0]).toEqual('node.fastify.router.response_time')
    expect(dogstatsdMock.histogram.mock.calls[0][1]).toBeGreaterThan(0)
    expect(dogstatsdMock.histogram.mock.calls[0][3][0]).toEqual('route:/users/:id')
    expect(dogstatsdMock.histogram.mock.calls[0][3][1]).toEqual('method:get')
  })

  it('should track response code', async () => {
    fastify.register(fastifyDatatog, { dogstatsd: dogstatsdMock, responseCode: true })

    fastify.get('/users/:id', async () => 200)

    await fastify.inject('/users/123456')

    expect(dogstatsdMock.histogram.mock.calls.length).toEqual(1)
    expect(dogstatsdMock.histogram.mock.calls[0][0]).toEqual('node.fastify.router.response_time')
    expect(dogstatsdMock.histogram.mock.calls[0][1]).toBeGreaterThan(0)
    expect(dogstatsdMock.histogram.mock.calls[0][3][0]).toEqual('route:/users/:id')
    expect(dogstatsdMock.histogram.mock.calls[0][3][1]).toEqual('response_code:200')

    expect(dogstatsdMock.increment.mock.calls.length).toEqual(2)
    expect(dogstatsdMock.increment.mock.calls[0][0]).toEqual('node.fastify.router.response_code.200')
    expect(dogstatsdMock.increment.mock.calls[1][0]).toEqual('node.fastify.router.response_code.all')
  })

  it('should track method', async () => {
    fastify.register(fastifyDatatog, { dogstatsd: dogstatsdMock, path: true })

    fastify.get('/users/:id', async () => 200)

    await fastify.inject('/users/123456')

    expect(dogstatsdMock.histogram.mock.calls.length).toEqual(1)
    expect(dogstatsdMock.histogram.mock.calls[0][0]).toEqual('node.fastify.router.response_time')
    expect(dogstatsdMock.histogram.mock.calls[0][1]).toBeGreaterThan(0)
    expect(dogstatsdMock.histogram.mock.calls[0][3][0]).toEqual('route:/users/:id')
    expect(dogstatsdMock.histogram.mock.calls[0][3][1]).toEqual('path:/users/123456')
  })
})
