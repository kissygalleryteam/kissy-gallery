/**
 * @fileoverview 文件上传验证
 * @author: 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.3/uploader/auth/base', function (S, Node,Base) {
    var EMPTY = '', $ = Node.all,
        console = console || S, LOG_PREFIX = '[uploader-auth]:';

    /**
     * @name Auth
     * @class 文件上传验证，可以从按钮的data-auth伪属性抓取规则配置
     * @constructor
     * @extends Base
     * @param {Uploader} uploader *，上传组件实例
     * @param {Object} config 配置
     */
    function Auth(uploader, config) {
        var self = this;
        config = S.merge({uploader:uploader}, config);
        Auth.superclass.constructor.call(self, config);
        self._init();
    }
    S.mix(Auth,/** @lends Auth*/{
        /**
         * 事件
         */
        event : {
            ERROR : 'error'
        }
    });
    /**
     * @name Auth#error
     * @desc  当验证出错时触发
     * @event
     * {rule:'require',msg : rule[1],value : isRequire}
     * @param {String} ev.rule 规则名
     * @param {String} ev.msg 出错消息
     * @param {Boolean|String} ev.value 规则值
     */
    S.extend(Auth, Base, /** @lends Auth.prototype*/{
        /**
         * 初始化
         */
        _init:function () {
            var self = this, uploader = self.get('uploader'),
                queue = uploader.get('queue');
            if (uploader == EMPTY) {
                console.log(LOG_PREFIX + 'uploader不可以为空！');
                return false;
            }
            self._setSwfButtonExt();
            self._addUploaderAttrs();

            //给uploader增加常用的max和required验证方法
            uploader.testMax = function(){
                return self.testMax();
            };
            uploader.testRequired = function(){
                return self.testRequired();
            };

            queue.on('add',function(ev){
                var file = ev.file;
                var type = file.type;
                if(type != 'restore'){
                    self.testAllowExt(file);
                    self.testMaxSize(file);
                    self.testRepeat(file);
                }
            });
            queue.on('remove',function(ev){
                var file = ev.file,status = file.status;
                //删除的是已经成功上传的文件，需要重新检验最大允许上传数
                if(status == 'success') self.testMax();
            });
            queue.on('statusChange',function(ev){
                var status = ev.status;
                //如果已经是禁用上传状态，阻止后面文件的上传，并予以移除
                if(status == 'start' && uploader.get('disabled')){
                    self._maxStopUpload();
                }
                if(status == 'success') self.testMax();
            });
            uploader.on('error', function (ev) {
                //允许继续上传文件
                uploader.set('isAllowUpload', true);
            });
        },
        /**
         * 给uploader增加验证规则属性
         * @private
         */
        _addUploaderAttrs:function(){
            var self = this;
            var uploader = self.get('uploader');
            var rules = self.get('rules');
            S.each(rules,function(val,rule){
                uploader.addAttr(rule,{
                    value:val[0],
                    getter:function(v){
                        if(rule == 'allowExts') v = self.getAllowExts(v);
                        return v;
                    },
                    setter:function(v){
                        var rules = self.get('rules');
                        if(rule == 'allowExts') v = self.setAllowExts(v);
                        rules[rule][0] = v;
                        return v;
                    }
                });
            });
        },
        /**
         * 举例：将jpg,jpeg,png,gif,bmp转成{desc:"JPG,JPEG,PNG,GIF,BMP", ext:"*.jpg;*.jpeg;*.png;*.gif;*.bmp"}
         * @param exts
         * @return {*}
         */
        setAllowExts:function(exts){
            if(!S.isString(exts)) return false;
            var ext = [];
            var desc = [];
            exts = exts.split(',');
            S.each(exts,function(e){
                ext.push('*.'+e);
                desc.push(e.toUpperCase());
            });
            ext = ext.join(';');
            desc = desc.join(',');
            return {desc:desc,ext:ext};
        },
        /**
         * 获取简化的图片格式，举例：将{desc:"JPG,JPEG,PNG,GIF,BMP", ext:"*.jpg;*.jpeg;*.png;*.gif;*.bmp"}转成jpg,jpeg,png,gif,bmp
         * @param exts
         * @return String
         */
        getAllowExts:function(exts){
            if(!S.isObject(exts)) return exts;
            var allExt = exts['ext'];
            exts = allExt.split(';');
            var arrExt = [];
            S.each(exts,function(ext){
                arrExt.push(ext.replace('*.',''));
            });
            return arrExt.join(',');
        },
        /**
         * 验证上传数、是否必须上传
         * @return {Boolean}
         */
        testAll : function(){
            var self = this;
            return self.testRequire() && self.testMax();
        },
        /**
         * 获取指定规则
         * @param {String} ruleName 规则名
         * @return {Array}
         */
        getRule : function(ruleName){
            var self = this,rules = self.get('rules');
            return rules[ruleName];
        },
        /**
         * 判断上传方式
         * @param type
         * @return {Boolean}
         */
        isUploaderType:function (type) {
            var self = this, uploader = self.get('uploader'),
                uploaderType = uploader.get('type');
            return type == uploaderType;
        },
        /**
         * 检验是否必须上传一个文件
         * @return {Boolean}
         */
        testRequire : function(){
            var self = this,uploader = self.get('uploader'),
                urlsInput = uploader.get('urlsInput'),
                urls = urlsInput.get('urls'),
                rule = self.getRule('required') || self.getRule('require'),
                isRequire = rule ? rule[0] : false,
                isHasUrls = urls.length > 0;
            if(!isRequire) return true;
            if(!isHasUrls){
                S.log(LOG_PREFIX + rule[1]);
                self._fireUploaderError('required',rule);
            }
            return isHasUrls;
        },
        /**
         * 检验是否必须上传一个文件
         * @return {Boolean}
         */
        testRequired:function(){
            return this.testRequire();
        },
        /**
         * 测试是否是允许的文件上传类型
         * @param {Object} file 文件对象
         * @return {Boolean} 是否通过
         */
        testAllowExt:function (file) {
            if (!S.isObject(file)) return false;
            var self = this,
                fileName = file.name,
                allowExts = self.getRule('allowExts'),
                exts = [],
                fileExt, msg,
                isAllow;
            if (!S.isArray(allowExts)) return false;
            //扩展名数组
            exts = self._getExts(allowExts[0].ext);

            isAllow = _isAllowUpload(fileName);
            //如果不是支持的文件格式，出现错误
            if(!isAllow){
                fileExt = _getFileExt(fileName);
                msg = S.substitute(allowExts[1],{ext : fileExt});
                self._fireUploaderError('allowExts',[allowExts[0],msg],file);
            }
            /**
             * 是否允许上传
             * @param {String} fileName 文件名
             * @return {Boolean}
             */
            function _isAllowUpload(fileName) {
                var isAllow = false, reg;
                S.each(exts, function (ext) {
                    reg = new RegExp('^.+\.' + ext + '$');
                    //存在该扩展名
                    if (reg.test(fileName))  return isAllow = true;
                });
                return isAllow;
            }
            /**
             * 获取文件扩展名
             * @param {String} file
             */
            function _getFileExt(file){
                var arr = file.split('.');
                return arr[arr.length -1];
            }
            return isAllow;
        },
        /**
         * 检验是否达到最大允许上传数
         * @return {Boolean}
         */
        testMax:function () {
            var self = this, uploader = self.get('uploader'),
                queue = uploader.get('queue'),
                successFiles = queue.getFiles('success'),
                len = successFiles.length,
                rule = self.getRule('max'),
                msg;
            if(rule){
            	var isPass = len < rule[0];
	            //达到最大允许上传数
	            if(!isPass){
                    //禁用按钮
	                uploader.set('disabled',true);
	                uploader.set('isAllowUpload', false);
                    msg = S.substitute(rule[1],{max : rule[0]});
                    self._fireUploaderError('max',[rule[0],msg]);
	            }else{
                    uploader.set('disabled',false);
	                uploader.set('isAllowUpload', true);
	            }
	            return isPass;
            }
        },
        /**
         * 检验是否超过允许最大文件大小，留意iframe上传方式此验证无效
         * @param {Object} file 文件对象
         */
        testMaxSize : function(file){
            var self = this,
                size = file.size,
                rule = self.getRule('maxSize');
            if(rule){
            	var maxSize = Number(rule[0]) * 1024,
	                isAllow = size <= maxSize,
	                msg;
	            if(!isAllow){
	                msg = S.substitute(rule[1],{maxSize:S.convertByteSize(maxSize),size : file.textSize});
                    self._fireUploaderError('maxSize',[rule[0],msg],file);
	            }
	            return isAllow;
            }
        },
        /**
         * 检验文件是否重复（检验文件名，很有可能存在误差，比如不同目录下的相同文件名会被判定为同一文件）
         * @param {Object} file 文件对象
         * @return {Boolean}
         */
        testRepeat : function(file){
            if(!S.isObject(file)) return false;
            var self = this,
                fileName = file.name,
                rule = self.getRule('allowRepeat');
            if(rule){
            	var isAllowRepeat = rule[0],
	                uploader = self.get('uploader'),
	                queue = uploader.get('queue'),
	                //上传成功的文件
	                files = queue.getFiles('success'),
	                isRepeat = false ;
	            //允许重复文件名，直接返回false
	            if(isAllowRepeat) return false;
	            S.each(files,function(f){
	                if(f.name == fileName && f.size == file.size){
                        self._fireUploaderError('allowRepeat',rule,file);
	                    return isRepeat = true;
	                }
	            });
	            return isRepeat;
            }
        },
        /**
         * 设置flash按钮的文件格式过滤
         * @return {Auth}
         */
        _setSwfButtonExt:function () {
            var self = this, uploader = self.get('uploader'),
                allowExts = self.getRule('allowExts'),
                button = uploader.get('button'),
                isFlashType = self.isUploaderType('flash');
            if (!isFlashType || !S.isArray(allowExts)) return false;
            //设置文件过滤
            if(button) button.set('fileFilters', allowExts[0]);
            return self;
        },
        /**
         * 获取扩展名，需额外添加大写扩展名
         * @param {String} sExt 扩展名字符串，类似*.jpg;*.jpeg;*.png;*.gif;*.bmp
         * @retunr {Array}
         */
        _getExts:function (sExt) {
            if (!S.isString(sExt)) return false;
            var exts = sExt.split(';'),
                uppercaseExts = [],
                reg = /^\*\./;
            S.each(exts, function (ext) {
                ext = ext.replace(reg, '');
                uppercaseExts.push(ext.toUpperCase());
            });
            S.each(uppercaseExts,function(ext){
                exts.push(ext);
            });
            return exts;
        },
        /**
         * 触发uploader的error事件
         * @param ruleName
         * @param rule
         * @param file
         */
        _fireUploaderError:function(ruleName,rule,file){
            var self = this,
                uploader = self.get('uploader'),
                queue = uploader.get('queue'),
                params = {status:-1,rule:ruleName},
                index = -1;
            if(file){
                index = queue.getFileIndex(file.id);
                S.mix(params,{file:file,index:index});
            }
            //result是为了与uploader的error事件保持一致
            if(rule) S.mix(params,{msg : rule[1],value : rule[0],result:{}});
            queue.fileStatus(index, 'error', params);
            self.fire(Auth.event.ERROR,params);
            uploader.fire('error',params);
        },
        /**
         * 如果达到最大上传数，阻止后面文件的上传，并予以移除
         * @private
         */
        _maxStopUpload:function(){
            var self = this,
                uploader = self.get('uploader'),
                queue = uploader.get('queue');
                var curFileIndex = uploader.get('curUploadIndex');
                if(curFileIndex == EMPTY) return false;
                var files = queue.get('files');
                uploader.stop();
                S.each(files,function(file,index){
                    if(index >= curFileIndex){
                        queue.remove(index);
                    }
                })
        }
    }, {ATTRS:/** @lends Auth.prototype*/{
        /**
         * 上传组件实例
         * @type Uploader
         * @default ""
         */
        uploader:{ value:EMPTY },
        /**
         * 上传验证规则，每个规则都是一个数组，数组第一个值为规则，第二个值为错误消息
         * @type Object
         * @default  { allowExts:[ {desc:"JPG,JPEG,PNG,GIF,BMP", ext:"*.jpg;*.jpeg;*.png;*.gif;*.bmp"}, '不支持{ext}格式的文件上传！' ], require:[false, '必须至少上传一个文件！'], max:[3, '每次最多上传{max}个文件！'], maxSize:[1000, '文件大小为{size}，文件太大！'], allowRepeat:[false, '该文件已经存在！'] } }
         *
         */
        rules:{
            value : {
                /**
                 * 允许上传的文件格式，如果是使用flash上传方式，在选择文件时就可以过滤格式
                 */
                allowExts:[
                    {desc:"JPG,JPEG,PNG,GIF,BMP", ext:"*.jpg;*.jpeg;*.png;*.gif;*.bmp"},
                    '不支持{ext}格式的文件上传！'
                ],
                /**
                 * 是否必须上传个文件
                 */
                required:[false, '必须至少上传一个文件！'],
                /**
                 * 允许的最大上传数
                 */
                max:[3, '每次最多上传{max}个文件！'],
                /**
                 * 文件最大大小，单位为kb
                 */
                maxSize:[1000, '文件大小为{size}，文件太大！'],
                /**
                 * 允许重复上传相同文件
                 */
                allowRepeat:[false, '该文件已经存在！']
            }
        }
    }});
    return Auth;
}, {requires:['node','base']});/**
 * @fileoverview 异步文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.3/uploader/base', function (S, Base, Node, UrlsInput, IframeType, AjaxType, FlashType, HtmlButton, SwfButton, Queue) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploader]:';

    /**
     * @name Uploader
     * @class 异步文件上传组件，支持ajax、flash、iframe三种方案
     * @constructor
     * @extends Base
     * @requires UrlsInput
     * @requires IframeType
     * @requires  AjaxType
     * @param {Object} config 组件配置（下面的参数为配置项，配置会写入属性，详细的配置说明请看属性部分）
     * @param {Button} config.button *，Button按钮的实例
     * @param {Queue} config.queue *，Queue队列的实例
     * @param {String|Array} config.type *，采用的上传方案
     * @param {Object} config.serverConfig *，服务器端配置
     * @param {String} config.urlsInputName *，存储文件路径的隐藏域的name名
     * @param {Boolean} config.isAllowUpload 是否允许上传文件
     * @param {Boolean} config.autoUpload 是否自动上传
     * @example
     * var uploader = new Uploader({button:button,queue:queue,serverConfig:{action:'test.php'}})
     */
    function Uploader(config) {
        var self = this;
        //调用父类构造函数
        Uploader.superclass.constructor.call(self, config);
    }


    S.mix(Uploader, /** @lends Uploader*/{
        /**
         * 上传方式，{AUTO:'auto', IFRAME:'iframe', AJAX:'ajax', FLASH:'flash'}
         */
        type:{AUTO:'auto', IFRAME:'iframe', AJAX:'ajax', FLASH:'flash'},
        /**
         * 组件支持的事件列表，{ RENDER:'render', SELECT:'select', START:'start', PROGRESS : 'progress', COMPLETE:'complete', SUCCESS:'success', UPLOAD_FILES:'uploadFiles', CANCEL:'cancel', ERROR:'error' }
         *
         */
        event:{
            //运行
            RENDER:'render',
            //选择完文件后触发
            SELECT:'select',
            //开始上传后触发
            START:'start',
            //正在上传中时触发
            PROGRESS:'progress',
            //上传完成（在上传成功或上传失败后都会触发）
            COMPLETE:'complete',
            //上传成功后触发
            SUCCESS:'success',
            //批量上传结束后触发
            UPLOAD_FILES:'uploadFiles',
            //取消上传后触发
            CANCEL:'cancel',
            //上传失败后触发
            ERROR:'error',
            //初始化默认文件数据时触发
            RESTORE:'restore'
        },
        /**
         * 文件上传所有的状态，{ WAITING : 'waiting', START : 'start', PROGRESS : 'progress', SUCCESS : 'success', CANCEL : 'cancel', ERROR : 'error', RESTORE: 'restore' }
         */
        status:{
            WAITING:'waiting',
            START:'start',
            PROGRESS:'progress',
            SUCCESS:'success',
            CANCEL:'cancel',
            ERROR:'error',
            RESTORE:'restore'
        }
    });
    /**
     * @name Uploader#select
     * @desc  选择完文件后触发
     * @event
     * @param {Array} ev.files 文件完文件后返回的文件数据
     */

    /**
     * @name Uploader#start
     * @desc  开始上传后触发
     * @event
     * @param {Number} ev.index 要上传的文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */

    /**
     * @name Uploader#progress
     * @desc  正在上传中时触发，这个事件在iframe上传方式中不存在
     * @event
     * @param {Object} ev.file 文件数据
     * @param {Number} ev.loaded  已经加载完成的字节数
     * @param {Number} ev.total  文件总字节数
     */

    /**
     * @name Uploader#complete
     * @desc  上传完成（在上传成功或上传失败后都会触发）
     * @event
     * @param {Number} ev.index 上传中的文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     * @param {Object} ev.result 服务器端返回的数据
     */

    /**
     * @name Uploader#success
     * @desc  上传成功后触发
     * @event
     * @param {Number} ev.index 上传中的文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     * @param {Object} ev.result 服务器端返回的数据
     */

    /**
     * @name Uploader#error
     * @desc  上传失败后触发
     * @event
     * @param {Number} ev.index 上传中的文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     * @param {Object} ev.result 服务器端返回的数据
     * @param {Object} ev.status 服务器端返回的状态码，status如果是-1，说明是前端验证返回的失败
     */

    /**
     * @name Uploader#cancel
     * @desc  取消上传后触发
     * @event
     * @param {Number} ev.index 上传中的文件在队列中的索引值
     */

    /**
     * @name Uploader#uploadFiles
     * @desc  批量上传结束后触发
     * @event
     */

    /**
     * @name Uploader#restore
     * @desc 添加默认数据到队列后触发
     * @event
     */

        //继承于Base，属性getter和setter委托于Base处理
    S.extend(Uploader, Base, /** @lends Uploader.prototype*/{
        /**
         * 运行组件，实例化类后必须调用render()才真正运行组件逻辑
         * @return {Uploader}
         */
        render:function () {
            var self = this, serverConfig = self.get('serverConfig'),
                type = self.get('type'),
                UploadType = self.getUploadType(type), uploadType,
                uploaderTypeEvent = UploadType.event,
                button;
            if (!UploadType) return false;
            button = self._renderButton();
            //路径input实例
            self.set('urlsInput', self._renderUrlsInput());
            self._renderQueue();
            //如果是flash异步上传方案，增加swfUploader的实例作为参数
            if (self.get('type') == Uploader.type.FLASH) {
                S.mix(serverConfig, {swfUploader:button.get('swfUploader')});
            }
            serverConfig.fileDataName = self.get('name');
            //实例化上传方式类
            uploadType = new UploadType(serverConfig);
            //监听上传器上传完成事件
            uploadType.on(uploaderTypeEvent.SUCCESS, self._uploadCompleteHanlder, self);
            uploadType.on(uploaderTypeEvent.ERROR, function(ev){
                self.fire(event.ERROR, {status:ev.status, result:ev.result});
            }, self);
            //监听上传器上传进度事件
            if (uploaderTypeEvent.PROGRESS) uploadType.on(uploaderTypeEvent.PROGRESS, self._uploadProgressHandler, self);
            //监听上传器上传停止事件
            uploadType.on(uploaderTypeEvent.STOP, self._uploadStopHanlder, self);
            self.set('uploadType', uploadType);
            self.fire(Uploader.event.RENDER);
            return self;
        },
        /**
         * 上传指定队列索引的文件
         * @param {Number} index 文件对应的在上传队列数组内的索引值
         * @example
         * //上传队列中的第一个文件，uploader为Uploader的实例
         * uploader.upload(0)
         */
        upload:function (index) {
            if (!S.isNumber(index)) return false;
            var self = this, uploadType = self.get('uploadType'),
                type = self.get('type'),
                queue = self.get('queue'),
                file = queue.get('files')[index],
                uploadParam;
            if (!S.isPlainObject(file)) {
                S.log(LOG_PREFIX + '队列中不存在id为' + index + '的文件');
                return false;
            }
            //如果有文件正在上传，予以阻止上传
            if (self.get('curUploadIndex') != EMPTY) {
                alert('第' + self.get('curUploadIndex') + '文件正在上传，请上传完后再操作！');
                return false;
            }
            //文件上传域，如果是flash上传,input为文件数据对象
            uploadParam = file.input.id || file.input;
            //如果是ajax上传直接传文件数据
            if (type == 'ajax') uploadParam = file.data;
            if (file['status'] === 'error') {
                return false;
            }
            //触发文件上传前事件
            self.fire(Uploader.event.START, {index:index, file:file});
            //阻止文件上传
            if (!self.get('isAllowUpload')) return false;
            //设置当前上传的文件id
            self.set('curUploadIndex', index);
            //改变文件上传状态为start
            queue.fileStatus(index, Uploader.status.START);
            //开始上传
            uploadType.upload(uploadParam);
        },
        /**
         * 取消文件上传，当index参数不存在时取消当前正在上传的文件的上传。cancel并不会停止其他文件的上传（对应方法是stop）
         * @param {Number} index 队列数组索引
         * @return {Uploader}
         */
        cancel:function (index) {
            var self = this, uploadType = self.get('uploadType'),
                queue = self.get('queue'),
                statuses = Uploader.status,
                status = queue.fileStatus(index);
            if (S.isNumber(index) && status != statuses.SUCCESS) {
                uploadType.stop();
                queue.fileStatus(index, statuses.CANCEL);
            } else {
                //取消上传后刷新状态，更改路径等操作请看_uploadStopHanlder()
                uploadType.stop();
                //存在批量上传操作，继续上传其他文件
                self._continueUpload();
            }
            return self;
        },
        /**
         * 停止上传动作
         * @return {Uploader}
         */
        stop:function () {
            var self = this;
            self.set('uploadFilesStatus', EMPTY);
            self.cancel();
            return self;
        },
        /**
         * 批量上传队列中的指定状态下的文件
         * @param {String} status 文件上传状态名
         * @return {Uploader}
         * @example
         * //上传队列中所有等待的文件
         * uploader.uploadFiles("waiting")
         */
        uploadFiles:function (status) {
            var self = this;
            if (!S.isString(status)) status = Uploader.status.WAITING;
            self.set('uploadFilesStatus', status);
            self._uploaderStatusFile(status);
            return self;
        },
        /**
         * 上传队列中的指定状态下的文件
         * @param {String} status 文件上传状态名
         * @return {Uploader}
         */
        _uploaderStatusFile:function (status) {
            var self = this, queue = self.get('queue'),
                fileIndexs = queue.getIndexs(status);
            //没有存在需要上传的文件，退出上传
            if (!fileIndexs.length) {
                self.set('uploadFilesStatus', EMPTY);
                self.fire(Uploader.event.UPLOAD_FILES);
                return false;
            }
            //开始上传等待中的文件
            self.upload(fileIndexs[0]);
            return self;
        },
        /**
         * 是否支持ajax方案上传
         * @return {Boolean}
         */
        isSupportAjax:function () {
            var isSupport = false;
            try {
                if (FormData) isSupport = true;
            } catch (e) {
                isSupport = false;
            }
            return isSupport;
        },
        /**
         * 是否支持flash方案上传
         * @return {Boolean}
         */
        isSupportFlash:function () {
            var fpv = S.UA.fpv();
            return S.isArray(fpv) && fpv.length > 0;
        },
        /**
         * 获取上传方式类（共有iframe、ajax、flash三种方式）
         * @type {String} type 上传方式
         * @return {IframeType|AjaxType|FlashType}
         */
        getUploadType:function (type) {
            var self = this, types = Uploader.type,
                UploadType;
            //如果type参数为auto，那么type=['ajax','flash','iframe']
            if (type == types.AUTO) type = [types.AJAX, types.FLASH, types.IFRAME];
            //如果是数组，遍历获取浏览器支持的上传方式
            if (S.isArray(type) && type.length > 0) {
                S.each(type, function (t) {
                    UploadType = self._getType(t);
                    if (UploadType) return false;
                });
            } else {
                UploadType = self._getType(type);
            }
            return UploadType;
        },
        /**
         * 获取上传方式
         * @param {String} type 上传方式（根据type返回对应的上传类，比如iframe返回IframeType）
         */
        _getType:function (type) {
            var self = this, types = Uploader.type, UploadType,
                isSupportAjax = self.isSupportAjax(),
                isSupportFlash = self.isSupportFlash();
            switch (type) {
                case types.IFRAME :
                    UploadType = IframeType;
                    break;
                case types.AJAX :
                    UploadType = isSupportAjax && AjaxType || false;
                    break;
                case types.FLASH :
                    UploadType = isSupportFlash && FlashType || false;
                    break;
                default :
                    S.log(LOG_PREFIX + 'type参数不合法');
                    return false;
            }
            if (UploadType) S.log(LOG_PREFIX + '使用' + type + '上传方式');
            self.set('type', type);
            return UploadType;
        },
        /**
         * 运行Button上传按钮组件
         * @return {Button}
         */
        _renderButton:function () {
            var self = this, button, Button,
                type = self.get('type'),
                buttonTarget = self.get('target'),
                multiple = self.get('multiple'),
                disabled = self.get('disabled'),
                name = self.get('name'),
                config = {name:name, multiple:multiple, disabled:disabled};
            if (type == Uploader.type.FLASH) {
                Button = SwfButton;
                S.mix(config, {size:self.get('swfSize')});
            } else {
                Button = HtmlButton;
            }
            button = new Button(buttonTarget, config);
            //监听按钮改变事件
            button.on('change', self._select, self);
            //运行按钮实例
            button.render();
            self.set('button', button);
            return button;
        },
        /**
         * 运行Queue队列组件
         * @return {Queue} 队列实例
         */
        _renderQueue:function () {
            var self = this, queue = new Queue(),
                urlsInput = self.get('urlsInput');
            if (!S.isObject(queue)) {
                S.log(LOG_PREFIX + 'queue参数不合法');
                return false;
            }
            //将上传组件实例传给队列，方便队列内部执行取消、重新上传的操作
            queue.set('uploader', self);
            //监听队列的删除事件
            queue.on('remove', function (ev) {
                //删除该文件路径，sUrl为服务器端返回的文件路径，而url是客服端文件路径
                if (ev.file.sUrl && urlsInput) urlsInput.remove(ev.file.sUrl);
            });
            self.set('queue', queue);
            return queue;
        },
        /**
         * 选择完文件后
         * @param {Object} ev 事件对象
         */
        _select:function (ev) {
            var self = this, autoUpload = self.get('autoUpload'),
                queue = self.get('queue'),
                curId = self.get('curUploadIndex'),
                files = ev.files;
            S.each(files, function (file) {
                //文件大小，IE浏览器下不存在
                if (!file.size) file.size = 0;
                //chrome文件名属性名为fileName，而firefox为name
                if (!file.name) file.name = file.fileName || EMPTY;
                //如果是flash上传，并不存在文件上传域input
                file.input = ev.input || file;
            });
            files = self._processExceedMultiple(files);
            self.fire(Uploader.event.SELECT, {files:files});
            //阻止文件上传
            if (!self.get('isAllowUpload')) return false;
            queue.add(files, function () {
                //如果不存在正在上传的文件，且允许自动上传，上传该文件
                if (curId == EMPTY && autoUpload) {
                    self.uploadFiles();
                }
            });
        },
        /**
         * 超过最大多选数予以截断
         */
        _processExceedMultiple:function (files) {
            var self = this, multipleLen = self.get('multipleLen');
            if (multipleLen < 0 || !S.isArray(files) || !files.length) return files;
            return S.filter(files, function (file, index) {
                return index < multipleLen;
            });
        },
        /**
         * 向上传按钮容器内增加用于存储文件路径的input
         */
        _renderUrlsInput:function () {
            var self = this, button = self.get('button'), inputWrapper = button.get('target'),
                name = self.get('urlsInputName'),
                urlsInput = new UrlsInput(inputWrapper, {name:name});
            urlsInput.render();
            return urlsInput;
        },
        /**
         * 当上传完毕后返回结果集的处理
         */
        _uploadCompleteHanlder:function (ev) {
            var self = this, result = ev.result, status, event = Uploader.event,
                queue = self.get('queue'), index = self.get('curUploadIndex');
            if (!S.isObject(result)) return false;
            //将服务器端的数据保存到队列中的数据集合
            queue.updateFile(index, {result:result});
            //文件上传状态
            status = Number(result.status);
            // 只有上传状态为1时才是成功的
            if (status === 1) {
                //修改队列中文件的状态为success（上传完成）
                queue.fileStatus(index, Uploader.status.SUCCESS);
                self._success(result.data);
                self.fire(event.SUCCESS, {index:index, file:queue.getFile(index), result:result});
            } else {
                var msg = result.msg || result.message || EMPTY;
                //修改队列中文件的状态为error（上传失败）
                queue.fileStatus(index, Uploader.status.ERROR, {msg:msg, result:result});
                self.fire(event.ERROR, {status:status, result:result, index:index, file:queue.getFile(index)});
            }
            //置空当前上传的文件在队列中的索引值
            self.set('curUploadIndex', EMPTY);
            self.fire(event.COMPLETE, {index:index, file:queue.getFile(index), result:result});
            //存在批量上传操作，继续上传
            self._continueUpload();
        },
        /**
         * 取消上传后调用的方法
         */
        _uploadStopHanlder:function () {
            var self = this, queue = self.get('queue'),
                index = self.get('curUploadIndex');
            //更改取消上传后的状态
            queue.fileStatus(index, Uploader.status.CANCEL);
            //重置当前上传文件id
            self.set('curUploadIndex', EMPTY);
            self.fire(Uploader.event.CANCEL, {index:index});
        },
        /**
         * 如果存在批量上传，则继续上传
         */
        _continueUpload:function () {
            var self = this,
                uploadFilesStatus = self.get('uploadFilesStatus');
            if (uploadFilesStatus != EMPTY) {
                self._uploaderStatusFile(uploadFilesStatus);
            }
        },
        /**
         * 上传进度监听器
         */
        _uploadProgressHandler:function (ev) {
            var self = this, queue = self.get('queue'),
                index = self.get('curUploadIndex'),
                file = queue.getFile(index);
            S.mix(ev, {file:file});
            queue.fileStatus(index, Uploader.status.PROGRESS, ev);
            self.fire(Uploader.event.PROGRESS, ev);
        },
        /**
         * 上传成功后执行的回调函数
         * @param {Object} data 服务器端返回的数据
         */
        _success:function (data) {
            if (!S.isObject(data)) return false;
            var self = this, url = data.url,
                urlsInput = self.get('urlsInput'),
                fileIndex = self.get('curUploadIndex'),
                queue = self.get('queue');
            if (!S.isString(url) || !S.isObject(urlsInput)) return false;
            //追加服务器端返回的文件url
            queue.updateFile(fileIndex, {'sUrl':url});
            //向路径隐藏域添加路径
            urlsInput.add(url);
        },
        /**
         * 添加默认数据到队列，不带参数的情况下，抓取restoreHook容器内的数据，添加到队列内
         * @param {Array} data 文件数据
         */
        restore:function (data) {
            var self = this,
                queue = self.get('queue'),
                urlsInput = self.get('urlsInput');
            if (!data) data = self._getRestoreData();
            if (!data.length) return false;

            S.each(data, function (file) {
                //向队列添加文件
                var fileData = queue.add(file);
                var id = fileData.id;
                var index = queue.getFileIndex(id);
                //改变文件状态为成功
                queue.fileStatus(index, 'success', {index:index, id:id, file:fileData});
            });
        },
        /**
         * 抓取restoreHook容器内的数据
         * @return {Array}
         */
        _getRestoreData:function () {
            var self = this;
            var urlsInput = self.get('urlsInput');
            var urls = urlsInput.parse();
            var files = [];
            S.each(urls,function(url){
                //伪造数据结构
                files.push({
                    name:url,
                    type:'restore',
                    url : url,
                    sUrl : url,
                    result:{
                        status:1,
                        data:{
                            name:url,
                            url : url
                        }
                    }
                });
            });
            return files;
        }
    }, {ATTRS:/** @lends Uploader.prototype*/{
        /**
         * Button按钮的实例
         * @type Button
         * @default {}
         */
        button:{value:{}},
        /**
         * Queue队列的实例
         * @type Queue
         * @default {}
         */
        queue:{value:{}},
        /**
         * 采用的上传方案，当值是数组时，比如“type” : ["flash","ajax","iframe"]，按顺序获取浏览器支持的方式，该配置会优先使用flash上传方式，如果浏览器不支持flash，会降级为ajax，如果还不支持ajax，会降级为iframe；当值是字符串时，比如“type” : “ajax”，表示只使用ajax上传方式。这种方式比较极端，在不支持ajax上传方式的浏览器会不可用；当“type” : “auto”，auto是一种特例，等价于["ajax","flash","iframe"]。
         * @type String|Array
         * @default "auto"
         * @since V1.2 （当“type” : “auto”，等价于["ajax","flash","iframe"]）
         */
        type:{value:Uploader.type.AUTO},
        /**
         * 是否开启多选支持，部分浏览器存在兼容性问题
         * @type Boolean
         * @default true
         * @since V1.2
         */
        multiple:{
            value:true,
            setter:function (v) {
                var self = this, button = self.get('button');
                if (!S.isEmptyObject(button) && S.isBoolean(v)) {
                    button.set('multiple', v);
                }
                return v;
            }
        },
        /**
         * 用于限制多选文件个数，值为负时不设置多选限制
         * @type Number
         * @default -1
         * @since V1.2.6
         */
        multipleLen:{ value:-1 },
        /**
         * 是否可用,false为可用
         * @type Boolean
         * @default false
         * @since V1.2
         */
        disabled:{
            value:false,
            setter:function (v) {
                var self = this, button = self.get('button');
                if (!S.isEmptyObject(button) && S.isBoolean(v)) {
                    button.set('disabled', v);
                }
                return v;
            }
        },
        /**
         * 服务器端配置。action：服务器处理上传的路径；data： post给服务器的参数，通常需要传递用户名、token等信息
         * @type Object
         * @default  {action:EMPTY, data:{}, dataType:'json'}
         */
        serverConfig:{value:{action:EMPTY, data:{}, dataType:'json'}},
        /**
         * 服务器处理上传的路径
         * @type String
         * @default ''
         */
        action:{
            value:EMPTY,
            getter:function (v) {
                return self.get('serverConfig').action;
            },
            setter:function (v) {
                if (S.isString(v)) {
                    var self = this;
                    self.set('serverConfig', S.mix(self.get('serverConfig'), {action:v}));
                }
                return v;
            }
        },
        /**
         * 此配置用于动态修改post给服务器的数据，会覆盖serverConfig的data配置
         * @type Object
         * @default {}
         * @since V1.2.6
         */
        data:{
            value:{},
            getter:function () {
                var self = this, uploadType = self.get('uploadType'),
                    data = self.get('serverConfig').data || {};
                if (uploadType) {
                    data = uploadType.get('data');
                }
                return data;
            },
            setter:function (v) {
                if (S.isObject(v)) {
                    var self = this, uploadType = self.get('uploadType');
                    if (S.isFunction(uploadType)) {
                        uploadType.set('data', v);
                        self.set('serverConfig', S.mix(self.get('serverConfig'), {data:v}));
                    }
                }
                return v;
            }
        },
        /**
         * 是否允许上传文件
         * @type Boolean
         * @default true
         */
        isAllowUpload:{value:true},
        /**
         * 是否自动上传
         * @type Boolean
         * @default true
         */
        autoUpload:{value:true},
        /**
         * 服务器端返回的数据的过滤器
         * @type Function
         * @default function(){}
         */
        filter:{
            value:EMPTY,
            setter:function(v){
                var self = this;
                var uploadType = self.get('uploadType');
                if(uploadType)uploadType.set('filter',v);
                return v;
            }
        },
        /**
         * 存储文件路径的隐藏域的name名
         * @type String
         * @default ""
         */
        urlsInputName:{value:EMPTY},
        /**
         *  当前上传的文件对应的在数组内的索引值，如果没有文件正在上传，值为空
         *  @type Number
         *  @default ""
         */
        curUploadIndex:{value:EMPTY},
        /**
         * 上传方式实例
         * @type UploaderType
         * @default {}
         */
        uploadType:{value:{}},
        /**
         * UrlsInput实例
         * @type UrlsInput
         * @default ""
         */
        urlsInput:{value:EMPTY},
        /**
         * 存在批量上传文件时，指定的文件状态
         * @type String
         * @default ""
         */
        uploadFilesStatus:{value:EMPTY},
        /**
         * 强制设置flash的尺寸，只有在flash上传方式中有效，比如{width:100,height:100}，默认为自适应按钮容器尺寸
         * @type Object
         * @default {}
         */
        swfSize:{value:{}}
    }});

    /**
     * 转换文件大小字节数
     * @param {Number} bytes 文件大小字节数
     * @return {String} 文件大小
     */
    S.convertByteSize = function (bytes) {
        var i = -1;
        do {
            bytes = bytes / 1024;
            i++;
        } while (bytes > 99);
        return Math.max(bytes, 0.1).toFixed(1) + ['kB', 'MB', 'GB', 'TB', 'PB', 'EB'][i];
    };
    return Uploader;
}, {requires:['base', 'node', './urlsInput', './type/iframe', './type/ajax', './type/flash', './button/base', './button/swfButton', './queue']});
/**
 * @fileoverview 文件上传按钮base
 * @author: 紫英(橘子)<daxingplay@gmail.com>, 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.3/uploader/button/base',function(S, Node, Base) {
    var EMPTY = '',
        LOG_PREFIX = '[Uploader-Button] ',
        $ = Node.all;
    /**
     * @name Button
     * @class 文件上传按钮，ajax和iframe上传方式使用
     * @constructor
     * @extends Base
     * @param {String} target *，目标元素
     * @param {Object} config 配置对象
     * @param {String} config.name  *，隐藏的表单上传域的name值
     * @param {Boolean} config.disabled 是否禁用按钮
     * @param {Boolean} config.multiple 是否开启多选支持
     */
    function Button(target, config) {
        var self = this;
        config = S.merge({target:$(target)}, config);
        //超类初始化
        Button.superclass.constructor.call(self, config);
    }

    S.mix(Button, {
        //支持的事件
        event : {
            'beforeShow': 'beforeShow',
            'afterShow': 'afterShow',
            'beforeHide': 'beforeHide',
            'afterHide': 'afterHide',
            'beforeRender' : 'beforeRender',
            'afterRender' : 'afterRender',
            'CHANGE' : 'change'
        },
        /**
         * 获取文件名称（从表单域的值中提取）
         * @param {String} path 文件路径
         * @return {String}
         */
        getFileName : function(path) {
            return path.replace(/.*(\/|\\)/, "");
        }
    });

    S.extend(Button, Base, /** @lends Button.prototype*/{
        /**
         * 运行
         * @return {Button} Button的实例
         */
        render : function() {
            var self = this,
                target = self.get('target'),
                render = self.fire(Button.event.beforeRender);
            if (render === false) {
                S.log(LOG_PREFIX + 'button render was prevented.');
                return false;
            } else {
                if (target == null) {
                    S.log(LOG_PREFIX + 'Cannot find target!');
                    return false;
                }
                self._createInput();
                self.fire(Button.event.afterRender);
                return self;
            }
        },
        /**
         * 显示按钮
         * @return {Button} Button的实例
         */
        show : function() {
            var self = this, target = self.get('target');
            target.show();
            self.fire(Button.event.afterShow);
            return Button;
        },
        /**
         * 隐藏按钮
         * @return {Button} Button的实例
         */
        hide : function() {
            var self = this, target = self.get('target');
            target.hide();
            self.fire(Button.event.afterHide);
            return Button;
        },
        /**
         * 重置按钮
         * @return {Button} Button的实例
         */
        reset : function() {
            var self = this,
                inputContainer = self.get('inputContainer');
            //移除表单上传域容器
            $(inputContainer).remove();
            self.set('inputContainer', EMPTY);
            self.set('fileInput', EMPTY);
            //重新创建表单上传域
            self._createInput();
            return self;
        },
        /**
         * 创建隐藏的表单上传域
         * @return {HTMLElement} 文件上传域容器
         */
        _createInput : function() {
            var self = this,
                target = self.get('target'),
                name = self.get('name'),
                tpl = self.get('tpl'),
                html,
                inputContainer,
                fileInput;
            if (!S.isString(name) || !S.isString(tpl)) {
                S.log(LOG_PREFIX + 'No name or tpl specified.');
                return false;
            }
            html = S.substitute(tpl, {
                'name' : name
            });
            // TODO: inputContainer = DOM.create(html);
            inputContainer = $(html);
            //向body添加表单文件上传域
            $(inputContainer).appendTo(target);
            fileInput = $(inputContainer).children('input');
            //TODO:IE6下只有通过脚本和内联样式才能控制按钮大小
            if(S.UA.ie == 6) fileInput.css('fontSize','400px');
            //TODO:firefox的fontSize不占宽度，必须额外设置left
            //if(S.UA.firefox)  fileInput.css('left','-1200px');
            //上传框的值改变后触发
            $(fileInput).on('change', self._changeHandler, self);
            self.set('fileInput', fileInput);
            self.set('inputContainer', inputContainer);
            //禁用按钮
            self._setDisabled(self.get('disabled'));
            //控制多选
            self._setMultiple(self.get('multiple'));
            return inputContainer;
        },
        /**
         * 文件上传域的值改变时触发
         * @param {Object} ev 事件对象
         */
        _changeHandler : function(ev) {
            var self = this,
                fileInput = self.get('fileInput'),
                value = $(fileInput).val(),
                //IE取不到files
                oFiles = ev.target.files,files = [];
            if (value == EMPTY) {
                S.log(LOG_PREFIX + 'No file selected.');
                return false;
            }
            if(oFiles){
                S.each(oFiles,function(v){
                    if(S.isObject(v)){
                        files.push({'name' : v.name,'type' : v.type,'size' : v.size,data:v});
                    }
                });
            }else{
                files.push({'name' : Button.getFileName(value)});
            }
            self.fire(Button.event.CHANGE, {
                files: files,
                input: fileInput.getDOMNode()
            });
            self.reset();
        },
        /**
         * 设置上传组件的禁用
         * @param {Boolean} disabled 是否禁用
         * @return {Boolean}
         */
        _setDisabled : function(disabled){
            var self = this,
                cls = self.get('cls'),disabledCls = cls.disabled,
                $target = self.get('target'),
                input = self.get('fileInput');
            if(!$target.length || !S.isBoolean(disabled)) return false;
            if(!disabled){
                $target.removeClass(disabledCls);
                $(input).show();
            }else{
                $target.addClass(disabledCls);
                $(input).hide();
            }
            return disabled;
        },
        /**
         * 设置上传组件的禁用
         * @param {Boolean} multiple 是否禁用
         * @return {Boolean}
         */
        _setMultiple : function(multiple){
            var self = this,fileInput = self.get('fileInput');
            if(!fileInput.length) return false;
            multiple && fileInput.attr('multiple','multiple') || fileInput.removeAttr('multiple');
            return multiple;
        }
    }, {
        ATTRS : /** @lends Button.prototype */{
            /**
             * 按钮目标元素
             * @type KISSY.Node
             * @default null
             */
            target: {
                value: null
            },
            /**
             * 对应的表单上传域
             * @type KISSY.Node
             * @default ""
             */
            fileInput: {
                value: EMPTY
            },
            /**
             * 文件上传域容器
             * @type KISSY.Node
             * @default ""
             */
            inputContainer: {
                value: EMPTY
            },
            /**
             * 隐藏的表单上传域的模板
             * @type String
             */
            tpl : {
                value : '<div class="file-input-wrapper" style="overflow: hidden;"><input type="file" name="{name}" hidefocus="true" class="file-input" /></div>'
            },
            /**
             * 隐藏的表单上传域的name值
             * @type String
             * @default "fileInput"
             */
            name : {
                value : 'fileInput',
                setter : function(v) {
                    if (this.get('fileInput')) {
                        $(this.get('fileInput')).attr('name', v);
                    }
                    return v;
                }
            },
            /**
             * 是否可用,false为可用
             * @type Boolean
             * @default false
             */
            disabled : {
                value : false,
                setter : function(v) {
                    this._setDisabled(v);
                    return v;
                }
            },
            /**
             * 是否开启多选支持，多选目前有兼容性问题，建议禁用
             * @type Boolean
             * @default true
             */
            multiple : {
                value : true,
                setter : function(v){
                    this._setMultiple(v);
                    return v;
                }
            },
            /**
             * 样式
             * @type Object
             * @default  { disabled : 'uploader-button-disabled' }
             */
            cls : {
                value : {
                    disabled : 'uploader-button-disabled'
                }
            }
        }
    });

    return Button;

}, {
    requires:[
        'node',
        'base'
    ]
});
/**
 * @fileoverview flash上传按钮
 * @author: 紫英(橘子)<daxingplay@gmail.com>, 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.3/uploader/button/swfButton', function (S, Node, Base, SwfUploader) {
    var EMPTY = '', $ = Node.all,
        SWF_WRAPPER_ID_PREVFIX = 'swf-uploader-wrapper-';

    /**
     * @name SwfButton
     * @class flash上传按钮，基于龙藏的AJBrige。只有使用flash上传方式时候才会实例化这个类
     * @constructor
     * @extends Base
     */
    function SwfButton(target, config) {
        var self = this;
        config = S.merge({target:$(target)}, config);
        //调用父类构造函数
        SwfButton.superclass.constructor.call(self, config);
    }

    S.mix(SwfButton, /** @lends SwfButton*/{
        /**
         * 支持的事件
         */
        event:{
            //组件运行后事件
            RENDER : 'render',
            //选择文件后事件
            CHANGE:'change',
            //鼠标在swf中滑过事件
            MOUSE_OVER:'mouseOver',
            //鼠标在swf中按下事件
            MOUSE_DOWN:'mouseDown',
            //鼠标在swf中弹起事件
            MOUSE_UP:'mouseUp',
            //鼠标在swf中移开事件
            MOUSE_OUT:'mouseOut',
            //鼠标单击事件
            CLICK:'click'
        }
    });
    S.extend(SwfButton, Base, /** @lends SwfButton.prototype*/{
        /**
         *  运行，会实例化AJBrige的Uploader，存储为swfUploader属性
         */
        render:function () {
            var self = this,
                $target = self.get('target'),
                swfUploader,
                multiple = self.get('multiple'),
                fileFilters = self.get('fileFilters') ;
            $target.css('position', 'relative');
            self.set('swfWrapper',self._createSwfWrapper());
            self._setFlashSizeConfig();
            swfUploader = self._initSwfUploader();
            //SWF 内容准备就绪
            swfUploader.on('contentReady', function(ev){
                //多选和文件过滤控制
                swfUploader.browse(multiple, fileFilters);
                //监听鼠标事件
                self._bindBtnEvent();
                //监听选择文件后事件
                swfUploader.on('fileSelect', self._changeHandler, self);
                self._setDisabled(self.get('disabled'));
                self.fire(SwfButton.event.RENDER);
            }, self);
        },
        /**
         * 创建flash容器
         */
        _createSwfWrapper:function () {
            var self = this,
                target = self.get('target'),
                tpl = self.get('tpl'),
                //容器id
                id = self.get('swfWrapperId') != EMPTY && self.get('swfWrapperId') || SWF_WRAPPER_ID_PREVFIX + S.guid(),
                //容器html
                html = S.substitute(tpl, {id:id});
            self.set('swfWrapperId', id);
            return $(html).appendTo(target);
        },
        /**
         * 初始化ajbridge的uploader
         * @return {SwfUploader}
         */
        _initSwfUploader:function () {
            var self = this, flash = self.get('flash'),
                id = self.get('swfWrapperId'),
                swfUploader;
            S.mix(flash,{id:'swfUploader'+S.guid()});
            try {
                //实例化AJBridge.Uploader
                swfUploader = new SwfUploader(id, flash);
                self.set('swfUploader', swfUploader);
            } catch (err) {

            }
            return swfUploader;
        },
        /**
         * 监听swf的各个鼠标事件
         * @return {SwfButton}
         */
        _bindBtnEvent:function () {
            var self = this, event = SwfButton.event,
                swfUploader = self.get('swfUploader');
            if (!swfUploader) return false;
            S.each(event, function (ev) {
                swfUploader.on(ev, function (e) {
                    self.fire(ev);
                }, self);
            });
            return self;
        },
        /**
         * 设置flash配置参数
         */
        _setFlashSizeConfig:function () {
            var self = this, flash = self.get('flash'),
                target = self.get('target'),
                size = self.get('size');
            if(!S.isEmptyObject(size)){
                S.mix(flash.attrs, size);
            }else{
                S.mix(flash.attrs, {
                    width:target.innerWidth(),
                    height:target.innerHeight()
                });
            }
            self.set('flash', flash);
        },
        /**
         * flash中选择完文件后触发的事件
         */
        _changeHandler:function (ev) {
            var self = this, files = ev.fileList;
            self.fire(SwfButton.event.CHANGE, {files:files});
        },
        /**
         * 设置上传组件的禁用
         * @param {Boolean} disabled 是否禁用
         * @return {Boolean}
         */
        _setDisabled : function(disabled){
            var self = this,
                swfUploader = self.get('swfUploader'),
                cls = self.get('cls'),disabledCls = cls.disabled,
                $target = self.get('target'),
                $swfWrapper = self.get('swfWrapper');
            if(!swfUploader || !S.isBoolean(disabled)) return false;
            if(!disabled){
                $target.removeClass(disabledCls);
                //显示swf容器
                $swfWrapper.css('top',0);
                //TODO:之所以不使用更简单的unlock()方法，因为这个方法应用无效，有可能是bug
                //swfUploader.unlock();
            }else{
                $target.addClass(disabledCls);
                //隐藏swf容器
                $swfWrapper.css('top','-3000px');
                //swfUploader.lock();
            }
            return disabled;
        },
        /**
         * 显示按钮
         */
        show:function(){
             var self = this,
                 $target = self.get('target');
             $target.show();
        },
        /**
         * 隐藏按钮
         */
        hide:function(){
            var self = this,
                $target = self.get('target');
            $target.hide();
        }
    }, {ATTRS:/** @lends SwfButton.prototype*/{
        /**
         * 按钮目标元素
         * @type KISSY.Node
         * @default ""
         */
        target:{value:EMPTY},
        /**
         * swf容器
         * @type KISSY.Node
         * @default ""
         */
        swfWrapper : {value : EMPTY},
        /**
         * swf容器的id，如果不指定将使用随机id
         * @type Number
         * @default ""
         */
        swfWrapperId:{value:EMPTY},
        /**
         * flash容器模板
         * @type String
         */
        tpl:{
            value:'<div id="{id}" class="uploader-button-swf" style="position: absolute;top:0;left:0;z-index:2000;"></div>'
        },
        /**
         * 是否开启多选支持
         * @type Boolean
         * @default true
         */
        multiple:{
            value:true,
            setter:function (v) {
                var self = this, swfUploader = self.get('swfUploader');
                if (swfUploader) {
                    swfUploader.multifile(v);
                }
                return v;
            }
        },
        /**
         * 文件过滤，格式类似[{desc:"JPG,JPEG,PNG,GIF,BMP",ext:"*.jpg;*.jpeg;*.png;*.gif;*.bmp"}]
         * @type Array
         * @default []
         */
        fileFilters:{
            value:[],
            setter:function (v) {
                var self = this, swfUploader = self.get('swfUploader');
                if(S.isObject(v)) v = [v];
                if (swfUploader && S.isArray(v)) {
                    S.later(function(){
                        swfUploader.filter(v);
                    },800);
                }
                return v;
            }
        },
        /**
         * 禁用按钮
         * @type Boolean
         * @default false
         */
        disabled : {
            value : false,
            setter : function(v){
                var self = this, swfUploader = self.get('swfUploader');
                if (swfUploader) {
                    self._setDisabled(v);
                }
                return v;
            }
        },
        /**
         * 样式
         * @type Object
         * @default  { disabled:'uploader-button-disabled' }
         */
        cls : {
            value : { disabled:'uploader-button-disabled' }
        },
        /**
         * 强制设置flash的尺寸，比如{width:100,height:100}，默认为自适应按钮容器尺寸
         * @type Object
         * @default {}
         */
        size : {value:{} },
        /**
         * flash配置，对于swf文件配路径配置非常关键，使用默认cdn上的路径就好
         * @type Object
         * @default { src:'http://a.tbcdn.cn/s/kissy/gallery/form/1.3/uploader/plugins/ajbridge/uploader.swf', id:'swfUploader', params:{ bgcolor:"#fff", wmode:"transparent" }, attrs:{ }, hand:true, btn:true }
             }
         */
        flash:{
            value:{
                src:'http://a.tbcdn.cn/s/kissy/gallery/form/1.3/uploader/plugins/ajbridge/uploader.swf',
                id:'swfUploader',
                params:{
                    bgcolor:"#fff",
                    wmode:"transparent"
                },
                //属性
                attrs:{ },
                //手型
                hand:true,
                //启用按钮模式,激发鼠标事件
                btn:true
            }
        },
        /**
         *  ajbridge的uploader的实例
         *  @type SwfUploader
         *  @default ""
         */
        swfUploader:{value:EMPTY}
    }});
    return SwfButton;
}, {requires:['node', 'base', '../plugins/ajbridge/uploader']});/**
 * @fileoverview 运行文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.3/uploader/imageUploader',function (S, Base, Node, RenderUploader,Auth) {
    var EMPTY = '', $ = Node.all;

    /**
     * 主要用于data-valid的解析，为了和Butterfly的uth保持统一
     * @param cfg
     * @return {*}
     */
    function toJSON(cfg) {
        cfg = cfg.replace(/'/g, '"');
        try {
            eval("cfg=" + cfg);
        } catch (e) {
            S.log('data-valid json is invalid');
        }
        return cfg;
    }
    /**
     * @name ImageUploader
     * @class 异步文件上传入口文件，会从按钮的data-config='{}' 伪属性中抓取组件配置
     * @version 1.3
     * @constructor
     * @param {String | HTMLElement} buttonTarget *，上传按钮目标元素
     * @param {String | HTMLElement} queueTarget 文件队列目标元素，再不需要显示文件信息的情况下这个参数可以设置为null
     * @param {Object} config 配置，该配置会覆盖data-config伪属性中的数据
     * @requires Uploader
     * @requires Auth
     * @example
     * <a id="J_UploaderBtn" class="uploader-button" data-config=
     '{"type" : "auto",
     "serverConfig":{"action":"upload.php"},
     "name":"Filedata",
     "urlsInputName":"fileUrls"}'
     href="#">
     选择要上传的文件
     </a>
     <ul id="J_UploaderQueue">

     </ul>
     * @example
     *
KISSY.use('gallery/form/1.3/uploader/index', function (S, ImageUploader) {
     var ru = new ImageUploader('#J_UploaderBtn', '#J_UploaderQueue');
     ru.on("init", function (ev) {
        var uploader = ev.uploader;
     })
})
     */
    function ImageUploader(buttonTarget, queueTarget, config) {
        var self = this;
        //合并配置
        config = S.mix(S.form.parseConfig(buttonTarget), config);
        //超类初始化
        ImageUploader.superclass.constructor.call(self, config);
        self.set('buttonTarget', buttonTarget);
        self.set('queueTarget', queueTarget);
        self.set('uploaderConfig', config);
    }
    S.mix(ImageUploader, /** @lends ImageUploader*/{
        /**
         * 监听的uploader事件
         */
        events:['select','start','progress','complete','success','uploadFiles','cancel','error','restore'],
        /**
         * 监听queue事件
         */
        queueEvents:['add','remove','statusChange','clear']
    });
    S.extend(ImageUploader, RenderUploader, /** @lends ImageUploader.prototype*/{
        /**
         * 删除父类的自动初始化函数
         * @private
         */
        _init:function(){

        },
        /**
         * 初始化组件
         * @return {ImageUploader}
         */
        render:function () {
            var self = this;
            var $target =$(self.get('buttonTarget'));
            if(!$target.length) return false;
            if($target.attr('theme')) self.set('theme',$target.attr('theme'));
            //主题路径
            var  theme = self.get('theme');
            var uploader;

            self._setQueueTarget();
            self._setConfig();
            self._replaceBtn();

            //不使用主题
            if(theme == EMPTY){
                uploader = self._initUploader();
                self.set('button', uploader.get('button'));
                S.later(function(){
                    self.fire('render', {uploader:uploader,button:uploader.get('button'),queue:uploader.get('queue'),auth:uploader.get('auth')});
                },500);
            }else{
                self._initThemes(function (theme) {
                    uploader = self._initUploader();
                    self.set('button', uploader.get('button'));
                    theme.set('uploader',uploader);
                    theme.set('button',uploader.get('button'));
                    theme.set('queue',uploader.get('queue'));
                    theme.set('auth',uploader.get('auth'));
                    theme._UploaderRender(function(){
                        theme.afterUploaderRender(uploader);
                        self._bindEvents(uploader);
                        uploader.restore();
                        self.fire('render', {uploader:uploader,button:uploader.get('button'),queue:uploader.get('queue'),auth:uploader.get('auth')});
                    });
                });
            }
            return self;
        },
        /**
         * 设置队列目标元素
         * @private
         */
        _setQueueTarget:function(){
            var self = this;
            var $queue = self.get('queueTarget');
            var $btn = $(self.get('buttonTarget'));
            if(!$queue || !$queue.length){
                var queueTarget = $btn.attr('queueTarget');
                if(queueTarget != EMPTY){
                    self.set('queueTarget',$(queueTarget));
                }
            }
        },
        /**
         * 监听uploader的各个事件
         * @param {Uploader} uploader
         * @private
         */
        _bindEvents:function(uploader){
            if(!uploader) return false;
            var self = this;
            var events = ImageUploader.events;
            var queueEvents = ImageUploader.queueEvents;
            var queue = uploader.get('queue');
            var extEventObj =  {uploader:uploader,queue:queue};
            S.each(events,function(event){
                uploader.on(event,function(ev){
                    self.fire(event, S.mix(ev,extEventObj));
                })
            });
            S.each(queueEvents,function(event){
                queue.on(event,function(ev){
                    self.fire(event, S.mix(ev,extEventObj));
                })
            })
        },
        /**
         * 初始化文件验证
         * @return {Auth}
         * @private
         */
        _auth:function () {
            var self = this;
            var  uploader = self.get('uploader') ;
            var config = self.get('authConfig');
            var auth;
            if(S.isEmptyObject(config)) return false;
            auth = new Auth(uploader,{rules : config});
            uploader.set('auth',auth);
            return auth;
        },
        /**
         * 设置配置
         * @private
         */
        _setConfig:function(){
            var self = this;
            var $btn = $(self.get('buttonTarget'));
            var uploaderConfig = self.get('uploaderConfig');
            var htmlConfig = {};
            var authConfig = self._getAuthConfig();
            self.set('authConfig',authConfig);
            if(!S.isEmptyObject(authConfig)){
                  self.set('authConfig', S.mix(authConfig,self.get('authConfig')));
            }

            var configkeys = ['name','urlsInputName','autoUpload','postData','action','multiple','multipleLen','uploadType','disabled'];
            var serverConfig = {};
            S.each(configkeys,function(key){
                var htmlKey = key;
                var value = $btn.attr(htmlKey);
                if(value){

                   switch (key){
                       case 'postData' :
                           key = 'data';
                           value = value && S.JSON.parse(value);
                           serverConfig.data = value;
                       break;
                       case 'action' :
                           serverConfig.action = value;
                       break;
                       case 'uploadType':
                           key = 'type';
                       break;
                   }

                   if(key == 'autoUpload' || key == 'multiple' || key == 'disabled' ){
                       value = value == 'false' && false || true;
                   }

                   htmlConfig[key] = value;

                }
            });
            htmlConfig.serverConfig = serverConfig;
            uploaderConfig = S.merge(htmlConfig,uploaderConfig);
            self.set('uploaderConfig',uploaderConfig);
            self.set('name',uploaderConfig.name);

        },
        /**
         * 从html中拉取验证配置
         * @private
         */
        _getAuthConfig:function(){
            var self = this;
            var $btn = $(self.get('buttonTarget'));
            if(!$btn.length) return false;

            var authConfig = {};
            //默认增加图片格式验证
            var defaultAllowExts = self.get('defaultAllowExts');
            //所有的验证规则
            var authRules = ['required','max','allowExts','maxSize','allowRepeat'];
            //验证消息
            var msgs = self.get('authMsg');
            var uploaderConfig = self.get('uploaderConfig');

            //标签上伪属性的消息配置
            var sMsgs = $btn.attr('data-valid');
            //合并验证消息
            if(sMsgs) S.mix(msgs,toJSON(sMsgs));

            S.each(authRules,function(rule){
                //js配置验证
                if(uploaderConfig[rule]){
                    authConfig[rule] = [uploaderConfig[rule],msgs[rule] || ''];
                }else{
                   //拉取属性的验证配置
                    var value = $btn.attr(rule);
                    if(value){
                        switch (rule){
                            case 'allowExts':
                                value = self._setAllowExts(value);
                                break;
                            case 'max':
                                value = Number(value);
                                break;
                            case 'maxSize':
                                value = Number(value);
                                break;
                            case  'required':
                                value = true;
                                break;
                            case 'allowRepeat':
                                value = true;
                                break;
                        }
                        authConfig[rule] = [value,msgs[rule] || ''];
                    }

                }
            });
            //默认允许上传的图片格式
            if(!authConfig['allowExts']) authConfig['allowExts'] = [self._setAllowExts(defaultAllowExts),msgs['allowExts'] || ''];
            //默认不允许上传重复图片
            if(!authConfig['allowRepeat']) authConfig['allowRepeat'] =  [false,msgs['allowRepeat'] || ''] ;
             return authConfig;
        },
        /**
         * 举例：将jpg,jpeg,png,gif,bmp转成{desc:"JPG,JPEG,PNG,GIF,BMP", ext:"*.jpg;*.jpeg;*.png;*.gif;*.bmp"}
         * @param exts
         * @return {*}
         * @private
         */
        _setAllowExts:function(exts){
            if(!S.isString(exts)) return exts;
            var ext = [];
            var desc = [];
            exts = exts.split(',');
            S.each(exts,function(e){
                ext.push('*.'+e);
                desc.push(e.toUpperCase());
            });
            ext = ext.join(';');
            desc = desc.join(',');
            return {desc:desc,ext:ext};
        },
        /**
         * 将input替换成上传按钮
         * @private
         */
        _replaceBtn:function(){
            var self = this;
            var $btn = $(self.get('buttonTarget'));
            if(!$btn.length) return false;
            var text = $btn.val() || '上传图片';
            var btnHtml = S.substitute(self.get('btnTpl'),{text:text});
            var $aBtn = $(btnHtml).insertAfter($btn);
            $btn.remove();
            self.set('buttonTarget',$aBtn);
            self.set('uploaderConfig', S.mix(self.get('uploaderConfig'),{target:$aBtn}));
            return $aBtn;
        }
    }, {
        ATTRS:/** @lends ImageUploader.prototype*/{
            /**
             * 主题引用路径，当值为""时，不使用uploader主题。非内置主题，值为模块路径，比如"refund/rfUploader"
             * @type String
             * @default  “imageUploader”
             */
            theme:{value:'imageUploader' },
            /**
             * 默认的文件格式过滤器
             * @type String
             * @default 'jpg,jpeg,png,gif,bmp'
             */
            defaultAllowExts:{value:'jpg,jpeg,png,gif,bmp'},
            /**
             * 验证消息
             * @type Object
             * @default {}
             */
            authMsg:{
                value:{
                    max:'每次最多上传{max}个图片！',
                    maxSize:'图片大小为{size}，超过{maxSize}！',
                    required:'至少上传一张图片！',
                    require:'至少上传一张图片！',
                    allowExts:'不支持{ext}格式！',
                    allowRepeat:'该图片已经存在！'
                }
            },
            /**
             * 模拟上传按钮样式
             */
            btnTpl:{
                value:'<a href="javascript:void(0)" class="g-u ks-uploader-button"><span class="btn-text">{text}</span></a>'
            }
        }
    });
    return ImageUploader;
}, {requires:['base', 'node','./index','./auth/base' ]});
/**
 * @fileoverview 运行文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.3/uploader/index',function (S, Base, Node, Uploader,Auth) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploaderRender]:',
        dataName = {
            CONFIG:'data-config',
            BUTTON_CONFIG : 'data-button-config',
            THEME_CONFIG : 'data-theme-config',
            AUTH : 'data-auth'
        },
        //所支持的内置主题
        THEMES = ['default','imageUploader', 'ershouUploader','loveUploader','uploadify','refundUploader'],
    //内置主题路径前缀
        THEME_PREFIX='gallery/form/1.3/uploader/themes/';
    S.namespace('form');
    /**
     * 解析组件在页面中data-config成为组件的配置
     * @param {String} hook 组件钩子
     * @param {String} dataConfigName 配置名
     * @return {Object}
     */
    S.form.parseConfig = function(hook, dataConfigName) {
        var config = {}, sConfig, DATA_CONFIG = dataConfigName || dataName.CONFIG;
        sConfig = $(hook).attr(DATA_CONFIG);
        if (!S.isString(sConfig)) return {};
        try {
            config = S.JSON.parse(sConfig);
        } catch (err) {
            S.log(LOG_PREFIX + '请检查' + hook + '上' + DATA_CONFIG + '属性内的json格式是否符合规范！');
        }
        return config;
    };

    /**
     * @name RenderUploader
     * @class 异步文件上传入口文件，会从按钮的data-config='{}' 伪属性中抓取组件配置
     * @version 1.2
     * @constructor
     * @param {String | HTMLElement} buttonTarget *，上传按钮目标元素
     * @param {String | HTMLElement} queueTarget 文件队列目标元素，再不需要显示文件信息的情况下这个参数可以设置为null
     * @param {Object} config 配置，该配置会覆盖data-config伪属性中的数据
     * @requires Uploader
     * @requires Auth
     * @example
     * <a id="J_UploaderBtn" class="uploader-button" data-config=
     '{"type" : "auto",
     "serverConfig":{"action":"upload.php"},
     "name":"Filedata",
     "urlsInputName":"fileUrls"}'
     href="#">
     选择要上传的文件
     </a>
     <ul id="J_UploaderQueue">

     </ul>
     * @example
     *
KISSY.use('gallery/form/1.3/uploader/index', function (S, RenderUploader) {
     var ru = new RenderUploader('#J_UploaderBtn', '#J_UploaderQueue');
     ru.on("init", function (ev) {
        var uploader = ev.uploader;
     })
})
     */
    function RenderUploader(buttonTarget, queueTarget, config) {
        var self = this;
        //合并配置
        config = S.mix(S.form.parseConfig(buttonTarget), config);
        //超类初始化
        RenderUploader.superclass.constructor.call(self, config);
        self.set('buttonTarget', buttonTarget);
        self.set('queueTarget', queueTarget);
        self.set('uploaderConfig', config);
        self._init();
    }
    /**
     * @name RenderUploader#init
     * @desc 上传组件完全初始化成功后触发，对uploader的操作务必先监听init事件
     * @event
     * @param {Uploader} ev.uploader   Uploader的实例
     * @param {Button} ev.button   Button的实例
     * @param {Queue} ev.queue   Queue的实例
     * @param {Auth} ev.auth   Auth的实例
     */

    S.extend(RenderUploader, Base, /** @lends RenderUploader.prototype*/{
        /**
         * 初始化组件
         */
        _init:function () {
            var self = this,
                //主题路径
                theme = self.get('theme'),
                uploader;
            //不使用主题
            if(theme == EMPTY){
                uploader = self._initUploader();
                self.set('button', uploader.get('button'));
                S.later(function(){
                    self.fire('init', {uploader:uploader,button:uploader.get('button'),queue:uploader.get('queue'),auth:uploader.get('auth')});
                },500);
            }else{
                self._initThemes(function (theme) {
                    uploader = self._initUploader();
                    self.set('button', uploader.get('button'));
                    theme.set('uploader',uploader);
                    theme.set('button',uploader.get('button'));
                    theme.set('queue',uploader.get('queue'));
                    theme.set('auth',uploader.get('auth'));
                    theme._UploaderRender(function(){
                        theme.afterUploaderRender(uploader);
                        // 抓取restoreHook容器内的数据，生成文件DOM
                        uploader.restore();
                        self.fire('init', {uploader:uploader,button:uploader.get('button'),queue:uploader.get('queue'),auth:uploader.get('auth')});
                    });
                });
            }
        },
        /**
         * 初始化Uploader
         * @return {Uploader}
         */
        _initUploader:function(){
            var self = this, uploaderConfig = self.get('uploaderConfig');
            //配置增加按钮实例和队列实例
            S.mix(uploaderConfig, {target:self.get('buttonTarget')});
            var uploader = new Uploader(uploaderConfig);
            uploader.render();
            self.set('uploader', uploader);
            self._auth();
            return uploader;
        },
        /**
         * 初始化主题
         * @param {Function} callback 主题加载完成后的执行的回调函数
         */
        _initThemes:function (callback) {
            var self = this, theme = self.get('theme'),
                target = self.get('buttonTarget'),
                cf = self.get('themeConfig'),
                //从html标签的伪属性中抓取配置
                config = S.form.parseConfig(target,dataName.THEME_CONFIG);
            S.mix(config,cf);
            self.set('themeConfig',config);
            //如果只是传递主题名，组件自行拼接
            theme = self._getThemeName(theme);
            S.use(theme, function (S, Theme) {
                var queueTarget = self.get('queueTarget'), theme;
                S.mix(config,{queueTarget:queueTarget,buttonTarget:self.get('buttonTarget')});
                theme = new Theme(config);
                theme.on('render',function(){
                    callback && callback.call(self, theme);
                });
                theme.render();
            })
        },
        /**
         * 获取正确的主题名
         * @param {String} theme 主题名
         * @return {String}
         */
        _getThemeName:function(theme){
            var themeName = theme;
            S.each(THEMES,function(t){
               if(t == theme){
                   themeName = THEME_PREFIX + theme;
               }
            });
            themeName = themeName + '/index';
            return themeName;
        },
        /**
         * 文件上传验证
         */
        _auth:function () {
            var self = this,buttonTarget = self.get('buttonTarget'),
                uploader = self.get('uploader'),
                cf = self.get('authConfig'),
                config = S.form.parseConfig(buttonTarget,dataName.AUTH);
            S.mix(config,cf);
            self.set('authConfig',config);
            if(S.isEmptyObject(config)) return false;
            auth = new Auth(uploader,{rules : config});
            uploader.set('auth',auth);
            return auth;
        }
    }, {
        ATTRS:/** @lends RenderUploader.prototype*/{
            /**
             * 主题引用路径，当值为""时，不使用uploader主题。非内置主题，值为模块路径，比如"refund/rfUploader"
             * @type String
             * @default  “default”
             */
            theme:{value:'default' },
            /**
             * 主题配置，会覆盖data-theme-config中的配置，不再推荐使用伪属性的方式配置主题参数
             * @type Object
             * @default {}
             * @since 1.2
             * @example
 //配置主题样式路径
themeConfig:{
    cssUrl:'gallery/form/1.3/uploader/themes/default/style.css'
}
             */
            themeConfig:{value:{}},
            /**
             * 按钮目标元素
             * @type String|HTMLElement|KISSY.NodeList
             * @default ""
             */
            buttonTarget:{value:EMPTY},
            /**
             * 队列目标元素
             * @default ""
             * @type String|HTMLElement|KISSY.NodeList
             */
            queueTarget:{value:EMPTY},
            /**
             * 上传组件配置
             * @type Object
             * @default {}
             */
            uploaderConfig:{},
            /**
             * 验证配置
             * @type Object
             * @default {}
             * @since 1.2
             * @example
             //验证配置
             authConfig: {
                 allowExts:[
                     {desc:"JPG,JPEG,PNG,GIF,BMP", ext:"*.jpg;*.jpeg;*.png;*.gif;*.bmp"},
                     '不支持{ext}格式的文件上传！'
                 ],
                 max:[3, '每次最多上传{max}个文件！']
             }
             */
            authConfig:{value:{}},
            /**
             * Button（上传按钮）的实例
             * @type Button
             * @default ""
             */
            button:{value:EMPTY},
            /**
             * Queue（上传队列）的实例
             * @type Queue
             * @default ""
             */
            queue:{value:EMPTY},
            /**
             * 上传组件实例
             * @type Uploader
             * @default ""
             */
            uploader:{value:EMPTY}
        }
    });
    return RenderUploader;
}, {requires:['base', 'node', './base','./auth/base']});
/*
Copyright 2011, KISSY UI Library v1.1.5
MIT Licensed
build time: Sep 11 10:29
*/
/**
 * AJBridge Class
 * @author kingfo oicuicu@gmail.com
 */
