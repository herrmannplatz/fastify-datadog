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

  let dynamicTags = tags;
  fastify.addHook('onRequest', async (req, reply) => {
    req[startTimeSymbol] = now()
    if (typeof tags === 'function') {
      dynamicTags = tags(req);
    }
  })

  fastify.addHook('onSend', async (req, reply) => {
    const { context, statusCode } = reply

    const statTags = [`route:${context.config.url}`, ...dynamicTags]

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

  fastify.decorate('dogstatsd', dogstatsd)
}

module.exports = fp(fastifyDatadog, {
  fastify: '3.x',
  name: 'fastify-datadog'
})
