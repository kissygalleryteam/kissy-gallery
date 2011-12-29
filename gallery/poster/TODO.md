每一次 set 都是 change？
ie6 kissy 未定义
before switch 和 after 要分别对待

第一屏的 datalazyload 始终是个问题
auto 的部分抽出来

初始化的时候就要定位到某一张图片呢……

readme
model attachment 和 auction 先再说
提供更多 demo

model
    目前的场景仍是一开始便获取并初始化一批数据，故而 fetch save 等通信部分目前不考虑，不加入 model
    如果一开始需要异步获取远程数据的，那么用户手动 get，并且在回调中执行入口函数
    kissymvc backbone 中，所有变化都汇集到 router
    为扩展考虑，加入 fetch, save, parse, sync
data-binding
    数据绑定的事情应该交给 model 自己完成
    解决 adapter 的回调问题，迁移到 attrChange 里面
render
    是否要留给 huabao 一个纯粹的 model，不加入 dom 方面的东西，dom render 让用户来调用
    是否需要默认模板，手动加的话模板放在哪里
decorate ui
    ui 的接口要重新设计，加入 custom？提供扩展的接口
    为了用户能自行提供 decorate 方法，提供哪些接口
    ui 引起的是主要接口 attr 的改变，同时影响其他的 view
    加入 lazyload
plugin
    对外提供哪些接口


augment，使用 Attachable 模拟接口
extend，使用 SubClass.superclass 来调用父类的方法
base，使用 onChange 监听数据变化
instance，使用 prototype.method 在实例覆盖的方法中手动调用原方法

