const {ChatModel} = require('../db/models');

module.exports = function (server) {
    // 得 到 IO 对 象
    const io = require('socket.io')(server) ;

    // 监 视 连 接 ( 当 有 一 个 客 户 连 接 上 时 回 调 )
    io.on('connection', function (socket) {

        console.log('soketio connected');

        // 绑 定 sendMsg 监 听 , 接 收 客 户 端 发 送 的 消 息
        socket.on('sendMsg', function ({from, to, content}) {

            // 处理接收到的数据（保存到数据库）
            // 准备chatMsg对象的相关数据
            const chat_id = [from, to].sort().join('_');
            const create_time = Date.now();
            new ChatModel({from, to, content, chat_id, create_time, read: true}).save(function(error, chatMsgs){
                // 向所有在线的客户端发送消息
                io.emit('receiveMsg', chatMsgs);
            })
        })
    })
};
