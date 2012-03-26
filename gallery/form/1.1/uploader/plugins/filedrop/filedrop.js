/**
 * @fileoverview  文件拖拽上传插件
 *  @author 飞绿
 */
KISSY.add('gallery/form/1.1/uploader/plugins/filedrop/filedrop', function (S, Node, Base) {
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
            if(mode != 'supportDrop'){
                S.log('该浏览器不支持拖拽上传！');
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
            console.log('after randeer');
            // self.fire('afterRender', {'buttonWrap': self.get('buttonWrap'), 'config': {'tpl' : self.get('btnTpl')}});
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
