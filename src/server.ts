import fastify from "fastify";
import axios from "axios";
import { Token } from "./models/token-model";
import { Appointment } from "./models/appointment-model";
import cors from "@fastify/cors";

require("dotenv").config();

const server = fastify();

server.register(cors);

const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL as string;
const BASIC_TOKEN = process.env.BASIC_TOKEN as string;
const USERNAME = process.env.USERNAME as string;
const PASSWORD = process.env.PASSWORD as string;
const PHONE_NUMBER = process.env.PHONE_NUMBER as string;
const DISTRIBUTION_ID = process.env.DESTRIBUTION_ID as string;

const getToken = async () => {
  try {
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/uaa/oauth/token`,
      params: {
        grant_type: "password",
        username: USERNAME,
        password: PASSWORD,
      },
      headers: {
        authorization: `Basic ${BASIC_TOKEN}`,
      },
    });

    return response.data as Token;
  } catch (err) {
    console.error(err);
  }
};

const sendSMS = async (accessToken: string, appointment: Appointment) => {
  try {
    const response = await axios({
      method: "POST",
      url: `${BASE_URL}/communication-event/api/communicationManagement/v2/communicationMessage/send`,
      headers: {
        "Content-Type": "application/json",
        Accept: '*/*',
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        content: `Нове заповнення форми.\nІмʼя: ${appointment.name}\nНомер телефону: ${appointment.phone}\nEmail: ${appointment.email}\nКоментар: ${appointment.comment}`,
        type: "SMS",
        receiver: [
          {
            id: 0,
            phoneNumber: PHONE_NUMBER,
          },
        ],
        sender: {
          id: "Dent-In",
        },
        characteristic: [
          {
            name: "DISTRIBUTION.ID",
            value: "Форма 2",
          },
          {
            name: "VALIDITY.PERIOD",
            value: "000000003000000R", // 30 min
          },
        ],
      },
    });

    console.log(response);

    return response;
  } catch (err:any) {
    console.error(err.code);
  }
};

server.get("/ping", async (request, reply) => {
  return "pong\n";
});

server.post("/sms", (request, reply) => {
  getToken()
    .then((token) => {
      const data = request.body as Appointment;

      sendSMS(token?.access_token as string, data)
        .then((response) => {
          reply.send(response);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

server.listen({ port: PORT as number }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
