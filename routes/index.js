var express = require('express')
var router = express.Router()

const md5 = require('blueimp-md5')
const {UserModel} = require('../db/models')

//define the filter
const filter = {
    password: 0,
    __v: 0
}

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
    UserModel.findOne({
        username
    }, (err, userDoc) => {
        if (userDoc) {
            res.send({code: 1, msg: 'Sorry, the username is unvailable'});
        } else {
            new UserModel({username, type, password: md5(password)}).save((err, user) => {
                //once you set the maxAge, it is longer cookie, not session cookie
                res.cookie('userid', user._id, {
                    maxAge: 1000 * 60 * 60 * 24
                });
                const data = {
                    username,
                    type,
                    _id: user._id
                };
                res.send({code: 0, data});
            })
        }
    })
})

//login route
router.post('/login', (req, res) => {
    const {username, password} = req.body;
    console.log(req.body);

    // query the databases according to username and password. if false, return err
    // msg; else: return all info of user {password:0} is a filter, which could be
    // definded at the beginning
    UserModel.findOne({
        username,
        password: md5(password)
    }, filter, (err, userDoc) => {
        if (userDoc) {
            res.cookie('userid', userDoc._id, {
                maxAge: 1000 * 60 * 60 * 24
            });
            res.send({code: 0, data: userDoc});
        } else {
            res.send({code: 1, msg: 'username or password is invalid'});
        }
    })
})

//update route
router.post('/update', (req, res) => {
    //get userid from cookie
    const userid = req.cookies.userid;
    //get the user info
    if (!userid) {
        return res.send({code: 1, msg: 'Please Login'});
    }
    
    //if userid is existed, update the user data in mongoDB
    const user = req.body; //no _id
    UserModel.findByIdAndUpdate({_id:userid},user,(err,oldUser)=>{
        if(!oldUser){
            //Notice browser to delete userid if !olduser
            res.clearCookie('userid')
            //return a msg
            res.send({code:1,msg:"Please Login"});
        }else{
            //三点运算符在后台没有办法使用，Object.assign(对象1，对象2)
            const{_id,username,type} = oldUser;
            const data  = Object.assign(user,{_id,username,type});
            res.send({code:0,data:data});
        }
    })
})

module.exports = router;
