var socketio = require('socket.io');
var io;
var PORT = 8000;
/*定义用户数组*/
var Allusers ={};
var users=[];
exports.listen=function(server)
{
   io=socketio.listen(server);
   io.on('connection', function (socket) {
	/*是否是新用户标识*/
	var isNewPerson = true; 
	/*当前登录用户*/
    var username = null;
	/*监听登录*/
	socket.on('login',function(data){
		for(var i=0;i<users.length;i++){
	        if(users[i].username === data.username){
	          	isNewPerson = false;
	          	break;
	        }else{
	          	isNewPerson = true;
	        }
	    }
	    if(isNewPerson){
	        username = data.username;
	        users.push({
	          username:data.username
	        })
	        Allusers[username]=data.password;
	        /*登录成功*/
	        socket.emit('loginSuccess',data);
	        /*向所有连接的客户端广播add事件*/
	        io.sockets.emit('add',data);
	    }else{
	    	/*登录失败*/
	    	if(data.message!=Allusers[data.username])
	        socket.emit('loginFail','');
	    	else
	    	{
	        socket.emit('loginSuccess',data);
	        /*向所有连接的客户端广播add事件*/
	        io.sockets.emit('add',data);	    		
	    	}
	    }  
	})

	/*监听发送消息*/
	socket.on('sendMessage',function(data){
        io.sockets.emit('receiveMessage',data);
    })

	/*退出登录*/
	socket.on('disconnect',function(){
		/*向所有连接的客户端广播leave事件*/
      	io.sockets.emit('leave',username);
      	users.map(function(val,index){
        if(val.username === username){
          	users.splice(index,1);
        }
      })
    })
})

   return io;
}