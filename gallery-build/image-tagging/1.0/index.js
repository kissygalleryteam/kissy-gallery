/**
 * @fileoverview image-tagging.js
 * @desc function description
 * @author qiaofu@taobao.com
 */
KISSY.add('gallery/image-tagging/1.0/image-tagging', function (S, Overlay) {
    var D = S.DOM, E = S.Event, doc = document;

    //������ͳ�
    var taggingContainer = null,
        _globalTimer = {
            timer:null,
            used:false
        },
        _processStatus = 0, // Ĭ��Ϊ0,��ʾû�п�ʼ��������Ϊ1������Ϊ0
        _processQueue = [], // �����ͼƬ������
        _completeQueue = [], // ����ɵ�ImageTag������
        _taggingIndex = 0;// ��¼imageTag��Ψһ����id

    S.mix(_globalTimer, S.EventTarget);// ʹglobalTimer����AOP������

    var _timerQueueRun = function () {
        _globalTimer.fire('globalInterval');
        },
        _waitForProcess = function (config, context) {
            _processQueue.push([config, context]);
            if (!_processStatus) {// �����һ���
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
     * ����
     * @param {HTMLElement|String} picNode ͼƬdom�ڵ����ͼƬ�ڵ��ѡ����
     * @param {Array} coords �����ݵ����飬������֧��{top:value,left:value},{bottom:value,left:value}}�ֶ�λ��ʽ
     * @param {Object} _config �������
     * @return һ��ImageTagʵ��
     */
    function ImageTag(picNode, coords, _config) {
        // �ڳ�ʼ����һ��ImageTag��ʱ������û����ú�Ĭ�����õĺϲ�
        // ����Ӧ��û���˻�ȥ��дһ��ԭ��Ķ���ɣ�

        // dynamic ������Ӧ�����ȫ��
        if (ImageTag.Config.dynamic && !_globalTimer.used) {
            _globalTimer.used = true;
            _globalTimer.on('globalInterval', _processImage);
            E.on(window, 'resize', _processImage);
        }

        var self = this;

        //������
        var config = {};
        S.mix(config, _config);
        //�������Ը�ֵ
        config.picNode = D.get(picNode);
        picNode = config.picNode;
        config.coords = coords;
        this.tagNodes = [];
        this.wrapNode = null;
        //��ʼ��
        if (picNode && coords) {
            // �ڵ�һ��ImageTag��ʼ����ʱ�򣬽���tagContainer��DOM��ʼ��
            if (!taggingContainer) {
                taggingContainer = D.create('<div class="ks-tagging-container"></div>');
                D.addStyleSheet('.ks-tagging-container {position:absolute;top:0;left:0;}');
                D.append(taggingContainer, D.get('body'));
                D.addStyleSheet('.ks-tag-wrap {position:absolute;}');
            }
            // �ڵ�һ��ImageTag��ʼ����ʱ�򣬽��м�ʱ��ĳ�ʼ��
            if (!_globalTimer.timer) {
                // ���������
                _globalTimer.timer = S.later(function () {
                    _timerQueueRun();
                }, this.constructor.Config.timerInterval, true);
            }
            if (!picNode.complete) {// ��������������еȴ��ٴ���
                _waitForProcess(config, self);// �����ͼƬ�� _waitForProcess ������������4����
            } else {// ���ͼƬcomplete���Ͷ�����Ⱦ
                S.log('Render Run');
                self._renderPic(config);
            }
        }
    }

    //Ĭ������
    var globalConfig = {
        dynamic:true, // ���dynamicΪ�棬����һ��ʱ��4��̬�������λ��
        timerInterval:250, // �������ʱ����
        rules:{// Ĭ��ץȡ����
            container:'', // ͼƬ�����id����Element
            imageClass:'', // ���ÿɱ�ץȡͼƬ��class
            imageIgnoreClass:'', // ���и�class��ͼƬ�ᱻɸѡ����
            minWidth:400, // ��С���
            minHeight:400, // ��С�߶�
            ratio:0.5// �߿�Ȼ��߿�߱�
        }
    };
    //��̳�
    //S.extend(YourGallery, S.Base);
    ImageTag.Config = S.mix({}, globalConfig);

    //ԭ��)չ
    S.augment(ImageTag, S.EventTarget, {
        /**
         * private _renderPic ��Ⱦ���е�ͼƬ
         * @param config
         */
        _renderPic:function (config) {
            var self = this,
                pic = config.picNode,
                coords = config.coords,
                width = D.width(pic),
                height = D.height(pic);
            // ��ͼƬ��ɸѡ
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
                wrapBottomNode = D.create('<div class="ks-tag-btnwrap"></div>'), // ���һ�����ڵײ���λ������,��Ӧ����Ҫ�ײ���λ��
                tagNodeClass = config.tagClass ? config.tagClass : 'ks-tag', // tagClass֧��function����
                tagContent = config.tagContent ? config.tagContent : '', // tagContent֧��function����
                _tagContent = '',
                _tagNodeClass = '',
                tagNode = null;

            // ��ͼƬ��һ���Զ������Ա��
            D.addClass(wrapNode, 'ks-tagindex-' + _taggingIndex++);
            D.css(wrapNode, {top:ot + paddingTop + borderTop, left:ol + paddingLeft + borderLeft});
            D.css(wrapBottomNode, {position:'absolute', top:height, left:0});

            D.append(wrapBottomNode, wrapNode);
            D.append(wrapNode, taggingContainer);

            for (var i = 0; i < coords.length; i++) {
                if (!S.isFunction(tagContent)) {
                    _tagContent = tagContent;
                } else {// ���tagContent��һ��function�Ļ�
                    _tagContent = tagContent({'index':i});
                    !_tagContent && (_tagContent = '');
                }
                if (!S.isFunction(tagNodeClass)) {
                    _tagNodeClass = tagNodeClass;
                } else {// ���tagNodeClass��һ��function�Ļ�
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
         * public showAll ��ʾ���е�tag
         * @param {number} index
         */
        showAll:function (index, anim) {
            S.each(this.tagNodes, function (el) {
                el.show();
            });
        },
        /**
         * public hideAll ����ȫ����tag
         * @param {number} index
         */
        hideAll:function (index, anim) {
            S.each(this.tagNodes, function (el) {
                el.hide();
            });
        },
        /**
         * public getTagNode ��ȡĳһ��tag,��������򷵻����е�tagNodes
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
KISSY.add("gallery/image-tagging/1.0/index",function(S, IT){
    return IT;
}, {
    requires:["./image-tagging"]
});
