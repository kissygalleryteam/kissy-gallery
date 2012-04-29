/**
 * @fileoverview 文件上传验证
 * @author: 剑平（明河）<minghe36@126.com>
 **/
KISSY.add('gallery/form/1.1/uploader/auth/base', function (S, Node,Base) {
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
                var file = ev.file,status = file.status;
                //删除的是已经成功上传的文件，需要重新检验最大允许上传数
                if(status == 'success'){
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
}, {requires:['node','base']});