"use strict";

const line = require("@line/bot-sdk");
const express = require("express");
const bodyParser = require('body-parser');
const config = require('./config.json');
const { WebhookClient } = require('dialogflow-fulfillment');
const { Card, Suggestion } = require('dialogflow-fulfillment');

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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/webhookDF", (req, res, next) => {
  console.log('WEBHOOK')
  console.log(req)
  const agent = new WebhookClient({ request: req, response: res });

  function welcome(agent) {
    agent.add('welcome agent')
  }

  function fallback(agent) {
    agent.add('fallback agent')
  }


  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  agent.handleRequest(intentMap);


  
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
