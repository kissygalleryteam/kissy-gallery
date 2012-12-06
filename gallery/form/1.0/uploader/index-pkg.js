/**
 * @fileoverview 文件上传验证
 * @author: 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.0/uploader/auth/base', function (S, Node,Base) {
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
            queue.on('add',function(ev){
                var file = ev.file;
                self.testAllowExt(file);
                self.testMaxSize(file);
                self.testRepeat(file);
            });
            queue.on('remove',function(ev){
                var file = ev.file,status = file.status,statusType = status.get('curType');
                //删除的是已经成功上传的文件，需要重新检验最大允许上传数
                if(statusType == 'success'){
                    self.testMax();
                }
            });
            uploader.on('success', function (ev) {
                self.testMax();
            });
            uploader.on('error', function (ev) {
                //允许继续上传文件
                uploader.set('isAllowUpload', true);
            });
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
                rule = self.getRule('require'),
                isRequire = rule ? rule[0] : false,
                isHasUrls = urls.length > 0;
            if(!isRequire) return true;
            if(!isHasUrls){
                S.log(LOG_PREFIX + rule[1]);
                self.fire(Auth.event.ERROR,{rule:'require',msg : rule[1],value : isRequire});
            }
            return isHasUrls;
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
                self._stopUpload(file,msg);
                self.fire(Auth.event.ERROR,{rule:'allowExts',msg : msg,value : allowExts[0]});
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
                rule = self.getRule('max');
            if(rule){
            	var button = uploader.get('button'),
	                isPass = len < rule[0];
	            //达到最大允许上传数
	            if(!isPass){
	                //禁用按钮
	                button.set('disabled',true);
	                uploader.set('isAllowUpload', false);
	                self.fire(Auth.event.ERROR,{rule:'max',msg : rule[1],value : rule[0]});
	            }else{
	                button.set('disabled',false);
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
            	var maxSize = Number(rule[0]) * 1000,
	                isAllow = size <= maxSize,
	                msg;
	            if(!isAllow){
	                msg = S.substitute(rule[1],{maxSize:S.convertByteSize(maxSize),size : file.textSize});
	                self._stopUpload(file,msg);
	                self.fire(Auth.event.ERROR,{rule:'maxSize',msg : msg,value : rule[0]});
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
	                msg = rule[1],
	                uploader = self.get('uploader'),
	                queue = uploader.get('queue'),
	                //上传成功的文件
	                files = queue.getFiles('success'),
	                isRepeat = false ;
	            //允许重复文件名，直接返回false
	            if(isAllowRepeat) return false;
	            S.each(files,function(f){
	                if(f.name == fileName){
	                    self._stopUpload(file,msg);
	                    self.fire(Auth.event.ERROR,{rule:'allowRepeat',msg : msg,value : rule[0]});
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
            button.set('fileFilters', allowExts[0]);
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
         * 阻止文件上传，并改变文件状态为error
         * @param {Object} file 文件对象
         * @param {String} msg 错误消息
         */
        _stopUpload:function (file,msg) {
            if(!S.isString(msg)) msg = EMPTY;
            var self = this, uploader = self.get('uploader'),
                queue = uploader.get('queue'),
                index = queue.getFileIndex(file.id);
            //改变文件状态为error
            queue.fileStatus(index, queue.constructor.status.ERROR, {msg:msg});
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
                require:[false, '必须至少上传一个文件！'],
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
KISSY.add('gallery/form/1.0/uploader/base', function (S, Base, Node, UrlsInput, IframeType, AjaxType, FlashType) {
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
            PROGRESS : 'progress',
            //上传完成（在上传成功或上传失败后都会触发）
            COMPLETE:'complete',
            //上传成功后触发
            SUCCESS:'success',
            //批量上传结束后触发
            UPLOAD_FILES:'uploadFiles',
            //取消上传后触发
            CANCEL:'cancel',
            //上传失败后触发
            ERROR:'error'
        },
        /**
         * 文件上传所有的状态，{ WAITING : 'waiting', START : 'start', PROGRESS : 'progress', SUCCESS : 'success', CANCEL : 'cancel', ERROR : 'error', RESTORE: 'restore' }
         */
        status:{
            WAITING : 'waiting',
            START : 'start',
            PROGRESS : 'progress',
            SUCCESS : 'success',
            CANCEL : 'cancel',
            ERROR : 'error',
            RESTORE: 'restore'
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
            //路径input实例
            self.set('urlsInput', self._renderUrlsInput());
            self._renderQueue();
            button = self._renderButton();
            // 看看是不是urlsinput里面已经有值了，如果有，恢复到队列中，适用于编辑页面。
            // self._restore();
            //如果是flash异步上传方案，增加swfUploader的实例作为参数
            if (self.get('type') == Uploader.type.FLASH) {
                S.mix(serverConfig, {swfUploader:button.get('swfUploader')});
            }
            //实例化上传方式类
            uploadType = new UploadType(serverConfig);
            //监听上传器上传完成事件
            uploadType.on(uploaderTypeEvent.SUCCESS, self._uploadCompleteHanlder, self);
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
            var status = queue.fileStatus(index).get('curType');
            if(status === 'error'){
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
            if(S.isNumber(index) && status != statuses.SUCCESS){
                queue.fileStatus(index,statuses.CANCEL);
            }else{
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
        stop : function(){
            var self = this;
            self.set('uploadFilesStatus',EMPTY);
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
            try{
                if(FormData) isSupport = true;
            }catch(e){
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
            if (type == types.AUTO) type = [types.AJAX, types.IFRAME];
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
            if(UploadType) S.log(LOG_PREFIX + '使用' + type+'上传方式');
            self.set('type', type);
            return UploadType;
        },
        /**
         * 运行Button上传按钮组件
         * @return {Button}
         */
        _renderButton:function () {
            var self = this, button = self.get('button');
            if (!S.isObject(button)) {
                S.log(LOG_PREFIX + 'button参数不合法！');
                return false;
            }
            //监听按钮改变事件
            button.on('change', self._select, self);
            //运行按钮实例
            button.render();
            return button;
        },
        /**
         * 运行Queue队列组件
         * @return {Queue} 队列实例
         */
        _renderQueue:function () {
            var self = this, queue = self.get('queue'),
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
                urlsInput.remove(ev.file.sUrl);
            });
            queue.render();
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
            self.fire(Uploader.event.SELECT, {files : files});
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
            queue.updateFile(index,{result:result});
            //文件上传状态
            status = Number(result.status);
            // 只有上传状态为1时才是成功的
            if (status === 1) {
                //修改队列中文件的状态为success（上传完成）
                queue.fileStatus(index, Uploader.status.SUCCESS);
                self._success(result.data);
                self.fire(event.SUCCESS,{index : index,file : queue.getFile(index),result:result});
            } else {
                var msg = result.msg || result.message  || EMPTY;
                //修改队列中文件的状态为error（上传失败）
                queue.fileStatus(index, Uploader.status.ERROR, {msg:msg,result:result});
                self.fire(event.ERROR, {status:status,result:result});
            }
            //置空当前上传的文件在队列中的索引值
            self.set('curUploadIndex', EMPTY);
            self.fire(event.COMPLETE,{index : index,file : queue.getFile(index),result:result});
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
            self.fire(Uploader.event.CANCEL,{index : index});
        },
        /**
         * 如果存在批量上传，则继续上传
         */
        _continueUpload : function(){
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
            S.mix(ev,{file : file});
            queue.fileStatus(index, Uploader.status.PROGRESS, ev);
            self.fire(Uploader.event.PROGRESS,ev);
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
         * 检查是否有已经存在的图片恢复到队列中
         */
        restore: function(){
        	var self = this,
        		urlsInput = self.get('urlsInput'),
        		filesExists = urlsInput.parse();
            if(filesExists && filesExists.length > 0){
            	var queue = self.get('queue');
            	queue.restore(filesExists);
            }
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
         * 采用的上传方案，当值是数组时，比如“type” : ["flash","ajax","iframe"]，按顺序获取浏览器支持的方式，该配置会优先使用flash上传方式，如果浏览器不支持flash，会降级为ajax，如果还不支持ajax，会降级为iframe；当值是字符串时，比如“type” : “ajax”，表示只使用ajax上传方式。这种方式比较极端，在不支持ajax上传方式的浏览器会不可用；当“type” : “auto”，auto是一种特例，等价于["ajax","iframe"]。
         * @type String|Array
         * @default "auto"
         */
        type:{value:Uploader.type.AUTO},
        /**
         * 服务器端配置。action：服务器处理上传的路径；data： post给服务器的参数，通常需要传递用户名、token等信息
         * @type Object
         * @default  {action:EMPTY, data:{}, dataType:'json'}
         */
        serverConfig:{value:{action:EMPTY, data:{}, dataType:'json'}},
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
        uploadFilesStatus:{value:EMPTY}
    }});

    /**
     * 转换文件大小字节数
     * @param {Number} bytes 文件大小字节数
     * @return {String} 文件大小
     */
    S.convertByteSize = function(bytes){
        var i = -1;
        do {
            bytes = bytes / 1024;
            i++;
        } while (bytes > 99);
        return Math.max(bytes, 0.1).toFixed(1) + ['kB', 'MB', 'GB', 'TB', 'PB', 'EB'][i];
    };
    return Uploader;
}, {requires:['base', 'node', './urlsInput', './type/iframe', './type/ajax', './type/flash', 'flash']});
/**
 * @fileoverview 文件上传按钮base
 * @author: 紫英(橘子)<daxingplay@gmail.com>, 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.0/uploader/button/base',function(S, Node, Base) {
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
                self._setDisabled(self.get('disabled'));
                self._setMultiple(self.get('multiple'));
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
            //上传框的值改变后触发
            $(fileInput).on('change', self._changeHandler, self);
            //DOM.hide(fileInput);
            self.set('fileInput', fileInput);
            self.set('inputContainer', inputContainer);
            // self.resetContainerCss();
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
                        files.push({'name' : v.name,'type' : v.type,'size' : v.size});
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
                value : '<div class="file-input-wrapper"><input type="file" name="{name}" hidefoucs="true" class="file-input" /></div>'
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
             * @default false
             */
            multiple : {
                value : false,
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
KISSY.add('gallery/form/1.0/uploader/button/swfButton', function (S, Node, Base, SwfUploader) {
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
                target = self.get('target');
            S.mix(flash.attrs, {
                width:target.width(),
                height:target.height()
            });
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
                $swfWrapper.show();
                //TODO:之所以不使用更简单的unlock()方法，因为这个方法应用无效，有可能是bug
                //swfUploader.unlock();
            }else{
                $target.addClass(disabledCls);
                //隐藏swf容器
                $swfWrapper.hide();
                //swfUploader.lock();
            }
            return disabled;
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
            value:'<div id="{id}" class="uploader-button-swf" style="position: absolute;top:0;left:0;"></div>'
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
                if (swfUploader && S.isArray(v)) {
                    swfUploader.filter(v);
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
         * flash配置，对于swf文件配路径配置非常关键，使用默认cdn上的路径就好
         * @type Object
         * @default { src:'http://a.tbcdn.cn/s/kissy/gallery/form/1.0/uploader/plugins/ajbridge/uploader.swf', id:'swfUploader', params:{ bgcolor:"#fff", wmode:"transparent" }, attrs:{ }, hand:true, btn:true }
             }
         */
        flash:{
            value:{
                src:'http://a.tbcdn.cn/s/kissy/gallery/form/1.0/uploader/plugins/ajbridge/uploader.swf',
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
KISSY.add('gallery/form/1.0/uploader/index',function (S, Base, Node, Uploader, Button,SwfButton,Auth) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploaderRender]:',
        dataName = {
            CONFIG:'data-config',
            BUTTON_CONFIG : 'data-button-config',
            THEME_CONFIG : 'data-theme-config',
            AUTH : 'data-auth'
        };

    /**
     * 解析组件在页面中data-config成为组件的配置
     * @param {String} hook 组件钩子
     * @param {String} dataConfigName 配置名
     * @return {Object}
     */
    S.parseConfig = function(hook, dataConfigName) {
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
     * @constructor
     * @param {String | HTMLElement} buttonTarget *，上传按钮目标元素
     * @param {String | HTMLElement} queueTarget *，文件队列目标元素
     * @param {Object} config 配置，该配置好覆盖data-config伪属性中的数据
     * @requires Uploader,Button,SwfButton,Auth
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
KISSY.use('gallery/form/1.0/uploader/index', function (S, RenderUploader) {
     var ru = new RenderUploader('#J_UploaderBtn', '#J_UploaderQueue');
     ru.on("init", function (ev) {
        var uploader = ev.uploader;
     })
})
     */
    function RenderUploader(buttonTarget, queueTarget, config) {
        var self = this;
        //合并配置
        config = S.mix(S.parseConfig(buttonTarget), config);
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
     */

    S.extend(RenderUploader, Base, /** @lends RenderUploader.prototype*/{
        /**
         * 初始化组件
         */
        _init:function () {
            var self = this, uploaderConfig = self.get('uploaderConfig'),
                name = self.get('name'),
                button = self._initButton(),
                queue;
            self.set('button', button);
            self._initThemes(function (theme) {
                queue = theme.get('queue');
                S.mix(uploaderConfig.serverConfig,{'fileDataName':name});
                //配置增加按钮实例和队列实例
                S.mix(uploaderConfig, {button:button, queue:queue});
                var uploader = new Uploader(uploaderConfig);
                uploader.render();
                self.set('uploader', uploader);
                theme.set('uploader',uploader);
                theme.set('button',button);
                self._auth();
                if(theme.afterUploaderRender) theme.afterUploaderRender(uploader);
                // 看看是不是urlsinput里面已经有值了，如果有，恢复到队列中，适用于编辑页面。
                uploader.restore();
                self.fire('init', {uploader:uploader});
            });
        },
        /**
         * 初始化模拟的上传按钮
         * @return {Button}
         */
        _initButton:function () {
            var self = this,
                target = self.get('buttonTarget'),
                //从html标签的伪属性中抓取配置
                config = S.parseConfig(target,dataName.BUTTON_CONFIG),
                name = self.get('name'),
                type = self.get('type');
            //合并配置
            config = S.merge({name:name},config);
            //实例化上传按钮
            return type != 'flash' && new Button(target, config) || new SwfButton(target);
        },
        /**
         * 初始化主题
         * @param {Function} callback 主题加载完成后的执行的回调函数
         */
        _initThemes:function (callback) {
            var self = this, theme = self.get('theme'),
                target = self.get('buttonTarget'),
                //从html标签的伪属性中抓取配置
                config = S.parseConfig(target,dataName.THEME_CONFIG);
            S.use(theme + '/index', function (S, Theme) {
                var queueTarget = self.get('queueTarget'),
                    theme;
                S.mix(config,{queueTarget:queueTarget});
                theme = new Theme(config);
                callback && callback.call(self, theme);
            })
        },
        /**
         * 文件上传验证
         */
        _auth:function () {
            var self = this,buttonTarget = self.get('buttonTarget'),
                uploader = self.get('uploader'),
                rules, auth;
            //存在验证配置
            if($(buttonTarget).attr(dataName.AUTH)){
                rules = S.parseConfig(buttonTarget,dataName.AUTH);
                auth = new Auth(uploader,{rules : rules});
                uploader.set('auth',auth);
            }
        }
    }, {
        ATTRS:/** @lends RenderUploader.prototype*/{
            /**
             * 主题引用路径
             * @type String
             * @default  “gallery/form/1.0/uploader/themes/default”
             */
            theme:{value:'gallery/form/1.0/uploader/themes/default' },
            /**
             * 按钮目标元素
             * @type String|HTMLElement|KISSY.Node
             * @default ""
             */
            buttonTarget:{value:EMPTY},
            /**
             * 队列目标元素
             * @default ""
             * @type String|HTMLElement|KISSY.Node
             */
            queueTarget:{value:EMPTY},
            /**
             * 上传组件配置
             * @type Object
             * @default {}
             */
            uploaderConfig:{},
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
            uploader:{value:EMPTY},
            /**
             * 上传验证实例
             * @type Auth
             * @default ""
             */
            auth : {value:EMPTY}
        }
    });
    return RenderUploader;
}, {requires:['base', 'node', './base', './button/base','./button/swfButton','./auth/base']});/*
Copyright 2011, KISSY UI Library v1.1.5
MIT Licensed
build time: Sep 11 10:29
*/
/**
 * AJBridge Class
 * @author kingfo oicuicu@gmail.com
 */
KISSY.add('gallery/form/1.0/uploader/plugins/ajbridge/ajbridge', function(S,Flash) {

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
    S.app(AJBridge, {

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
KISSY.add('gallery/form/1.0/uploader/plugins/ajbridge/uploader', function(S,flash,A) {

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
 * @fileoverview 本地图片预览组件
 * @author 紫英（橘子）<daxingplay@gmail.com>
 * @date 2012-01-10
 * @requires KISSY 1.2+
 */

KISSY.add('gallery/form/1.0/uploader/plugins/preview/preview', function(S, D, E){
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
						}
						reader.onerror = function(e){
							S.log(LOG_PRE + 'File Reader Error. Your browser may not fully support html5 file api', 'warning');
							self.fire(_eventList.error);
						}
						reader.readAsDataURL(fileInput.files[0]);
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
	})
	
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
KISSY.add('gallery/form/1.0/uploader/plugins/progressBar/progressBar',function(S, Node, Base) {
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
        width : { value:100 },
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
KISSY.add('gallery/form/1.0/uploader/queue/base', function (S, Node, Base, Status) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploader-queue]:';

    /**
     * @name Queue
     * @class 文件上传队列基类，不同主题拥有不同的队列类
     * @constructor
     * @extends Base
     * @requires Status
     * @param {String} target *，目标元素
     * @param {Object} config Queue没有必写的配置
     * @param {Uploader} config.uploader Uploader的实例
     * @param {Number} config.duration 添加/删除文件时的动画速度
     * @example
     * <ul id="J_Queue"> </ul>
     * @example
     * S.use('gallery/form/1.0/uploader/queue/base,gallery/form/1.0/uploader/themes/default/style.css', function (S, Queue) {
     *    var queue = new Queue('#J_Queue');
     *    queue.render();
     * })
     */
    function Queue(target, config) {
        var self = this;
        //调用父类构造函数
        Queue.superclass.constructor.call(self, config);
        //队列目标
        self.set('target', $(target));
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
            //成功运行后触发
            RENDER : 'render',
            //添加完文件后触发
            ADD:'add',
            //批量添加文件后触发
            ADD_FILES:'addFiles',
            //删除文件后触发
            REMOVE:'remove',
            //清理队列所有的文件后触发
            CLEAR:'clear',
            //当改变文件状态后触发
            FILE_STATUS : 'fileStatus',
            //更新文件数据后触发
            UPDATE_FILE : 'updateFile',
            // 恢复文件后触发
            RESTORE: 'restore'
        },
        /**
         * 文件的状态
         */
        status:Status.type,
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
     * @param {KISSY.Node} ev.target 对应的li元素
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
     * @name Queue#fileStatus
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
         * 运行组件
         * @return {Queue}
         */
        render:function () {
            var self = this, $target = self.get('target');
            $target.addClass(Queue.cls.QUEUE);
            self.fire(Queue.event.RENDER);
            return self;
        },
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
            var self = this, event = Queue.event;
            //如果存在多个文件，需要批量添加文件
            if (files.length > 0) {
                self._addFiles(files,function(){
                    callback && callback.call(self);
                    self.fire(event.ADD_FILES,{files : files});
                });
                return false;
            } else {
                return self._addFile(files, function (index, fileData) {
                    callback && callback.call(self, index, fileData);
                });
            }
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
                duration = self.get('duration'),
                //设置文件对象
                fileData = self._setAddFileData(file),
                index = self.getFileIndex(fileData.id);
            //更换文件状态为等待
            self.fileStatus(index, Queue.status.WAITING);
            //显示文件信息li元素
            fileData.target.fadeIn(duration, function () {
                self.fire(Queue.event.ADD, {index:index, file:fileData, target:fileData.target});
                callback && callback.call(self, index, fileData);
            });
            return fileData;
        },
        /**
         * 向队列批量添加文件
         * @param {Array} files 文件数据数组
         * @param {Function} callback 全部添加完毕后执行的回调函数
         */
        _addFiles : function(files,callback){
            if (!files.length) {
                S.log(LOG_PREFIX + '_addFiles()参数files不合法！');
                return false;
            }
            var self = this;
            _run(0);
            function _run(index){
                if(index === files.length){
                    callback && callback.call(this);
                    return false;
                }
                self._addFile(files[index],function(){
                    index ++;
                    _run(index);
                });
            }
        },
        /**
         * 删除队列中指定id的文件
         * @param {Number} indexOrFileId 文件数组索引或文件id
         * @param {Function} callback 删除元素后执行的回调函数
         * @example
         * queue.remove(0,function(){
         *     alert(2);
         * });
         */
        remove:function (indexOrFileId, callback) {
            var self = this, files = self.get('files'), file, $file,
                duration = self.get('duration');
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
            $file = file.target;
            $file.fadeOut(duration, function () {
                $file.remove();
                self.fire(Queue.event.REMOVE, {index:indexOrFileId, file:file});
                callback && callback.call(self,indexOrFileId, file);
            });
            //将该id的文件过滤掉
            files = S.filter(files, function (file, i) {
                return i !== indexOrFileId;
            });
            self.set('files', files);
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
         * 将数据恢复到队列中
         * @param {Array} 需要恢复的数据
         */
        restore: function(files){
        	var self = this,
        		filesData = [];
        	if(files && files.length > 0){
        		S.each(files, function(url, index){
                    var s = url.split('|'),name = EMPTY;
                    if(s.length > 1){
                        url = s[1];
                        name = s[0];
                    }
	        		if(url){
	        			var file = {
	        				input: null,
	        				name: name,
	        				sUrl: url,
	        				size: '',
	        				type: ''
	        			};
	        			var fileData = self._setAddFileData(file),
			                index = self.getFileIndex(fileData.id);
			            //更换文件状态为等待
			            self.fileStatus(index, Queue.status.RESTORE);
			            //显示文件信息li元素
			            $(fileData.target).show();
			            fileData.status.set('curType', Queue.status.SUCCESS);
			            filesData.push(fileData);
	        		}
	        	});
        	}
        	self.fire(Queue.event.RESTORE, {
            	'files': filesData
            });
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
            var self = this, file = self.getFile(index), oStatus;
            if (!S.isPlainObject(file)) return false;
            //状态实例
            oStatus = file['status'];
            if (status) oStatus.change(status, args);
            self.fire(Queue.event.FILE_STATUS,{index : index,status : status});
            return  oStatus;
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
            if (!S.isPlainObject(file)) file = false;
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
                    if (status.get('curType') == type) {
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
            var self = this, files = self.get('files'), oStatus, statusFiles = [];
            if (!files.length) return [];
            S.each(files, function (file) {
                if (file) {
                    oStatus = file.status;
                    oStatus.get('curType') == status && statusFiles.push(file);
                }
            });
            return statusFiles;
        },
        /**
         * 添加文件时先向文件数据对象追加id、target、size等数据
         * @param {Object} file 文件数据对象
         * @return {Object} 新的文件数据对象
         */
        _setAddFileData:function (file) {
            var self = this,
                files = self.get('files'),
                uploader = self.get('uploader');
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '_updateFileData()参数file不合法！');
                return false;
            }
            //设置文件唯一id
            if (!file.id) file.id = S.guid(Queue.FILE_ID_PREFIX);
            //转换文件大小单位为（kb和mb）
            if (file.size) file.textSize = Status.convertByteSize(file.size);
            //文件信息元素
            file.target = self._appendFileHtml(file);
            //状态实例
            file.status = self._renderStatus(file);
            //传递Uploader实例给Status
            if (S.isObject(uploader)) file.status.set('uploader', uploader);
            files.push(file);
            return file;
        },
        /**
         * 向列表添加li元素（文件信息）
         * @param {Object} data 文件对象数据
         * @return {NodeList}
         */
        _appendFileHtml:function (data) {
            var self = this, $target = self.get('target'),
                //文件信息显示模板
                tpl = self.get('tpl'),
                hFile = S.substitute(tpl, data);
            return $(hFile).hide().appendTo($target).data('data-file', data);

        },
        /**
         * 运行Status
         * @param {Object} file  文件数据
         * @return {Status} 状态实例
         */
        _renderStatus:function (file) {
            var self = this, $file = file.target,
                hook = Queue.hook.STATUS, elStatus,
                statusConfig = self.get('statusConfig');
            if (!$file.length) return false;
            //状态层
            elStatus = $file.children(hook);
            //合并参数
            S.mix(statusConfig,{queue:self, file:file});
            //实例化状态类
            return new Status(elStatus, statusConfig);
        }
    }, {ATTRS:/** @lends Queue.prototype*/{
        /**
         * 模板
         * @type String
         * @default  Queue.tpl.DEFAULT
         */
        tpl:{ value:Queue.tpl.DEFAULT },
        /**
         * 添加/删除文件时的动画速度
         * @type Number
         * @default 0.3
         */
        duration:{value:0.3},
        /**
         * 队列目标元素
         * @type KISSY.Node
         * @default ""
         */
        target:{value:EMPTY},
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
         * 状态类配置，queue和file参数会被组件内部覆盖，传递无效
         * @type Object
         * @default {}
         */
        statusConfig : {
            value : {}
        },
        /**
         * 该队列对应的Uploader实例
         * @type Uploader
         * @default ""
         */
        uploader:{value:EMPTY}
    }});

    return Queue;
}, {requires:['node', 'base', './status']});
/**
 * @fileoverview 文件改变状态后改变状态元素的内容
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.0/uploader/queue/status',function(S, Node, Base,ProgressBar) {
    var EMPTY = '',$ = Node.all,LOG_PREFIX = '[queue-status]:';

    /**
     * @name Status
     * @class 文件改变状态后改变状态元素的内容
     * @constructor
     * @extends Base
     * @requires Node
     * @param {String} target 目标元素钩子
     * @param {Object} config 配置
     */
    function Status(target, config) {
        var self = this;
        config = S.merge({target:$(target)}, config);
        //调用父类构造函数
        Status.superclass.constructor.call(self, config);
    }

    S.mix(Status, /** @lends Status.prototype*/{
        /**
         * 文件的状态类型
         */
        type : {
            WAITING : 'waiting',
            START : 'start',
            PROGRESS : 'progress',
            SUCCESS : 'success',
            CANCEL : 'cancel',
            ERROR : 'error',
            RESTORE: 'restore'
        },
        /**
         * 转换文件大小字节数
         * @param {Number} bytes 文件大小字节数
         * @return {String} 文件大小
         */
        convertByteSize : function(bytes){
            var i = -1;
            do {
                bytes = bytes / 1024;
                i++;
            } while (bytes > 99);
            return Math.max(bytes, 0.1).toFixed(1) + ['kB', 'MB', 'GB', 'TB', 'PB', 'EB'][i];
        }
    });
    //继承于Base，属性getter和setter委托于Base处理
    S.extend(Status, Base, /** @lends Status.prototype*/{
        /**
         * 改变状态，调用对应的状态函数
         * @param {String} status 状态名
         * @param {Object} args 传递给状态函数的参数
         * @return {Status}
         */
        change : function(status,args){
            if (!S.isString(status)) return false;
            var self = this,method;
            if (!self.isSupport(status)) {
                S.log(LOG_PREFIX + 'status参数为' + status + '，不支持的状态类型');
                return false;
            }
            if(!args) args = {};
            method = self['_' + status];
            //改变状态层内容
            method && method.call(self,args);
            self.set('curType',status);
            return self;
        },
        /**
         * 判断是不是允许的状态类型
         * @param {String} status
         * @return {Boolean}
         */
        isSupport : function(status) {
            if (!S.isString(status)) return false;
            var type = Status.type,b = false;
            S.each(type, function(v) {
                if (status == v) {
                    return b = true;
                }
            });
            return b;
        },
        /**
         * 改变状态层的DOM内容
         * @return {NodeList} 内容层
         */
        _changeDom : function(content) {
            var self = this,$target = self.get('target'),$content;
            $target.html(EMPTY);
            $content = $(content).appendTo($target);
            return $content;
        },
        /**
         * 等待上传时状态层内容
         */
        _waiting : function() {
            var self = this, tpl = self.get('tpl'),waitingTpl = tpl.waiting,
                uploader = self.get('uploader'),
                queue = self.get('queue'),
                //文件id
                file = self.get('file'),id = file.id,
                index = queue.getFileIndex(id),
                $content = self._changeDom(waitingTpl),
                $upload = $content.children('.J_Upload');
            $upload.on('click',function(ev){
                ev.preventDefault();
                if (!S.isObject(uploader)) return false;
                uploader.upload(index);
            });
        },
        /**
         * 开始上传后改成状态层内容
         */
        _start : function(data) {
            var self = this, tpl = self.get('tpl'),startTpl = tpl.start,
                target = self.get('target'),
                uploader = self.get('uploader'),
                uploadType = uploader.get('type'),
                $content,$cancel;
            if (!S.isString(startTpl)) return false;
            $content = self._changeDom(startTpl);
            //取消链接
            $cancel = $content.children('.J_UploadCancel');
            $cancel.on('click', function(ev) {
                ev.preventDefault();
                if (!S.isObject(uploader)) return false;
                uploader.cancel();
            });
            //如果是ajax或flash异步上传，加入进度条
            if(uploadType == 'ajax' || uploadType == 'flash'){
                var $progressBar = $content.children('.J_ProgressBar');
                var progressBar = new ProgressBar($progressBar);
                progressBar.render();
                self.set('progressBar',progressBar);
            }
            var $parent = target.parent();
            $parent.addClass('current-upload-file');
        },
        /**
         * 正在上传时候刷新状态层的内容
         * @param data
         */
        _progress : function(data){
            var self = this,loaded = data.loaded,total = data.total,
                val = Math.ceil(loaded/total) * 100,
                progressBar = self.get('progressBar');
            if(!progressBar) return false;
            progressBar.set('value',val);
        },
        /**
         * 成功上传后改成状态层内容
         */
        _success : function() {
            var self = this, tpl = self.get('tpl'),successTpl = tpl.success,
                target = self.get('target'),
                queue = self.get('queue'),
                file = self.get('file'),id = file.id,
                progressBar = self.get('progressBar'),
                $target = self.get('target'),
                $content,$progressBar,
                $del;
            if (!S.isString(successTpl)) return false;
            //设置为100%进度
            S.isObject(progressBar) && progressBar.set('value',100);
            S.later(function(){
                //拷贝进度条
                if(S.isObject(progressBar)){
                    var $wrapper =$target.children();
                    $progressBar = $wrapper.children('.J_ProgressBar').clone(true);
                }
                //改变状态层的内容
                $content = self._changeDom(successTpl);
                //将进度条插入到状态层
                if($progressBar) $content.prepend($progressBar);
                $del = $content.children('.J_FileDel');
                //点击删除
                $del.on('click', function(ev) {
                    ev.preventDefault();
                    //删除队列中的文件
                    queue.remove(id);
                });
            },300);
            var $parent = target.parent();
            $parent.removeClass('current-upload-file');
        },
        /**
         * 文件恢复到队列中
         */
        _restore: function(){
            this._success();
        },
        /**
         * 取消上传后改成状态层内容
         */
        _cancel : function() {
            var self = this, tpl = self.get('tpl'),cancelTpl = tpl.cancel,
                uploader = self.get('uploader'),
                $content = self._changeDom(cancelTpl),
                $reUpload = $content.children('.J_ReUpload'),
                //文件id
                file = self.get('file'),id = file.id;
            //点击重新上传链接
            $reUpload.on('click', function(ev) {
                ev.preventDefault();
                if (!S.isObject(uploader)) return false;
                uploader.upload(id);
            });
        },
        /**
         * 上传失败后改成状态层内容
         */
        _error : function(data) {
            if(!S.isObject(data)){
                data = {msg : '文件上传失败！'};
            }
            var self = this, tpl = self.get('tpl'),errorTpl = tpl.error,
                html = S.substitute(errorTpl,data),
                $content = self._changeDom(html),
                $del = $content.children('.J_FileDel'),
                queue = self.get('queue'),
                //文件id
                file = self.get('file'),id = file.id;
            //点击重新上传链接
            $del.on('click', function(ev) {
                ev.preventDefault();
                //删除队列中的文件
                queue.remove(id);
            });
        }
    }, {ATTRS : /** @lends Status*/{
        /**
         * 状态改变时改变的元素层
         */
        target : {value : EMPTY},
        /**
         * 模板
         */
        tpl : {value : {
            waiting : '<div class="waiting-status">等待上传，<a href="#Upload" class="J_Upload">点此上传</a> </div>',
            start : '<div class="start-status clearfix">' +
                '<div class="f-l  J_ProgressBar uploader-progress"><img class="loading" src="http://img01.taobaocdn.com/tps/i1/T1F5tVXjRfXXXXXXXX-16-16.gif" alt="loading" /></div>' +
                ' <a class="f-l J_UploadCancel upload-cancel" href="#uploadCancel">取消</a>' +
                '</div> ',
            success : ' <div class="success-status"><a href="#fileDel" class="J_FileDel">删除</a></div>',
            cancel : '<div class="cancel-status">已经取消上传，<a href="#reUpload" class="J_ReUpload">点此重新上传</a> </div>',
            error : '<div class="error-status upload-error">{msg}<a href="#fileDel" class="J_FileDel">删除</a></div>'
        } },
        /**
         * 队列实例
         */
        queue : {value : EMPTY},
        /**
         * 上传组件的实例
         */
        uploader : {value : EMPTY},
        /**
         * 文件对象
         */
        file : {value : {}},
        /**
         * 当前状态类型
         */
        curType : { value : EMPTY },
        //进度条ProgressBar的实例，iframe上传时并不存在
        progressBar : {value : EMPTY}
    }});
    return Status;
}, {requires : ['node','base','../plugins/progressBar/progressBar']});/**
 * @fileoverview ajax方案上传
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.0/uploader/type/ajax',function(S, Node, UploadType) {
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
        self._setFormData();
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
         * @param {HTMLElement} fileInput 文件input
         * @return {AjaxType}
         */
        upload : function(fileInput) {
            //不存在文件信息集合直接退出
            if (!fileInput) {
                S.log(LOG_PREFIX + 'upload()，fileInput参数有误！');
                return false;
            }
            var self = this, files = fileInput.files, file;
            //不存在文件信息集合直接退出
            if (!files.length) {
                S.log(LOG_PREFIX + 'upload()，不存在要上传的文件！');
                return false;
            }
            file = files[0];
            self._addFileData(fileInput, file);
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
                var result = {};
                try{
                    result = S.JSON.parse(xhr.responseText);
                }catch(e){
                    S.log(LOG_PREFIX + 'ajax返回结果集responseText格式不合法！');
                }
                self.fire(AjaxType.event.SUCCESS, {result : result});
            };
            xhr.open("POST", action, true);
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
         * @param {HTMLElement} fileInput 文件上传域
         * @param {Object} file 文件信息
         */
        _addFileData : function(fileInput, file) {
            if (!S.isObject(file)) {
                S.log(LOG_PREFIX + '_addFileData()，file参数有误！');
                return false;
            }
            var self = this,
                formData = self.get('formData'),
                fileDataName = self.get('fileDataName');
            if (fileDataName == EMPTY) {
                fileDataName = $(fileInput).attr('name');
                self.set('fileDataName', fileDataName);
            }
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
KISSY.add('gallery/form/1.0/uploader/type/base',function(S, Node, Base) {
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
        data : {value : {}}
    }});

    return UploadType;
}, {requires:['node','base']});/**
 * @fileoverview flash上传方案，基于龙藏写的ajbridge内的uploader
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.0/uploader/type/flash', function (S, Node, UploadType, swfUploader) {
    var EMPTY = '', $ = Node.all, LOG_PREFIX = '[uploader-FlashType]:';

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
                data = self.get('data');
            self.set('uploadingId',id);
            swfUploader.upload(id, action, method, data);
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
            self.fire(FlashType.event.PROGRESS, { 'loaded':ev.loaded, 'total':ev.total });
        },
        /**
         * 上传完成后事件监听器
         * @param {Object} ev
         */
        _uploadCompleteDataHandler : function(ev){
            var self = this,result;
            try {
                result = JSON.parse(ev.data);
            } catch(err) {
                S.log(LOG_PREFIX + 'json数据格式不合法！');
                self.fire(FlashType.event.ERROR, {msg : '不是合法的json数据'});
            }
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
        }
    }, {ATTRS:/** @lends FlashType*/{
        /**
         * ajbridge的uploader组件的实例，必须参数
         */
        swfUploader:{value:EMPTY},
        /**
         * 正在上传的文件id
         */
        uploadingId : {value : EMPTY}
    }});
    return FlashType;
}, {requires:['node', './base']});/**
 * @fileoverview iframe方案上传
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.0/uploader/type/iframe',function(S, Node, UploadType) {
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
            FORM : '<form method="post" enctype="multipart/form-data" action="{action}" target="{target}">{hiddenInputs}</form>',
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
            if (!S.isObject(data) || S.isEmptyObject(data)) {
                S.log(LOG_PREFIX + 'data参数不是对象或者为空！');
                return false;
            }
            var self = this,hiddenInputHtml = EMPTY,
                //hidden元素模板
                tpl = self.get('tpl'),hiddenTpl = tpl.HIDDEN_INPUT;
            if (!S.isString(hiddenTpl)) return false;
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
            result = doc.body.innerHTML;
            S.log(LOG_PREFIX + '服务器端输出:'+result);
            //如果不存在json结果集，直接退出
            if (result == EMPTY) return false;
            try {
                result = JSON.parse(result);
            } catch(err) {
                S.log(LOG_PREFIX + 'json数据格式不合法！');
                self.fire(errorEvent, {msg : '数据：' + result + '不是合法的json数据'});
            }
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
                hiddens,form = EMPTY,$form;
            if (!S.isString(formTpl)) {
                S.log(LOG_PREFIX + 'form模板不合法！');
                return false;
            }
            if (!S.isObject(data)) {
                S.log(LOG_PREFIX + 'data参数不合法！');
                return false;
            }
            if (!S.isString(action)) {
                S.log(LOG_PREFIX + 'action参数不合法！');
                return false;
            }
            hiddens = self.dataToHidden(data);
            if (hiddens == EMPTY) return false;
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
            var self = this,form = self.get('form'),iframe = self.get('iframe');
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
KISSY.add('gallery/form/1.0/uploader/urlsInput',function(S, Node, Base) {
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