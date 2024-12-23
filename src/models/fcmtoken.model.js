const mongoose = require('mongoose')

const fcmTokenSchema = new mongoose.Schema({
    token: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, 
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  

const Fcmtoken = mongoose.model('fcmtoken', fcmTokenSchema)
module.exports = Fcmtoken;