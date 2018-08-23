$(function(){
	/*建立socket连接，使用websocket协议，端口号是服务器端监听端口号*/
	var socket = io.connect('ws://localhost:8000');
	/*定义用户名*/
	var uname = null;
	var password=null;
	/*登录*/
	$('#btn-login').click(function(){
		uname = $.trim($('.login-username').val());
		password=$.trim($('.login-password').val());
		if(uname&&password){
			/*向服务端发送登录事件*/
			socket.emit('login',{username:uname,message:password});
		}else{
			alert('请输入昵称和密码');
		}
	})

	/*发送消息*/
	$('.sendBtn').click(function(){
		sendMessage()
	});
	$(document).keydown(function(event){
		if(event.keyCode == 13){
			sendMessage()
		}
	})

	/*登录成功*/
	socket.on('loginSuccess',function(data){
		if(data.username === uname){
			checkin(data)
		}else{
			alert('用户名或密码不匹配，请重试');
		}
	})

	/*登录失败*/
	socket.on('loginFail',function(){
		alert('昵称重复')
	})

	/*新人加入提示*/
	socket.on('add',function(data){
		var html = '<p>系统消息:'+data.username+'已加入群聊</p><br>';
		$('.chat-con').append(html);
	})

	/*接收消息*/
	socket.on('receiveMessage',function(data){
		showMessage(data)
	})
	socket.on('administorMessage',function(data){
		var html = '<p>系统消息:'+data.message+'</p><br>';
		$('.chat-con').append(html);		
	})
	/*退出群聊提示*/
	socket.on('leave',function(name){
		if(name != null){
			var html = '<p>系统消息:'+name+'已退出群聊</p><br>';
			$('.chat-con').append(html);
		}
	})

	/*隐藏登录界面 显示聊天界面*/
	function checkin(data){
		$('#people-login').hide('slow');
		$('.chat-wrap').show('slow');
		document.getElementById("people-login").style.zIndex="-1";
	}

	/*发送消息*/
	function sendMessage(){
		var txt = $('#sendtxt').val();
		$('#sendtxt').val('');
		if(txt){
			socket.emit('sendMessage',{username:uname,message:txt});
		}
	}

	/*显示消息*/
	function showMessage(data){
		var html
		if(data.username === uname){
			html = '<div class="chat-item item-right clearfix"><span class="img fr"></span><span class="message fr">'+data.message+'</span></div>'
		}else{
			html='<div class="chat-item item-left clearfix rela"><span class="abs uname">'+data.username+'</span><span class="img fl"></span><span class="fl message">'+data.message+'</span></div>'
		}
		$('.chat-con').append(html);
	}

})