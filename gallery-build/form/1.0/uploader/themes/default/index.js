KISSY.add('gallery/form/1.0/uploader/themes/default/index', function (S, Node, Base, Queue) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name DefaultTheme
     * @class 上传组件默认模板
     * @constructor
     * @extends Base
     * @requires Node
     */
    function DefaultTheme(config) {
        var self = this;
        //调用父类构造函数
        DefaultTheme.superclass.constructor.call(self, config);
        self._LoaderCss();
        self._init();
    }

    S.extend(DefaultTheme, Base, /** @lends DefaultTheme.prototype*/{
        /**
         * 初始化
         */
        _init:function () {
            var self = this, queueTarget = self.get('queueTarget'), queue,
                //处理队列的配置
                config = S.parseConfig(queueTarget, 'data-queue-config');
            queue = new Queue(queueTarget, config);
            self.set('queue', queue);
        },
        /**
         * 加载css文件
         */
        _LoaderCss : function(){
            var self = this,
                isUseCss = self.get('isUseCss'),
                cssUrl = self.get('cssUrl');
            //加载css文件
            if(isUseCss){
                S.use(cssUrl,function(){ });
            }
        },
        /**
         * 在上传组件运行完毕后执行的方法（对上传组件所有的控制都应该在这个函数内）
         * @param {Uploader} uploader
         */
        afterUploaderRender:function (uploader) {
            var self = this,$uploadFiles = $(self.get('elUploadFiles'));
            //存在上传按钮，用户点击该按钮上传文件
            if($uploadFiles.length){
                $uploadFiles.on('click',function(){
                    uploader.uploadFiles();
                });
            }
        }
    }, {ATTRS:/** @lends DefaultTheme*/{
        /**
         * 是否引用css文件
         */
        isUseCss : {value:true},
        /**
         * css模块路径
         */
        cssUrl:{value:'gallery/form/1.0/uploader/themes/default/style.css'},
        /**
         * 上传按钮（上传所有等待的文件）
         */
        elUploadFiles : {value:EMPTY},
        queueTarget:{value:EMPTY},
        queue:{value:EMPTY}
    }});
    return DefaultTheme;
}, {requires:['node', 'base', '../../queue/base']});