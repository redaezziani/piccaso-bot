import axios from 'axios';
import dotenv from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import express from 'express';

const app= express();
const port = process.env.PORT || 3000;

dotenv.config();

const API_KEY = process.env.API_SECRET_KEY_PEXELS;
const QUERY = ['nature', 'water', 'city', 'mountain', 'sky', 'forest', 'beach', 'road', 'landscape', 'sunset', 'river', 'ocean', 'tree', 'snow', 'night', 'moon', 'cloud', 'desert', 'flower', 'animal', 'dog', 'cat', 'bird', 'fish', 'horse', 'lion', 'tiger', 'elephant', 'bear', 'monkey', 'cow', 'sheep', 'rabbit', 'pig', 'deer', 'wolf', 'fox', 'snake', 'turtle'];

// Initialize the Telegram bot with your token
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Define a keyboard for user options
const keyboardOptions = {
  reply_markup: {
    keyboard: [['Random Image', 'Search Image']],
  },
};

// Object to store the last request time for each user
const lastRequestTime = {};

// Function to send a random Pexels image
const sendRandomPexelsImage = async (chatId) => {
  try {
    const currentTime = Date.now();
    const lastTime = lastRequestTime[chatId] || 0;

    // Check if the time difference is at least 7 seconds
    if (currentTime - lastTime >= 7000) {
      bot.sendMessage(chatId, 'Fetching a random image...');
      var random = Math.floor(Math.random() * QUERY.length);
      const response = await axios.get(
        `https://api.pexels.com/v1/search?query=${QUERY[random]}&per_page=1&page=${Math.floor(
          Math.random() * 10
        ) + 1}`,
        {
          headers: {
            Authorization: API_KEY,
          },
        }
      );

      if (response.data.photos.length > 0) {
        const randomPhoto = response.data.photos[0];
        bot.sendPhoto(chatId, randomPhoto.src.original);
      } else {
        bot.sendMessage(chatId, `No photos found `);
      }

      // Update the last request time
      lastRequestTime[chatId] = currentTime;
    } else {
      bot.sendMessage(chatId, 'Please wait at least 7 seconds before making another request.');
    }
  } catch (error) {
    bot.sendMessage(chatId, 'Error fetching data');
    console.error('Error fetching data:', error);
  }
};

// Listen for incoming messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') {
    // Initial message with keyboard
    bot.sendMessage(chatId, 'Welcome to the Pexels Bot!', keyboardOptions);
  } else if (text === 'Random Image') {
    // User chose random image option
    sendRandomPexelsImage(chatId);
  } else if (text === 'Search Image') {
    // User chose search image option
    bot.sendMessage(chatId, 'Please enter your search query:');
  } else if (text) {
    // User entered a search query
    const page = Math.floor(Math.random() * 10) + 1;
    axios
      .get(`https://api.pexels.com/v1/search?query=${text}`, {
        headers: {
          Authorization: API_KEY,
        },
      })
      .then((response) => {
  
        let previousImage = '';

// Inside the response handling section:
if (response.data.photos.length > 0) {
  let randomPhoto;
  do {
    randomPhoto = response.data.photos[Math.floor(Math.random() * response.data.photos.length)];
  } while (randomPhoto.src.original === previousImage);

  previousImage = randomPhoto.src.original;

  bot.sendPhoto(chatId, randomPhoto.src.original);
  //lets send the data to the user
  bot.sendMessage(chatId, `Photo by ${randomPhoto.photographer}`);
} else {
  bot.sendMessage(chatId, `No photos found `);
}

      })
      .catch((error) => {
        bot.sendMessage(chatId, 'Error fetching data');
        console.error('Error fetching data:', error);
      });
  }
});


app.listen(port, () => {
  console.log(`server is running ...`)
})

//let make a route for the bot

app.get('/bot', (req, res) => {
  res.send('bot is running ...')
})



