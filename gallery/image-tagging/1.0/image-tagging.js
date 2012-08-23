/**
 * @fileoverview image-tagging.js
 * @desc function description
 * @author qiaofu@taobao.com
 */
KISSY.add('gallery/image-tagging/1.0/image-tagging', function (S, Overlay) {
    var D = S.DOM, E = S.Event, doc = document;

    //定义变量和常量
    var taggingContainer = null,
        _globalTimer = {
            timer:null,
            used:false
        },
        _processStatus = 0, // 默认为0,表示没有开始，进行中为1，结束为0
        _processQueue = [], // 待处理的图片的数组
        _completeQueue = [], // 已完成的ImageTag的数组
        _taggingIndex = 0;// 记录imageTag的唯一数字id

    S.mix(_globalTimer, S.EventTarget);// 使globalTimer具有AOP的性质

    var _timerQueueRun = function () {
        _globalTimer.fire('globalInterval');
        },
        _waitForProcess = function (config, context) {
            _processQueue.push([config, context]);
            if (!_processStatus) {// 初次做一个绑定
                _globalTimer.on('globalInterval', _checkForComplete);
                _processStatus = 1;
            }
        },
        _checkForComplete = function () {
            for (var i = 0; i < _processQueue.length; i++) {
                if (_processQueue[i][0].picNode.complete) {
                    _processQueue[i][1]._renderPic(_processQueue[i][0]);
                    _processQueue.splice(i, 1);
                }
            }
            if (_processQueue.length === 0) {
                _globalTimer.detach('globalInterval', _checkForComplete);
                _processStatus = 0;
            }
        },
        _reRenderPic = function (config) {
            var pic = config.img,
                wrapNode = config.wrapNode,
                paddingTop = parseInt(D.css(pic, 'paddingTop'), 10),
                paddingLeft = parseInt(D.css(pic, 'paddingLeft'), 10),
                borderTop = parseInt(D.css(pic, 'borderTopWidth'), 10),
                borderLeft = parseInt(D.css(pic, 'borderLeftWidth'), 10),
                offset = D.offset(pic),
                ot = offset.top,
                ol = offset.left;
            D.css(wrapNode, {'top':ot + paddingTop + borderTop, 'left':ol + paddingLeft + borderLeft});
        },
        _processImage = function () {
            S.log('process Run');
            S.each(_completeQueue, function (el) {
                _reRenderPic(el);
            });
        }

    /**
     * 功能
     * @param {HTMLElement|String} picNode 图片dom节点或者图片节点的选择器
     * @param {Array} coords 标记数据的数组，单个标记支持{top:value,left:value},{bottom:value,left:value}两种定位方式
     * @param {Object} _config 相关配置
     * @return 一个ImageTag实例
     */
    function ImageTag(picNode, coords, _config) {
        // 在初始化第一个ImageTag的时候进行用户配置和默认配置的合并
        // 但是应该没有人会去重写一个原生的对象吧？

        // dynamic 的配置应该针对全局
        if (ImageTag.Config.dynamic && !_globalTimer.used) {
            _globalTimer.used = true;
            _globalTimer.on('globalInterval', _processImage);
            E.on(window, 'resize', _processImage);
        }

        var self = this;

        //参数处理
        var config = {};
        S.mix(config, _config);
        //对象属性赋值
        config.picNode = D.get(picNode);
        picNode = config.picNode;
        config.coords = coords;
        this.tagNodes = [];
        this.wrapNode = null;
        //初始化
        if (picNode && coords) {
            // 在第一个ImageTag初始化的时候，进行tagContainer的DOM初始化
            if (!taggingContainer) {
                taggingContainer = D.create('<div class="ks-tagging-container"></div>');
                D.addStyleSheet('.ks-tagging-container {position:absolute;top:0;left:0;}');
                D.append(taggingContainer, D.get('body'));
                D.addStyleSheet('.ks-tag-wrap {position:absolute;}');
            }
            // 在第一个ImageTag初始化的时候，进行计时器的初始化
            if (!_globalTimer.timer) {
                // 生成主心跳
                _globalTimer.timer = S.later(function () {
                    _timerQueueRun();
                }, this.constructor.Config.timerInterval, true);
            }
            if (!picNode.complete) {// 否则推入数组进行等待再处理
                _waitForProcess(config, self);// 待处理的图片由 _waitForProcess 函数交于主心跳来处理
            } else {// 如果图片complete，就对他渲染
                S.log('Render Run');
                self._renderPic(config);
            }
        }
    }

    //默认配置
    var globalConfig = {
        dynamic:true, // 如果dynamic为真，会有一个定时器来动态修正标点的位置
        timerInterval:250, // 修正标点的时间间隔
        rules:{// 默认抓取规则
            container:'', // 图片容器的id或者Element
            imageClass:'', // 设置可被抓取图片的class
            imageIgnoreClass:'', // 具有该class的图片会被筛选忽略
            minWidth:400, // 最小宽度
            minHeight:400, // 最小高度
            ratio:0.5// 高宽比或者宽高比
        }
    };
    //类继承
    //S.extend(YourGallery, S.Base);
    ImageTag.Config = S.mix({}, globalConfig);

    //原型扩展
    S.augment(ImageTag, S.EventTarget, {
        /**
         * private _renderPic 渲染所有的图片
         * @param config
         */
        _renderPic:function (config) {
            var self = this,
                pic = config.picNode,
                coords = config.coords,
                width = D.width(pic),
                height = D.height(pic);
            // 对图片的筛选
            if (width < ImageTag.Config.rules.minWidth) {
                return;
            }
            if (height < ImageTag.Config.rules.minHeight) {
                return;
            }
            if (ImageTag.Config.rules.imageIgnoreClass && D.hasClass(pic, ImageTag.Config.rules.imageIgnoreClass)) {
                return;
            }
            if (ImageTag.Config.rules.imageClass && !D.hasClass(pic, ImageTag.Config.rules.imageClass)) {
                return;
            }
            if (ImageTag.Config.rules.ratio) {
                if (Math.min(width / height, height / width) < ImageTag.Config.rules.ratio) {
                    return;
                }
            }

            var paddingTop = parseInt(D.css(pic, 'paddingTop'), 10),
                paddingLeft = parseInt(D.css(pic, 'paddingLeft'), 10),
                borderTop = parseInt(D.css(pic, 'borderTopWidth'), 10),
                borderLeft = parseInt(D.css(pic, 'borderLeftWidth'), 10),
                offset = D.offset(pic),
                ot = offset.top,
                ol = offset.left,
                wrapNode = D.create('<div class="ks-tag-wrap"></div>'),
                wrapBottomNode = D.create('<div class="ks-tag-btnwrap"></div>'), // 生成一个用于底部定位的容器,以应对需要底部定位的
                tagNodeClass = config.tagClass ? config.tagClass : 'ks-tag', // tagClass支持function返回
                tagContent = config.tagContent ? config.tagContent : '', // tagContent支持function返回
                _tagContent = '',
                _tagNodeClass = '',
                tagNode = null;

            // 对图片加一个自定义属性标记
            D.addClass(wrapNode, 'ks-tagindex-' + _taggingIndex++);
            D.css(wrapNode, {top:ot + paddingTop + borderTop, left:ol + paddingLeft + borderLeft});
            D.css(wrapBottomNode, {position:'absolute', top:height, left:0});

            D.append(wrapBottomNode, wrapNode);
            D.append(wrapNode, taggingContainer);

            for (var i = 0; i < coords.length; i++) {
                if (!S.isFunction(tagContent)) {
                    _tagContent = tagContent;
                } else {// 如果tagContent是一个function的话
                    _tagContent = tagContent({'index':i});
                    !_tagContent && (_tagContent = '');
                }
                if (!S.isFunction(tagNodeClass)) {
                    _tagNodeClass = tagNodeClass;
                } else {// 如果tagNodeClass是一个function的话
                    _tagNodeClass = tagNodeClass({'index':i});
                    !_tagNodeClass && (_tagNodeClass = '');
                }

                tagNode = D.create('<div class="' + _tagNodeClass + '" tagindex="' + i + '">' + _tagContent + '</div>');

                if (S.isNumber(coords[i].bottom) && !isNaN(coords[i].bottom)) {
                    D.append(tagNode, wrapBottomNode);
                    D.css(tagNode, {'position':'absolute', 'bottom':coords[i].bottom, 'left':coords[i].left});
                    overlayNode = new Overlay({
                        srcNode:tagNode,
                        elCls:_tagNodeClass,
                        content:_tagContent,
                        align:{
                            node:wrapBottomNode,
                            points:['bl', 'bl'],
                            offset:[coords[i].left, coords[i].bottom]
                        }
                    });

                } else {
                    D.append(tagNode, wrapNode);
                    D.css(tagNode, {'position':'absolute', 'top':coords[i].top, 'left':coords[i].left});
                    overlayNode = new Overlay({
                        srcNode:tagNode,
                        elCls:_tagNodeClass,
                        content:_tagContent,
                        align:{
                            node:wrapNode,
                            points:['tl', 'tl'],
                            offset:[coords[i].left, coords[i].top]
                        }
                    });
                }
                overlayNode.render();
                overlayNode.show();
                this.tagNodes.push(overlayNode);
            }
            this.wrapNode = wrapNode;
            _completeQueue.push({img:pic, wrapNode:wrapNode});
        },
        /**
         * public showAll 显示所有的tag
         * @param {number} index
         */
        showAll:function (index, anim) {
            S.each(this.tagNodes, function (el) {
                el.show();
            });
        },
        /**
         * public hideAll 隐藏全部的tag
         * @param {number} index
         */
        hideAll:function (index, anim) {
            S.each(this.tagNodes, function (el) {
                el.hide();
            });
        },
        /**
         * public getTagNode 获取某一个tag,不带参数则返回所有的tagNodes
         * @param {number} index
         * @return tagNode
         */
        getTagNodes:function() {
            return this.tagNodes;
        }
    });

    return ImageTag;
}, {
    requires:["overlay"]
});
