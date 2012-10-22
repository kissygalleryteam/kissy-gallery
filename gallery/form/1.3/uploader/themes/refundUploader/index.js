/**
 * @fileoverview 图片上传主题（带图片预览）
 * @author 明河
 **/
KISSY.add(function (S, Node, Theme) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name RefundUploader
     * @class 图片上传主题（带图片预览）
     * @constructor
     * @extends Theme
     * @requires Theme
     * @requires  ProgressBar
     * @author 明河
     */
    function RefundUploader(config) {
        var self = this;
        //调用父类构造函数
        RefundUploader.superclass.constructor.call(self, config);
    }

    S.extend(RefundUploader, Theme, /** @lends RefundUploader.prototype*/{
        /**
         * 在上传组件运行完毕后执行的方法（对上传组件所有的控制都应该在这个函数内）
         * @param {Uploader} uploader
         */
        afterUploaderRender:function () {
            var self = this;
            var queue = self.get('queue');
            queue.on('add',self._addFileHandler,self);
            //当移除文件后改变按钮上的文案
            queue.on('remove',function(){
                self._changeText();
            });
            //获取下按钮上的文案
            var button = self.get('button');
            var text = $(button.get('target')).text();
            self.set('defaultText',text);
        },
        /**
         * 在完成文件dom插入后执行的方法
         * @param {Object} ev 类似{index:0,file:{},target:$target}
         */
        _addFileHandler:function(ev){
            var self = this,
                file = ev.file,
                $delBtn = $('.J_Del_'+file.id) ;
            $delBtn.data('data-file',file);
            //点击删除按钮
            $delBtn.on('click',self._delHandler,self);
        },
        /**
         * 获取状态容器
         * @param {KISSY.NodeList} target 文件的对应的dom（一般是li元素）
         * @return {KISSY.NodeList}
         */
        _getStatusWrapper:function (target) {
            return target && target.all('.J_FileStatus') || $('');
        },
        /**
         * 文件处于等待上传状态时触发
         */
        _waitingHandler:function (ev) {
             var self = this;
            var  uploader = ev.uploader;
            //上传方式
            var uploadType = uploader.get('type');
            //chrome和firefox下支持图片预览
            if(uploadType == 'ajax'){
                var Preview = self.get('oPlugin').preview;
                var file = ev.file;
                var id= file.id;
                var $img = $('.J_Pic_' + id);
                $img.show();
                var p = new Preview();
                p.show(file.data,$img);
            }
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
                uploadType = uploader.get('type'),
                file = ev.file,
                $progressBar = $('.J_ProgressBar_' + ev.id);
            var $mask = $('.J_Mask_'+ev.id);
            $mask.show();
            //如果是ajax或flash异步上传，加入进度条
            if(uploadType == 'ajax' || uploadType == 'flash'){
                var ProgressBar = self.get('oPlugin').progressBar,progressBar;
                if(ProgressBar){
                    progressBar = new ProgressBar($progressBar);
                    progressBar.on('change',function(ev){
                        //百分百进度隐藏进度条
                        if(ev.value == 100){
                            S.later(function(){
                                progressBar.hide();
                                self._setDisplayMask(false,file);
                                //隐藏状态层
                                file.statusWrapper.hide();
                            },500);
                        }
                    });
                    progressBar.render();
                    self.set('progressBar',progressBar);
                }
                //将进度条实例写入到队列的文件数据上备用
                queue.updateFile(index,{progressBar:progressBar});
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
                val = Math.ceil((loaded/total) * 100),
                progressBar = file.progressBar;
            if(!progressBar) return false;
            //处理进度
            progressBar.set('value',val);
        },
        /**
         * 文件处于上传成功状态时触发
         */
        _successHandler:function (ev) {
            var self = this,
                file = ev.file,
                id = file.id,
                //服务器端返回的数据
                result = file.result,
                progressBar = file.progressBar;
            //获取服务器返回的图片路径写入到src上
            if(result) self._changeImageSrc(ev.id,result);
            self._changeText();
            //不存在进度条直接予以隐藏
            if(!progressBar){
                $('.J_ProgressBar_'+id).hide();
                self._setDisplayMask(false,ev.file);
                file.statusWrapper.hide();
                return false;
            }else{
                //处理进度
                progressBar.set('value',100);
            }
        },
         /**
         * 文件处于上传错误状态时触发
         */
        _errorHandler:function (ev) {
            var self = this,msg = ev.msg,
                id = ev.id;
             var queue = self.get('queue');
             //向控制台打印错误消息
             S.log(msg);
             if(ev.rule == 'max' || ev.rule == 'required') return false;
            //打印错误消息
            $('.J_ErrorMsg_' + id).html('上传失败');
             S.later(function(){
                 alert(msg);
                 queue.remove(id);
             },1000);
        },
        /**
         * 显示/隐藏遮罩层（遮罩层在出现状态消息的时候出现）
         */
        _setDisplayMask:function(isShow,data){
            if(!data) return false;
            var $mask = $('.J_Mask_' + data.id);
            $mask[isShow && 'show' || 'hide']();
            if(isShow){
                $mask.show();
            }else{
                $mask.hide();
            }
        },
        /**
         * 删除图片后触发
         */
        _delHandler:function(ev){
             var self = this,uploader = self.get('uploader'),queue = self.get('queue'),
                 file = $(ev.target).data('data-file'),index = queue.getFileIndex(file.id),
                 status = file.status;
            //如果文件还在上传，取消上传
             if(status == 'start' || status == 'progress'){
                 uploader.cancel(index);
             }
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
        },
        /**
         * 将服务器返回的图片路径写到预览图片区域，部分浏览器不支持图片预览
         * @param {String} id  文件id
         * @param {Object} result  服务器端返回的结果集
          */
        _changeImageSrc:function(id,result){
            var data = result.data,url,
                $img = $('.J_Pic_' + id);
            if(!S.isObject(data)) return false;
            url = data.sUrl || data.url;
            if($img.attr('src') == EMPTY || S.UA.safari){
                $img.show();
                $img.attr('src',url);
            }
        },
        /**
         * 改变按钮上的文案
         * @private
         */
        _changeText:function(){
            var self = this;
            var len = self.getFilesLen();
            var auth = self.get('auth') ;
            var btn = self.get('button');
            var $text = btn.get('target').children('span');
            var maxText = self.get('maxText');
            var defaultText = self.get('defaultText');
            if(!auth) return false;
            var rules = auth.get('rules'),
            //max的值类似[5, '最多上传{max}个文件！']
                max = rules.max;
            if(!max) return false;
            if(Number(max[0]) <= len){
                //改变按钮文案
                $text.text(S.substitute(maxText,{max:max[0]}));
            }else{
                $text.text(defaultText);
            }
        }
    }, {ATTRS:/** @lends RefundUploader.prototype*/{
        /**
         *  主题名（文件名），此名称跟样式息息相关
         * @type String
         * @default "refundUploader"
         */
        name:{value:'refundUploader'},
        /**
         * css模块路径
         * @type String
         * @default "gallery/form/1.3/uploader/themes/refundUploader/style.css"
         */
        cssUrl:{value:'gallery/form/1.3/uploader/themes/refundUploader/style.css'},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:
            '<li id="queue-file-{id}" class="g-u" data-name="{name}">' +
                '<div class="pic-wrapper">' +
                    '<div class="pic">' +
                        '<span><img class="J_Pic_{id}" src="" /></span>' +
                    '</div>' +
                    '<div class=" J_Mask_{id} pic-mask"></div>' +
                    '<div class="status-wrapper J_FileStatus">' +
                        '<div class="status waiting-status"><p>等待上传</p></div>' +
                        '<div class="status start-status progress-status success-status">' +
                            '<div class="J_ProgressBar_{id}"></div>' +
                            '<div>上传中</div>' +
                        '</div>' +
                        '<div class="status error-status">' +
                            '<p class="J_ErrorMsg_{id}">上传失败，请重试！</p></div>' +
                    '</div>' +
                '</div>'+
                '<div>' +
                    '<a class="J_Del_{id} del-pic" href="#">删除</a>' +
                '</div>' +
            '</li>'
        },
        /**
         * 需要加载的插件，需要手动实例化
         * @type Array
         * @default ['preview','progressBar','filedrop'] 图片预览、进度条、文件拖拽
         */
        plugins:{
          value:['progressBar','preview']
        },
        /**
         * 按钮上的默认文案（只读）
         * @type String
         * @default ''
         */
        defaultText:{value:EMPTY},
        /**
         * 当达到最大上传数时按钮上改变的文案
         * @type String
         * @default '您已上传满{max}张图片'
         */
        maxText:{value:'您已上传满{max}张图片'}
    }});
    return RefundUploader;
}, {requires:['node', '../../theme']});