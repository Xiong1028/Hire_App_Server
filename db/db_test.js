/*
    npm install mongoose blueimp-md5 --save
    using mongoose to manage mongoDB
* */

const md5 = require('blueimp-md5');

//import mongoose
const mongoose = require('mongoose');

//connect the server. mongodb:// is a protocal
mongoose.connect('mongodb://localhost:27017/hire_test');

const conn = mongoose.connection;

conn.on('connected', () => {
    console.log('connect succ');
});

/*
    得到对应特定文档的数据
*/
//define Schema - 对文档字段进行定义文档结构，即各属性数据类型，相当于关系型数据库中定义表字段 属性名/属性值，是否必须，默认值
const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    icon: {
        type: String
    }
})


// Define Model (Match collection and manipulate the collection) model() =>
// constructor function
const UserModel = mongoose.model('user', userSchema);


//CRUD save()
//userModel is a instance of UserModel
const testSave = (userModel) => {
    //call save()
    userModel.save((err, userDoc) => {
        console.log('save()', err, userDoc);
    })
}

const userModel1 = new UserModel({username: 'Jim', password: md5('abc'), type: 'Applicant'});

//find() or findOne()
function testFind() {
    UserModel.find({
        _id: '5c396211dc3da71680d99e82'
    }, (err, users) => {
        console.log("find()", err, users)
    });

    UserModel.findOne({
        _id: '5c396211dc3da71680d99e82'
    }, (err, user) => {
        console.log('findOne()', err, user)
    })
}

testFind();

//Model.findByIdAndUpdate()
function testUpdate() {
    UserModel.findByIdAndUpdate({
        _id: '5c396211dc3da71680d99e82'
    }, {username:'Jack'},(err,oldUserDoc)=>{
        console.log("findByIdAndUpdate(): ",err,oldUserDoc)
    })
}

testUpdate();

//Model.remove()
function testRemove(){
    UserModel.remove({
        _id: '5c396211dc3da71680d99e82'
    },(err,userDoc)=>{
        console.log("remove():",err,userDoc)
    })
}

testRemove();

