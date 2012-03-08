/**
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
     * @class 运行文件上传组件
     * @constructor
     * @param {String | HTMLElement} buttonTarget 上传按钮目标元素
     * @param {String | HTMLElement} queueTarget 文件队列目标元素
     * @param {Object} config 配置
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

    S.extend(RenderUploader, Base, {
        /**
         * 初始化组件
         */
        _init:function () {
            var self = this, uploaderConfig = self.get('uploaderConfig'),
                button = self._initButton(),
                queue;
            self.set('button', button);
            self._initThemes(function (theme) {
                queue = theme.get('queue');
                //配置增加按钮实例和队列实例
                S.mix(uploaderConfig, {button:button, queue:queue});
                var uploader = new Uploader(uploaderConfig);
                uploader.render();
                self.set('uploader', uploader);
                if(theme.afterUploaderRender) theme.afterUploaderRender(uploader);
                self._auth();
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
        ATTRS:{
            theme:{value:'gallery/form/1.0/uploader/themes/default' },
            /**
             * 按钮目标元素
             */
            buttonTarget:{value:EMPTY},
            /**
             * 队列目标元素
             */
            queueTarget:{value:EMPTY},
            /**
             * 上传组件配置
             */
            uploaderConfig:{},
            /**
             * Button（上传按钮）的实例
             */
            button:{value:EMPTY},
            /**
             * Queue（上传队列）的实例
             */
            queue:{value:EMPTY},
            /**
             * 上传组件实例
             */
            uploader:{value:EMPTY},
            /**
             * 上传验证实例
             */
            auth : {value:EMPTY}
        }
    });
    return RenderUploader;
}, {requires:['base', 'node', './base', './button/base','./button/swfButton','./auth/base']});