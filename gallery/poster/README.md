# 画报组件化 #

## APIs ###

### Huabao ###

#### Class ####

#### Config Attributes ####

#### Properties ####

#### Methods ####

#### Static Methods ####

### Poster ###

## Extensions ##

### Data-source Adaptor ###

画报的数据可能来自不同的源，源提供的原始数据格式很可能和 model 需要的格式
不一致，自然需要一个 adaptor 或者说 parser

默认数据源类型使用 config 中的 dataSourceType 指定；默认的 parser
在 Poster, Pic, Attachment 中实现

    Poster.prototype.parse = function(dataSourceType, dataSource) {}

**如果数据源是异步的，那么需要用户自行处理异步调用，再在回调中执行 Huabao
的构建工作**（model 自身的 fetch sync 支持有待下一版改进）