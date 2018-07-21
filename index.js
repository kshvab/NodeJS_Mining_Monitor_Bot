var mongoose = require('mongoose');
var fs = require('fs');

var admdata = require('./server_modules/adm_data');
var db = require ('./server_modules/db');
var farmOwner = require('./server_modules/db_models');
var bot_module = require('./server_modules/bot');
var tStart = Date.now();

var bot = bot_module.bot;
module.exports.bot = bot;

db.connect(admdata.dbUrl);

//************ | User inputs | ************\\
{

bot.on('message', (msg) => {
	
	var topMes;

	switch (msg.text) {
  		case '/BALANCE':
    		topMes = "💬 BALANCE";
    		break;
		case '/DASHBOARD':
    		topMes = "💬 DASHBOARD";
    		break;
		case '/help':
    		topMes = "💬 How to use";
    		break;
		case '/stop':
    		topMes = "⚠️ I stop monitoring all your addresses";
    		break;
		case '/TOP10':
    		topMes = "💬 TOP10 from coinmarketcap.com";
    		break;
  		case undefined:
   			topMes = "💬 Ok, give me a second...";
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
	
});

bot.onText(/\/top10/i,function(msg, match){
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
		console.log('\n=====> User #' + userId + ' need top10:\n\n'+ text);
		bot.sendMessage(userId, text);
	});	
});

bot.onText(/\/help/i,function(msg, match){
bot.sendMessage(msg.from.id, '💬 Give me the your mining addresses\n💡 Examples for ETH:\n/0xsf5sef4ghjg...\n/ETH 0xsf5sef4ghjg...\n/eth 0xsf5sef4ghjg...\n💡 Examples for ZEC:\n/t5ehgsef4ghjg...\n/ZEC t5ehgsef4ghjg...\n/zec t5ehgsef4ghjg...');
});



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

bot.onText(/\/eth (.+)/i,function(msg,match){
	var Adr=match[1];
	var Cur = 'ETH';
	initMonitoring(msg, Adr, Cur);
});

bot.onText(/\/zec (.+)/i,function(msg,match){
	var Adr=match[1];
	var Cur = 'ZEC';
	initMonitoring(msg, Adr, Cur);
});

bot.onText(/\/stop/,function(msg, match){
	fStopMonitoring(msg);
});

bot.onText(/\/BALANCE/,function(msg, match){
	fBalancesInit(msg);
});

bot.onText(/\/DASHBOARD/,function(msg, match){
	fInitDashboard(msg);
});

}

//********* | Address initiation | ********\\
function fServerStart (){
	farmOwner.find({}, function (err, docs) {
		for (var i = 0; i < docs.length; i++) {
			if (!(docs[i].isMonitored)) continue;
			var userId;
			for (var k = 0; k < docs[i].addresses.length; k++) {
				
				var obj ={};
				obj.data = [{}];
				obj.userId = docs[i].telegramUserId;
				obj.userName = docs[i].firstName;
				obj.userSurName = docs[i].secondName;
				obj.userUserName = docs[i].userName;
				obj.Adr = docs[i].addresses[k].adr;
				obj.currency =docs[i].addresses[k].cur;
				userId = obj.userId;
				fStartMonitoring(obj);
			};
			console.log("=====> I\'m coming back to work ...");
			bot.sendMessage(userId, "⚠️ Oops, sorry, I think I was offline for a while.\nPerhaps some technical work was done on the server.\nI\'m coming back to work ...");
		};
	});
};

fServerStart();

