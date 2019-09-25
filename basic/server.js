"use strict";

const line = require("@line/bot-sdk");
const express = require("express");
const crypto = require("crypto");

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/webhook", line.middleware(config), (req, res, next) => {
  // const body = JSON.stringify(req.body);
  // console.log(req.body);
  // const signature = crypto
  //   .createHmac("SHA256", config.channelSecret)
  //   .update(body)
  //   .digest("base64");

  // console.log(signature);
  // console.log(req.headers["x-line-signature"]);

  Promise.all(req.body.events.map(handleEvent))
    .then(result => {
      console.log("Success");
      res.json(result);
    })
    .catch(err => {
      console.log("Error");
      next(err);
    });
});

// event handler
function handleEvent(event) {
  if (
    event.replyToken === "00000000000000000000000000000000" ||
    event.replyToken === "ffffffffffffffffffffffffffffffff"
  ) {
    return Promise.resolve(null);
  }
  if (event.type !== "message" || event.message.type !== "text") {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // create a echoing text message
  const echo = { type: "text", text: JSON.stringify(event.message.text) };
  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

//Error handler
app.use((err, req, res, next) => {
  // if (err instanceof line.SignatureValidationFailed) {
  //   res.status(401).send(err.signature);
  //   return;
  // } else if (err instanceof line.JSONParseError) {
  //   res.status(400).send(err.raw);
  //   return;
  // }
  next(err); // will throw default 500
});

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
