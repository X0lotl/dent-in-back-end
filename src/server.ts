import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify'
import { Server, IncomingMessage, ServerResponse } from 'http'

const server: FastifyInstance = Fastify({})

const opts: RouteShorthandOptions = {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          pong: {
            type: 'string'
          }
        }
      }
    }
  }
}

server.get('/', (req, res) => {
  console.log(req);
  res.send(1);
})

server.get('/ping', opts, (request, reply) => {
  reply.send({ pong: 'it worked!' })
})

server.listen({ port: 3000 }, (err) => {
  if (err) {
    server.log.error(err)
    process.exit(1)
  }

  const address = server.server.address()
  const port = typeof address === 'string' ? address : address?.port

})