//********* | Address initiation | ********\\
function initMonitoring(msg, Adr, Cur){
	userId = msg.from.id;
	
	console.log('=====> User #' + userId + ' initiated adress:');
	console.log('=====> ' + Cur + ': '+ Adr);
	
	
	newScanUsrDb(Adr, Cur, function(freshUsrDb) {

		var obj = JSON.parse(freshUsrDb);
		
		if (obj.status == 'ERROR') {
			if (obj.error == 'Invalid address') {
				console.log('=====> Invalid address');
				bot.sendMessage(userId, '⚠️ Invalid address! Check it out and try again');
			}
			else {
				console.log('=====> The address looks like the correct one but there was a technical error, please contact support.');
				bot.sendMessage(userId, '⚠️ The address looks like the correct one but there was a technical error, please contact support.');
			}
		}
		else {
			farmOwner.findOne({ 'telegramUserId': userId }, function (err, person) {
  				if (err) return handleError(err);
				
				var userExist = false;
				var	adrExist = false;
				var	underMonitoring = false;
				
				if (!(person)){
					addNewPerson();
				}
				else {
					activateAdr();
				};
				
				function addNewPerson(){
					
					var newFarmOwner = new farmOwner ({
						_id: new mongoose.Types.ObjectId(),
						telegramUserId: userId,
						isMonitored: true,
						addresses: [{
							adr: Adr,
							cur: Cur
						}],
						firstName: msg.from.first_name,
						secondName: msg.from.second_name,
						userName: msg.from.username,
					});
		
					newFarmOwner.save(function(err) {
						if (err) throw err;
					});	
											
					fPrepForStart();
					
				};
				
				function activateAdr(){
					var indexOfWallet = -1;
					
					for (var i = 0; i < person.addresses.length; i++){
						if(person.addresses[i].adr === Adr) indexOfWallet = i;
					};
					
					if (person.isMonitored && (indexOfWallet != -1)){
						console.log('=====> The address is already monitored');
						bot.sendMessage(userId, '⚠️ The address is already monitored');
						return;
					}
					else {
						
						if ((!(person.isMonitored)) && (indexOfWallet != -1)){
							console.log('=====> I am restored monitoring');
							bot.sendMessage(userId, '⚠️ I am restored monitoring');
							person.isMonitored = true;
							person.save();
						}
						else {
							console.log('=====> A new address submitted for monitoring');
							bot.sendMessage(userId, '⚠️ A new address submitted for monitoring');
							person.isMonitored = true;
							person.addresses.push({"adr": Adr, "cur": Cur});
							person.save();
						};
						
						fPrepForStart();
						
					};
				};
				
				function fPrepForStart(){
	
					fAddAtrDb(msg, Adr, Cur, obj);	//Розширили об'єкт
					
					if (Cur == 'ETH') {
						for (var i=0; i<obj.data.length; i++) {
						obj.data[i].reportedHashrate/=1000000;
						obj.data[i].currentHashrate/=1000000;
						};
					};
					
					fWriteToFile (obj);				//Збережемо у файл
					fShowRigList (obj);				//Покажемо поточні ферми
					fStartMonitoring (obj);			//Старт моніторингу
				};
				
			});
		};
	});
};



