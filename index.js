var TelegramBot=require('node-telegram-bot-api');
var fs = require('fs');
var token='612583872:AAGc3jDt_Rc7xiCn3wCjujrn35KfNHIzcbk';	//main
//var token='598509339:AAGouiHG2XfC6a7ASi3mYr1dPCgq8Y4UxZA';	//test


var bot=new TelegramBot(token,{polling:true});

var actMonitor = new Object;
	actMonitor={};

var tStart = Date.now();

 function timeConversion(millisec) {

        var seconds = (millisec / 1000).toFixed(1);

        var minutes = (millisec / (1000 * 60)).toFixed(1);

        var hours = (millisec / (1000 * 60 * 60)).toFixed(1);

        var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

        if (seconds < 60) {
            return seconds + " Sec";
        } else if (minutes < 60) {
            return minutes + " Min";
        } else if (hours < 24) {
            return hours + " Hrs";
        } else {
            return days + " Days"
        }
    };



bot.on('message', (msg) => {
	fPokazMainButton(msg)
});

function fPokazMainButton(msg){

	var topMes;

	switch (msg.text) {
  		case '/BALANCE':
    		topMes = "💬 BALANCE";
    		break;
		case '/Balance':
    		topMes = "💬 BALANCE";
    		break;
		case '/balance':
    		topMes = "💬 BALANCE";
    		break;
		case '/DASHBOARD':
    		topMes = "💬 DASHBOARD";
    		break;
		case '/dashboard':
    		topMes = "💬 DASHBOARD";
    		break;
		case '/STOP':
    		topMes = "⚠️ Зупиняю моніторинг усіх Ваших адрес.";
    		break;
		case '/help':
    		topMes = "💬 Інструкція";
    		break;
		case '/Stop':
    		topMes = "⚠️ Зупиняю моніторинг усіх Ваших адрес.";
    		break;
		case '/stop':
    		topMes = "⚠️ Зупиняю моніторинг усіх Ваших адрес.";
    		break;
		case '/TOP10':
    		topMes = "💬 TOP10 from coinmarketcap.com";
    		break;
  		case undefined:
   			topMes = "💬 Ok, зараз усьо буде...";
    		break;			
  		default:
    		topMes = "💬 Sorry, no time for chatting, need to monitor 😎\n🤖 Created by K. Shvab (CyberDream.Club)";
	}
	

	const keyboard = {
            reply_markup: {
            resize_keyboard: true,
            one_time_keyboard: true,
            keyboard: [["/DASHBOARD","/BALANCE"],["/TOP10","/stop","/help"]]
        	}
	};
	
	chatId = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
	bot.sendMessage(chatId, topMes, keyboard);
	
};

function fHelp(msg){
	
	bot.sendMessage(msg.from.id, '💬 Надайте мені адреси, на які Ви здійснюєте майнінг\n❓ Як правильно ввести адресу?\n💡 Приклад для ETH:\n/0xsf5sef4ghjg...\n/ETH 0xsf5sef4ghjg...\n/eth 0xsf5sef4ghjg...\n💡 Приклад для ZEC:\n/t5ehgsef4ghjg...\n/ZEC t5ehgsef4ghjg...\n/zec t5ehgsef4ghjg...');
};

function fTop10(msg){
	var userId = msg.from.id;
	
	var request = require('request');
	var apiUrl = 'https://api.coinmarketcap.com/v2/ticker/?convert=USD&limit=10&sort=market_cap';
			
    request(apiUrl, function (error, response, body) {

        if (error) {
            console.log(error);
            return;
        };

		var obj = JSON.parse(body);
		
		
		//*********** Adding new numeration ***********
		var k = 0;
		
		for (var i in obj.data) {
			obj.data[k] = obj.data[i];
			k++
		};
		
		for (var i in obj.data) {
			if (k<=0) delete obj.data[i];
			k--;
		};
		

		//*********** SORTING ***********
		for (var i = 9; i > 0; i--) {
			for (var j = 0; j < i; j++) {
				if (obj.data[j].quotes.USD.market_cap < obj.data[j+1].quotes.USD.market_cap){
					var Temp = obj.data[j];
					obj.data[j] = obj.data[j+1];
					obj.data[j+1] = Temp;
				};
			};
		};
		
		
		//*********** OUTPUT ***********
		var text = '';
		for (var i in obj.data) {
			var A,
				B;
			if ((obj.data[i].quotes.USD.percent_change_24h) > 0){
				A = '🎾 ';
				B = ' (+';
			}
			else {
				A = '🔴 ';
				B = ' (';
			};
			
			
			text += A + obj.data[i].name + ' $' + (+obj.data[i].quotes.USD.price).toFixed(2) + B + obj.data[i].quotes.USD.percent_change_24h + ')\n'
			
			
			
			

		};	
		console.log(text);
		bot.sendMessage(userId, text);
	});	
};


