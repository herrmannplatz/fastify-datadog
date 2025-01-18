# fastify-datadog

![CI](https://github.com/herrmannplatz/fastify-datadog/actions/workflows/release.yaml/badge.svg)
[![npm version](https://badge.fury.io/js/fastify-datadog.svg)](https://badge.fury.io/js/fastify-datadog) [![neostandard javascript style](https://img.shields.io/badge/code_style-neostandard-brightgreen?style=flat)](https://github.com/neostandard/neostandard)

> 🐶 [Datadog](https://www.datadoghq.com) plugin for fastify. Influenced by [node-connect-datadog](https://github.com/AppPress/node-connect-datadog)

## Install
```
$ npm install fastify-datadog
```

## Usage

```js
const StatsD = require('hot-shots')

fastify.register(require('fastify-datadog'), {
  dogstatsd: new StatsD()
})
```

## Options

* `dogstatsd` DogStatsD client.
* `stat` *string* name for the stat. `default = "node.fastify.router"`
* `tags` *array* of tags to be added to the histogram. `default = []`
* `path` *boolean* include path tag. `default = false`
* `method` *boolean* include http method tag. `default = false`
* `responseCode` *boolean* include http response codes. `default = false`
