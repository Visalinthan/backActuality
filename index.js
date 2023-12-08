const WebSocket = require('ws');
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
  const key = '3ae6c7ef47764a919093ed68658ba917';
  let prefix = ''

  // Handle incoming messages

  ws.on('message', function incoming(request) {
    const jsonData = JSON.parse(request)
    jsonData.forEach(element => {
      console.log("keyword : " + element.key)
      if (element.value == "all") {
        prefix = "everything?q=keyword"
      } else if (element.key == "list_sources") {
        prefix = "top-headlines/sources?"
      } else if (element.key == "one_source") {
        prefix = `top-headlines?sources=${element.value}`
      } else if (element.key == "category") {
        prefix = `top-headlines?category=${element.value}`
      }

    });


    // executable
     const executeTask = async () => {
       try {
         // @ts-ignore
         const url = `${baseURL}${prefix}&apiKey=${key}`
         const apiResponse = await axios.get(url);
         const data = apiResponse.data;
         
 
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
