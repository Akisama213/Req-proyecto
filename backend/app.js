'use strict'

const path = require('path');
const AutoLoad = require('@fastify/autoload');
const fileUpload = require('fastify-file-upload');

module.exports = async function (fastify, opts) {
  fastify.register(require('@fastify/postgres'), {
    connectionString: 'postgresql://req:8Lw3JYo25WW4c5D8@127.0.0.1:5432/requerimentos'
  })

  fastify.register(require('@fastify/cors'), { 
    origin: true
  })

  fastify.register(fileUpload);

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: Object.assign({}, opts)
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({}, opts)
  })
}
