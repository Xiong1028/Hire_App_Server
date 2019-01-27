var express = require('express')
var router = express.Router()

const md5 = require('blueimp-md5')
const {UserModel,ChatModel} = require('../db/models')

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
    console.log(user);
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

//获取用户信息的路由（根据cookie中的userid）
router.get('/user',(req,res)=>{
    //从请求中的cookie得到userid
    const userid = req.cookies.userid;
    if(!userid){
        return res.send({code:1,msg:'Please Login'});
    }

    // 根据userid查询对应的user
    UserModel.findOne({_id:userid},filter,function(err,userDoc){
        res.send({code:0,data:userDoc});
    })

})

//获取用户列表（根据类型）
//req参数类型主要有两种：req.query(), req.params() . 要求url中 / ***/:type
router.get('/userlist',function(req,res){
    const {type} = req.query;
    //filter表示返回的数据，过滤其中第三信息，如密码
    UserModel.find({type},filter,function(err,users){
        res.send({code:0,data:users});
    })
})


/*
*   +++++获取当前用户所有相关聊天信息列表++++
* */

router.get('/msglist',function(req,res){
    /*
      ====Get userid from cookie===
    */
    const userid = req.cookies.userid;

    //get all users document
    UserModel.find(function(err,userDocs){
        //use object structure to save all the users info: key ->user_id,val ->name, icon
        const users = {};
        userDocs.forEach(doc=>{
            users[doc._id] = {username:doc.username,icon:doc.icon};
        })

        // 另外一种写法
        /*
        const users = userDocs.reduce((users,user)=>{
            users[user._id] = {username:doc.username,icon:doc.icon};
            return users;
        },{})
        */


        /*
        *   ===GET All Chat info by userid==
        *   @args1: query object: {'$or':[{from:userid},{to:userid}]}
        *   @args2: filter object
        *   @args3: callback
        *
        * */


        ChatModel.find({'$or':[{from:userid},{to:userid}]},filter,function(err,chatMsgs){
            //return all the chat msgs related with this userid
            res.send({code:0,data:{users,chatMsgs}});
        })

    })
})


/*
*   API: 修改指定消息为已读
*
 *  */

router.post('/readmsg',function(req,res){
    //得到请求中的from和to
    const from = req.body.from;
    const to = req.cookies.userid;

    /*
    *   更新数据库中的chat数据
    *   参数1：查询条件
    *   参数2：更新为指定的数据对象
    *   参数3：是否1次更新多条，默认只更新一条
    *   参数4：更新完成的回调函数
    *
    * */

    ChatModel.update({from,to,read:false},{read:true},{multi:true},function(err,doc){
        console.log('/readmsg',doc);
        res.send({code:0,data:doc.nModified})//更新的数量

    })


})
















module.exports = router;
