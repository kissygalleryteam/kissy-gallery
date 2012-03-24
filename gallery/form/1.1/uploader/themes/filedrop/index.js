KISSY.add('gallery/form/1.0/uploader/themes/filedrop/index', function(S, Node, DefaultTheme, Queue, FD, Template){
    var $ = Node.all,
        UA = S.UA;

    var FileDrop = function(config) {
        var self = this;
        self.set('queueTarget', config.queueTarget);
        // console.log(config.dropArea);
        self.set('target', config.target);
        FileDrop.superclass.constructor.call(self, config);
    };
    
    S.extend(FileDrop, DefaultTheme, {
        _init: function() {
            var self = this,
				queueTarget = self.get('queueTarget'),
				queue;
            queue = new Queue(queueTarget);
            self.set('queue',queue);
            // console.log('feilv filedrop init');
        },
        afterUploaderRender: function(uploader) {
            var self = this,
                // queueTarget = self.get('queueTarget'),
                // im = new ImgManager(self.get('imgManagerCfg')),
                queue= self.get('queue'),
                uploadBar = $(self.get('uploadBarCls')),
                doUploadBtn = $(self.get('doUploadBtn')),
                clearListBtn = $(self.get('clearListBtn')),
                imgList = $(self.get('queueTarget')),
                fileDrop;
            // im.render();
            // self.set('imgManager', im);
            // queue = new Queue(queueTarget);
            // self.set('queue', queue);
            self.set('uploader', uploader);
            // console.log(queue);
            fileDrop = new FD({target: self.get('target')});

            fileDrop.on('afterRender', function(ev) {
                 // console.log('fileDrop after render', ev, $(self.get('target')));
                var buttonTarget = $(self.get('target'));
                // console.log(uploader.get('buttonTarget'));
                buttonTarget.appendTo(ev.buttonTarget);
            });

            fileDrop.render();
            self._displayUploadBar();
            fileDrop.on('afterdrop', function(ev) {
                // console.log('afterdrop', ev);
                queue.add(ev.files);
            });

            uploadBar.delegate('click', self.get('doUploadBtn'), function(ev) {
                ev.preventDefault();
                // console.log('do upload');
                uploader.uploadFiles('waiting');
            });

            uploadBar.delegate('click', self.get('clearListBtn'), function(ev) {
                ev.preventDefault();
                console.log('clear list');
                queue.clear();
            });

            // imgList.delegate('click', '.J_Delete', function(ev) {
            //     ev.preventDefault();
            //     var target = $(ev.target),
            //         imgId = target.attr('data-id');
            //     queue.remove(imgId);
            // });

            queue.on('add', function(ev) {
                // console.log('add', ev, queue.get('files'));
                // uploader.upload(0);
                //self._createImgInfo(ev.file);
                self._displayList();
                self._displayUploadBar();
            });

            queue.on('remove clear', function(ev) {
                // console.log(ev);
                self._displayList();
                self._displayUploadBar();
            });

            uploader.on('success', function(ev) {
                // var fileId = ev.file.id,index = queue.getFileIndex(fileId);
                // console.log('queue file length:', queue.getFiles('waiting').length);
                // im.addImg(ev.result.data);
                self._displayList();
                self._displayUploadBar();
            });

            uploader.on('complete', function(ev) {
                // console.log('uploader complete:');
                // var waitings = queue.getFiles('waiting'),
                //     errors = queue.getFiles('error'),
                //     successs = queue.getFiles('success');
                // console.log(waitings.length, errors.length, successs.length);
                self._displayUploadBar();
            });
        },
        _displayList: function(b) {
            var self = this,
                queue = self.get('queue'),
                waitings = queue.getFiles('waiting'),
                uploaderContent = $(self.get('uploaderContent'));
            // console.log(uploaderContent);
            uploaderContent[waitings.length ? 'addClass': 'removeClass']('uploader-content-hasList');
        },
        _getUploadResult: function() {
            var queue = this.get('queue'),
                waitingLen = queue.getFiles('waiting').length,
                errorLen = queue.getFiles('error').length,
                successLen = queue.getFiles('success').length,
                data = {};
            data.fileLen = queue.get('files').length;
            data.errorLen = errorLen;
            data.waitingLen = waitingLen;
            data.successLen = successLen;
            return data;
        },
        _displayUploadBar: function() {
            var self = this,
                data = self._getUploadResult(),
                tmp = self.get('uploadBarTmp'),
                operateBar = $(self.get('uploadBarCls'));
            if(!data.fileLen) {
                tmp = tmp['start'];
                // tmp = tmp[data.success ? 'complete' : 'waiting'];
            }else if(!data.waitingLen && data.successLen) {
                tmp = tmp['complete'];
            }else if(data.waitingLen || data.errorLen) {
                tmp = tmp['waiting'];
            }
            operateBar.html('');
            // console.log(tmp, data, Template(tmp).render(data));
            operateBar.append(Template(tmp).render(data));
        }
    }, {
        ATTRS: {
            dropArea: {value: ''},
            uploadBarTmp: {
                value: {
                    start: '<div class="upload-status-info info-item">' + 
                                '请选择图片' +
                            '</div>',
                    waiting: '<div class="upload-status-info info-item">' + 
                                '已添加{{waitingLen}}张图片到列表' +
                                '{{#if errorLen}}，失败{{errorLen}}张{{/if}}' + 
                            '</div>' + 
                            '<div class="upload-list-operate info-item">' + 
                                '<a href="#" class="do-upload J_DoUpload">确认上传</a>&nbsp;&nbsp;&nbsp;&nbsp;' + 
                                '<a href="#" class="clear-upload-list J_ClearUploadList">清除</a>' + 
                            '</div>',
                    complete: '<div class="upload-status-info info-item">' + 
                                '已成功上传<em class="upload-count">{{successLen}}张</em>' + 
                                ' 您可以拖拽图片调整顺序，选择单个或鼠标框选多个图片复制链接。' + 
                            '</div>'
                }
            }       
        }
    });

    return FileDrop;
}, 
{
    requires: ['node', '../default/index', './queue', '../../plugins/filedrop/filedrop', 'template']
});
