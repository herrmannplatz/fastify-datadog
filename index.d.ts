/// <reference types="node" />

import { FastifyPlugin } from 'fastify';
import { StatsD } from 'hot-shots';

export interface FastifyDatadogOptions {
  dogstatsd: StatsD
  stat?: string
  tags?: string[]
  method?: boolean
  path?: boolean
  responseCode?: boolean
}

declare const fastifyDatadog: FastifyPlugin<FastifyDatadogOptions>;

export default fastifyDatadog;
