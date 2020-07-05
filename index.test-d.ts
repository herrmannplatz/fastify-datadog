import fastify from 'fastify';
import { StatsD } from 'hot-shots';
import datadogPlugin from '.';

const app1 = fastify();

app1.register(datadogPlugin, {
  dogstatsd: new StatsD()
});

const app2 = fastify();

app2.register(datadogPlugin, {
  dogstatsd: new StatsD(),
  stat: 'stat-test',
  tags: ['tag-1', 'tag-2'],
  method: true,
  path: true,
  responseCode: true
});
