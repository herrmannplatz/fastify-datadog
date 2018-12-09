const fp = require('fastify-plugin')
const startTimeSymbol = Symbol('startTime')

const fastifyDatadog = (fastify, {
  dogstatsd,
  stat = 'node.fastify.router',
  tags = [],
  method = false,
  path = false,
  responseCode = false
} = {}, next) => {
  if (dogstatsd == null) {
    throw new Error('Missing dogstatsd option.')
  }

  fastify.addHook('onRequest', (req, reply, next) => {
    req[startTimeSymbol] = now()
    next()
  })

  fastify.addHook('onSend', ({ raw: request }, reply, payload, next) => {
    const { context, res: { statusCode } } = reply
    const { config: { url: route } } = context

    var statTags = [`route:${route}`, ...tags]

    if (method) {
      statTags.push(`method:${request.method.toLowerCase()}`)
    }

    if (path !== false) {
      statTags.push(`path:${request.url}`)
    }

    if (responseCode) {
      statTags.push(`response_code:${statusCode}`)
      dogstatsd.increment(`${stat}.response_code.${statusCode}`, 1, statTags)
      dogstatsd.increment(`${stat}.response_code.all`, 1, statTags)
    }

    dogstatsd.histogram(`${stat}.response_time`, now() - request[startTimeSymbol], 1, statTags)

    next()
  })

  const now = () => {
    const [seconds, nanoseconds] = process.hrtime()
    return seconds * 1e3 + nanoseconds / 1e6
  }

  next()
}

module.exports = fp(fastifyDatadog, {
  fastify: '>=1.0.0',
  name: 'fastify-datadog'
})
