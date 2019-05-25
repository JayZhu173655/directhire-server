/*
*   测试使用mongoose操作mongoDB数据库
*/
// 加密模块
const md5 = require('blueimp-md5');

// 第一步：连接数据库
// 1、引入mongoose
// 2、连接指定的数据库（URL只有数据库是变化的）
// 3、获取连接对象
// 4、绑定连接完成的监听（用来提示连接成功）
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/czhipin_test');

const conn = mongoose.connection;

conn.on('connected', function(){
    console.log('数据库连接成功')
});


// 第二步：得到对应特定集合的model
// 1、定义Schema（描述文档结构数据的类型）
// 2、定义model（与集合对应，可以操作集合）

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    header: {
        type: String
    }
});

const UserModel = mongoose.model('user', userSchema);

// 第三步：通过Model或其实例对集合数据进行增删改查（crud）
// 1、通过Model实例的save()添加数据
// 2、通过Model实例的find()/findOne()查询多个或者一个数据
// 1、通过Model实例的findByIdAndUpdate()更新某个数据
// 2、通过Model实例的remove()删除匹配的数据

// 保存数据到数据库
function testSave(){
    // 创建UserModel的实例
    const userModel = new UserModel({
        username: 'Bobi',
        password: md5('789564'),
        type: 'Boss'
    });
    userModel.save(function(err,userDoc){
        console.log(err,userDoc)
    })
}

//testSave();

// 查询数据在数据库
function testFind(){
    // 查询多条数据 find()返回的是数组 没有查询到返回空数组 ,也可以按条件查询
    UserModel.find({username: 'Bobi'},function(err, users){
        console.log(err, users)
    });

    //查询一条数据 没有查询到返回null
    UserModel.findOne({type: 'Boss'}, function(err, user){
        console.log(err, user)
    })
}
//testFind();


// 更新数据
function testUpadate(){
    UserModel.findByIdAndUpdate({_id: '5cde22a34b43ec35c80556a7'}, {username: 'Jay'}, function(err, oldUser){
        console.log(err, doc);
    })
}
//testUpadate();

// 删除数据

function testDelete(){
    UserModel.remove({username: 'Jay'}, function(err, doc){
        console.log(err, doc);
    })
}
testDelete();