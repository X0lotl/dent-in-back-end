import fastify from 'fastify'
import { request } from 'http';
require('dotenv').config();

const server = fastify()

const PORT = process.env.PORT || 3001;

server.get('/ping', async (request, reply) => {
  return 'pong\n';
})

server.get('/', async (request, reply) => {
  return request.body;
} )

server.listen({ port: PORT as number}, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})