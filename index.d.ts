/// <reference types="node" />

import { FastifyPluginCallback } from 'fastify'
import { StatsD } from 'hot-shots'

export interface FastifyDatadogOptions {
  dogstatsd: StatsD
  stat?: string
  tags?: string[]
  method?: boolean
  path?: boolean
  responseCode?: boolean
}

declare const fastifyDatadog: FastifyPluginCallback<FastifyDatadogOptions>

export default fastifyDatadog
