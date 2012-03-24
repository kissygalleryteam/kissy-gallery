KISSY.add('gallery/form/1.1/uploader/themes/filedrop/status', function(S, Node, StatusBase) {
    var $ = Node.all;

    var Status = function(target, config) {
        var self = this;
        config = S.merge({target:$(target)}, config);
        // console.log(config);
        Status.superclass.constructor.call(self, target, config);
    };

    Status.type = StatusBase.type;
    S.extend(Status, StatusBase, {
        _waiting: function(data) {
            console.log('waiting', data); 
            var self = this, tpl = self.get('tpl'),waitingTpl = tpl.waiting,
                uploader = self.get('uploader'),
                queue = self.get('queue'),
                //文件id
                file = self.get('file'),id = file.id,
                index = queue.getFileIndex(id),
                $content = self._changeDom(waitingTpl),
                $upload = $content.children('.J_FileDel');
            $upload.on('click',function(ev){
                ev.preventDefault();
                if (!S.isObject(uploader)) return false;
                queue.remove(id);
            });       
        }, 
        // _start: function(data) {
        //     // console.log('start', data);        
        // }, 
        // _progress: function(data) {
        //     // console.log('progress', data);        
        // }, 
        // _error: function(data) {
        //     console.log('error', data);        
        // },
         _success: function(data) {
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
                
                //删除队列中的文件
                queue.remove(id);
                
            },300);
            var $parent = target.parent();
            $parent.removeClass('current-upload-file');
        },
        _cancel: function(data) {

        }
    }, {
        ATTRS: {
            tpl: {value: {
                    waiting: '<div class="waiting-status"><a href="#fileDel" class="J_FileDel">删除</a></div>',
                    start: '<div class="start-status clearfix">' +
                                '<div class="f-l  J_ProgressBar uploader-progress"><img class="loading" src="http://img01.taobaocdn.com/tps/i1/T1F5tVXjRfXXXXXXXX-16-16.gif" alt="loading" /></div>' +
                                ' <a class="f-l J_UploadCancel upload-cancel" href="#uploadCancel">取消</a>' +
                            '</div> ',
                    progress: '',
                    success: '<div class="success-status"><a href="#fileDel" class="J_FileDel">上传成功</a></div>',
                    error: '<div class="error-status upload-error"><a href="#fileDel" class="J_FileDel">点此删除</a></div>',
            }}
        }
    });

    return Status;
},
{
    requires: ['node', '../../queue/status']
});
