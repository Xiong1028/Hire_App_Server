/*
*   this is a test of socketIO
*
* */

module.exports = function (server) {
  const io = require('socket.io')(server);

//监视连接（当有一个客户连接上时回调）
  //io表示所有与服务器的连接，socket表示当前与服务器连接的浏览器
  io.on('connection', function (socket) {
    console.log('socketio connected');

    //绑定sendMsg监听，接收客户端发送的消息
    socket.on('sendMsg', function (data) {
      console.log('服务器收到浏览器发来的消息', data)

      socket.emit('receiveMsg', data.name + '_' + data.date);
      console.log('服务器向浏览器发送消息', data);

    })
  })
}
