'use strict'

const fp = require('fastify-plugin')

const startTimeSymbol = Symbol('startTime')

async function fastifyDatadog (fastify, options = {}) {
  const {
    dogstatsd,
    stat = 'node.fastify.router',
    tags = [],
    method = false,
    path = false,
    responseCode = false
  } = options

  if (dogstatsd == null) {
    throw new Error('Missing dogstatsd option.')
  }

  const now = () => {
    const [seconds, nanoseconds] = process.hrtime()

    return seconds * 1e3 + nanoseconds / 1e6
  }

  fastify.addHook('onRequest', async (req, reply) => {
    req[startTimeSymbol] = now()
  })

  fastify.addHook('onSend', async (req, reply) => {
    const { statusCode } = reply

    const statTags = [`route:${req.routeOptions.config.url}`, ...tags]

    if (method) {
      statTags.push(`method:${req.method.toLowerCase()}`)
    }

    if (path) {
      statTags.push(`path:${req.url}`)
    }

    if (responseCode) {
      statTags.push(`response_code:${statusCode}`)
      dogstatsd.increment(`${stat}.response_code.${statusCode}`, 1, statTags)
      dogstatsd.increment(`${stat}.response_code.all`, 1, statTags)
    }

    const resposeTime = now() - req[startTimeSymbol]

    dogstatsd.histogram(`${stat}.response_time`, resposeTime, 1, statTags)
  })
}

module.exports = fp(fastifyDatadog, {
  fastify: '5.x',
  name: 'fastify-datadog'
})