//*********** Робота з глобальою змінною ***********
/*
function Test2(){
	
	var userId = 8888;
	var Adr = '0x1111';
	var bbb = 'www';
	
	actMonitor[userId] = {};
		
		//{monOnOf: true, [Adr]: true};
	
	actMonitor[userId]['ccc'] = 2;
	actMonitor[userId][bbb] = false;
	console.log(actMonitor[userId][bbb]);
	console.log(JSON.stringify(actMonitor));
	
	
	
	
	
	
	
	
	if(	(actMonitor.hasOwnProperty(userId)) && 	
		(actMonitor[userId].hasOwnProperty(Adr))	&&
		(actMonitor[userId].monOnOf) &&
		(actMonitor[userId][Adr]) ){
	};

};
Test2();
*/


//*********** USER INPUTS ***********
{
	
	
bot.onText(/\/0x(.+)/,function(msg, match){
	var Adr = msg.text.slice(1);
	var Cur = 'ETH';
	initMonitoring(msg, Adr, Cur);
});


bot.onText(/\/t(.+)/,function(msg, match){
	var Adr = msg.text.slice(1);
	var Cur = 'ZEC';
	initMonitoring(msg, Adr, Cur);
});


bot.onText(/\/ETH (.+)/,function(msg,match){
	var Adr = match[1];
	var Cur = 'ETH';
	initMonitoring(msg, Adr, Cur);
});


bot.onText(/\/eth (.+)/,function(msg,match){
	var Adr=match[1];
	var Cur = 'ETH';
	initMonitoring(msg, Adr, Cur);
});


bot.onText(/\/ZEC (.+)/,function(msg,match){
	var Adr=match[1];
	var Cur = 'ZEC';
	initMonitoring(msg, Adr, Cur);
});


bot.onText(/\/zec (.+)/,function(msg,match){
	var Adr=match[1];
	var Cur = 'ZEC';
	initMonitoring(msg, Adr, Cur);
});
	
	
bot.onText(/\/BALANCE/,function(msg, match){
	fShowBalances(msg);
});
	
bot.onText(/\/Balance/,function(msg, match){
	fShowBalances(msg);
});
	
bot.onText(/\/balance/,function(msg, match){
	fShowBalances(msg);
});
	
bot.onText(/\/stop/,function(msg, match){
	console.log('11111111111')
	fStopMonitoring(msg);
});

bot.onText(/\/STOP/,function(msg, match){
	fStopMonitoring(msg);
});
	
bot.onText(/\/Stop/,function(msg, match){
	fStopMonitoring(msg);
});	
	
bot.onText(/\/DASHBOARD/,function(msg, match){
	fInitDashboard(msg);
});		

bot.onText(/\/dashboard/,function(msg, match){
	fInitDashboard(msg);
});	
	
bot.onText(/\/help/,function(msg, match){
	fHelp(msg);
});
	
bot.onText(/\/TOP10/,function(msg, match){
	fTop10(msg);
});
	
}

