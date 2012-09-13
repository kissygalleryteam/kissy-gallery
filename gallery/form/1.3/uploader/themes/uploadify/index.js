/**
 * @fileoverview  改造自jquery的异步上传插件uploadify
 * @author  明河
 **/
KISSY.add('gallery/form/1.3/uploader/themes/uploadify/index', function (S, Node, Theme) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name Uploadify
     * @class 改造自jquery的异步上传插件uploadify
     * @constructor
     * @extends Theme
     * @requires Theme
     * @requires  ProgressBar
     * @author 明河
     */
    function Uploadify(config) {
        var self = this;
        //调用父类构造函数
        Uploadify.superclass.constructor.call(self, config);
    }

    S.extend(Uploadify, Theme, /** @lends Uploadify.prototype*/{
        /**
         * 在上传组件运行完毕后执行的方法（对上传组件所有的控制都应该在这个函数内）
         * @param {Uploader} uploader
         */
        afterUploaderRender:function (uploader) {

        },
        /**
         * 在完成文件dom插入后执行的方法
         * @param {Object} ev 类似{index:0,file:{},target:$target}
         */
        _addFileHandler:function(ev){

        },
        /**
         * 获取状态容器
         * @param {KISSY.NodeList} target 文件的对应的dom（一般是li元素）
         * @return {KISSY.NodeList}
         */
        _getStatusWrapper:function (target) {
            return target.children('.J_FileStatus');
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
            var self = this,
                uploader = ev.uploader,
                index = ev.index,
                queue = self.get('queue'),
                //上传方式
                uploadType = uploader.get('type');
            //如果是ajax或flash异步上传，加入进度条
            if(uploadType == 'ajax' || uploadType == 'flash'){

            }
        },
        /**
         * 文件处于正在上传状态时触发
         */
        _progressHandler:function (ev) {
            var file = ev.file,
                //已加载字节数
                loaded = ev.loaded,
                //总字节数
                total = ev.total,
                val = Math.ceil((loaded/total) * 100);

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
            var self = this,msg = ev.msg,
                id = ev.id;
            //打印错误消息
            $('.J_ErrorMsg_' + id).html(msg);
             self._setDisplayMsg(true,ev.file);
             //向控制台打印错误消息
             S.log(msg);
        },
        /**
         * 获取成功上传的图片张数，不传参的情况获取成功上传的张数
         * @param {String} status 状态
         * @return {Number} 图片数量
         */
        getFilesLen:function(status){
            if(!status) status = 'success';
            var self = this,
            queue = self.get('queue'),
            //成功上传的文件数
            successFiles = queue.getFiles(status);
            return successFiles.length;
        }
    }, {ATTRS:/** @lends Uploadify.prototype*/{
        /**
         *  主题名（文件名），此名称跟样式息息相关
         * @type String
         * @default "uploadify"
         */
        name:{value:'uploadify'},
        /**
         * css模块路径
         * @type String
         * @default "gallery/form/1.3/uploader/themes/imageUploader/style.css"
         */
        cssUrl:{value:'gallery/form/1.3/uploader/themes/uploadify/style.css'},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:
            '<li id="queue-file-{id}" class="clearfix queue-file" data-name="{name}">' +
                '<div class="f-l file-name">{name}</div>' +
                '<div class="f-r file-status status-wrapper J_FileStatus">' +
                    '<div class="status waiting-status start-status progress-status success-status clearfix"><div class="f-l J_ProgressNum_{id}">0%</div><div class="f-l uploader-icon del-icon J_Del_{id"></div></div>' +
                    '<div class="status error-status tips-upload-error">' +
                        '{msg}<a href="#fileDel" class="J_FileDel">点此删除</a>' +
                    '</div>' +
                '</div>' +
                '<div class="f-r file-size">{textSize}</div>' +
            '</li>'
        },
        /**
         * 需要加载的插件，需要手动实例化
         * @type Array
         * @default ['progressBar'] 进度条
         */
        plugins:{
          value:['progressBar']
        },
        /**
         * 统计上传张数的容器
         * @type KISSY.NodeList
         * @default '#J_UploadCount'
         */
        elCount:{value:'#J_UploadCount'}
    }});
    return Uploadify;
}, {requires:['node', '../../theme']});