KISSY.add('gallery/form/1.3/uploader/plugins/ajbridge/ajbridge', function(S,Flash) {

    var ID_PRE = '#',
        VERSION = '1.0.15',
		PREFIX = 'ks-ajb-',
		LAYOUT = 100,
        EVENT_HANDLER = 'KISSY.AJBridge.eventHandler'; // Flash 事件抛出接受通道

    /**
     * @constructor
     * @param {String} id       注册应用容器 id
     * @param {Object} config   基本配置同 S.Flash 的 config
     * @param {Boolean} manual  手动进行 init
     */
    function AJBridge(id, config,manual) {
        id = id.replace(ID_PRE, ''); // 健壮性考虑。出于 KISSY 习惯采用 id 选择器
        config = Flash._normalize(config||{}); // 标准化参数关键字

        var self = this,
            target = ID_PRE + id, // 之所以要求使用 id，是因为当使用 ajbridge 时，程序员自己应该能确切知道自己在做什么
            callback = function(data) {
                if (data.status < 1) {
                    self.fire('failed', { data: data });
                    return;
                }
				
                S.mix(self, data);

                // 执行激活 静态模式的 flash
                // 如果这 AJBridge 先于 DOMReady 前执行 则失效
                // 建议配合 S.ready();
                if (!data.dynamic || !config.src) {
						self.activate();
                }
            };
		
		// 自动产生 id	
		config.id = config.id || S.guid(PREFIX);

        // 注册应用实例
        AJBridge.instances[config.id] = self;

        //	动态方式
        if (config.src) {
            // 强制打开 JS 访问授权，AJBridge 的最基本要求
            config.params.allowscriptaccess = 'always';
            config.params.flashvars = S.merge(config.params.flashvars, {
                // 配置 JS 入口
                jsEntry: EVENT_HANDLER,
                // 虽然 Flash 通过 ExternalInterface 获得 obejctId
                // 但是依然存在兼容性问题, 因此需要直接告诉
                swfID: config.id
            });
        }

        // 支持静态方式，但是要求以上三个步骤已静态写入
        // 可以参考 test.html
		
        // 由于完全基于事件机制，因此需要通过监听之后进行初始化 Flash
		
        if(manual)self.__args = [target, config, callback];
		else S.later(Flash.add,LAYOUT,false,Flash,[target, config, callback]);
    }

    /**
     * 静态方法
     */
    S.mix(AJBridge, {

        version: VERSION,

        instances: { },

        /**
         * 处理来自 AJBridge 已定义的事件
         * @param {String} id            swf传出的自身ID
         * @param {Object} event        swf传出的事件
         */
        eventHandler: function(id, event) {
            var instance = AJBridge.instances[id];
            if (instance) {
                instance.__eventHandler(id, event);
            }
        },

        /**
         * 批量注册 SWF 公开的方法
         * @param {Class} C
         * @param {String|Array} methods
         */
        augment: function (C, methods) {
            if (S.isString(methods)) {
                methods = [methods];
            }
            if (!S.isArray(methods)) return;
			
			

            S.each(methods, function(methodName) {
                C.prototype[methodName] = function() {
                    try {
                        return this.callSWF(methodName, S.makeArray(arguments));
                    } catch(e) { // 当 swf 异常时，进一步捕获信息
                        this.fire('error', { message: e });
                    }
                }
            });
        }
    });

    S.augment(AJBridge, S.EventTarget, {

        init: function() {
			if(!this.__args)return;
            Flash.add.apply(Flash, this.__args);
			this.__args = null;
			delete this.__args; // 防止重复添加
        },

        __eventHandler: function(id, event) {
            var self = this,
                type = event.type;
			
            event.id = id;   //	弥补后期 id 使用
            switch(type){
				case "log":
					 S.log(event.message);
					break;
				default:
					self.fire(type, event);
			}
			
        },

        /**
         * Calls a specific function exposed by the SWF's ExternalInterface.
         * @param func {String} the name of the function to call
         * @param args {Array} the set of arguments to pass to the function.
         */
        callSWF: function (func, args) {
            var self = this;
            args = args || [];
            try {
                if (self.swf[func]) {
                    return self.swf[func].apply(self.swf, args);
                }
            }
            // some version flash function is odd in ie: property or method not supported by object
            catch(e) {
                var params = '';
                if (args.length !== 0) {
                    params = "'" + args.join("','") + "'";
                }
                //avoid eval for compressiong
                return (new Function('self', 'return self.swf.' + func + '(' + params + ');'))(self);
            }
        }
    });

    // 为静态方法动态注册
    // 注意，只有在 S.ready() 后进行 AJBridge 注册才有效。
    AJBridge.augment(AJBridge, ['activate', 'getReady','getCoreVersion']);

    window.AJBridge = S.AJBridge = AJBridge;

    return AJBridge;
}, { requires:["flash"] });
/**
 * NOTES:
 * 20120117 移植成kissy1.2.0的模块（明河修改）
 */