//*********** DASHBOARD ***********
{
	
function fInitDashboard(msg){
	var userId = msg.from.id;
	
	if	(
	(!(actMonitor.hasOwnProperty(userId))) ||
	(!(actMonitor[userId].monOnOf))
	){
		console.log('=====> Жодна адреса зараз не моніториться');
		bot.sendMessage(userId, '⚠️ Жодна адреса зараз не моніториться, спочатку надайте адресу.');
	}
	else{
		
		var usrKeys = Object.keys(actMonitor[userId]);
		
		for(var i=0; i<usrKeys.length ;i++)	{
			
			if (usrKeys[i] == 'monOnOf') continue;
			
			var Cur;
			var Adr = usrKeys[i];
			
			if (usrKeys[i][0] == 0){
				Cur = 'ETH';
				fDashboardEth(msg, Adr, Cur);
			}
			else {
				Cur = 'ZEC';
				fDashboardZec(msg, Adr, Cur);
			};
		};
	};
};


function fDashboardEth(msg, Adr, Cur){
	var userId = msg.from.id;
	console.log('EFIRKA');
	
	var request = require('request');
	var apiUrl = 'https://api.ethermine.org/miner/' + Adr + '/workers';
			
    request(apiUrl, function (error, response, body) {
        if (error) {
            console.log(error);
            return;
        };
		var obj = JSON.parse(body);
			
		if (obj.status == 'ERROR'){
			console.log('=====> Не можу отримати доступ до пулу ' + Adr);
			bot.sendMessage(userId, '⚠️ Не можу отримати доступ до пулу ' + Adr);
		}
		else {

			fAddAtrDb(msg, Adr, Cur, obj);	//Розширили об'єкт

			for (var i=0; i<obj.data.length; i++) {
			obj.data[i].reportedHashrate/=1000000;
			obj.data[i].currentHashrate/=1000000;
			};
				
			fShowRigList (obj);				//Покажемо поточні ферми
			
		};	
	});	
	
};


function fDashboardZec(msg, Adr, Cur){
console.log('EFIRKA');
	var userId = msg.from.id;
	var request = require('request');
	var apiUrl = 'https://api-zcash.flypool.org/miner/' + Adr + '/workers';
			
    request(apiUrl, function (error, response, body) {
        if (error) {
            console.log(error);
            return;
        };
		var obj = JSON.parse(body);
			
		if (obj.status == 'ERROR'){
			console.log('=====> Не можу отримати доступ до пулу ' + Adr);
			bot.sendMessage(userId, '⚠️ Не можу отримати доступ до пулу ' + Adr);
		}
		else {

			fAddAtrDb(msg, Adr, Cur, obj);	//Розширили об'єкт
			fShowRigList (obj);				//Покажемо поточні ферми
		};	
	});	
	
	
	
};

}


//****** Ініціація адреси ******
function initMonitoring(msg, Adr, Cur){
	userId = msg.from.id;
	
	console.log('=====> FUNCTION InitMonitoring STARTED')
	console.log('=====> ENTERED ' + Adr)
	
	
	newScanUsrDb(Adr, Cur, function(freshUsrDb) {

		var obj = JSON.parse(freshUsrDb);
		
		if (obj.status == 'ERROR') {
			if (obj.error == 'Invalid address') {
				console.log('=====> Адресу введено невірно!');
				bot.sendMessage(userId, '⚠️ Адресу введено невірно! Перевірте її та спробуйте ще раз.');
			}
			else {
				console.log('=====> Адреса схожа на правильну, але виникла якась технічна помилка, зверніться до служби підтримки.');
				bot.sendMessage(userId, '⚠️ Адреса схожа на правильну, але виникла якась технічна помилка, зверніться до служби підтримки. (код помилки 0001)');
			}
		}
		
		else {
			if(
				(actMonitor.hasOwnProperty(userId)) && 	
				(actMonitor[userId].hasOwnProperty(Adr))	&&
				(actMonitor[userId].monOnOf) &&
				(actMonitor[userId][Adr])
			 	){
				console.log('=====> Адреса уже моніториться');
				bot.sendMessage(userId, '⚠️ Адреса уже моніториться');
				}
			else {
				//console.log("=====> Адреса пройшла перевірку, дані з пулу завантажені.");
				
				fAddAtrDb(msg, Adr, Cur, obj);	//Розширили об'єкт
				
				
				if (Cur == 'ETH') {
					for (var i=0; i<obj.data.length; i++) {
					obj.data[i].reportedHashrate/=1000000;
					obj.data[i].currentHashrate/=1000000;
					};
				};
				
				
				fWriteToFile (obj);				//Збережемо у файл
				
				//Змінюємо глобальну змінну
				
				if (!(actMonitor.hasOwnProperty(userId))) actMonitor[userId] = {};
				actMonitor[userId].monOnOf = true;
				actMonitor[userId][Adr] = true;
				
				fShowRigList (obj);				//Покажемо поточні ферми
				fStartMonitoring (obj);			//Старт моніторингу
			};
		};
	});
};


