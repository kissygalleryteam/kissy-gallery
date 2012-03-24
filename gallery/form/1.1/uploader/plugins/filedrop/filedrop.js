/**
 *
 */
KISSY.add('gallery/form/1.1/uploader/plugins/filedrop/filedrop', function(S, Node, Base) {
    var EMPTY = '',
        $ = Node.all,
        UA = S.UA;

    var FileDrop = function(config) {
        var self = this;
        // console.log(config);
        FileDrop.superclass.constructor.call(self, config);
//        console.log($(config.target), self.get('target'));
        self.set('mode', getMode());
    };

    var getMode = function() {
        if(UA.webkit >= 7 || UA.firefox >= 3.6 ) {
            return 'supportDrop';
        }
        if(UQ.ie) {
            return 'notSupportDropIe';
        }
        if(UA.webkit < 7 || UA.firefox < 3.6) {
            return 'notSupportDrop';
        }
    };
    
    S.mix(FileDrop, {
        event: {
            'AFTER_DROP': 'afterdrop'       
        }
    });

    S.extend(FileDrop, Base, {
        render: function() {
//            console.log('render', this.get('target'));        
            var self = this;
            self._createDropArea();
            console.log('after randeer');
            // self.fire('afterRender', {'buttonWrap': self.get('buttonWrap'), 'config': {'tpl' : self.get('btnTpl')}});
            self.fire('afterRender', {'buttonTarget': self.get('buttonWrap')});
        },
        /**
         * 显示拖拽区域
         */
        show: function() {
            var self = this,
                dropContainer = self.get('dropContainer');
            dropContainer.show();
        },
        /**
         * 隐藏拖拽区域
         */
        hide: function() {
            var self = this,
                dropContainer = self.get('dropContainer');
            dropContainer.hide();
        },
        /**
         * ?
         */
        reset: function() {},
        /**
         * 创建拖拽区域
         */
        _createDropArea: function() {
            var self = this,
                target = $(self.get('target')),
                mode = self.get('mode'),
                html = S.substitute(self.get('tpl')[mode], {name: self.get('name')}),
                dropContainer = $(html), 
                buttonWrap = dropContainer.all('.J_ButtonWrap');
            // console.log(buttonWrap);
            dropContainer.insertAfter(target);
            dropContainer.on('dragover', function(ev) {
                ev.stopPropagation();
                ev.preventDefault();
            });
            dropContainer.on('drop', function(ev) {
                ev.stopPropagation();
                ev.preventDefault();
                self._dropHandler(ev);
            });
            self.set('dropContainer', dropContainer);
            self.set('buttonWrap', buttonWrap);
        },
        /**
         * 处理拖拽时间 
         */
        _dropHandler: function(ev) {
            console.log('handler');
            var self = this,
                event = FileDrop.event,
                fileList = ev.originalEvent.dataTransfer.files,
                files = [];
//            console.log(fileList.length);
            if(fileList.lenght == 0) {return;}

            S.each(fileList, function(f) {
                if(S.isObject(f)) {
                    files.push({'name' : f.name, 'type': f.type, 'size': f.size, 'input': {files:[f]}});
                }
            });
            self.fire(event.AFTER_DROP, {files: files});
        },
        _setDisabled: function() {}
    }, {
        ATTRS: {
            target: {
                value: null        
            },       
            fileInput: {
                value: EMPTY           
            },
            dropContainer: {
                value: EMPTY               
            },
            tpl: {
                value: {
                    supportDrop: '<div class="drop-wrapper">' + 
                                    '<p>直接拖拽图片到这里，</p>' + 
                                    '<p class="J_ButtonWrap">或者' + 
                                    '</p>' +
                                '</div>',
                    notSupportDropIe: '<div class="drop-wrapper">' + 
                                        '<p>您的浏览器只支持传统的图片上传，</p>' + 
                                        '<p class="suggest J_ButtonWrap">推荐使用chrome浏览器或firefox浏览器' + 
                                        '</p>' + 
                                    '</div>',
                    notSupportDrop: '<div class="drop-wrapper">' + 
                                        '<p>您的浏览器只支持传统的图片上传，</p>' + 
                                        '<p class="suggest J_ButtonWrap">推荐升级您的浏览器' + 
                                        '</p>' +
                                    '</div>'
                }
            },
            btnTpl: {
                value: '<input type="file" name="dropFile" hidefoucs="true" class="file-input" />'
            },
            name: {
                value: '',
                setter: function(v) {
                }
            },
            disabled: {
                value: false,
                setter: function(v) {
                    this._setDisabled(v);
                    return v;
                }
            },
            cls: {
                disabled: 'drop-area-disabled'
            }
        }
    });

    return FileDrop;
}, {requires: ['node', 'base']});
