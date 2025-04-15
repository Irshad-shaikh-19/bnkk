const mongoose = require("mongoose");

const monthlyActiveUserSchema = new mongoose.Schema({
    date:{
        type:Date
    },
    monthlyActiveUsers:{
        type:Number
    },
    
});

const MonthlyActiveUser = mongoose.model('tbl_monthly_active_user', monthlyActiveUserSchema);

module.exports = MonthlyActiveUser;



