KISSY Gallery 说明
==========================

展览馆，存放社区贡献的正式组件

组件目录结构
-------------------------------

0) **assets 统一使用 UTF-8**;

1) github上 Gallery 目录结构说明:

gallery 根目录下, 提交各个组件目录, 拿 pagination 举例:

```
gallery
| -- pagination         // 组件目录名, 小写, 多字符用 – 分隔
|          |-----1.0    // 版本名字, 两个数字表示 x.x
|          |         |---------assets               // 和组件相关的assets资源
|          |         |               |-------img    // css中用到的图片目录
|          |         |               |-------pagination.css         // 组件相关的皮肤, 可定义多套, 里面如果用到图片请使用相对路径
|          |         |---------pagination.js                        // 组件代码
|          |         |---------pagination-part2.js                  // 如果组件源码有多个js文件, 也请放置此目录下, 例如 grid组件下的多个脚本;
|          |         |---------index.js                             // 入口文件
|          |         |---------demo.html                            // 示例
|          |         |---------build.xml                            // 打包配置, 添加新组件时, 请参考 yours下目录,
|          |         |---------CHANGELOG.md                         // 变更点说明文档, 可选
|          |-----tmp                                  // 示例用到的assets资源, 这些不应该包含在组件中
```
开发时写的demo, 需要头部配置:

    <script>
    KISSY.config({
      packages:[
        {
          name:"gallery",
          tag:"20111220",
          path:"../../../",  // 开发时目录, 发布到cdn上需要适当修改
          charset:"utf-8"
        }
      ]
    });
    </script>


add时,

```
KISSY.add('gallery/pagination/1.0/pagination', function(S, Template, undefined) {
},{requires:["template"]});
```

use时, 

``` 
KISSY.use('gallery/pagination/1.0/pagination,gallery/pagination/1.0/tmp/friends,
gallery/pagination/1.0/tmp/demo.css,gallery/pagination/1.0/assets/pagination.css', function(S, P, FriendList, undefined) {
});
```


2)	cdn上 Gallery 目录结构说明:

```
/pathtocdn/kissy/gallery
| -- pagination
|          |-----index.html             // 组件索引 
|          |-----1.0
|          |         |---------assets    // 该目录会完整从github上的assets拷贝过去, 并且会压缩源码
|          |         |---------index.js   // 将版本号下的代码打包成一个文件 ,名字为 index.js 并压缩;
```

这样使用 Gallery组件时, 可以 S.use("gallery/pagination/1.0/", function (S, Pagination) {});


3)	还有几个注意点:

  3.0) gallery-build 打包目录;
  
  3.1) 打包规则:
  
  - 各个组件通过各自的 build.xml 统一build 到外面, 不需要组件开发者手工build, 我们会定时统一build好提交到cdn上, 这个打包规则应该能够满足90%的需求, 如果某些特殊, 可以自行编写 build.xml;

  3.2) 提交新组件时:
  
  - 务必gallery 中组件使用 1.2.0 Loader 的写法.
  - 提交到 KISSY Gallery 请参考 yours 中目录结构;
  
  3.3) 修改组件时:
  
  - 小修改/bugfix, 保持兼容且适当写上changelog;
  - 大修改或者接口不兼容, 建议新起版本号, 并注明升级注意点;
