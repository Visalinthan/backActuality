const WebSocket = require('wss');
const axios = require('axios');
const express = require('express');
const app = express();
const server = require('http').createServer(app)

// creation WebSocket serveur 
const wss = new WebSocket.Server({ port: 3001 });


// quand WebSocket est connecté
wss.on('connection', async (ws) => {

  console.log('WebSocket connecté');

  const baseURL = "https://newsapi.org/v2/"
  const key = '7a76bca50c1d4dd1bfae499697eea7b4';
  let prefix = ''

  // Handle incoming messages

  ws.on('message', function incoming(request) {
    console.log("keyword : " + request)
    if (request == "all" || request == undefined) {
      prefix = "everything?q=keyword"
    } else if (request == "sources") {
      prefix = "top-headlines/sources?"
    } else {
      prefix = `top-headlines?sources=${request}`
    }

    // executable
    const executeTask = async () => {
      try {
        // @ts-ignore
        const url = `${baseURL}${prefix}&apiKey=${key}`
        const apiResponse = await axios.get(url);
        const data = apiResponse.data;
        console.log(url)

        // passer au front
        ws.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error fetching data from API:', error.message);
      }
    };

    // exécuter immédiat
    executeTask();

    // tous les 10mins
    const intervalId = setInterval(executeTask, 10 * 60 * 1000);

    // 当WebSocket连接关闭时
    ws.on('close', () => {
      console.log('WebSocket close');

      // effacer l'intervalle
      clearInterval(intervalId);
    });
  });



});
