
var socketPoll = {};//存储当前聊天用户的池子

module.exports = {


  setSocket(socket){

    //用户进入聊天页面代表登录
    socket.on('login', function(obj) {
      console.log('用户'+obj._id+'进入聊天页面')
      //将用户id和当前用户的socket存起来
      socketPoll[obj._id] = socket;

    });
    //用户离开聊天页面代表登出
    socket.on('loginout', function(obj) {
      console.log('用户'+obj._id+'离开聊天页面')
      //将该用户从用户池中删除
      delete socketPoll[obj._id];

    });

  },

  sendMsg(obj){
    //根据id，找到对应的socket
    var currentSocket = socketPoll[obj.id];
    console.log('向客户端推送消息')
    if (currentSocket) {
      //向客户端推送消息
      currentSocket.emit(obj.action, obj.data);
    }

  }

};
