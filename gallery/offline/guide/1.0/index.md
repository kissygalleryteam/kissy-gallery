## 综述

Offline是一个离线存储组件，是对gallery里面之前一个离线存储（local-storage）的改进。

* 版本：1.0
* 基于：kissy1.20或者更高版本
* 作者：伯方


#### Offline的特性

* 将localStorage和低版本的ie userData分离出来，分别加载文件
* 提供了过期时间处理
* 在用户进行添加，删除等操作的时候提供事件触发，方便用户监听
* 每个外部方法都提供了返回值，便于写单元测试
* 对每个传入的参数都进行了验证
* 提供了统计使用字节的方法，便于用户估算剩余容量

## demo

[点击访问](http://sirzxj.github.com/gallery/offline/1.0/demo.html)

## 组件使用

kissy1.2下需要gallery的包配置：

```javascript
KISSY.config({
    packages:[
        {
            name:"gallery",
            path:"http://a.tbcdn.cn/s/kissy/",
            charset:"utf-8"
        }
    ]
});
```

kissy1.3就不需要该配置。




### 1.加载Offline模块,初始化Offline

```javascript
    KISSY.use('gallery/offline/1.0/index', function (S, Offline) {
        var offline = new Offline();
    })
```
**提醒**：use()的回调，第一个参数是KISSY，第二个参数才是组件。

### 2. 使用setItem方法保存数据
offline.setItem(key, value, deadline);
**提醒**：key和value必须都是字符串,第三个参数deadline是可选的，单位为毫秒，用于key的过期时间，过期后自动清除key
	

```javascript
//将key1 存到浏览器里30天
offline.setItem('key1','value1',1000*60*60*24*30);
```
返回值：成功返回true,失败返回false



### 3. 常规方法
getItem获得,removeItem移除，clear清空

### 4. 新增方法	

* timeRemain
	获取某个key存储的剩余时间（毫秒数）,没有限制的key会返回-1
* size
	获取本地存储的字段数
* getAll
	获取全部存储的字段
	**提醒**：getAll默认返回的是所有key和value 经过 stringify 的字符串，当传递true参数时候，则返回对象。
* usedByte
	返回浏览器中本地存储已经使用的字节数。

### 5. 其他
在使用setItem,removeItem,clear的时候，分别为为KISSY.Offline 触发了 setItem，removeItem,clear等事件，用于监听	 

