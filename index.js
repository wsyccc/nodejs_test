const https = require("https");
const fs = require("fs");
const express = require("express");
const line = require('@line/bot-sdk');
const secret = require('./secret.json');


// create LINE SDK client
const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: secret.token
});

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post('/callback', line.middleware({
  channelSecret: secret.channelSecret
}), (req, res) => {
  console.log('Request received:', req);
  console.log('Request Query:', JSON.stringify(req.query));
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// event handler
function handleEvent(event) {
  if (event.type === 'follow') {

    console.log(`UserId is: ${event.source.userId}`);

    const welcomeMessage = {
      type: 'text',
      text: 'Please use the link to bind with your Line account: https://www.idcs4iot.net/authentication/signin?lineId=' + event.source.userId
    };
    return client.replyMessage({
      replyToken: event.replyToken,
      messages: [welcomeMessage]
    });
  }
  // if (event.type !== 'message' || event.message.type !== 'text') {
  //   // ignore non-text-message event
  //   console.log('Non-text message received, skipping...');
  //   return Promise.resolve(null);
  // }
  //
  //
  // console.log(`Message received: ${event.message.text}`);
  //
  // // create an echoing text message
  // const echo = { type: 'text', text: event.message.text };
  //
  // // use reply API
  // return client.replyMessage({
  //   replyToken: event.replyToken,
  //   messages: [echo],
  // });
}

// 加载 SSL 证书和密钥文件
const sslOptions = {
  key: fs.readFileSync("privkey.pem"), // 替换为你的私钥文件路径
  cert: fs.readFileSync("fullchain.pem"), // 替换为你的证书文件路径
};

// 启动 HTTPS 服务器
const port = process.env.PORT || 17777;
https.createServer(sslOptions, app).listen(port, () => {
  console.log(`服务器运行在 https://localhost:${port}`);
});
