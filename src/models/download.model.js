const mongoose = require("mongoose");

const downloadSchema = new mongoose.Schema({
    date:{
        type:Date
    },
    downloads:{
        type:Number
    },
    
});

const Download = mongoose.model('tbl_download', downloadSchema);

module.exports = Download;



