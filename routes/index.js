var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


//define a route for registering new users
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
  //get the request object
  const {username, password} = req.body;
  if (username === 'admin') {
    //return onFail
    res.send({code: 1, msg: 'username is existed'});
  } else {
    //return onSuccess
    res.send({code: 0, data:{id: 'abc', username, password}});
  }
  console.log(username,password);
})

module.exports = router;
