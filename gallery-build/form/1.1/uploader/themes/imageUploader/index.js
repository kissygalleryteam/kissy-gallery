/**
 * @fileoverview 图片上传主题（带图片预览），第一版由紫英同学完成，苏河同学做了大量优化，明河整理优化
 * @author 苏河、紫英、明河
 **/
KISSY.add('gallery/form/1.1/uploader/themes/imageUploader/index', function (S, Node, Theme) {
    var EMPTY = '', $ = Node.all;

    /**
     * @name ImageUploader
     * @class 图片上传主题（带图片预览），第一版由紫英同学完成，苏河同学做了大量优化，明河整理优化
     * @constructor
     * @extends Theme
     * @requires Theme
     * @requires  ProgressBar
     * @author 苏河、紫英、明河
     */
    function ImageUploader(config) {
        var self = this;
        //调用父类构造函数
        ImageUploader.superclass.constructor.call(self, config);
    }

    S.extend(ImageUploader, Theme, /** @lends ImageUploader.prototype*/{
        /**
         * 在上传组件运行完毕后执行的方法（对上传组件所有的控制都应该在这个函数内）
         * @param {Uploader} uploader
         */
        afterUploaderRender:function (uploader) {
            var self = this,
                Preview = self.get('oPlugin').preview,
                preview = new Preview(),
                queue = self.get('queue');
            //图片预览
            self.set('preview',preview);
           //达到最大允许上传数隐藏上传按钮
            self._maxHideBtn(uploader);
            self._renderFiledrop();
            queue.on('add',self._addFileHandler,self);
        },
        /**
         * 在完成文件dom插入后执行的方法
         * @param {Object} ev 类似{index:0,file:{},target:$target}
         */
        _addFileHandler:function(ev){
            var self = this,file = ev.file,$target = file.target,$delBtn = $('.J_Del_'+file.id),
                $mask = $('.J_Mask_' + file.id) ;
            //显示/隐藏删除按钮
            $target.on('mouseover mouseout',function(ev){
                if(ev.type == 'mouseover'){
                    $delBtn.show();
                    $mask.show();
                }else{
                    $delBtn.hide();
                    $mask.hide();
                }
            });
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
            return target.children('.J_FileStatus');
        },
        /**
         * 运行文件拖拽插件
         * @return {Filedrop}
         */
        _renderFiledrop:function(){
            //文件拖拽支持
            var self = this,button = self.get('button'),
                target = button.get('target'),
                Filedrop = self.get('oPlugin').filedrop,
            filedrop = new Filedrop({
                target:target,
                uploader:this.get('uploader'),
                tpl:{supportDrop:'<div class="drop-wrapper"></div>' }
            });
            filedrop.render();
            return filedrop;
        },
        /**
         * 文件处于等待上传状态时触发
         */
        _waitingHandler:function (ev) {
            var self = this,preview = self.get('preview'),
                file = ev.file,input = file.input,
                $imageWrapper = $('.J_Pic_'+file.id);
            if(preview && input && $imageWrapper.length){
                preview.preview(ev.file.input, $imageWrapper);
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
                $progressBar = $('.J_ProgressBar_' + ev.id);
            //如果是ajax或flash异步上传，加入进度条
            if(uploadType == 'ajax' || uploadType == 'flash'){
                var ProgressBar = self.get('oPlugin').progressBar,progressBar = new ProgressBar($progressBar);
                progressBar.render();
                self.set('progressBar',progressBar);
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
                val = Math.ceil(loaded/total) * 100,
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
                //服务器端返回的数据
                result = file.result;
            self._setCount();
            if(result) self._changeImageSrc(ev.id,result);
            self._setDisplayMsg(false,ev.file);
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
         * 显示“你还可以上传几张图片”
         */
        _setCount:function(){
            var self = this,
                //用于显示上传数的容器
                elCount = $(self.get('elCount')),
                len = self.getFilesLen(),
                auth = self.get('auth');
            if(!elCount.length || !auth) return false;
            var rules = auth.get('rules'),
                //max的值类似[5, '最多上传{max}个文件！']
                max = rules.max;
            if(!max) return false;
            elCount.text(max[0]-len);
        },
        /**
         * 显示/隐藏遮罩层（遮罩层在出现状态消息的时候出现）
         */
        _setDisplayMsg:function(isShow,data){
            if(!data) return false;
            var $mask = $('.J_Mask_' + data.id),
                $statusWrapper = data.statusWrapper;
            $mask[isShow && 'show' || 'hide']();
            if(isShow){
                $mask.show();
                $statusWrapper.show();
            }else{
                $mask.hide();
                $statusWrapper.hide();
            }
        },
        /**
         * 达到最大允许上传数隐藏按钮
         * @param {Uploader} uploader
         */
        _maxHideBtn:function(uploader){
            //监听上传验证的error事件
            var self = this,auth = self.get('auth');
            auth.on('error',function(ev){
                var rule = ev.rule,button = uploader.get('button'),$btn = button.get('target');
                //图片达到最大允许上传数，隐藏按钮
                if(rule == 'max'){
                    button.hide();
                    //隐藏按钮之上的li容器
                    $btn.parent('li').hide();
                }
            })
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
            //统计允许上传文件个数
            self._setCount();
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
            url = data.url;
            //不存在预览图片，IE8使用滤镜处理图片预览有问题
            if($img.attr('src') == EMPTY || S.UA.ie == 8){
                $img.attr('src',url);
            }
        }
    }, {ATTRS:/** @lends ImageUploader.prototype*/{
        /**
         *  主题名（文件名），此名称跟样式息息相关
         * @type String
         * @default "imageUploader"
         */
        name:{value:'imageUploader'},
        /**
         * 是否引用css文件
         * @type Boolean
         * @default true
         */
        isUseCss:{value:true},
        /**
         * css模块路径
         * @type String
         * @default "gallery/form/1.1/uploader/themes/imageUploader/style.css"
         */
        cssUrl:{value:'gallery/form/1.1/uploader/themes/imageUploader/style.css'},
        /**
         * 队列使用的模板
         * @type String
         * @default ""
         */
        fileTpl:{value:
            '<li id="queue-file-{id}" class="clearfix" data-name="{name}">' +
                '<div class="tb-pic120">' +
                    '<a href="javascript:void(0);"><img class="J_Pic_{id}" src="" /></a>' +
                '</div>' +
                '<div class=" J_Mask_{id} pic-mask"></div>' +
                '<div class="status-wrapper J_FileStatus">' +
                    '<div class="status waiting-status tips-upload-waiting"><p class="tips-text">等待上传，请稍候</p></div>' +
                    '<div class="status start-status progress-status tips-uploading">' +
                        '<div class="J_ProgressBar_{id}"><s class="loading-icon"></s>上传中...</div>' +
                    '</div>' +
                    '<div class="status success-status tips-upload-success">' +
                      '上传成功！' +
                    '</div>' +
                    '<div class="status error-status tips-upload-error">' +
                        '<p class="J_ErrorMsg_{id} tips-text">上传失败，请重试！</p></div>' +
                '</div>' +
                '<a class="J_Del_{id} del-pic" href="#">删除</a>' +
            '</li>'
        },
        /**
         * 需要加载的插件，需要手动实例化
         * @type Array
         * @default ['preview','progressBar','filedrop'] 图片预览、进度条、文件拖拽
         */
        plugins:{
          value:['preview','progressBar','filedrop']
        },
        /**
         * 统计上传张数的容器
         * @type KISSY.NodeList
         * @default '#J_UploadCount'
         */
        elCount:{value:'#J_UploadCount'}
    }});
    return ImageUploader;
}, {requires:['node', '../../theme']});