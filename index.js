'use strict'

const fp = require('fastify-plugin')
const startTimeSymbol = Symbol('startTime')

const fastifyDatadog = (fastify, {
  dogstatsd,
  stat = 'node.fastify.router',
  tags = [],
  method = false,
  path = false,
  responseCode = false
} = {}, done) => {
  if (dogstatsd == null) {
    throw new Error('Missing dogstatsd option.')
  }

  const now = () => {
    const [seconds, nanoseconds] = process.hrtime()
    return seconds * 1e3 + nanoseconds / 1e6
  }

  fastify.addHook('onRequest', (request, reply, next) => {
    request.raw[startTimeSymbol] = now()
    next()
  })

  fastify.addHook('onSend', (request, reply, payload, next) => {
    const { raw: req } = request

    const { context, raw: { statusCode } } = reply

    const { config: { url: route } } = context

    const statTags = [`route:${route}`, ...tags]

    if (method) {
      statTags.push(`method:${req.method.toLowerCase()}`)
    }

    if (path !== false) {
      statTags.push(`path:${req.url}`)
    }

    if (responseCode) {
      statTags.push(`response_code:${statusCode}`)
      dogstatsd.increment(`${stat}.response_code.${statusCode}`, 1, statTags)
      dogstatsd.increment(`${stat}.response_code.all`, 1, statTags)
    }

    dogstatsd.histogram(`${stat}.response_time`, now() - req[startTimeSymbol], 1, statTags)

    next()
  })

  done()
}

module.exports = fp(fastifyDatadog, {
  fastify: '3.x',
  name: 'fastify-datadog'
})
