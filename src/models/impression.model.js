const mongoose = require("mongoose");

const impressionSchema = new mongoose.Schema({
    date:{
        type:Date
    },
    impressions:{
        type:Number
    },
    
});

const Impression = mongoose.model('tbl_impression', impressionSchema);

module.exports = Impression;



