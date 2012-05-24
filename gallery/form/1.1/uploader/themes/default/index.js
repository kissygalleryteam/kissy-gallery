/**
 * @fileoverview 默认主题
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.1/uploader/themes/default/index', function (S, Node, Theme) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name DefaultTheme
     * @class 默认主题
     * @constructor
     * @extends Theme
     * @requires Theme
     * @requires  ProgressBar
     * @author 剑平（明河）<minghe36@126.com>
     */
    function DefaultTheme(config) {
        var self = this;
        //调用父类构造函数
        DefaultTheme.superclass.constructor.call(self, config);
    }

    S.extend(DefaultTheme, Theme, /** @lends DefaultTheme.prototype*/{
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
        _getStatusWrapper:function(target){
            return target.children('.J_FileStatus');
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
             var self = this,
                 uploader = ev.uploader,
                 index = ev.index,
                 queue = self.get('queue'),
                 //上传方式
                 uploadType = uploader.get('type'),
                 $progressBar = $('.J_ProgressBar_' + ev.id);
            //如果是ajax或flash异步上传，加入进度条
            if(uploadType == 'ajax' || uploadType == 'flash'){
<<<<<<< HEAD
                var ProgressBar = self.get('oPlugin').progressBar,
            progressBar = new ProgressBar($progressBar);
            progressBar.render();
            self.set('progressBar',progressBar);
            //将进度条实例写入到队列的文件数据上备用
            queue.updateFile(index,{progressBar:progressBar});
        }
=======
                var ProgressBar = self.get('oPlugin').progressBar,progressBar;
                if(ProgressBar){
                    progressBar = new ProgressBar($progressBar);
                    progressBar.render();
                    self.set('progressBar',progressBar);
                }
                //将进度条实例写入到队列的文件数据上备用
                queue.updateFile(index,{progressBar:progressBar});
            }
>>>>>>> KF/master
        },
        /**
         * 文件处于正在上传状态时触发
         */
        _progressHandler:function(ev){
<<<<<<< HEAD
        var file = ev.file,
        //已加载字节数
            loaded = ev.loaded,
        //总字节数
            total = ev.total,
            val = Math.ceil(loaded/total) * 100,
            progressBar = file.progressBar;
        if(!progressBar) return false;
=======
            var file = ev.file,
                //已加载字节数
                loaded = ev.loaded,
                //总字节数
                total = ev.total,
                val = Math.ceil((loaded/total) * 100),
                progressBar = file.progressBar;
            if(!progressBar) return false;
>>>>>>> KF/master
            //处理进度
            progressBar.set('value',val);
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
            var msg = ev.msg,
                id = ev.id;
            //打印错误消息
            $('.J_ErrorMsg_' + id).html(msg);
        }
    }, {ATTRS:/** @lends DefaultTheme.prototype*/{
        /**
         *  主题名（文件名）
         * @type String
         * @default "defaultTheme"
         */
        name:{value:'defaultTheme'},
        /**
         * css模块路径
         * @type String
         * @default "gallery/form/1.1/uploader/themes/default/style.css"
         */
        cssUrl:{value:'gallery/form/1.1/uploader/themes/default/style.css'},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:
            '<li id="queue-file-{id}" class="clearfix" data-name="{name}">' +
                '<div class="f-l sprite file-icon"></div>' +
                '<div class="f-l">{name}</div>' +
                '<div class="f-l status-wrapper J_FileStatus">' +
                    '<div class="status waiting-status">等待上传，<a class="J_Upload_{id}" href="#Upload">点此上传</a> </div>' +
                    '<div class="status start-status progress-status clearfix">' +
                        '<div class="J_ProgressBar_{id} f-l uploader-progress"><img class="loading" src="http://img01.taobaocdn.com/tps/i1/T1F5tVXjRfXXXXXXXX-16-16.gif" alt="loading" /></div>' +
                        ' <a  class="J_Cancel_{id} f-l upload-cancel" href="#uploadCancel">取消</a>' +
                    '</div> ' +
                    ' <div class="status success-status"><a href="#fileDel" class="J_Del_{id}">删除</a></div>' +
                    '<div class="status cancel-status">已经取消上传，<a href="#reUpload" id="J_ReUpload_{id}" class="J_Upload_{id}">点此重新上传</a> </div>' +
                    '<div class="status error-status upload-error"><span class="J_ErrorMsg_{id}"></span><a href="#fileDel" class="J_Del_{id}">删除</a></div>' +
                '</div>' +
                '</li>'
        },
        /**
         * 需要加载的插件，需要手动实例化
         * @type Array
         * @default [''progressBar'] 进度条
         */
        plugins:{
            value:['progressBar']
        }
    }});
    return DefaultTheme;
}, {requires:['node', '../../theme']});