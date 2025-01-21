'use strict'

const { it, mock, describe, beforeEach, afterEach } = require('node:test')
const assert = require('node:assert')

const Fastify = require('fastify')
const fastifyDatatog = require('./index')

const dogstatsdMock = {
  increment: mock.fn(),
  histogram: mock.fn()
}

describe('fastify-datadog', () => {
  let fastify

  beforeEach(() => {
    fastify = Fastify()
  })

  afterEach(() => {
    fastify.close()
    dogstatsdMock.histogram.mock.resetCalls()
    dogstatsdMock.increment.mock.resetCalls()
  })

  it('should throw error if dogstatsd option is missing', async () => {
    await assert.rejects(
      async () => fastify.register(fastifyDatatog, { dogstatsd: undefined }),
      { message: 'Missing dogstatsd option.' }
    )
  })

  it('should track response time', async () => {
    fastify.register(fastifyDatatog, { dogstatsd: dogstatsdMock })

    fastify.get('/users/:id', async () => 200)

    await fastify.inject('/users/123456')

    assert.strictEqual(dogstatsdMock.histogram.mock.calls.length, 1)
    assert.strictEqual(dogstatsdMock.histogram.mock.calls[0].arguments[0], 'node.fastify.router.response_time')
    assert.strictEqual(dogstatsdMock.histogram.mock.calls[0].arguments[1] > 0, true)
    assert.strictEqual(dogstatsdMock.histogram.mock.calls[0].arguments[3][0], 'route:/users/:id')
  })

  it('should track method', async () => {
    fastify.register(fastifyDatatog, { dogstatsd: dogstatsdMock, method: true })

    fastify.get('/users/:id', async () => 200)

    await fastify.inject('/users/123456')

    assert.strictEqual(dogstatsdMock.histogram.mock.calls.length, 1)
    assert.strictEqual(dogstatsdMock.histogram.mock.calls[0].arguments[0], 'node.fastify.router.response_time')
    assert.strictEqual(dogstatsdMock.histogram.mock.calls[0].arguments[1] > 0, true)
    assert.strictEqual(dogstatsdMock.histogram.mock.calls[0].arguments[3][0], 'route:/users/:id')
    assert.strictEqual(dogstatsdMock.histogram.mock.calls[0].arguments[3][1], 'method:get')
  })

  it('should track response code', async () => {
    fastify.register(fastifyDatatog, { dogstatsd: dogstatsdMock, responseCode: true })

    fastify.get('/users/:id', async () => 200)

    await fastify.inject('/users/123456')

    assert.strictEqual(dogstatsdMock.histogram.mock.calls.length, 1)
    assert.strictEqual(dogstatsdMock.histogram.mock.calls[0].arguments[0], 'node.fastify.router.response_time')
    assert.strictEqual(dogstatsdMock.histogram.mock.calls[0].arguments[1] > 0, true)
    assert.strictEqual(dogstatsdMock.histogram.mock.calls[0].arguments[3][0], 'route:/users/:id')
    assert.strictEqual(dogstatsdMock.histogram.mock.calls[0].arguments[3][1], 'response_code:200')

    assert.strictEqual(dogstatsdMock.increment.mock.calls.length, 2)
    assert.strictEqual(dogstatsdMock.increment.mock.calls[0].arguments[0], 'node.fastify.router.response_code.200')
    assert.strictEqual(dogstatsdMock.increment.mock.calls[1].arguments[0], 'node.fastify.router.response_code.all')
  })

  it('should track method', async () => {
    fastify.register(fastifyDatatog, { dogstatsd: dogstatsdMock, path: true })

    fastify.get('/users/:id', async () => 200)

    await fastify.inject('/users/123456')

    assert.strictEqual(dogstatsdMock.histogram.mock.calls.length, 1)
    assert.strictEqual(dogstatsdMock.histogram.mock.calls[0].arguments[0], 'node.fastify.router.response_time')
    assert.strictEqual(dogstatsdMock.histogram.mock.calls[0].arguments[1] > 0, true)
    assert.strictEqual(dogstatsdMock.histogram.mock.calls[0].arguments[3][0], 'route:/users/:id')
    assert.strictEqual(dogstatsdMock.histogram.mock.calls[0].arguments[3][1], 'path:/users/123456')
  })
})
