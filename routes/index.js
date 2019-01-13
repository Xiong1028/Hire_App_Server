var express = require('express')
var router = express.Router()

const md5 = require('blueimp-md5')
const {UserModel} = require('../db/models')

//define the filter
const filter = {password: 0, __v: 0}

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'})
});


// define a route for registering new users
/*
*   path:/register
*   method: POST
*   arguments: username, password
*   return onSuccess:{code:0,data:{_id:'abc',username:'xxx',password:'123'}
*   return onFail:{code:1,msg:'username is existed'}
*   Note: admin is existed
*
* */
router.post('/register', (req, res) => {
    //get the request object from the request body
    const {username, password, type} = req.body;

    //condition: true->save data; false->err
    UserModel.findOne({username}, (err, userDoc) => {
        if (userDoc) {
            res.send({code: 1, msg: 'Sorry, the username is unvailable'});
        } else {
            new UserModel({username, type, password: md5(password)}).save((err, user) => {
                //once you set the maxAge, it is longer cookie, not session cookie
                res.cookie('userid', user._id, {maxAge: 1000 * 60 * 60 * 24});
                const data = {username, type, _id: user._id};
                res.send({code: 0, data});
            })
        }
    })
})


//login route
router.post('/login', (req, res) => {
    const {username, password} = req.body;

    //query the databases according to username and password. if false, return err msg; else: return all info of user
    //{password:0} is a filter, which could be definded at the beginning
    UserModel.findOne({username, password: md5(password)}, filter, (err, userDoc) => {
        if (userDoc) {
            res.cookie('userid', userDoc._id, {maxAge: 1000 * 60 * 60 * 24});
            res.send({code: 0, data: userDoc});
        } else {
            res.send({code: 1, msg: 'username or password is invalid'});
        }
    })
})


module.exports = router;
