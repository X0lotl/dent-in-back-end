const express = require("express");
const axios = require("axios");
const oauth = require("axios-oauth-client");
const { response } = require("express");
const qs = require("querystring");
require("dotenv").config();

const app = express();
const port = process.env.PORT;

const data = { grant_type: "client_credentials" };

console.log(process.env.CLIENT_ID)
const URL = "https://api-gateway.kyivstar.ua/idp/oauth2/token";

async function getToken() {
  try {
    let res = await axios({
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      auth: {
        username: process.env.CLIENT_ID,
        password: process.env.CLIENT_SECRET,
      },
      data: qs.stringify(data),
      url: URL,
    });
    if (res.status == 200) {
      console.log(res.status);
    }

    return res.data;
  } catch (err) {
    console.error(err);
  }
}

// axios({
//   method: "POST",
//   url: " https://api-gateway.kyivstar.ua/sandbox/rest/v1beta/sms",
//   headers: { Authorization: "Bearer " + token },
//   data: {
//     from: "messagedesk",
//     to: "38 (097) 637-39-38",
//     text: "Нове заповнення форми!",
//   },
// })



app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/sms", (req, res) => {
  getToken()
  .then(response => {
    console.log(response)
    res.status(200).json(response)
  })
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
