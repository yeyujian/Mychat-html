var http=require('http');
var fs=require('fs');
var path=require('path');
var mime=require('mime');
var chatserver=require('./chat_server');
var cache={};
function send404(response)
{
	response.writeHead(404,{'Content-Type':'text/plain'});
	response.write('Error 404: not found');
	response.end();
}


function sendFile(res,filepath,filecontents)
{
	res.writeHead(200,{'Content-Type':mime.lookup(path.basename(filepath))});
	res.end(filecontents);
}

function serveSatic(response,cache,abspath)
{
	if(cache[abspath])
	{
		sendFile(response,abspath,cache[abspath]);
	}
	else
	{
		fs.exists(abspath,function(exists)
			{
				if(exists)
				{
					fs.readFile(abspath,function(err,data){
						if(err)
						{
							send404(response);
						}
						else
						{
							cache[abspath]=data;
							sendFile(response,abspath,cache[abspath]);
						}
					});
				}
				else
				{
   					send404(response);
				}
			});
	}
}

var server=http.createServer(function(request,response)
	{
		var filepath="";
		if(request.url=='/')
		{
			filepath='public/index.html';
		}
		else
		{
			filepath='public'+request.url;
		}
		var abspath='./'+filepath;
		serveSatic(response,cache,abspath);
	});
server.listen(8000,()=>{console.log('OK  listen port:8000');});
var io=chatserver.listen(server);
process.stdin.resume();
process.stdin.on('data',function(data){
	//process.stdout.write(`data:${data.toString()}`);
	if(data.toString()=="end") 
	process.stdin.pause();
	else // console.log(io);
	io.sockets.emit('administorMessage',{username:'master',message:data.toString()});
});