const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {type: String, unique:true, required: true},
    email: {type: String, unique: true, required: true},
    isActivated: {type: Boolean, default: false},
    activationLink: {type: String, default: false},
    password: {type: String, required: false},
})

module.exports = mongoose.model('User', UserSchema);