//****** Розширення об'єкта ******
function fAddAtrDb (msg, Adr, Cur, obj) {
	
	if (Cur == 'ETH') {
		obj.currency = 'ETH';
	}
	else {
		obj.currency = 'ZEC';
	};
	
	obj.Adr = Adr;
	obj.userId = msg.from.id;
	obj.userName = msg.from.first_name;
	obj.userSurName = msg.from.second_name;
	obj.userUserName = msg.from.username;	
};


//****** Новий запит на пул workers ******
function newScanUsrDb(Adr, Cur, callback){
	var request = require('request');
	var apiUrl;
	if (Cur=='ETH') apiUrl = 'https://api.ethermine.org/miner/' + Adr + '/workers';
	else apiUrl = 'https://api-zcash.flypool.org/miner/' + Adr + '/workers';
	
	request(apiUrl, function (error, response, body) {
        if (error) {
            console.log(error);
            callback ('error');
        }
        else callback(body);
	});
};

//****** Запис у файл ******
function fWriteToFile (obj){
	var destination = 'db\\' + obj.userId + obj.currency + obj.Adr +'.json';
	var JsonString = JSON.stringify(obj);
			
	fs.writeFile(destination, JsonString, function (err) {
  		if (err) throw err;
	});
};

//****** Показ списку ферм ******
function fShowRigList (obj){
	
	var rigsAmount = obj.data.length;
	var curSituation = '💬 '+ obj.currency + ': ' + obj.Adr + '\n' + rigsAmount + ' ферм.\n';
	var sumReportedHashrate = 0;
	var sumCurrentHashrate = 0;

	
	for (i=0; i<rigsAmount; i++) {
	
		if (obj.currency == 'ETH') {
			if (!(obj.data[i].reportedHashrate) || !(obj.data[i].currentHashrate)) {
				curSituation += '🔴 ' + obj.data[i].worker + ' (' + (+obj.data[i].reportedHashrate).toFixed(0) + 'MH/s / ' + (obj.data[i].currentHashrate).toFixed(0) + 'MH/s)\n'; 
			}
			else {
				curSituation += '🎾 ' + obj.data[i].worker + ' (' + (+obj.data[i].reportedHashrate).toFixed(0) + 'MH/s / ' + (obj.data[i].currentHashrate).toFixed(0) + 'MH/s)\n';
			};
		}
		else {
			if (!(obj.data[i].currentHashrate)) {
				curSituation += '🔴 ' + obj.data[i].worker + ' (' + (+obj.data[i].currentHashrate).toFixed(0) + 'Sol/s)\n'; 
			}
			else {
				curSituation += '🎾 ' + obj.data[i].worker + ' (' + (+obj.data[i].currentHashrate).toFixed(0) + 'Sol/s)\n';
			};
		};
		

		sumReportedHashrate += obj.data[i].reportedHashrate;
		sumCurrentHashrate += obj.data[i].currentHashrate;
	};
	
	sumReportedHashrate = (sumReportedHashrate).toFixed(0);
	sumCurrentHashrate = (sumCurrentHashrate).toFixed(0);
	if (obj.currency == 'ETH') {
		curSituation += '⚙️ Total Reported: ' + sumReportedHashrate + 'MH/s.\n⚙️ Total Current: ' + sumCurrentHashrate + 'MH/s.';
	}
	else {
		curSituation += '⚙️ Total Current: ' + sumCurrentHashrate + 'Sol/s.';
	};
	

	console.log(curSituation);
	bot.sendMessage(userId, curSituation);
	
};


