const express = require("express");
const axios = require("axios");
require("dotenv").config();
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT;
const jsonParser = bodyParser.json();

const URL = "https://api-gateway.kyivstar.ua/idp/oauth2/token";

// Function that get Token from kyivstar oauth2
async function getToken() {
  try {
    let res = await axios({
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      auth: {
        username: process.env.CLIENT_ID,
        password: process.env.CLIENT_SECRET,
      },
      data: { grant_type: "client_credentials" },
      url: URL,
    });

    return res.data;
  } catch (err) {
    console.error(err);
  }
}

// Function that send SMS with kyivstar api
async function sendSMS(token, data) {
  try {
    let res = await axios({
      method: "POST",
      url: "https://api-gateway.kyivstar.ua/mock/rest/v1beta/sms",
      headers: { Authorization: "Bearer " + token },
      data: {
        from: "messagedesk",
        to: "38 (067) 000-02-00",
        text: "Нове заповнення форми!",
      },
    });

    return res.data;
  } catch (err) {
    console.error(err);
  }
}

async function checkSMSStatus(token, smsID) {
  console.log(smsID);
  try {
    let res = await axios({
      method: "GET",
      url: `https://api-gateway.kyivstar.ua/mock/rest/v1beta/sms/${smsID}`,
      headers: { Authorization: "Bearer " + token },
    });

    return res.data;
  } catch (err) {
    console.error(err.code);
  }
}

app.post("/sms", jsonParser, (req, res) => {
  getToken().then((response) => {
    const token = response.access_token;

    sendSMS(token, req.body).then((smsResponse) => {
      const smsId = smsResponse.msgId;

      checkSMSStatus(token, smsId).then((smsStatusResponse) => {
        const smsStatus = smsStatusResponse.status;

        if (smsStatus === 'delivered') {
          res.status(200);
        }

        res.json(smsStatusResponse);
      });
    });
  });
});

app.listen(port, () => {
  console.log(`dent-in backend listening on port ${port}`);
});
