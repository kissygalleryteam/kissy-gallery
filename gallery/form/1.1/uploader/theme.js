/**
 * @fileoverview 上传组件主题基类
 * @author 剑平（明河）<minghe36@126.com>
 **/

KISSY.add('gallery/form/1.1/uploader/theme', function (S, Node, Base, Queue) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name Theme
     * @class 上传组件主题基类
     * @constructor
     * @extends Base
     * @requires Node
     */
    function Theme(config) {
        var self = this;
        //调用父类构造函数
        Theme.superclass.constructor.call(self, config);
        self._LoaderCss();
        self._init();
    }

    S.extend(Theme, Base, /** @lends Theme.prototype*/{
        /**
         * 初始化
         */
        _init:function () {
            var self = this,
                queue = self._initQueue(),
                name=self.get('name');
            if(name != EMPTY){
                var $queueTarget = queue.get('target');
                if($queueTarget.length){
                    $queueTarget.addClass(name+'-queue');
                }
            }
        },
        /**
         * 初始化队列
         */
        _initQueue:function(){
            var self = this, queueTarget = self.get('queueTarget'), queue,
                tpl = self.get('fileTpl'),
                config = {tpl:tpl};
            //合并从伪属性中抓取的配置
            S.mix(config,S.parseConfig(queueTarget, 'data-queue-config'));
            queue = new Queue(queueTarget, config);
            queue.set('theme',self);
            self.set('queue', queue);
            queue.on('addData',function(ev){
                queue.updateFile(ev.index,{
                    statusWrapper:self._getStatusWrapper(ev.file.target)
                });
            });
            queue.on('add',function(ev){
                self._addFileHandler(ev);
            });
            queue.on('statusChange',function(ev){
                self._setStatusVisibility(ev);
            });
            return queue;
        },
        /**
         * 获取状态容器
         * @param {KISSY.NodeList} target 文件的对应的dom（一般是li元素）
         * @return {KISSY.NodeList}
         */
        _getStatusWrapper:function(target){
            return target.children('.J_FileStatus');
        },
        /**
         * 加载css文件
         */
        _LoaderCss:function () {
            var self = this,
                isUseCss = self.get('isUseCss'),
                cssUrl = self.get('cssUrl');
            //加载css文件
            if (isUseCss) {
                S.use(cssUrl, function () {
                    S.log(cssUrl + '加载成功！');
                }); }
        },
        /**
         * 在上传组件运行完毕后执行的方法（对上传组件所有的控制都应该在这个函数内）
         * @param {Uploader} uploader
         */
        afterUploaderRender:function (uploader) {

        },
        /**
         * 添加完文件后触发的监听器
         */
        _addFileHandler:function(ev){
            var self = this,
                queue = self.get('queue'),
                uploader = ev.uploader,
                index = ev.index,
                //文件id
                fileId = ev.file.id,
                //上传链接
                $upload = $('.J_Upload_' + fileId),
                //取消链接
                $cancel = $('.J_Cancel_' + fileId),
                //删除链接
                $del = $(".J_Del_"+fileId);
            //点击上传
            $upload.on('click',function(ev){
                ev.preventDefault();
                if (!S.isObject(uploader)) return false;
                uploader.upload(index);
            });
            //点击取消
            $cancel.on('click', function(ev) {
                ev.preventDefault();
                uploader.cancel(index);
            });
            //点击删除
            $del.on('click',function(){
                ev.preventDefault();
                //删除队列中的文件
                queue.remove(fileId);
            }) ;
        },
        //设置状态层的可见性
        _setStatusVisibility:function(ev){
            var $statusWrapper = ev.file.statusWrapper,$status,
                file = ev.file,status = file.status;
            if(!$statusWrapper.length){
                S.log('状态容器层不存在！');
            }
            $status = $statusWrapper.children('.status');
            $status.hide();
            $statusWrapper.children('.' + status + '-status').show();
        },
        /**
         * 文件处于等待上传状态时触发
         */
        _waitingHandler:function(ev){

        },
        /**
         * 文件处于开始上传状态时触发
         */
        _startHandler : function(ev){

        },
        /**
         * 文件处于正在上传状态时触发
         */
        _progressHandler:function(ev){

        },
        /**
         * 文件处于上传成功状态时触发
         */
        _successHandler:function(ev){

        },
        /**
         * 文件处于上传错误状态时触发
         */
        _errorHandler:function(ev){

        },
        /**
         * 从路径隐藏域抓取文件，往队列添加文件后触发
         * @param ev
         */
        _restoreHandler:function(ev){

        }
    }, {ATTRS:/** @lends Theme.prototype*/{
        /**
         *  主题名
         * @type String
         * @default ""
         */
        name:{value:EMPTY},
        /**
         * 是否引用css文件
         * @type Boolean
         * @default true
         */
        isUseCss:{value:true},
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
         * 队列目标元素（一般是ul），队列的实例化过程在Theme中
         * @type String
         * @default ""
         */
        queueTarget:{value:EMPTY},
        /**
         * Queue（上传队列）实例
         * @type Queue
         * @default ""
         */
        queue:{value:EMPTY},
        /**
         * Auth（上传验证）实例
         * @type Auth
         * @default ""
         */
        auth:{value:EMPTY}
    }});
    return Theme;
}, {requires:['node', 'base', './queue']});