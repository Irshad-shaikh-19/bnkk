const mongoose = require("mongoose");

const analyticSchema = new mongoose.Schema({
    date:{
        type:Date
    },
    views:{
        type:Number
    },
    
});

const Analytic = mongoose.model('tbl_analytic', analyticSchema);

module.exports = Analytic;



