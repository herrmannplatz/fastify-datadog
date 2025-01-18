'use strict'

const { StatsD } = require('hot-shots')

const fastify = require('fastify')()

fastify.register(require('..'), {
  dogstatsd: new StatsD(),
  tags: ['app:example'],
})

fastify.get('/', function handler (request, reply) {
  reply.send({ hello: 'world' })
})

fastify.listen({ port: 3000 }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
