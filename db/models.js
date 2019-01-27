/**
 *  Include couples of models to manage the DB
 *
 */

//Step1: connect DB
const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/hire')
const conn = mongoose.connection
conn.on('connectd', () => {
    console.log('connect succ')
})


//Step2: define Schema
const userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    type: {type: String, required: true},
    icon: {type: String},
    post: {type: String},
    info: {type: String},
    company: {type: String},
    salary: {type: String}
})

//Step3: Define Mode
const UserModel = mongoose.model('user',userSchema)


//Step4: export Model
// exports.xxx = xxx; exports.yyy = yyy
// module.exports = ZZZ; Only write once
exports.UserModel = UserModel


//DEFINE another Schema called charSchema
//step 1 : shared as the above
//step 2: define Schema
const chatSchema = mongoose.Schema({
    from:{type:String, required:true},
    to:{type:String, required:true},
    chat_id:{type:String,required:true},
    content:{type:String,required:true},
    read:{type:String,required:true},
    create_time:{type:Number}
})

//定义操作数据chats集合数据的Model
const ChatModel = mongoose.model('chat',chatSchema);

//向外暴露Model
exports.ChatModel = ChatModel;

