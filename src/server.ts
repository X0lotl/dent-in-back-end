import fastify from "fastify";
import axios from "axios";
import { Token } from "./models/token-model";
import { Appointment } from "./models/appointment-model";
import cors from "@fastify/cors";
import { SendSMSResponse } from "./models/sms-model";
import { SMSStatus } from "./models/sms-status-model";

require("dotenv").config();

const server = fastify();

server.register(cors);

const PORT = process.env.PORT || 3001;
const BASE_URL = process.env.BASE_URL as string;
const BASIC_TOKEN = process.env.BASIC_TOKEN as string;
const USERNAME = process.env.USERNAME as string;
const PASSWORD = process.env.PASSWORD as string;
const PHONE_NUMBER = process.env.PHONE_NUMBER || 380504408392;
const DISTRIBUTION_ID = process.env.DESTRIBUTION_ID || 4574415;
const HOST = process.env.HOST as string;

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

const checkSMSStatus = async (
  accessToken: string,
  sendSMSResoponse: SendSMSResponse
) => {
  try {
    const response = (await axios({
      method: "GET",
      url: `${BASE_URL}/communication-event/api/communicationManagement/v2/communicationMessage/status`,
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        Authorization: `bearer ${accessToken}`,
      },
      params: {
        messageId: sendSMSResoponse.data[0].id,
      },
    })) as SMSStatus;

    return response;
  } catch (err) {
    console.error(err);
  }
};

const sendSMS = async (accessToken: string, appointment: Appointment) => {
  try {
    const response = (await axios({
      method: "POST",
      url: `${BASE_URL}/communication-event/api/communicationManagement/v2/communicationMessage/send`,
      headers: {
        "Content-Type": "application/json",
        Accept: "*/*",
        Authorization: `bearer ${accessToken}`,
      },
      data: {
        content: `Нове заповнення форми.\nІмʼя: ${appointment.name}\nНомер телефону: ${appointment.phone}\nEmail: ${appointment.email}\nКоментар: ${appointment.comment}`,
        type: "SMS",
        receiver: [
          {
            id: PHONE_NUMBER as number,
            phoneNumber: PHONE_NUMBER as string,
          },
        ],
        sender: {
          id: "Dent-In",
        },
        characteristic: [
          {
            name: "DISTRIBUTION.ID",
            value: DISTRIBUTION_ID as number,
          },
          {
            name: "VALIDITY.PERIOD",
            value: "000000003000000R", // 30 min
          },
        ],
      },
    })) as SendSMSResponse;

    return response;
  } catch (err) {
    console.error("Sending sms error: " + err);
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
          if (response?.data[0].status == "ACCEPTED") {
            reply.status(200).send("SMS_SENDED");
          } else {
            console.log("ERROR 1")
            reply.status(500).send("ERROR_WITH_SMS_RESPONSE");
          }
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
});

server.listen({ port: PORT as number, host: HOST }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
