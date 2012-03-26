/**
 * @fileoverview 运行文件上传组件
 * @author 剑平（明河）<minghe36@126.com>,紫英<daxingplay@gmail.com>
 **/
KISSY.add('gallery/form/1.1/uploader/index',function (S, Base, Node, Uploader, Button,SwfButton,Auth) {
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
KISSY.use('gallery/form/1.1/uploader/index', function (S, RenderUploader) {
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
                var auth = self._auth();
                theme.set('auth',auth);
                if(theme.afterUploaderRender) theme.afterUploaderRender(uploader);
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
                rules, auth = EMPTY;
            //存在验证配置
            if($(buttonTarget).attr(dataName.AUTH)){
                rules = S.parseConfig(buttonTarget,dataName.AUTH);
                auth = new Auth(uploader,{rules : rules});
                uploader.set('auth',auth);
            }
            return auth;
        }
    }, {
        ATTRS:/** @lends RenderUploader.prototype*/{
            /**
             * 主题引用路径
             * @type String
             * @default  “gallery/form/1.1/uploader/themes/default”
             */
            theme:{value:'gallery/form/1.1/uploader/themes/default' },
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
}, {requires:['base', 'node', './base', './button/base','./button/swfButton','./auth/base']});