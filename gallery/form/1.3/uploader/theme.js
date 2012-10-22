/**
 * @fileoverview 上传组件主题基类
 * @author 剑平（明河）<minghe36@126.com>
 **/

KISSY.add('gallery/form/1.3/uploader/theme', function (S, Node, Base) {
    var EMPTY = '', $ = Node.all,
        //主题样式名前缀
        classSuffix = {BUTTON:'-button', QUEUE:'-queue'};

    /**
     * @name Theme
     * @class 上传组件主题基类
     * @constructor
     * @extends Base
     * @requires Queue
     */
    function Theme(config) {
        var self = this;
        //调用父类构造函数
        Theme.superclass.constructor.call(self, config);
    }

    S.extend(Theme, Base, /** @lends Theme.prototype*/{
        /**
         * 组件运行
         */
        render:function(){
            var self = this;
            self._LoaderCss(function(){
                self._addThemeCssName();
                self.fire('render');
            });
        },
        /**
         * 在上传组件运行完毕后执行的方法（对上传组件所有的控制都应该在这个函数内）
         * @param {Uploader} uploader
         */
        afterUploaderRender:function (uploader) {

        },
        /**
         * 获取状态容器
         * @param {KISSY.NodeList} target 文件的对应的dom（一般是li元素）
         * @return {KISSY.NodeList}
         */
        _getStatusWrapper:function (target) {
            return target && target.children('.J_FileStatus') || $('');
        },
        /**
         * 控制文件对应的li元素的显影
         * @param {Boolean} isShow 是否认显示
         * @param {NodeList} target li元素
         * @param {Function} callback 回调
         */
        displayFile:function (isShow, target, callback) {
            var self = this,
                duration = self.get('duration');
            if (!target || !target.length) return false;
            target[isShow && 'fadeIn' || 'fadeOut'](duration, function () {
                callback && callback.call(self);
            });
        },
        /**
         * 文件处于等待上传状态时触发
         */
        _waitingHandler:function (ev) {

        },
        /**
         * 文件处于开始上传状态时触发
         */
        _startHandler:function (ev) {

        },
        /**
         * 文件处于正在上传状态时触发
         */
        _progressHandler:function (ev) {

        },
        /**
         * 文件处于上传成功状态时触发
         */
        _successHandler:function (ev) {

        },
        /**
         * 文件处于上传错误状态时触发
         */
        _errorHandler:function (ev) {

        },
        /**
         * 从路径隐藏域抓取文件，往队列添加文件后触发
         * @param ev
         */
        _restoreHandler:function (ev) {

        },
        /**
         * uploader实例化后执行
         */
        _UploaderRender:function (callback) {
            var self = this;
            self._initQueue();
            //加载插件
            self._loadPlugins(callback);
        },
        /**
         * 将主题名写入到队列和按钮目标容器，作为主题css样式起始
         */
        _addThemeCssName:function () {
            var self = this, name = self.get('name'),
                $queueTarget = $(self.get('queueTarget')),
                $btn = $(self.get('buttonTarget'));
            if (name == EMPTY) return false;
            if($queueTarget.length)  $queueTarget.addClass(name + classSuffix.QUEUE);
            $btn.addClass(name + classSuffix.BUTTON);
        },
        /**
         * 初始化队列
         * @return {Queue}
         */
        _initQueue:function () {
            var self = this, queue = self.get('queue');
            queue.set('fnAdd',function(index, file){
                return self._addCallback(index, file);
            });
            queue.set('theme', self);
            queue.on('add', self._addFileHandler, self);
            queue.on('remove', self._removeFileHandler, self);
            queue.on('statusChange', function (ev) {
                self._setStatusVisibility(ev);
            });
            return queue;
        },
        /**
         * 加载css文件
         */
        _LoaderCss:function (callback) {
            var self = this,
                cssUrl = self.get('cssUrl');
            //加载css文件
            if (cssUrl == EMPTY){
                callback.call(self);
                return false;
            }
            S.use(cssUrl, function () {
                S.log(cssUrl + '加载成功！');
                callback.call(self);
            });
        },
        /**
         * 向队列添加完文件后触发的回调函数（在add事件前触发）
         * @param {Number} index 文件索引值
         * @param {Object} file 文件数据
         * @return {Object} file
         */
        _addCallback:function (index, file) {
            var self = this,
                queue = self.get('queue'),
                $target = self._appendFileDom(file);
            //将状态层容器写入到file数据
            queue.updateFile(index, {
                target:$target,
                statusWrapper:self._getStatusWrapper($target)
            });
            //更换文件状态为等待
            queue.fileStatus(index,'waiting');
            self.displayFile(true, $target);
            //给li下的按钮元素绑定事件
            // TODO 这里的绑定事件应该只是imageUploader这个主题的吧，不应该放在公共的Theme下
            self._bindTriggerEvent(index, file);
            return queue.getFile(index);
        },
        /**
         * 删除队列中的文件后触发的监听器
         */
        _removeFileHandler:function (ev) {
            var self = this,
                file = ev.file;
            self.displayFile(false, file.target);
        },
        /**
         * 给删除、上传、取消等按钮元素绑定事件
         * TODO 这个是不是也应该放在imageUploader里面呢？
         * @param {Number} index 文件索引值
         * @param {Object} 文件数据
         */
        _bindTriggerEvent:function (index, file) {
            var self = this,
                queue = self.get('queue'),
                uploader = self.get('uploader'),
                //文件id
                fileId = file.id,
                //上传链接
                $upload = $('.J_Upload_' + fileId),
                //取消链接
                $cancel = $('.J_Cancel_' + fileId),
                //删除链接
                $del = $(".J_Del_" + fileId);
            //点击上传
            $upload.on('click', function (ev) {
                ev.preventDefault();
                if (!S.isObject(uploader)) return false;
                uploader.upload(index);
            });
            //点击取消
            $cancel.on('click', function (ev) {
                ev.preventDefault();
                uploader.cancel(index);
            });
            //点击删除
            $del.on('click', function (ev) {
                ev.preventDefault();
                //删除队列中的文件
                queue.remove(fileId);
            });
        },
        /**
         * 设置状态层的可见性
         * @param ev
         */
        _setStatusVisibility:function (ev) {
            var $statusWrapper = ev.file.statusWrapper, $status,
                file = ev.file, status = file.status;
            if (!$statusWrapper || !$statusWrapper.length) {
                S.log('状态容器层不存在！');
                return false;
            }
            $status = $statusWrapper.children('.status');
            $status.hide();
            $statusWrapper.children('.' + status + '-status').show();

            var $target = file.target;
            var statuses = ['waiting','start','uploading','progress','error','success'];
            S.each(statuses,function(status){
                $target.removeClass(status);
            });
            $target.addClass(status);
        },
        /**
         * 当队列添加完文件数据后向队列容器插入文件信息DOM结构
         * @param {Object} fileData 文件数据
         * @return {KISSY.NodeList}
         */
        _appendFileDom:function (fileData) {
            var self = this, tpl = self.get('fileTpl'),
                $target = $(self.get('queueTarget')),
                hFile;
            if (!$target.length) return false;
            hFile = S.substitute(tpl, fileData);
            return $(hFile).hide().appendTo($target).data('data-file', fileData);
        },
        /**
         * 根据插件配置加载插件
         */
        _loadPlugins:function(callback){
            var self = this,
                plugins = self.get('plugins'),
                oPlugin = self.get('oPlugin'),
                //模块路径前缀
                modPrefix = 'gallery/form/1.3/uploader/plugins/',
                mods = [];
            if(!plugins.length){
                callback && callback.call(self,oPlugin);
                return false;
            }
            //拼接模块路径
            S.each(plugins,function(plugin){
                mods.push(modPrefix+plugin+'/' +plugin);
            });
            S.use(mods.join(','),function(){
                 S.each(arguments,function(arg,i){
                     // 类排除S
                     if(i>=1) oPlugin[plugins[i-1]] = arg;
                 });
                self.set('oPlugin',oPlugin);
                callback && callback.call(self,oPlugin);
            })
        }
    }, {ATTRS:/** @lends Theme.prototype*/{
        /**
         *  主题名
         * @type String
         * @default ""
         */
        name:{value:EMPTY},
        /**
         * css模块路径
         * @type String
         * @default ""
         */
        cssUrl:{value:EMPTY},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:EMPTY },
        /**
         * 需要加载的插件，需要手动实例化
         * @type Array
         * @default []
         */
        plugins:{value:[]},
        /**
         * 插件类集合
         * @type Array
         * @default []
         */
        oPlugin:{value:{}},
        /**
         * 队列目标元素（一般是ul），队列的实例化过程在Theme中
         * @type String
         * @default ""
         */
        queueTarget:{value:EMPTY},
        /**
         * 动画速度
         * @type Number
         * @default 0.3
         */
        duration:{value:0.3},
        /**
         * Queue（上传队列）实例
         * @type Queue
         * @default ""
         */
        queue:{value:EMPTY},
        /**
         * Uploader 上传组件实例
         * @type Uploader
         * @default ""
         */
        uploader:{value:EMPTY},
        /**
         * Button 按钮实例（_init()下并不存在）
         * @type Button
         * @default ""
         */
        button:{value:EMPTY},
        /**
         * Auth（上传验证）实例
         * @type Auth
         * @default ""
         */
        auth:{value:EMPTY}
    }});
    return Theme;
}, {requires:['node', 'base']});
