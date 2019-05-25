var express = require('express');
var router = express.Router();

const md5 = require('blueimp-md5');
const {UserModel, ChatModel} = require('../db/models');
// 指定过滤的属性
const filter = {password: 0, __v: 0};
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


// 注册一个路由： 用户注册
/*
*   1、path为：/register
*   2、请求方式为：POST
*   3、接收username和password参数
*   4、admin是已注册用户
*   5、注册成功返回：{code: 0, data:{_id: 'xxx', password: '2654'}}
*   6、注册失败返回：{code: 1, msg:'用户名已存在'}
*/
/*
*   1、获取请求参数
*   2、处理请求
*   3、返回响应数据
*/


/*
// 这是测试用的
router.post('/register', function(req, res){
    // 获取请求参数
    const {username, password} = req.body;
    //处理请求
    if(username === 'admin'){
        // 注册失败 返回相应数据（注册失败数据）

        res.send({code: 1, mas: '用户名已存在'});
    } else{
        //注册成功 返回相应数据（注册成功数据）
        res.send({code: 0, data:{id: 'abc123', username, password}})
    }
});
*/

//注册路由
router.post('/register', function(req, res){
    // 读取请求参数
    const {username, password, type} = req.body;

    //处理数据，判断用户名是否存在，如果存在，返回提示错误的信息，如果不存在，保存在数据库
    //根据username查询数据库
    UserModel.findOne({username}, function(err, user){
        if(user){
            // 用户名存在 返回提示错误信息
            res.send({
                code: 1,
                msg: '用户名已存在'
            })
        } else{
            // 用户名不存在 保存数据库
            new UserModel({
                username,
                type,
                password: md5(password)
            }).save(function(err, user){
                //注册成功生成cookie给浏览器保存（注册完成就自动登录）
                res.cookie('userid', user._id, {maxAge: 1000*60*60*24*7});

                //返回包含user的json数据 返回数据不需要传密码
                const data = {username, type, _id: user._id};
                res.send({
                    code: 0,
                    data
                })
            })
        }
    })
});

// 登录路由
router.post('/login', function(req, res){
    const {username,password} = req.body;
    // 根据username和password查询数据库
    //如果用户不存在就返回提示错误信息
    //如果用户存在再判断密码，密码正确返回username，type,_id
    //如果密码不正确，返回登录失败信息

    // 这样分的较细，用户知道具体哪里错了，用户体验好
    UserModel.findOne({username, password: md5(password)}, filter, function(err, user){
        if(user){
            res.cookie('userid', user._id, {maxAge: 1000*60*60*24*7});
            res.send({
                code: 0,
                data: user
            })
        } else{
            UserModel.findOne({username}, function(err, user){
                if(user){
                    res.send({
                        code: 1,
                        msg: '密码错误'
                    })
                } else{
                    res.send({
                        code: 1,
                        msg: '用户名不存在'
                    })
                }
            })
        }
    })

    /*
    UserModel.findOne({username, password: md5(password)}, filter, function(err, user){
        if(user){
           res.cookie('userid', user._id, {maxAge: 1000*60*60*24*7});
           res.send({
               code: 0,
               data: user
           })
        } else{
           res.send({
               dode: 1,
               msg: '用户名或密码不正确'
           })
        }
    })
    */
});

// 更新用户信息路由
router.post('/update', function(req, res){
    // 从请求中的cookies获取userid
    const userid = req.cookies.userid;
    // 如果userid不存在，直接返回一个提示信息
    if(!userid){
        return res.send({code: 1, msg: '请先登录'})
    }

    // 如果userid存在，根据userid更新对应的user的数据库数据
    // 获取用户提交的数据
    const user = req.body;

    UserModel.findByIdAndUpdate({_id: userid},user, function(error, oldUser){
        if(!oldUser){
            // 如果用户信息不存在，则通知浏览器删除userid的cookie
            res.clearCookie('userid');
            // 并返回一个提示信息
            res.send({code: 1, msg: '请先登录'})
        } else{
            // 用户信息存在，返回一个user数据
            const {_id, username, type} = oldUser;
            const data = Object.assign({_id, username, type}, user);
            //返回数据
            res.send({code: 0, data})
        }
    })

});

// 获取用户信息路由（根据cookies中的userid）
router.get('/user', function(req, res){
    //从请求的cookies中获取userid
    const userid = req.cookies.userid;
    // 如果不存在，直接返回一个提示信息
    if(!userid){
        return res.send({code: 1, msg: '请先登录'})
    }
    // 根据userid查询对应的user
    UserModel.findOne({_id: userid}, filter, function(error, user){
        res.send({code: 0, data: user})
    })
});

// 根据用户类型来获取指定用户列表
router.get('/userlist', function(req, res){
    const {type} = req.query;
    UserModel.find({type}, filter, function(error, users){
        res.send({code: 0, data: users})
    })
});


// 获取用户所有相关聊天信息列表
router.get('/msglist', function(req, res){
    //获取cookies中的userid
    const userid = req.cookies.userid;
    // 查询得到所有user文档数组
    UserModel.find(function(err, userDocs){
        //用对象存储所有user信息：key为user的_id,val为username和header组成的user对象
        /*
        const users = {}; // 对象容器
        userDocs.forEach(doc => {
            users[doc._id] = {
                username: doc.username,
                header: doc.header
            }
        });
        // 这一步可以写成下面形式
        */
        const users = userDocs.reduce((users, user) => {
            users[user._id] = {username: user.username, header: user.header};
            return users;
        }, {});
        /*
        *   查询userid相关的所有聊天信息
        *   参数1：查询条件
        *   参数2：过滤条件
        *   参数3：回调函数
        *
        */
        // $or是数组参数中条件的或者关系
        ChatModel.find({'$or': [{from: userid}, {to: userid}]}, filter, function(err, chatMsgs){
            // 返回包含所有用户和当前用户相关的所有聊天消息数据
            console.log(123,chatMsgs);
            res.send({code: 0, data: {users, chatMsgs}})
        })
    })
});

// 修改指定消息为已读
router.post('/readmsg', function(req,res){
    //得到请求中的from和to
    const from = req.body.from;
    const to = req.body.to;

    /*
    *   更新数据库中的chat数据
    *   参数1:查询条件
    *   参数2：更新指定的数据对象
    *   参数3：是否1次更新多条，默认只更新一条
    *   参数4：更新完成的回调函数
    */

    // multi: true表示更新查到的所有数据，默认只更新一条数据
    ChatModel.update({from, to, read: true}, {read: false}, {multi: true}, function(err, doc){
        res.send({code: 0, data: doc.nModified}); //更新的数量
    })
});

module.exports = router;
