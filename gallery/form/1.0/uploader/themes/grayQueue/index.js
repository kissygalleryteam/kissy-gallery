KISSY.add('gallery/form/1.0/uploader/themes/grayQueue/index',function(S, Node, DefaultTheme,Queue) {
    var EMPTY = '',$ = Node.all;

    /**
     * @name GrayQueue
     * @class 上传组件灰色模板
     * @constructor
     * @extends Base
     * @requires Node
     */
    function GrayQueue(config) {
        var self = this;
        //调用父类构造函数
        GrayQueue.superclass.constructor.call(self, config);
    }
    S.extend(GrayQueue, DefaultTheme, /** @lends GrayQueue.prototype*/{
        /**
         * 初始化
         */
        _init : function() {
            var self = this,queueTarget = self.get('queueTarget'),queue;
            queue = new Queue(queueTarget);
            self.set('queue',queue);
        },
        /**
         * 在上传组件运行完毕后执行的方法（对上传组件所有的控制都应该在这个函数内）
         * @param {Uploader} uploader
         */
        afterUploaderRender : function(uploader){
            var self = this,
                queue = uploader.get('queue'),
                //开始上传按钮
                $startUpload = $(self.get('elStartUpload')),
                //总进度数容器
                $totalProgressNum = $(self.get('elTotalProgressNum')),
                //上传按钮不可用时的样式名
                startUploadDisabledCls = self.get('startUploadDisabledCls');
            //监听队列的添加文件后事件
            queue.on('add',function(ev){
                $startUpload.removeClass( startUploadDisabledCls);
            });
            //全部上传完成后触发
            uploader.on('uploadAll',function(){
                //进度条
                var progressBar = uploader.get('progressBar');
                //强制进度到100%，防止部分上传只能到99%的问题
                progressBar.set('value',100);
                progressBar.hide();
                $totalProgressNum.text('100%');
            });
            //点击开始上传的按钮
            $startUpload.on('click',function(ev){
                ev.preventDefault();
                //如果不是禁用状态，上传所有等待中的文件
                if(!$startUpload.hasClass( startUploadDisabledCls)){
                    var progressBar = uploader.get('progressBar');
                    if(progressBar) progressBar.show();
                    uploader.uploadAll();
                }
            })
        }
    }, {ATTRS : /** @lends GrayQueue*/{
        elStartUpload : {value : '#J_StartUpload'},
        startUploadDisabledCls : {value : 'start-upload-disabled'},
        elTotalProgressNum : {value : '#J_TotalProgressNum'}
    }});
    return GrayQueue;
}, {requires : ['node','../default/index','./queue','./style.css']});