//********** | Monitoring cycle | *********\\
function fStartMonitoring (obj) {
	var Cur = obj.currency;
	var userId = obj.userId;
	var Adr=obj.Adr;
		
	var CronJob = require('cron').CronJob;
	var job = new CronJob({
  		cronTime: '*/3 * * * *',
  		onTick: function() {
			var tDuration = timeConversion(Date.now() - tStart);
			console.log('=====> CRON cycle: ' + tDuration + ' ==> ' + Adr);

			
			//***** Stop monitoring *********
			
			farmOwner.findOne({ 'telegramUserId': userId }, function (err, person) {
  				if (err) return handleError(err);
				
				if	(!(person.isMonitored)){
			  	console.log('=====> Monitoring '+ Adr + ' stopped');
				bot.sendMessage(userId, '⚠️ Monitoring '+ Adr + ' stopped!');
				job.stop();
				return;
			   };
				
			});
			
			//***** Cycle monitoring *********
			
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
						
						
					if ((!(exist))&&(obj.data[i].worker)) {
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
						
					if (!(exist)) {
						console.log('=====> ' + newObj.data[i].worker);
						bot.sendMessage(userId, '🎾 Online ' + newObj.data[i].worker);
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



//************** | Balance | **************\\
function fBalancesInit (msg){
	var userId = msg.from.id;
	
	farmOwner.findOne({ 'telegramUserId': userId }, function (err, person) {
  		if (err) return handleError(err);
		if	(!(person.isMonitored)) {
			console.log('=====> No address is monitored');
			bot.sendMessage(userId, '⚠️ No address is monitored');
			return;
		};
		for (var i = 0; i < person.addresses.length; i++){
			var Cur = person.addresses[i].cur;
			var Adr = person.addresses[i].adr;
			
			fShowBalanse(userId, Adr, Cur);
		};
	});
	
	function fShowBalanse(userId, Adr, Cur) {
		
		var request = require('request');
		var apiUr;
		var precision;
		if (Cur == 'ETH'){
			apiUrl = 'https://api.ethermine.org/miner/' + Adr + '/currentStats';
			precision = 1000000000000000000;
		}
		else {
			apiUrl = 'https://api-zcash.flypool.org/miner/' + Adr + '/currentStats';
			precision = 100000000;
		}
				
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
				
				var unpaidBalance = ((+obj.data.unpaid)/precision).toFixed(6);
				var usdEarnings = ((+obj.data.usdPerMin)*60*24*30).toFixed(2);
				var curEarnings = ((+obj.data.coinsPerMin)*60*24*30).toFixed(6);
				var msgWithBalance = Cur + ': ' + Adr + '\n💰 Unpaid: ' + unpaidBalance + Cur + '\n💸 Earning: ' + curEarnings + Cur + ' ($' + usdEarnings + ')';
	
				console.log(userId + "==>" + msgWithBalance);
				bot.sendMessage(userId, msgWithBalance);
			};	
		});	
	};
};


	

//************* | Dashboard | *************\\
function fInitDashboard(msg){
	var userId = msg.from.id;
	
	farmOwner.findOne({ 'telegramUserId': userId }, function (err, person) {
  		if (err) return handleError(err);
		if	(!(person.isMonitored)) {
			console.log('=====> No address is monitored');
			bot.sendMessage(userId, '⚠️ No address is monitored');
			return;
		};
		for (var i = 0; i < person.addresses.length; i++){
			var Cur = person.addresses[i].cur;
			var Adr = person.addresses[i].adr;
			
			fShowDashBoard(userId, Adr, Cur);
		};
	});
	
	
	function fShowDashBoard(userId, Adr, Cur){
		
		var request = require('request');
		var apiUr;
		if (Cur == 'ETH'){
			apiUrl = 'https://api.ethermine.org/miner/' + Adr + '/workers';
		}
		else {
			apiUrl = 'https://api-zcash.flypool.org/miner/' + Adr + '/workers';
		};

    	request(apiUrl, function (error, response, body) {
        	if (error) {
        	    console.log(error);
        	    return;
        	};
			var obj = JSON.parse(body);
				
			if (obj.status == 'ERROR'){
				console.log('=====> I can not access the pool ' + Adr);
				bot.sendMessage(userId, '⚠️ I can not access the pool ' + Adr);
			}
			else {
	
				fAddAtrDb(msg, Adr, Cur, obj);	//Розширили об'єкт
				if (Cur == 'ETH'){
					for (var i=0; i<obj.data.length; i++) {
					obj.data[i].reportedHashrate/=1000000;
					obj.data[i].currentHashrate/=1000000;
					};
				};
				fShowRigList (obj);				//Покажемо поточні ферми
	
			};	
		});	
	};
};






//********* | Support Functions | **********\\


function fStopMonitoring(msg){
	var userId = msg.from.id;
	
	farmOwner.findOne({ 'telegramUserId': userId }, function (err, person) {
  		if (err) return handleError(err);
		
		if	(person.isMonitored){
			person.isMonitored = false;
			console.log('=====> I stop monitoring all your addresses');
			person.addresses.splice(0);
		
			
			person.save();
			
		}
		else {
			console.log('=====> No address is monitored');
			bot.sendMessage(userId, '⚠️ No address is monitored');
		};
	});
};

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

function fWriteToFile (obj){
	var destination = 'users\\' + obj.userId + obj.currency + obj.Adr +'.json';
	var JsonString = JSON.stringify(obj);
			
	fs.writeFile(destination, JsonString, function (err) {
  		if (err) throw err;
	});
};

function fShowRigList (obj){
	var userId = obj.userId;
	var rigsAmount = obj.data.length;
	var curSituation = '💬 '+ obj.currency + ': ' + obj.Adr + '\n' + rigsAmount + ' farms.\n';
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

function fTransportAtributes (objFrom, objTo) {
	
	objTo.currency = objFrom.currency;
	objTo.Adr = objFrom.Adr;
	objTo.userId = objFrom.userId;
	objTo.userName = objFrom.userName;
	objTo.userSurName = objFrom.userSurName;
	objTo.userUserName = objFrom.userUserName;
	
};