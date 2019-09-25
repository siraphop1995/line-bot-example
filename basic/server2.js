"use strict";

const line = require("@line/bot-sdk");
const express = require("express");
const config = require('./config.json');

const client = new line.Client(config);

const app = express();

app.post("/webhook", line.middleware(config), (req, res, next) => {

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
    return Promise.resolve(null);
  }

  const echo = { type: "text", text: JSON.stringify(event.message.text) };
  return client.replyMessage(event.replyToken, echo);
}

//Error handler
app.use((err, req, res, next) => {
  next(err); // will throw default 500
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
