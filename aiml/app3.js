// Reply using AIML

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const config = require("../config.json");
const AIMLInterpreter = require("aimlinterpreter");

const app = express();
const port = process.env.PORT || 3000;
const aimlInterpreter = new AIMLInterpreter({ name: "HelloBot" });

aimlInterpreter.loadAIMLFilesIntoArray(["./aiml/test-aiml.xml"]);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/webhook", (req, res) => {
  let reply_token = req.body.events[0].replyToken;
  let msg = req.body.events[0].message.text;
  aimlInterpreter.findAnswerInLoadedAIMLFiles(
    msg,
    (answer, wildCardArray, input) => {
      if (answer === "ECHO") {
        reply(reply_token, msg);
      } else {
        reply(reply_token, answer);
      }
    }
  );
  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`listening on ${port}`);
});

function reply(reply_token, msg) {
  let headers = {
    "Content-Type": "application/json",
    Authorization: "Bearer " + config.channelAccessToken
  };

  let body = JSON.stringify({
    replyToken: reply_token,
    messages: [
      {
        type: "text",
        text: msg
      }
    ]
  });

  request.post(
    {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: headers,
      body: body
    },
    (err, res, body) => {
      console.log("status = " + res.statusCode);
    }
  );
}