//****** Старт моніторингу ******
function fStartMonitoring (obj) {
	var Cur = obj.currency;
	var userId = obj.userId;
	var Adr=obj.Adr;
		
	var CronJob = require('cron').CronJob;
	var job = new CronJob({
  		cronTime: '*/2 * * * *',
  		onTick: function() {
			var tDurtion = timeConversion(Date.now() - tStart);
			console.log('=====> КРОН! ' + tDurtion + ' ==>' + Adr);

			
			//***** ЗУПИНКА МОНІТОРИНГУ *********
			
			if	(
				(!(actMonitor.hasOwnProperty(userId))) ||
				(!(actMonitor[userId].monOnOf))
				){
			  	console.log('=====> Моніторинг адреси '+ Adr + ' зупинено!');
				bot.sendMessage(userId, '⚠️ Моніторинг адреси '+ Adr + ' зупинено!');
				this.stop();
				return;
			   };
			
			
			newScanUsrDb(Adr, Cur, function(freshUsrDb) {
				
				
                if (freshUsrDb == 'error') return;

				var newObj = JSON.parse(freshUsrDb);
				
				if (Cur == 'ETH') {
					for (var i=0; i<newObj.data.length; i++) {
					newObj.data[i].reportedHashrate/=1000000;
					newObj.data[i].currentHashrate/=1000000;
					};
				};
				
				
				//console.log('=====> 3. Пройдемося по старому обєкту:');
				for (i = 0; i < obj.data.length; i++) {
					
					var exist = false;
					var oldHashrate;
					var newHashrate;
					
					for (k = 0; k < newObj.data.length; k++) {
						if (obj.data[i].worker == newObj.data[k].worker) {
							exist = true;
							if (Cur == 'ETH') {
								oldHashrate = obj.data[i].reportedHashrate;
								newHashrate = newObj.data[k].reportedHashrate;
							}
							else {
								oldHashrate = obj.data[i].currentHashrate;
								newHashrate = newObj.data[k].currentHashrate;
							};
								
						};
					};
						
					//console.log(obj.data[i].worker + ' on Pool: ' + exist + ' Хешрейт: ' + oldHashrate + ' ==> ' + newHashrate);
						
					if (!(exist)) {
						console.log('=====> ' + obj.data[i].worker + ': Deleted from pool listing');
						bot.sendMessage(userId, '❌ ' + obj.data[i].worker + ': Deleted from pool listing');
					};
					
					if ((exist)&&(!(newHashrate))&&(oldHashrate)) {
						console.log('=====> Offline ' + obj.data[i].worker);
						bot.sendMessage(userId, '🔴 Offline ' + obj.data[i].worker);
					};
					
					if ((exist)&&(newHashrate)&&(!(oldHashrate))) {
						console.log('=====> Online ' + obj.data[i].worker);
						bot.sendMessage(userId, '🎾 Online ' + obj.data[i].worker);
					};

				};
				
				//console.log('=====> 4. Пройдемося по новому обєкту:');
				for (i = 0; i < newObj.data.length; i++) {
					var exist = false;
					for (k = 0; k < obj.data.length; k++) {
						if (newObj.data[i].worker == obj.data[k].worker) {
							exist = true;
						};
					};
						
					//console.log(newObj.data[i].worker + ' on Pool: ' + exist );
					if (!(exist)) {
						console.log('=====> ' + newObj.data[i].worker + ': Added to pool');
						bot.sendMessage(userId, '🎾 Online ' + newObj.data[i].worker + ': Added to pool');
					};
				};
				
				fTransportAtributes (obj, newObj);
				obj=newObj;
				
				
				
				
				
				
				
			
			
			
			
			
			
			
			});
		},
  		start: false,
  		timeZone: 'Europe/Amsterdam'
	});
	
	job.start();			
};

function fTransportAtributes (objFrom, objTo) {
	
	objTo.currency = objFrom.currency;
	objTo.Adr = objFrom.Adr;
	objTo.userId = objFrom.userId;
	objTo.userName = objFrom.userName;
	objTo.userSurName = objFrom.userSurName;
	objTo.userUserName = objFrom.userUserName;
	
};