/*
Copyright 2011, KISSY UI Library v1.1.5
MIT Licensed
build time: Sep 11 10:29
*/
/**
 * @author kingfo  oicuicu@gmail.com
 */
KISSY.add('gallery/form/1.3/uploader/plugins/ajbridge/uploader', function(S,flash,A) {

    /**
     * @constructor
     * @param {String} id                                    需要注册的SWF应用ID
     * @param {Object} config                                配置项
     * @param {String} config.ds                             default server 的缩写
     * @param {String} config.dsp                            default server parameters 的缩写
     * @param {Boolean} config.btn                           启用按钮模式，默认 false
     * @param {Boolean} config.hand                          显示手型，默认 false
     */
    function Uploader(id, config) {
        config = config || { };
        var flashvars = { };
		
		
		
		S.each(['ds', 'dsp', 'btn', 'hand'], function(key) {
			if(key in config) flashvars[key] = config[key];
		});
		

        config.params = config.params || { };
        config.params.flashvars = S.merge(config.params.flashvars, flashvars);

		Uploader.superclass.constructor.call(this, id, config);
    }

    S.extend(Uploader, A);

    A.augment(Uploader,
        [
            'setFileFilters',
            'filter',
            'setAllowMultipleFiles',
            'multifile',
            'browse',
            'upload',
            'uploadAll',
            'cancel',
            'getFile',
            'removeFile',
            'lock',
            'unlock',
            'setBtnMode',
            'useHand',
            'clear'
        ]
        );

    Uploader.version = '1.0.1';
    A.Uploader = Uploader;
    return A.Uploader;
},{ requires:["flash","./ajbridge"] });
/**
 * @fileoverview �Ӷ���ͼƬ��ѡ��һ����Ϊ����ͼƬ������ͼ��
 * @author ��Ӣ�����ӣ�<daxingplay@gmail.com>�����<jianping.xwh@taobao.com>

 */
