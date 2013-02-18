/**
 * @fileoverview 默认主题
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.3/uploader/themes/daogouUploader/index', function (S, Node, Theme) {
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
    function Daogou(config) {
        var self = this;
        //调用父类构造函数
        Daogou.superclass.constructor.call(self, config);
    }

    S.extend(Daogou, Theme, /** @lends Daogou.prototype*/{
        /**
         * 在上传组件运行完毕后执行的方法（对上传组件所有的控制都应该在这个函数内）
         * @param {Uploader} uploader
         */
        afterUploaderRender:function (uploader) {
            uploader.on('select',function(ev){
                var file = ev.files[0];
                var name = file.name;
                $('.J_FileName').val(name);
            })
        },
        /**
         * 获取状态容器
         * @param {KISSY.NodeList} target 文件的对应的dom（一般是li元素）
         * @return {KISSY.NodeList}
         */
        _getStatusWrapper:function(target){
            return target && target.children('.J_FileStatus') || $('');
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
                 file = ev.file,
                 //进度条容器
                 $progressBar = $('.J_ProgressBar_' + ev.id);
            self._showMsg(file,'.J_UploadingMsg');
            //如果是ajax或flash异步上传，加入进度条
            if(uploadType == 'ajax' || uploadType == 'flash'){
                var ProgressBar = self.get('oPlugin').progressBar,progressBar;
                if(ProgressBar){
                    progressBar = new ProgressBar($progressBar,{width:self.get('progressBarWidth')});
                    progressBar.on('change',function(ev){
                        if(ev.value == 100){
                            S.later(function(){
                                self._showMsg(file,'.J_SuccessMsg');
                            },200);
                        }
                    });
                    progressBar.render();

                }
                //将进度条实例写入到队列的文件数据上备用
                queue.updateFile(index,{progressBar:progressBar});
            }

        },
        /**
         * 文件处于正在上传状态时触发
         */
        _progressHandler:function(ev){
            var file = ev.file,
                //已加载字节数
                loaded = ev.loaded,
                //总字节数
                total = ev.total,
                val = Math.ceil((loaded/total) * 100),
                progressBar = file.progressBar;
            if(!progressBar) return false;
            //处理进度
            progressBar.set('value',val);
        },
        /**
         * 文件处于上传成功状态时触发
         */
        _successHandler:function(ev){
            var file = ev.file;
            var progressBar = file.progressBar;
            //处理进度
            progressBar.set('value',100);
        },
        /**
         * 文件处于上传错误状态时触发
         */
        _errorHandler:function(ev){
            var msg = ev.msg,
                id = ev.id;
            //打印错误消息
            $('.J_ErrorMsg_' + id).html(msg);
            self._showMsg(ev.file,'.J_ErrorMsg');
        },
        /**
         * 显示错误消息
         * @param hook
         * @private
         */
        _showMsg:function(file,hook){
            var $target = $(file.target);
            $target.all('.status-msg').hide();
            $target.all(hook).show();
        }
    }, {ATTRS:/** @lends Daogou.prototype*/{
        /**
         *  主题名（文件名）
         * @type String
         * @default "daogouUploader"
         */
        name:{value:'daogouUploader'},
        /**
         * css模块路径
         * @type String
         * @default "gallery/form/1.3/uploader/themes/default/style.css"
         */
        cssUrl:{value:'gallery/form/1.3/uploader/themes/daogouUploader/style.css'},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:
            '<div id="queue-file-{id}" class="file-uploading" data-name="{name}">' +
                '<div class="J_UploadingMsg status-msg">' +
                    '<p class="file-name">{name}</p>' +
                    '<p class="tx">正在部署，请稍候...</p>' +
                    '<div class="J_ProgressBar_{id} f-l uploader-progress"><img class="loading" src="http://img01.taobaocdn.com/tps/i1/T1F5tVXjRfXXXXXXXX-16-16.gif" alt="loading" /></div>' +
                '</div>' +


                '<div class="J_SuccessMsg status-msg"><i class="i-success"></i><div class="tx"><b>上传成功!</b></div>' +

                '<div class="J_ErrorMsg status-msg"> <i class="i-tip"></i> <div class="tx"><b>上传失败：<i class="dg-light J_ErrorMsg_{id}"></i></b></div></div>' +
            '</div>'
        },
        /**
         * 需要加载的插件，需要手动实例化
         * @type Array
         * @default [''progressBar'] 进度条
         */
        plugins:{
            value:['progressBar']
        },
        /**
         * 进度条宽度
         * @type Number
         * @default 100
         */
        progressBarWidth:{value:400}
    }});
    return Daogou;
}, {requires:['node', '../../theme']});