function fStopMonitoring(msg){
	var userId = msg.from.id;
	if	(actMonitor.hasOwnProperty(userId)){
		actMonitor[userId].monOnOf=false;
		console.log('=====> Зупиняю моніторинг усіх Ваших адрес.');
		
		
		console.log(JSON.stringify(actMonitor));

		for (var i in actMonitor[userId]) {	
			delete actMonitor[userId][i];
		};
		
		console.log(JSON.stringify(actMonitor));
		
		
		//bot.sendMessage(userId, '⚠️ Зупиняю моніторинг усіх Ваших адрес.');
	}
	else {
		console.log('=====> Жодна адреса не моніториться');
		bot.sendMessage(userId, '⚠️ Жодна адреса не моніториться');
	};
	
};


//*********** BALANCE ***********
{
function fBalanseEth(Adr, userId, Cur){
	var request = require('request');
	var apiUrl = 'https://api.ethermine.org/miner/' + Adr + '/currentStats';
			
    request(apiUrl, function (error, response, body) {
        if (error) {
           console.log(error);
           return;
        };
		var obj = JSON.parse(body);
			
		if (obj.status == 'ERROR'){
			console.log('=====> Не можу отримати доступ до балансу за адресою ' + Adr);
			bot.sendMessage(userId, '⚠️ Не можу отримати доступ до балансу за адресою ' + Adr);
		}
		else {
			var unpaidBalance = ((+obj.data.unpaid)/1000000000000000000).toFixed(6);
			var usdEarnings = ((+obj.data.usdPerMin)*60*24*30).toFixed(2);
			var curEarnings = ((+obj.data.coinsPerMin)*60*24*30).toFixed(6);
			var msgWithBalance = 'ETH: ' + Adr + '\n💰 Unpaid: ' + unpaidBalance + 'ETH\n💸 Earning: ' + curEarnings + 'ETH ($' + usdEarnings + ')';

			console.log(msgWithBalance);
			bot.sendMessage(userId, msgWithBalance);
		};	
	});	
};


function fBalanseZec(Adr, userId, Cur){

	var request = require('request');
	var apiUrl = 'https://api-zcash.flypool.org/miner/' + Adr + '/currentStats';
	request(apiUrl, function (error, response, body) {

		var obj = JSON.parse(body);

		if (obj.status == 'ERROR'){
			console.log('=====> Не можу отримати доступ до балансу за адресою ' + Adr);
			bot.sendMessage(userId, '⚠️ Не можу отримати доступ до балансу за адресою ' + Adr);
		}
		else {
			var unpaidBalance = ((+obj.data.unpaid)/100000000).toFixed(6);
			var usdEarnings = ((+obj.data.usdPerMin)*60*24*30).toFixed(2);
			var curEarnings = ((+obj.data.coinsPerMin)*60*24*30).toFixed(6);
			var msgWithBalance = 'ZEC: ' + Adr + '\n💰 Unpaid: ' + unpaidBalance + 'ZEC\n💸 Earning: ' + curEarnings + 'ZEC ($' + usdEarnings + ')';

			console.log(msgWithBalance);
			bot.sendMessage(userId, msgWithBalance);
		};
	});	
};


function fShowBalances (msg){
	var userId = msg.from.id;
	
	if	(
	(!(actMonitor.hasOwnProperty(userId))) ||
	(!(actMonitor[userId].monOnOf))
	){
		console.log('=====> Жодна адреса зараз не моніториться');
		bot.sendMessage(userId, '⚠️ Жодна адреса зараз не моніториться, спочатку надайте адресу.');
	}
	else{

		var usrKeys = Object.keys(actMonitor[userId]);
		
		//for (var i in usrKeys) {
		for(var i=0; i<usrKeys.length ;i++)	{
			
			if (usrKeys[i] == 'monOnOf') continue;
			
			var Cur;
			var Adr = usrKeys[i];
			
			if (usrKeys[i][0] == 0){
				Cur = 'ETH';
				fBalanseEth(Adr, userId, Cur);
			}
			else {
				Cur = 'ZEC';
				fBalanseZec(Adr, userId, Cur);
			};
		};	
	};
};
}