KISSY.add('gallery/form/1.3/uploader/plugins/coverPic/coverPic', function(S, Node,Base){

    var $ = Node.all,
        LOG_PRE = '[LineQueue: setMainPic] ';

    /**
     * �Ӷ���ͼƬ��ѡ��һ����Ϊ����ͼƬ������ͼ
     * @param {NodeList | String} $input Ŀ��Ԫ��
     * @param {Uploader} uploader uploader��ʵ��
     * @constructor
     */
    function CoverPic($input,uploader){

    }
    S.extend(CoverPic, Base, /** @lends CoverPic.prototype*/{
        /**
         * �������
         */
        render:function(){

        }
    },{
        ATTRS:/** @lends CoverPic.prototype*/{

        }
    });

    return CoverPic;

}, {
    requires: [ 'node','base' ]
});/**
 * @fileoverview  文件拖拽上传插件
 *  @author 飞绿
 */
KISSY.add('gallery/form/1.3/uploader/plugins/filedrop/filedrop', function (S, Node, Base) {
    var EMPTY = '',
        $ = Node.all,
        UA = S.UA;
    /**
     * @name FileDrop
     * @class 文件拖拽上传插件
     * @constructor
     *  @author 飞绿
     * @extends Base
     * @param {Object} config 组件配置（下面的参数为配置项，配置会写入属性，详细的配置说明请看属性部分）
     * @param {Button} config.button *，Button按钮的实例
     */
    var FileDrop = function (config) {
        var self = this;
        // console.log(config);
        FileDrop.superclass.constructor.call(self, config);
//        console.log($(config.target), self.get('target'));
        self.set('mode', getMode());
    };

    var getMode = function () {
        if (UA.webkit >= 7 || UA.firefox >= 3.6) {
            return 'supportDrop';
        }
        if (UA.ie) {
            return 'notSupportDropIe';
        }
        if (UA.webkit < 7 || UA.firefox < 3.6) {
            return 'notSupportDrop';
        }
    };

    S.mix(FileDrop, {
        event:{
            'AFTER_DROP':'afterdrop'
        }
    });

    S.extend(FileDrop, Base, /** @lends FileDrop.prototype*/ {
        /**
         * 运行
         */
        render:function () {
//            console.log('render', this.get('target'));
            var self = this,mode = self.get('mode'),
                uploader = self.get('uploader'),
                $dropArea;
            if(uploader.get('type') == 'flash'){
                S.log('flash上传方式不支持拖拽！');
                self.set('isSupport',false);
                return false;
            }
            if(mode != 'supportDrop'){
                S.log('该浏览器不支持拖拽上传！');
                self.set('isSupport',false);
                return false;
            }
            if(!uploader){
                S.log('缺少Uploader的实例！');
                return false;
            }
            $dropArea = self._createDropArea();
            if($dropArea.length){
                $dropArea.on('click',self._clickHandler,self);
            }
            //当uploader的禁用状态发生改变后显隐拖拽区域
            uploader.on('afterDisabledChange',function(ev){
                self[ev.newVal && 'hide' || 'show']();
            });
            self.fire('afterRender', {'buttonTarget':self.get('buttonWrap')});
        },
        /**
         * 显示拖拽区域
         */
        show:function () {
            var self = this,
                dropContainer = self.get('dropContainer');
            dropContainer.show();
        },
        /**
         * 隐藏拖拽区域
         */
        hide:function () {
            var self = this,
                dropContainer = self.get('dropContainer');
            dropContainer.hide();
        },
        /**
         * ?
         */
        reset:function () {
        },
        /**
         * 创建拖拽区域
         */
        _createDropArea:function () {
            var self = this,
                target = $(self.get('target')),
                mode = self.get('mode'),
                html = S.substitute(self.get('tpl')[mode], {name:self.get('name')}),
                dropContainer = $(html),
                buttonWrap = dropContainer.all('.J_ButtonWrap');
            // console.log(buttonWrap);
            dropContainer.appendTo(target);
            dropContainer.on('dragover', function (ev) {
                ev.stopPropagation();
                ev.preventDefault();
            });
            dropContainer.on('drop', function (ev) {
                ev.stopPropagation();
                ev.preventDefault();
                self._dropHandler(ev);
            });
            self.set('dropContainer', dropContainer);
            self.set('buttonWrap', buttonWrap);
            self._setStyle();
            return dropContainer;
        },
        /**
         * 设置拖拽层样式
         * @author 明河新增
         */
        _setStyle:function(){
             var self = this,$dropContainer = self.get('dropContainer');
            if(!$dropContainer.length) return false;
            $dropContainer.parent().css('position','relative');
            $dropContainer.css({'position':'absolute','top':'0','left':'0',width:'100%',height:'100%','zIndex':'1000'});
        },
        /**
         * 点击拖拽区域后触发
         * @author 明河新增
         * @param ev
         */
        _clickHandler:function(ev){
            var self = this,$target = $(ev.target),uploader = self.get('uploader'),
                button = uploader.get('button'),
                $input = button.get('fileInput');
            //触发input的选择文件
            $input.fire('click');
        },
        /**
         * 处理拖拽时间
         */
        _dropHandler:function (ev) {
            var self = this,
                event = FileDrop.event,
                fileList = ev.originalEvent.dataTransfer.files,
                files = [],
                uploader = self.get('uploader');

            if (!fileList.length || uploader == EMPTY)  return false;
            S.each(fileList, function (f) {
                if (S.isObject(f)) {
                    files.push({'name':f.name, 'type':f.type, 'size':f.size,'data':f});
                }
            });
            self.fire(event.AFTER_DROP, {files:files});
            uploader._select({files:files});
        },
        _setDisabled:function () {
        }
    }, {
        ATTRS:/** @lends FileDrop.prototype*/{
            target:{
                value:EMPTY
            },
            uploader:{value:EMPTY},
            dropContainer:{
                value:EMPTY
            },
            /**
             * 是否支持拖拽
             */
            isSupport:{value:true},
            /**
             * 模板
             * @type Object
             * @default {}
             */
            tpl:{
                value:{
                    supportDrop:'<div class="drop-wrapper">' +
                        '<p>直接拖拽图片到这里，</p>' +
                        '<p class="J_ButtonWrap">或者' +
                        '</p>' +
                        '</div>',
                    notSupportDropIe:'<div class="drop-wrapper">' +
                        '<p>您的浏览器只支持传统的图片上传，</p>' +
                        '<p class="suggest J_ButtonWrap">推荐使用chrome浏览器或firefox浏览器' +
                        '</p>' +
                        '</div>',
                    notSupportDrop:'<div class="drop-wrapper">' +
                        '<p>您的浏览器只支持传统的图片上传，</p>' +
                        '<p class="suggest J_ButtonWrap">推荐升级您的浏览器' +
                        '</p>' +
                        '</div>'
                }
            },
            name:{
                value:'',
                setter:function (v) {
                }
            },
            disabled:{
                value:false,
                setter:function (v) {
                    this._setDisabled(v);
                    return v;
                }
            },
            cls:{
                disabled:'drop-area-disabled'
            }
        }
    });

    return FileDrop;
}, {requires:['node', 'base']});
KISSY.add("'gallery/form/1.3/uploader/plugins/imagePreview/imagePreview'",function(S){
	
	//����
	var Mod;
	!function(){
		var types={};
		
		Mod={
			add : function(type,obj){
				if(!types[type]){
					types[type] = obj;
					types[type].type = type;
				} else {
					S.mix(types[type],obj);
					types[type].type = type;
				}
			},
			use : function(type){
				return S.mix(types['default'],types[type]);
			}
		}
	}();
	
	//��ͨ
	Mod.add("default",{
		//��ȡͼƬ����ݣ�html5�����ļ�����˷�ͼƬ��ݣ����ͼƬ�ļ����׺��
		getData:function(fileDom){
			return [fileDom.value];
		},
		// @fileData �ļ�����ļ�����
		// @img ��ʾͼƬDOM
		show:function(fileData,onshow){
			
			var self = this;
	
			var img = new Image();
			img.src = fileData;
			
			//������ie6�ģ���ϰ�߷ֱ���
			if (document.all) {
				img.onreadystatechange = function () {
					if (img.readyState == "loaded" || img.readyState == 'complete') {
						onshow(img,self.type);
						img.onreadystatechange = null;
					}
				}
				img.onreadystatechange();
			}
			else {
				img.onload = function () {
					onshow(img,self.type);
					img.onload = null;
				}
			}		
		}
	});
	
	//html5
	Mod.add("html5",{
		getData:function(fileDom){
			var img = [];
				for(var i = 0; i<fileDom.files.length;i++){
					if(fileDom.files[i].type.indexOf('image') >= 0){
						img.push(fileDom.files[i]);
					}
				}
			return img;
		},
		// @fileData �ļ�����ļ�����
		// @img ��ʾͼƬDOM
		show:function(fileData,onshow){
			var img = new Image(); 
			if (window.URL && window.URL.createObjectURL) {
				//FF4+
				img.src = window.URL.createObjectURL(fileData);
			} else if (window.webkitURL&&window.webkitURL.createObjectURL) {
				//Chrome8+
				img.src = window.webkitURL.createObjectURL(fileData);
			} else {
				//ʵ��file reader����
				var reader = new FileReader();

				reader.onload = function(e) {
					img.src = e.target.result;
				}
				reader.readAsDataURL(fileData);
			}
			
			//û��ʹ��Ԥ�ء��߿?���С��������CSS
			onshow(img,this.type);
		}
	});
	
	//filter
	Mod.add("filter",{
		getData:function(fileDom){
			fileDom.select();
			try{
				return [document.selection.createRange().text];
			} finally { document.selection.empty(); }
			return [];
		},
		show:function(fileData,onshow){
			//TODO �Ȳ����� Сͼ��
			var TRANSPARENT = S.UA.ie==6 || S.UA.ie == 7 ? "http://img04.taobaocdn.com/tps/i4/T1Ao_pXfVpXXc6Yc2r-1-1.gif" : "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
	
			if ( !this._preload ) {
				var preload = this._preload = document.createElement("div");
				//���ز������˾�
				S.DOM.css(preload, {
					width: "1px", height: "1px",
					visibility: "hidden", position: "absolute", left: "-9999px", top: "-9999px",
					filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='image')"
				});
				//����body
				var body = document.body; body.insertBefore( preload, body.childNodes[0] );
			}
			
			var 
				img = new Image(),
				preload = this._preload,
				data = fileData.replace(/[)'"%]/g, function(s){ return escape(escape(s)); });
			try{
				preload.filters.item("DXImageTransform.Microsoft.AlphaImageLoader").src = data;
			}catch(e){ return; }
			//�����˾�����ʾ
			img.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale',src=\"" + data + "\")";
			
			img.style.width = preload.offsetWidth;
			img.style.height = preload.offsetHeight;
			
			img.src = TRANSPARENT;
			//������ʵ�߿�
			img.width = preload.offsetWidth;
			img.height = preload.offsetHeight;
			onshow(img,this.type,preload.offsetWidth,preload.offsetHeight);
		}
	});
	
	//filename 
	Mod.add("filename",{
		getData:function(fileDom){
			var filenames = [];
			if(fileDom.files){
				for(var i=0;i<fileDom.files.length;i++){
					filenames.push(fileDom.files[i].name);
				}
			} else {
				filenames.push(fileDom.value);
			}
			
			return filenames;
		},
		show:function(fileData,onshow){
			onshow(S.DOM.create(fileData),this.type);
		}
	});
	
	//·��
	function getMod(fileDom){
		var mod = "filename";
			
		if(window.URL&&window.URL.createObjectURL || window.webkitURL&&window.webkitURL.createObjectURL || window.FileReader) {
			mod = "html5";
		} else if(S.UA.ie === 7 || S.UA.ie === 8){
			mod = "filter";
		} else if(S.UA.ie === 6) {
			mod = "default";
		}
		
		return mod;
	}
	
	//���
	function ImagePreview(fileDom,onshow){

		var 
			mod = Mod.use(getMod(fileDom)),
			
			imgs = mod.getData(fileDom) , img;

		for(var i=0;i<imgs.length;i++){
			mod.show(imgs[i],onshow);
		}

	}
	
	return ImagePreview;
});/**
 * @fileoverview 本地图片预览组件
 * @author 紫英（橘子）<daxingplay@gmail.com>
 * @date 2012-01-10
 * @requires KISSY 1.2+
 */

