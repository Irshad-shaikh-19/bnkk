const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    date:{
        type:Date
    },
    sessions:{
        type:Number
    },
    
});

const Session = mongoose.model('tbl_session', sessionSchema);

module.exports = Session;



