module.exports = function (server) {
    // 得 到 IO 对 象
    const io = require('socket.io')(server) ;

    // 监 视 连 接 ( 当 有 一 个 客 户 连 接 上 时 回 调 )
    io.on('connection', function (socket) {

        console.log('soketio connected');

        // 绑 定 sendMsg 监 听 , 接 收 客 户 端 发 送 的 消 息
        socket.on('sendMsg', function (data) {
            console.log('服务器接收到浏览器的消息', data) ;
            data.name = data.name.toUpperCase()
            // 向 客 户 端 发 送 消 息 ( 名 称 , 数 据 )
            io.emit('receiveMsg', data) ;
            console.log('服务器向浏览器发送消息', data)
        })
    })
};