KISSY.add('gallery/form/1.3/uploader/plugins/preview/preview', function(S, D, E){
	var doc = document, 
		LOG_PRE = '[Plugin: Preview] ',
		_mode = getPreviewMode(),
		_eventList = {
			check: 'check',
			success: 'success',
			showed: 'showed',
			error: 'error'
		},
		_transparentImg = S.UA.ie < 8 ? "http://a.tbcdn.cn/p/fp/2011a/assets/space.gif" : "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==";
	
	/**
	 * Private 检测当前浏览器适应于哪种预览方式
	 * @return {String} 检测出的预览方式
	 */
	function getPreviewMode(){
		var previewMode = '';
		// prefer to use html5 file api
		if(typeof window.FileReader === "undefined"){
			switch(S.UA.shell){
				case 'firefox':
					previewMode = 'domfile';
					break;
				case 'ie':
					switch(S.UA.ie){
						case 6:
							previewMode = 'simple';
							break;
						default:
							previewMode = 'filter';
							break;
					}
					break;
			}
		}else{
			previewMode = 'html5';
		}
		return previewMode;
	}
	
	/**
	 * Private 将图片的本地路径写入img元素，展现给用户
	 * @param {HTMLElement} imgElem img元素
	 * @param {String} data  图片的本地路径
	 * @param {Number} maxWidth 最大宽度
	 * @param {Number} maxHeight 最大高度
	 */
	function showPreviewImage(imgElem, data, width, height){
		if(!imgElem){
			return false;
		}
		if(_mode != 'filter'){
			imgElem.src = data || _transparentImg;
		}else{
			imgElem.src = _transparentImg;
			if(data){
				data = data.replace(/[)'"%]/g, function(s){
					return escape(escape(s));
				});
				imgElem.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(sizingMethod='scale',src='" + data + "')";
				imgElem.zoom = 1;
			}
		}
		return true;
	}
	
	/**
	 * Constructor
	 * @param {Object} config 配置
	 */
	function Preview(config){
		var self = this,
			_config = {
				maxWidth: 40,
				maxHeight: 40
			};
		
		self.config = S.mix(_config, config);
		// self.mode = getPreviewMode();
		
		S.log(LOG_PRE + 'Preview initialized. The preview mode is ' + _mode);
	}
	
	S.augment(Preview, S.EventTarget, {
        /**
         * 显示预览图片，不支持IE
         * @author 明河
         * @since 1.3
         */
        show:function(file,$img){
            if(_mode != 'html5' || !$img || !$img.length) return false;
            var self = this;
            var reader = new FileReader();
            reader.onload = function(e){
                var data = self.data = e.target.result;
                self.fire(_eventList.getData, {
                    data: data,
                    mode: _mode
                });
                $img.attr('src',data);
                self.fire(_eventList.showed, {
                    img: data
                });
            };
            reader.onerror = function(e){
                S.log(LOG_PRE + 'File Reader Error. Your browser may not fully support html5 file api', 'warning');
                self.fire(_eventList.error);
            };
                reader.readAsDataURL(file);
        },
		/**
		 * 预览函数
		 * @param {HTMLElement} fileInput 文件上传的input
		 * @param {HTMLElement} imgElem 需要显示预览图片的img元素，如果不设置的话，程序则不会执行显示操作，用户可以从该函数的返回值取得预览图片的地址自行写入
		 * @return {String} 取得的图片地址
		 */
		preview: function(fileInput, imgElem){

			fileInput = D.get(fileInput);
			imgElem = D.get(imgElem);
			var self = this,
				onsuccess = function(){
					self.fire(_eventList.getData, {
						data: self.data,
						mode: _mode
					});
					if(imgElem){
						showPreviewImage(imgElem, self.data);
						self.fire(_eventList.showed, {
							img: imgElem
						});
					}
				};
			
			self.data = undefined;
			
			if(fileInput){
				S.log(LOG_PRE + 'One file selected. Getting data...');
				// get Image location path or data uri
				switch(_mode){
					case 'domfile':
						self.data = fileInput.files[0].getAsDataURL();
						break;
					case 'filter':
						// fileInput.focus();
						fileInput.select();
						try{
							self.data = doc.selection.createRange().text;
						}catch(e){
							S.log(LOG_PRE + 'Get image data error, the error is: ');
							S.log(e, 'dir');
						}finally{
							doc.selection.empty();
						}
						if(!self.data){
							self.data = fileInput.value;
						}
						break;
					case 'html5':
						// TODO Mathon3
						var reader = new FileReader();
						reader.onload = function(e){
							self.data = e.target.result;
							onsuccess();
						};
						reader.onerror = function(e){
							S.log(LOG_PRE + 'File Reader Error. Your browser may not fully support html5 file api', 'warning');
							self.fire(_eventList.error);
						};
                        if(fileInput.files){
                            reader.readAsDataURL(fileInput.files[0]);
                        }
						// alert(reader.readAsDataURL);
						// S.log(reader, 'dir');
						break;
					case 'simple':
					default:
						self.data = fileInput.value;
						break;
				}
				
				if(self.data){
					onsuccess();
				}else if(_mode != 'html5'){
					S.log(LOG_PRE + 'Retrive Data error.');
					showPreviewImage(imgElem);
					self.fire(_eventList.error);
				}
			}else{
				S.log(LOG_PRE + 'File Input Element does not exists.');
			}
			
			return self.data;
		}
	});
	
	return Preview;
	
}, {
	requires: [
		'dom',
		'event'
	]
});/**
 * @fileoverview 进度条
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.3/uploader/plugins/progressBar/progressBar',function(S, Node, Base) {
    var EMPTY = '',$ = Node.all,
        PROGRESS_BAR = 'progressbar',ROLE = 'role',
        ARIA_VALUEMIN = 'aria-valuemin',ARIA_VALUEMAX = 'aria-valuemax',ARIA_VALUENOW = 'aria-valuenow',
        DATA_VALUE = 'data-value';
    /**
     * @name ProgressBar
     * @class 进度条
     * @constructor
     * @extends Base
     * @requires Node
     */
    function ProgressBar(wrapper, config) {
        var self = this;
        config = S.merge({wrapper:$(wrapper)}, config);
        //调用父类构造函数
        ProgressBar.superclass.constructor.call(self, config);
    }
    S.mix(ProgressBar, /** @lends ProgressBar.prototype*/{
        /**
         * 模板
         */
        tpl : {
            DEFAULT:'<div class="ks-progress-bar-value" data-value="{value}"></div>'
        },
        /**
         * 组件用到的样式
         */
        cls : {
            PROGRESS_BAR : 'ks-progress-bar',
            VALUE : 'ks-progress-bar-value'
        },
        /**
         * 组件支持的事件
         */
        event : {
            RENDER : 'render',
            CHANGE : 'change',
            SHOW : 'show',
            HIDE : 'hide'
        }
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(ProgressBar, Base, /** @lends ProgressBar.prototype*/{
        /**
         * 运行
         */
        render : function() {
            var self = this,$wrapper = self.get('wrapper'),
                width = self.get('width');
            if(!$wrapper.length) return false;
            //给容器添加ks-progress-bar样式名
            $wrapper.addClass(ProgressBar.cls.PROGRESS_BAR)
                    .width(width);
            self._addAttr();
            !self.get('visible') && self.hide();
            self.set('bar',self._create());
            self.fire(ProgressBar.event.RENDER);
        },
        /**
         * 显示进度条
         */
        show : function(){
            var self = this,$wrapper = self.get('wrapper');
            $wrapper.fadeIn(self.get('duration'),function(){
                self.set('visible',true);
                self.fire(ProgressBar.event.SHOW,{visible : true});
            });
        },
        /**
         * 隐藏进度条
         */
        hide : function(){
            var self = this,$wrapper = self.get('wrapper');
            $wrapper.fadeOut(self.get('duration'),function(){
                self.set('visible',false);
                self.fire(ProgressBar.event.HIDE,{visible : false});
            });
        },
        /**
         * 创建进度条
         * @return {NodeList}
         */
        _create : function(){
            var self = this,
                $wrapper = self.get('wrapper'),
                value = self.get('value'),tpl = self.get('tpl'),
                html = S.substitute(tpl, {value : value}) ;
            $wrapper.html('');
            return $(html).appendTo($wrapper);

        },
        /**
         * 给进度条容器添加一些属性
         * @return {Object} ProgressBar的实例
         */
        _addAttr : function() {
            var self = this,$wrapper = self.get('wrapper'),value = self.get('value');
            $wrapper.attr(ROLE, PROGRESS_BAR);
            $wrapper.attr(ARIA_VALUEMIN, 0);
            $wrapper.attr(ARIA_VALUEMAX, 100);
            $wrapper.attr(ARIA_VALUENOW, value);
            return self;
        }
    }, {ATTRS : /** @lends ProgressBar*/{
        /**
         * 容器
         */
        wrapper : {value : EMPTY},
        /**
         * 进度条元素
         */
        bar : {value : EMPTY},
        /**
         * 进度条宽度
         */
        width : { value:'auto' },
        /**
         * 当前进度
         */
        value : {
            value : 0,
            setter : function(v) {
                var self = this,$wrapper = self.get('wrapper'),$bar = self.get('bar'),
                    speed = self.get('speed'),
                    width;
                if (v > 100) v = 100;
                if (v < 0) v = 0;
                //将百分比宽度换算成像素值
                width = $wrapper.width() * (v / 100);
                $bar.animate({'width':width + 'px'},speed,'none',function(){
                    $wrapper.attr(ARIA_VALUENOW,v);
                    $bar.attr(DATA_VALUE,v);
                    self.fire(ProgressBar.event.CHANGE,{value : v,width : width});
                });
                return v;
            }
        },
        /**
         * 控制进度条的可见性
         */
        visible : { value:true },
        /**
         * 显隐动画的速度
         */
        duration : {
          value : 0.3
        },
        /**
         * 模板
         */
        tpl : {
            value : ProgressBar.tpl.DEFAULT
        },
        speed : {value : 0.2}
    }});
    return ProgressBar;
}, {requires : ['node','base']});/**
 * @fileoverview 文件上传队列列表显示和处理
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.3/uploader/queue', function (S, Node, Base) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploader-queue]:';

    /**
     * @name Queue
     * @class 文件上传队列，用于存储文件数据
     * @constructor
     * @extends Base
     * @param {Object} config Queue没有必写的配置
     * @param {Uploader} config.uploader Uploader的实例
     * @example
     * S.use('gallery/form/1.3/uploader/queue/base,gallery/form/1.3/uploader/themes/default/style.css', function (S, Queue) {
     *    var queue = new Queue();
     *    queue.render();
     * })
     */
    function Queue(config) {
        var self = this;
        //调用父类构造函数
        Queue.superclass.constructor.call(self, config);
    }

    S.mix(Queue, /**@lends Queue*/ {
        /**
         * 模板
         */
        tpl:{
            DEFAULT:'<li id="queue-file-{id}" class="clearfix" data-name="{name}">' +
                '<div class="f-l sprite file-icon"></div>' +
                '<div class="f-l">{name}</div>' +
                '<div class="f-l file-status J_FileStatus"></div>' +
                '</li>'
        },
        /**
         * 支持的事件
         */
        event:{
            //添加完文件后触发
            ADD:'add',
            //批量添加文件后触发
            ADD_FILES:'addFiles',
            //删除文件后触发
            REMOVE:'remove',
            //清理队列所有的文件后触发
            CLEAR:'clear',
            //当改变文件状态后触发
            FILE_STATUS : 'statusChange',
            //更新文件数据后触发
            UPDATE_FILE : 'updateFile',
            // 恢复文件后触发
            RESTORE: 'restore'
        },
        /**
         * 文件的状态
         */
        status:{
            WAITING : 'waiting',
            START : 'start',
            PROGRESS : 'progress',
            SUCCESS : 'success',
            CANCEL : 'cancel',
            ERROR : 'error',
            RESTORE: 'restore'
        },
        //样式
        cls:{
            QUEUE:'ks-uploader-queue'
        },
        hook:{
            //状态
            STATUS:'.J_FileStatus'
        },
        FILE_ID_PREFIX:'file-'
    });
    /**
     * @name Queue#add
     * @desc  添加完文件后触发
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */
    /**
     * @name Queue#addFiles
     * @desc  批量添加文件后触发
     * @event
     * @param {Array} ev.files 添加后的文件数据集合
     */
    /**
     * @name Queue#remove
     * @desc  删除文件后触发
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */
    /**
     * @name Queue#clear
     * @desc  清理队列所有的文件后触发
     * @event
     */
    /**
     * @name Queue#statusChange
     * @desc  当改变文件状态后触发
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {String} ev.status 文件状态
     */
    /**
     * @name Queue#updateFile
     * @desc  更新文件数据后触发
     * @event
     * @param {Number} ev.index 文件在队列中的索引值
     * @param {Object} ev.file 文件数据
     */
    /**
     * @name Queue#restore
     * @desc  恢复文件后触发
     * @event
     * @param {Array} ev.files 文件数据集合
     */
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(Queue, Base, /** @lends Queue.prototype*/{
        /**
         * 向上传队列添加文件
         * @param {Object | Array} files 文件数据，传递数组时为批量添加
         * @example
         * //测试文件数据
 var testFile = {'name':'test.jpg',
     'size':2000,
     'input':{},
     'file':{'name':'test.jpg', 'type':'image/jpeg', 'size':2000}
 };
 //向队列添加文件
 queue.add(testFile);
         */
        add:function (files, callback) {
            var self = this,fileData={};
            //如果存在多个文件，需要批量添加文件
            if (files.length > 0) {
                fileData=[];
                S.each(files,function(file){
                    fileData.push(self._addFile(file));
                });
            } else {
                fileData = self._addFile(files);
            }
            callback && callback.call(self);
            return fileData;
        },
        /**
         * 向队列添加单个文件
         * @param {Object} file 文件数据
         * @param {Function} callback 添加完成后执行的回调函数
         * @return {Object} 文件数据对象
         */
        _addFile:function (file,callback) {
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '_addFile()参数file不合法！');
                return false;
            }
            var self = this,
                //设置文件对象
                fileData = self._setAddFileData(file),
                //文件索引
                index = self.getFileIndex(fileData.id),
                fnAdd = self.get('fnAdd');
            //执行用户自定义的回调函数
            if(S.isFunction(fnAdd)){
                fileData = fnAdd(index,fileData);
            }
            self.fire(Queue.event.ADD, {index:index, file:fileData,uploader:self.get('uploader')});
            callback && callback.call(self, index, fileData);
            return fileData;
        },
        /**
         * 删除队列中指定id的文件
         * @param {Number} indexOrFileId 文件数组索引或文件id
         * @param {Function} callback 删除元素后执行的回调函数
         * @example
         * queue.remove(0);
         */
        remove:function (indexOrFileId, callback) {
            var self = this, files = self.get('files'), file;
            //参数是字符串，说明是文件id，先获取对应文件数组的索引
            if (S.isString(indexOrFileId)) {
                indexOrFileId = self.getFileIndex(indexOrFileId);
            }
            //文件数据对象
            file = files[indexOrFileId];
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + 'remove()不存在index为' + indexOrFileId + '的文件数据');
                return false;
            }
            //将该id的文件过滤掉
            files = S.filter(files, function (file, i) {
                return i !== indexOrFileId;
            });
            self.set('files', files);
            self.fire(Queue.event.REMOVE, {index:indexOrFileId, file:file});
            callback && callback.call(self,indexOrFileId, file);
            return file;
        },
        /**
         * 清理队列
         */
        clear:function () {
            var self = this, files;
            _remove();
            //移除元素
            function _remove() {
                files = self.get('files');
                if (!files.length) {
                    self.fire(Queue.event.CLEAR);
                    return false;
                }
                self.remove(0, function () {
                    _remove();
                });
            }
        },
        /**
         * 获取或设置文件状态，默认的主题共有以下文件状态：'waiting'、'start'、'progress'、'success'、'cancel'、'error' ,每种状态的dom情况都不同，刷新文件状态时候同时刷新状态容器类下的DOM节点内容。
         * @param {Number} index 文件数组的索引值
         * @param {String} status 文件状态
         * @return {Object}
         * @example
         * queue.fileStatus(0, 'success');
         */
        fileStatus:function (index, status, args) {
            if (!S.isNumber(index)) return false;
            var self = this, file = self.getFile(index),
                theme = self.get('theme'),
                curStatus,statusMethod;
            if (!file) return false;
            //状态
            curStatus = file['status'];
            if(!status){
                return curStatus;
            }
            //状态一直直接返回
            if(curStatus == status) return self;

            //更新状态
            self.updateFile(index,{status:status});

            statusMethod = '_'+status+'Handler';
            //如果主题存在对应的状态变更监听器，予以执行
            if(theme && S.isFunction(theme[statusMethod])){
                args = S.merge({uploader:self.get('uploader'),index:index,file:file,id:file.id},args);
                theme[statusMethod].call(theme,args);
            }
            self.fire(Queue.event.FILE_STATUS,{index : index,status : status,args:args,file:file});
            return  self;
        },
        /**
         * 获取指定索引值的队列中的文件
         * @param  {Number} index 文件在队列中的索引
         * @return {Object}
         */
        getFile:function (index) {
            if (!S.isNumber(index)) return false;
            var self = this, files = self.get('files'),
                file = files[index];
            if (!S.isPlainObject(file)){
                S.log('getFile():文件数据为空！');
                file = {};
            }
            return file;
        },
        /**
         * 根据文件id来查找文件在队列中的索引
         * @param {String} fileId 文件id
         * @return {Number} index
         */
        getFileIndex:function (fileId) {
            var self = this, files = self.get('files'), index = -1;
            S.each(files, function (file, i) {
                if (file.id == fileId) {
                    index = i;
                    return true;
                }
            });
            return index;
        },
        /**
         * 更新文件数据对象，你可以追加数据
         * @param {Number} index 文件数组内的索引值
         * @param {Object} data 数据
         * @return {Object}
         */
        updateFile:function (index, data) {
            if (!S.isNumber(index)) return false;
            if (!S.isObject(data)) {
                S.log(LOG_PREFIX + 'updateFile()的data参数有误！');
                return false;
            }
            var self = this, files = self.get('files'),
                file = self.getFile(index);
            if (!file) return false;
            S.mix(file, data);
            files[index] = file;
            self.set('files', files);
            self.fire(Queue.event.UPDATE_FILE,{index : index, file : file});
            return file;
        },
        /**
         * 获取等指定状态的文件对应的文件数组index的数组
         * @param {String} type 状态类型
         * @return {Array}
         * @example
         * //getFiles()和getFileIds()的作用是不同的，getFiles()类似过滤数组，获取的是指定状态的文件数据，而getFileIds()只是获取指定状态下的文件对应的在文件数组内的索引值。
         * var indexs = queue.getFileIds('waiting');
         */
        getIndexs:function (type) {
            var self = this, files = self.get('files'),
                status, indexs = [];
            if (!files.length) return indexs;
            S.each(files, function (file, index) {
                if (S.isObject(file)) {
                    status = file.status;
                    //文件状态
                    if (status == type) {
                        indexs.push(index);
                    }
                }
            });
            return indexs;
        },
        /**
         * 获取指定状态下的文件
         * @param {String} status 状态类型
         * @return {Array}
         * @example
         * //获取等待中的所有文件
         * var files = queue.getFiles('waiting');
         */
        getFiles:function (status) {
            var self = this, files = self.get('files'), statusFiles = [];
            if (!files.length) return [];
            S.each(files, function (file) {
                if (file && file.status == status) statusFiles.push(file);
            });
            return statusFiles;
        },
        /**
         * 添加文件时先向文件数据对象追加id、size等数据
         * @param {Object} file 文件数据对象
         * @return {Object} 新的文件数据对象
         */
        _setAddFileData:function (file) {
            var self = this,
                files = self.get('files');
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '_updateFileData()参数file不合法！');
                return false;
            }
            //设置文件唯一id
            if (!file.id) file.id = S.guid(Queue.FILE_ID_PREFIX);
            //转换文件大小单位为（kb和mb）
            if (file.size) file.textSize = S.convertByteSize(file.size);
            //状态
            file.status = EMPTY;
            files.push(file);
            return file;
        }
    }, {ATTRS:/** @lends Queue.prototype*/{
        /**
         * 添加完文件数据后执行的回调函数，会在add事件前触发
         * @type Function
         * @default  ''
         */
        fnAdd:{value:EMPTY},
        /**
         * 队列内所有文件数据集合
         * @type Array
         * @default []
         * @example
         * var ids = [],
         files = queue.get('files');
         S.each(files, function (file) {
         ids.push(file.id);
         });
         alert('所有文件id：' + ids);
         */
        files:{value:[]},
        /**
         * 该队列对应的Uploader实例
         * @type Uploader
         * @default ""
         */
        uploader:{value:EMPTY},
        /**
         * 主题实例
         * @type Theme
         * @default ""
         */
        theme:{value:EMPTY}
    }});

    return Queue;
}, {requires:['node', 'base']});
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
/**
 * @fileoverview ajax方案上传
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.3/uploader/type/ajax',function(S, Node, UploadType) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-AjaxType]:';

    /**
     * @name AjaxType
     * @class ajax方案上传
     * @constructor
     * @requires UploadType
     */
    function AjaxType(config) {
        var self = this;
        //调用父类构造函数
        AjaxType.superclass.constructor.call(self, config);
    }

    S.mix(AjaxType, /** @lends AjaxType.prototype*/{
        /**
         * 事件列表
         */
        event : S.merge(UploadType.event,{
            PROGRESS : 'progress'
        })
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(AjaxType, UploadType, /** @lends AjaxType.prototype*/{
        /**
         * 上传文件
         * @param {File} fileData 文件数据
         * @return {AjaxType}
         */
        upload : function(fileData) {
            //不存在文件信息集合直接退出
            if (!fileData) {
                S.log(LOG_PREFIX + 'upload()，fileData参数有误！');
                return false;
            }
            var self = this;
            self._setFormData();
            self._addFileData(fileData);
            self.send();
            return self;
        },
        /**
         * 停止上传
         * @return {AjaxType}
         */
        stop : function() {
            var self = this,xhr = self.get('xhr');
            if (!S.isObject(xhr)) {
                S.log(LOG_PREFIX + 'stop()，io值错误！');
                return false;
            }
            //中止ajax请求，会触发error事件
            xhr.abort();
            self.fire(AjaxType.event.STOP);
            return self;
        },
        /**
         * 发送ajax请求
         * @return {AjaxType}
         */
        send : function() {
            var self = this,
                //服务器端处理文件上传的路径
                action = self.get('action'),
                data = self.get('formData');
            var xhr = new XMLHttpRequest();
            //TODO:如果使用onProgress存在第二次上传不触发progress事件的问题
            xhr.upload.addEventListener('progress',function(ev){
                self.fire(AjaxType.event.PROGRESS, { 'loaded': ev.loaded, 'total': ev.total });
            });
            xhr.onload = function(ev){
                var result = self._processResponse(xhr.responseText);
                self.fire(AjaxType.event.SUCCESS, {result : result});
            };
            xhr.open("POST", action, true);
            data.append("type", "ajax");
            xhr.send(data);
            // 重置FormData
            self._setFormData();
            self.set('xhr',xhr);
            return self;
        },
        /**
         * 设置FormData数据
         */
        _setFormData:function(){
            var self = this;
            try{
            	self.set('formData', new FormData());
                self._processData();
            }catch(e){
            	S.log(LOG_PREFIX + 'something error when reset FormData.');
            	S.log(e, 'dir');
           }
        },
        /**
         * 处理传递给服务器端的参数
         */
        _processData : function() {
            var self = this,data = self.get('data'),
                formData = self.get('formData');
            //将参数添加到FormData的实例内
            S.each(data, function(val, key) {
                formData.append(key, val);
            });
            self.set('formData', formData);
        },
        /**
         * 将文件信息添加到FormData内
         * @param {Object} file 文件信息
         */
        _addFileData : function(file) {
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '_addFileData()，file参数有误！');
                return false;
            }
            var self = this,
                formData = self.get('formData'),
                fileDataName = self.get('fileDataName');
            formData.append(fileDataName, file);
            self.set('formData', formData);
        }
    }, {ATTRS : /** @lends AjaxType*/{
        /**
         * 表单数据对象
         */
        formData : {value : EMPTY},
        /**
         * ajax配置
         */
        ajaxConfig : {value : {
            type : 'post',
            processData : false,
            cache : false,
            dataType : 'json',
            contentType: false
        }
        },
        xhr : {value : EMPTY},
        fileDataName : {value : EMPTY},
        form : {value : {}},
        fileInput : {value : EMPTY}
    }
    });
    return AjaxType;
}, {requires:['node','./base']});/**
 * @fileoverview 上传方式类的基类
 * @author: 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.3/uploader/type/base',function(S, Node, Base) {
    var EMPTY = '',$ = Node.all;

    /**
     * @name UploadType
     * @class 上传方式类的基类，定义通用的事件和方法，一般不直接监听此类的事件
     * @constructor
     * @extends Base
     * @param {Object} config 组件配置（下面的参数为配置项，配置会写入属性，详细的配置说明请看属性部分）
     * @param {String} config.action *，服务器端路径
     * @param {Object} config.data 传送给服务器端的参数集合（会被转成hidden元素post到服务器端）
     *
     */
    function UploadType(config) {
        var self = this;
        //调用父类构造函数
        UploadType.superclass.constructor.call(self, config);
    }

    S.mix(UploadType, /** @lends UploadType*/{
        /**
         * 事件列表
         */
        event : {
            //开始上传后触发
            START : 'start',
            //停止上传后触发
            STOP : 'stop',
            //成功请求
            SUCCESS : 'success',
            //上传失败后触发
            ERROR : 'error'
        }
    });

    /**
     * @name UploadType#start
     * @desc  开始上传后触发
     * @event
     */
    /**
     * @name UploadType#stop
     * @desc  停止上传后触发
     * @event
     */
    /**
     * @name UploadType#success
     * @desc  上传成功后触发
     * @event
     */
    /**
     * @name UploadType#error
     * @desc  上传失败后触发
     * @event
     */
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(UploadType, Base, /** @lends UploadType.prototype*/{
        /**
         * 上传文件
         */
        upload : function() {

        },
        /** 
         * 停止上传
         */
        stop : function(){
            
        },
        /**
         * 处理服务器端返回的结果集
         * @private
         */
        _processResponse:function(responseText){
            var self = this;
            var filter = self.get('filter');
            var result = {};
            if(filter != EMPTY) responseText = filter.call(self,responseText);
            //格式化成json数据
            if(S.isString(responseText)){
                try{
                    result = S.JSON.parse(responseText);
                    result = self._fromUnicode(result);
                }catch(e){
                    var msg = responseText + '，返回结果集responseText格式不合法！';
                    S.log(msg);
                    self.fire('error',{status:-1, result:{msg:msg}});
                }
            }else if(S.isObject(responseText)){
                result = self._fromUnicode(responseText);
            }
            S.log('服务器端输出：' + S.JSON.stringify(result));
            return result;
        },
        /**
         * 将unicode的中文转换成正常显示的文字，（为了修复flash的中文乱码问题）
         * @private
         */
        _fromUnicode:function(data){
            if(!S.isObject(data)) return data;
            _each(data);
            function _each(data){
                S.each(data,function(v,k){
                    if(S.isObject(data[k])){
                        _each(data[k]);
                    }else{
                        data[k] = S.isString(v) && S.fromUnicode(v) || v;
                    }
                });
            }
            return data;
        }

    }, {ATTRS : /** @lends UploadType.prototype*/{
        /**
         * 服务器端路径
         * @type String
         * @default ""
         */
        action : {value : EMPTY},
        /**
         * 传送给服务器端的参数集合（会被转成hidden元素post到服务器端）
         * @type Object
         * @default {}
         */
        data : {value : {}},
        /**
         * 服务器端返回的数据的过滤器
         * @type Function
         * @default ''
         */
        filter:{
            value:EMPTY
        }
    }});

    return UploadType;
}, {requires:['node','base']});/**
 * @fileoverview flash上传方案，基于龙藏写的ajbridge内的uploader
 * @author 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.3/uploader/type/flash', function (S, Node, UploadType, swfUploader) {
    var EMPTY = '', LOG_PREFIX = '[uploader-FlashType]:';
    if(S.FlashType) return S.FlashType;
    /**
     * @name FlashType
     * @class flash上传方案，基于龙藏写的ajbridge内的uploader
     * @constructor
     * @extends UploadType
     * @requires Node
     */
    function FlashType(config) {
        var self = this;
        //调用父类构造函数
        FlashType.superclass.constructor.call(self, config);
        self.isHasCrossdomain();
        self._init();
    }

    S.mix(FlashType, /** @lends FlashType.prototype*/{
        /**
         * 事件列表
         */
        event:S.merge(UploadType.event, {
            //swf文件已经准备就绪
            SWF_READY: 'swfReady',
            //正在上传
            PROGRESS:'progress'
        })
    });

    S.extend(FlashType, UploadType, /** @lends FlashType.prototype*/{
        /**
         * 初始化
         */
        _init:function () {
            var self = this, swfUploader = self.get('swfUploader');
            if(!swfUploader){
                S.log(LOG_PREFIX + 'swfUploader对象为空！');
                return false;
            }
            //SWF 内容准备就绪
            swfUploader.on('contentReady', function(ev){
                self.fire(FlashType.event.SWF_READY);
            }, self);
            //监听开始上传事件
            swfUploader.on('uploadStart', self._uploadStartHandler, self);
            //监听文件正在上传事件
            swfUploader.on('uploadProgress', self._uploadProgressHandler, self);
            //监听文件上传完成事件
            swfUploader.on('uploadCompleteData',self._uploadCompleteDataHandler,self);
            //监听文件失败事件
            swfUploader.on('uploadError',self._uploadErrorHandler,self);
        },
        /**
         * 上传文件
         * @param {String} id 文件id
         * @return {FlashType}
         */
        upload:function (id) {
            var self = this, swfUploader = self.get('swfUploader'),
                action = self.get('action'), method = 'POST',
                data = self.get('data'),
                name = self.get('fileDataName');
            if(!name) name = 'Filedata';
            self.set('uploadingId',id);
            S.mix(data,{"type":"flash"});
            swfUploader.upload(id, action, method, data,name);
            return self;
        },
        /**
         * 停止上传文件
         * @return {FlashType}
         */
        stop:function () {
            var self = this, swfUploader = self.get('swfUploader'),
                uploadingId = self.get('uploadingId');
            if(uploadingId != EMPTY){
                swfUploader.cancel(uploadingId);
                self.fire(FlashType.event.STOP, {id : uploadingId});
            }
            return self;
        },
        /**
         * 开始上传事件监听器
         * @param {Object} ev ev.file：文件数据
         */
        _uploadStartHandler : function(ev){
            var self = this;
            self.fire(FlashType.event.START, {'file' : ev.file });
        },
        /**
         * 上传中事件监听器
         * @param {Object} ev
         */
        _uploadProgressHandler:function (ev) {
            var self = this;
            S.mix(ev, {
                //已经读取的文件字节数
                loaded:ev.bytesLoaded,
                //文件总共字节数
                total : ev.bytesTotal
            });
            S.log(LOG_PREFIX + '已经上传字节数为：' + ev.bytesLoaded);
            self.fire(FlashType.event.PROGRESS, { 'loaded':ev.loaded, 'total':ev.total });
        },
        /**
         * 上传完成后事件监听器
         * @param {Object} ev
         */
        _uploadCompleteDataHandler : function(ev){
            var self = this;
            var result = self._processResponse(ev.data);
            self.set('uploadingId',EMPTY);
            self.fire(FlashType.event.SUCCESS, {result : result});
        },
        /**
         *文件上传失败后事件监听器
         */
        _uploadErrorHandler : function(ev){
            var self = this;
            self.set('uploadingId',EMPTY);
            self.fire(FlashType.event.ERROR, {msg : ev.msg});
        },
        /**
         * 应用是否有flash跨域策略文件
         */
        isHasCrossdomain:function(){
            var domain = location.hostname;
             S.io({
                 url:'http://' + domain + '/crossdomain.xml',
                 dataType:"xml",
                 error:function(){
                     S.log('缺少crossdomain.xml文件或该文件不合法！');
                 }
             })
        }
    }, {ATTRS:/** @lends FlashType*/{
        /**
         * 服务器端路径，留意flash必须是绝对路径
         */
        action:{
            value:EMPTY,
            getter:function(v){
                var reg = /^http/;
                //不是绝对路径拼接成绝对路径
                if(!reg.test(v)){
                     var href = location.href,uris = href.split('/'),newUris;
                    newUris  = S.filter(uris,function(item,i){
                        return i < uris.length - 1;
                    });
                    v = newUris.join('/') + '/' + v;
                }
                return v;
            }
        },
        /**
         * ajbridge的uploader组件的实例，必须参数
         */
        swfUploader:{value:EMPTY},
        /**
         * 正在上传的文件id
         */
        uploadingId : {value : EMPTY}
    }});
    //TODO:之所以污染KISSY，是因为ImageUploader和Uploader同时引用时存在bug
    S.FlashType = FlashType;
    return FlashType;
}, {requires:['node', './base']});/**
 * @fileoverview iframe方案上传
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.3/uploader/type/iframe',function(S, Node, UploadType) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-iframeType]:',ID_PREFIX = 'ks-uploader-iframe-';

    /**
     * @name IframeType
     * @class iframe方案上传，全浏览器支持
     * @constructor
     * @extends UploadType
     * @param {Object} config 组件配置（下面的参数为配置项，配置会写入属性，详细的配置说明请看属性部分）
     *
     */
    function IframeType(config) {
        var self = this;
        //调用父类构造函数
        IframeType.superclass.constructor.call(self, config);
    }

    S.mix(IframeType, /**@lends IframeType*/ {
        /**
         * 会用到的html模板
         */
        tpl : {
            IFRAME : '<iframe src="javascript:false;" name="{id}" id="{id}" border="no" width="1" height="1" style="display: none;" />',
            FORM : '<form method="post" enctype="multipart/form-data" action="{action}" target="{target}" style="visibility: hidden;">{hiddenInputs}</form>',
            HIDDEN_INPUT : '<input type="hidden" name="{name}" value="{value}" />'
        },
        /**
         * 事件列表
         */
        event : S.mix(UploadType.event,{
            //创建iframe和form后触发
            CREATE : 'create',
            //删除form后触发
            REMOVE : 'remove'
        })
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(IframeType, UploadType, /** @lends IframeType.prototype*/{
        /**
         * 上传文件
         * @param {HTMLElement} fileInput 文件input
         */
        upload : function(fileInput) {
            var self = this,$input = $(fileInput),form;
            if (!$input.length) return false;
            self.fire(IframeType.event.START, {input : $input});
            self.set('fileInput', $input);
            //创建iframe和form
            self._create();
            form = self.get('form');
            if(!form){
                S.log(LOG_PREFIX + 'form节点不存在！');
                return false;
            }
            //提交表单到iframe内
            form.getDOMNode().submit();
        },
        /**
         * 停止上传
         * @return {IframeType}
         */
        stop : function() {
            var self = this,iframe = self.get('iframe');
            iframe.attr('src', 'javascript:"<html></html>";');
            self._remove();
            self.fire(IframeType.event.STOP);
            self.fire(IframeType.event.ERROR, {status : 'abort',msg : '上传失败，原因：abort'});
            return self;
        },
        /**
         * 将参数数据转换成hidden元素
         * @param {Object} data 对象数据
         * @return {String} hiddenInputHtml hidden元素html片段
         */
        dataToHidden : function(data) {
            if (!S.isObject(data) || S.isEmptyObject(data)) return '';
            var self = this,hiddenInputHtml = EMPTY,
                //hidden元素模板
                tpl = self.get('tpl'),hiddenTpl = tpl.HIDDEN_INPUT;
            if (!S.isString(hiddenTpl)) return '';
            for (var k in data) {
                hiddenInputHtml += S.substitute(hiddenTpl, {'name' : k,'value' : data[k]});
            }
            return hiddenInputHtml;
        },
        /**
         * 创建一个空的iframe，用于文件上传表单提交后返回服务器端数据
         * @return {NodeList}
         */
        _createIframe : function() {
            var self = this,
                //iframe的id
                id = ID_PREFIX + S.guid(),
                //iframe模板
                tpl = self.get('tpl'),iframeTpl = tpl.IFRAME,
                existIframe = self.get('iframe'),
                iframe,$iframe;
            //先判断是否已经存在iframe，存在直接返回iframe
            if (!S.isEmptyObject(existIframe)) return existIframe;
            if (!S.isString(iframeTpl)) {
                S.log(LOG_PREFIX + 'iframe的模板不合法！');
                return false;
            }
            if (!S.isString(id)) {
                S.log(LOG_PREFIX + 'id必须存在且为字符串类型！');
                return false;
            }
            //创建处理上传的iframe
            iframe = S.substitute(tpl.IFRAME, { 'id' : id });
            $iframe = $(iframe);
            //监听iframe的load事件
            $iframe.on('load', self._iframeLoadHandler, self);
            $('body').append($iframe);
            self.set('id',id);
            self.set('iframe', $iframe);
            return $iframe;
        },
        /**
         * iframe加载完成后触发（文件上传结束后）
         */
        _iframeLoadHandler : function(ev) {
            var self = this,iframe = ev.target,
                errorEvent = IframeType.event.ERROR,
                doc = iframe.contentDocument || window.frames[iframe.id].document,
                result;
            if (!doc || !doc.body) {
                self.fire(errorEvent, {msg : '服务器端返回数据有问题！'});
                return false;
            }
            var response = doc.body.innerHTML;
            result = self._processResponse(response);
            self.fire(IframeType.event.SUCCESS, {result : result});
            self._remove();
        },
        /**
         * 创建文件上传表单
         * @return {NodeList}
         */
        _createForm : function() {
            var self = this,
                //iframe的id
                id = self.get('id'),
                //form模板
                tpl = self.get('tpl'),formTpl = tpl.FORM,
                //想要传送给服务器端的数据
                data = self.get('data'),
                //服务器端处理文件上传的路径
                action = self.get('action'),
                fileInput = self.get('fileInput'),
                hiddens,$form,form;
            if (!S.isString(formTpl)) {
                S.log(LOG_PREFIX + 'form模板不合法！');
                return false;
            }
            if (!S.isString(action)) {
                S.log(LOG_PREFIX + 'action参数不合法！');
                return false;
            }
            hiddens = self.dataToHidden(data);
           hiddens += self.dataToHidden({"type":"iframe"});
            form = S.substitute(formTpl, {'action' : action,'target' : id,'hiddenInputs' : hiddens});
            //克隆文件域，并添加到form中
            $form = $(form).append(fileInput);
            $('body').append($form);
            self.set('form', $form);
            return $form;
        },
        /**
         * 创建iframe和form
         */
        _create : function() {
            var self = this,
                iframe = self._createIframe(),
                form = self._createForm();
            self.fire(IframeType.event.CREATE, {iframe : iframe,form : form});
        },
        /**
         * 移除表单
         */
        _remove : function() {
            var self = this,form = self.get('form');
            if(!form){
                S.log(LOG_PREFIX + 'form节点不存在！');
                return false;
            }
            //移除表单
            form.remove();
            //重置form属性
            self.reset('form');
            self.fire(IframeType.event.REMOVE, {form : form});
        }
    }, {ATTRS : /** @lends IframeType.prototype*/{
        /**
         * iframe方案会用到的html模板，一般不需要修改
         * @type {}
         * @default
         * {
         IFRAME : '<iframe src="javascript:false;" name="{id}" id="{id}" border="no" width="1" height="1" style="display: none;" />',
         FORM : '<form method="post" enctype="multipart/form-data" action="{action}" target="{target}">{hiddenInputs}</form>',
         HIDDEN_INPUT : '<input type="hidden" name="{name}" value="{value}" />'
         }
         */
        tpl : {value : IframeType.tpl},
        /**
         * 只读，创建的iframeid,id为组件自动创建
         * @type String
         * @default  'ks-uploader-iframe-' +随机id
         */
        id : {value : ID_PREFIX + S.guid()},
        /**
         * iframe
         */
        iframe : {value : {}},
        form : {value : {}},
        fileInput : {value : EMPTY}
    }});

    return IframeType;
}, {requires:['node','./base']});/**
 * @fileoverview 存储文件路径信息的隐藏域
 * @author: 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.3/uploader/urlsInput',function(S, Node, Base) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[uploader-urlsInput]:';
    /**
     * @name UrlsInput
     * @class 存储文件路径信息的隐藏域
     * @constructor
     * @extends Base
     * @param {String} wrapper 容器钩子
     * @param {Object} config 组件配置（下面的参数为配置项，配置会写入属性，详细的配置说明请看属性部分）
     * @param {String} config.name *，隐藏域名称，当此name的隐藏域不存在时组件会创建一个
     * @param {String} config.split  多个路径间的分隔符
     * @param {String} config.tpl   隐藏域模板
     *
     */
    function UrlsInput(wrapper, config) {
        var self = this;
        //调用父类构造函数
        UrlsInput.superclass.constructor.call(self, config);
        self.set('wrapper', $(wrapper));
    }

    S.mix(UrlsInput, /**@lends UrlsInput*/ {
        /**
         * 隐藏域模板， '<input type="hidden" id="{name}" name="{name}" value="{value}" />'
         *
         */
        TPL : '<input type="hidden" id="{name}" name="{name}" value="{value}" />'
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(UrlsInput, Base, /** @lends UrlsInput.prototype*/{
        /**
         * 运行组件，实例化类后必须调用render()才真正运行组件逻辑
         * @return {UrlsInput}
         */
        render : function() {
            var self = this,$wrapper = self.get('wrapper'),
                name = self.get('name'),
                elInput = document.getElementsByName(name)[0];
            if (!S.isObject($wrapper)) {
                S.log(LOG_PREFIX + 'container参数不合法！');
                return false;
            }
            //如果已经存在隐藏域，那么不自动创建
            if(elInput){
            	S.log(LOG_PREFIX + 'urls input found');
                self.set('input',$(elInput));
            }else{
                self._create();
            }
            return self;
        },
        /**
         * 向路径隐藏域添加路径
         * @param {String} url 路径
         * @return {UrlsInput}
         */
        add : function(url){
            if(!S.isString(url)){
                S.log(LOG_PREFIX + 'add()的url参数不合法！');
                return false;
            }
            var self = this,urls = self.get('urls'),
                //判断路径是否已经存在
                isExist = self.isExist(url);
            //TODO:第一个路径会出现为空的情况，日后完善
            if(urls[0] == EMPTY) urls = [];
            if(isExist){
                S.log(LOG_PREFIX + 'add()，文件路径已经存在！');
                return self;
            }
            urls.push(url);
            self.set('urls',urls);
            self._val();
            return self;
        },
        /**
         * 删除隐藏域内的指定路径
         * @param {String} url 路径
         * @return {Array} urls 删除后的路径
         */
        remove : function(url){
            if(!url) return false;
            var self = this,urls = self.get('urls'),
                isExist = self.isExist(url) ,
                reg = new RegExp(url);
            if(!isExist){
                S.log(LOG_PREFIX + 'remove()，不存在该文件路径！');
                return false;
            }
            urls = S.filter(urls,function(sUrl){
                return !reg.test(sUrl);
            });
            self.set('urls',urls);
            self._val();
            return urls;
        },
        /**
         * 解析当前input的值，取得文件路径
         * @return {Array}
         */
        parse: function(){
        	var self = this,
        		input = self.get('input');
    		if(input){
    			var urls = $(input).val(),
    				split = self.get('split'),
    				files;
    			files = urls.split(split);
                self.set('urls',files);
    			return files;
    		}else{
    			S.log(LOG_PREFIX + 'cannot find urls input.');
    			return [];
    		}
        },
        /**
         * 设置隐藏域的值
         * @return {String} 
         */
        _val : function(){
            var self = this,urls = self.get('urls'),
                $input = self.get('input'),
                //多个路径间的分隔符
                split = self.get('split'),
                sUrl = urls.join(split);
            $input.val(sUrl);
            return sUrl;
        },
        /**
         * 是否已经存在指定路径
         * @param {String} url 路径
         * @return {Boolean}
         */
        isExist : function(url){
            var self = this,b = false,urls = self.get('urls'),
                reg = new RegExp(url);
            if(!urls.length) return false;
            S.each(urls,function(val){
                if(reg.test(val)){
                    return b = true;
                }
            });
            return b;
        },
        /**
         * 创建隐藏域
         */
        _create : function() {
            var self = this,
            	container = self.get('wrapper'),
                tpl = self.get('tpl'),
                name = self.get('name'), 
                urls = self.get('urls'),
                input;
            if(!container || container.length <= 0){
            	S.log(LOG_PREFIX + 'UrlsInput container not specified!', 'warn');
            	return false;
            }
            if (!S.isString(tpl) || !S.isString('name')){
                S.log(LOG_PREFIX + '_create()，tpl和name属性不合法！');
                return false;
            }
            input = $(S.substitute(tpl, {name : name,value : urls}));
            container.append(input);
            self.set('input', input);
            S.log(LOG_PREFIX + 'input created.');
            return input;
        }

    }, {ATTRS : /** @lends UrlsInput.prototype*/{
        /**
         * 隐藏域名称
         * @type String
         * @default ""
         */
        name : {value : EMPTY},
        /**
         * 文件路径
         * @type Array
         * @default []
         */
        urls : { value : [] },
        /**
         * input模板
         * @type String
         * @default  '<input type="hidden" id="{name}" name="{name}" value="{value}" />'
         */
        tpl : {value : UrlsInput.TPL},
        /**
         * 多个路径间的分隔符
         * @type String
         * @default ","
         */
        split : {value : ',',
            setter : function(v){
                var self = this;
                self._val();
                return v;
            }
        },
        /**
         * 文件路径隐藏input
         * @type KISSY.Node
         * @default ""
         */
        input : {value : EMPTY},
        /**
         * 隐藏域容器
         *@type KISSY.Node
         * @default ""
         */
        wrapper : {value : EMPTY}
    }});

    return UrlsInput;
}, {requires:['node','base']});
