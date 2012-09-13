/**
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
