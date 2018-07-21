var mongoose = require('mongoose');

var farmOwnerSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
	telegramUserId: String,
	isMonitored: Boolean,
	addresses: [{
				adr: String,
				cur: String
				}],
	firstName: String,
	secondName: String,
	userName: String,
    created: { 
        	type: Date,
        	default: Date.now
    }
});

var farmOwner = mongoose.model('farmOwner', farmOwnerSchema);


module.exports = farmOwner;