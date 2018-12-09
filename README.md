# fastify-datadog

[![npm version](https://badge.fury.io/js/fastify-datadog.svg)](https://badge.fury.io/js/fastify-datadog) [![Build Status](https://travis-ci.org/herrmannplatz/fastify-datadog.svg?branch=master)](https://travis-ci.org/herrmannplatz/fastify-datadog)

> 🐶 [https://www.datadoghq.com](Datadog) plugin for fastify. Incluenced by [https://github.com/AppPress/node-connect-datadog](node-connect-datadog)

## Install
```
$ npm install fastify-datadog
```

## Usage

```js
fastify.register(require('fastify-datadog'), {})
```

## Options

* `dogstatsd` DogStatsD client.
* `stat` *string* name for the stat. `default = "node.express.router"`
* `tags` *array* of tags to be added to the histogram. `default = []`
* `path` *boolean* include path tag. `default = false`
* `method` *boolean* include http method tag. `default = false`
* `responseCode` *boolean* include http response codes. `default = false`
