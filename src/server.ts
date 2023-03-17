import fastify from "fastify";
import axios from "axios";

require("dotenv").config();

const server = fastify();

const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL as string;
const BASIC_TOKEN = process.env.BASIC_TOKEN as string;
const USERNAME = process.env.USERNAME as string;
const PASSWORD = process.env.PASSWORD as string;

const getToken = async () => {
  axios
    .post(`${BASE_URL}/uaa/oauth/token`, null, {
      params: {
        'grant_type': 'password',
        'username': USERNAME,
        'password': PASSWORD,
      },
      headers: {
        authorization: `Basic ${BASIC_TOKEN}`,
      },
    })
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((err) => console.log(err));
};

server.get("/ping", async (request, reply) => {
  return "pong\n";
});

server.post("/sms", async (request, reply) => {
  // console.log(request.body);

  getToken()

  return "Ura";
});

server.listen({ port: PORT as number }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
