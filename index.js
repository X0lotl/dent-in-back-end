const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
const port = process.env.PORT;
const jsonParser = bodyParser.json();

const URL = "https://api-gateway.kyivstar.ua/idp/oauth2/token";

async function getToken() {
  try {
    let res = await axios({
      method: "POST",
      url: process.env.TOKEN_URL,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      auth: {
        username: process.env.CLIENT_ID,
        password: process.env.CLIENT_SECRET,
      },
      data: { grant_type: "client_credentials" },
    });

    return res.data;
  } catch (err) {
    console.error(err);
  }
}

async function sendSMS(token, data) {
  try {
    console.log(data);
    let res = await axios({
      method: "POST",
      url: process.env.API_URL,
      headers: { Authorization: "Bearer " + token },
      data: {
        from: process.env.FROM_NAME,
        to: process.env.PHONE_NUMBER,
        text: `Нове заповнення форми.\nІмʼя: ${data.name}\nНомер телефону: ${data.phone}\nEmail: ${data.email}\nКоментар: ${data.comment}`,
      },
    });

    return res.data;
  } catch (err) {
    console.error(err);
  }
}

async function checkSMSStatus(token, smsID) {
  try {
    let res = await axios({
      method: "GET",
      url: `${process.env.API_URL}/${smsID}`,
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
      console.log(smsResponse);
      
      checkSMSStatus(token, smsResponse.msgId).then((smsStatusResponse) => {
        try {
          const smsStatus = smsStatusResponse.status;

          if (smsStatus === "delivered") {
            res.status(200);
          }

          res.json(smsStatusResponse);
        } catch (err) {
          res.status(err.code);
          res.json(err);
        }
      });
    });
  });
});

app.listen(port, () => {
  console.log(`dent-in backend listening on port ${port}`);
});
