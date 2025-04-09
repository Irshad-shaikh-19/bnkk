const mongoose = require("mongoose");

const activeUserSchema = new mongoose.Schema({
    date:{
        type:Date
    },
    activeUsers:{
        type:Number
    },
    
});

const ActiveUser = mongoose.model('tbl_active_user', activeUserSchema);

module.exports = ActiveUser;



