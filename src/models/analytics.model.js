const mongoose = require("mongoose");

const analyticSchema = new mongoose.Schema({
    date:{
        type:Date
    },
    active_users:{
        type:Number
    },
    downloads:{
        type:Number
    },
    revenue:{
        type:Number
    }
});

const Analytic = mongoose.model('tbl_analytic', analyticSchema);

module.exports = Analytic;



