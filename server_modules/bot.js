var admdata = require('./adm_data');
var TelegramBot=require('node-telegram-bot-api');



var bot = new TelegramBot(admdata.telegramBotToken,{polling:true});

console.log("=====> Polling TelegramBot successfully created.");

module.exports.bot = bot;