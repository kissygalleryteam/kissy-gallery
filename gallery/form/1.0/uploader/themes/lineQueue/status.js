/**
 * 二手模板状态处理
 * @author 紫英(橘子)<daxingplay@gmail.com>
 */
KISSY.add('gallery/form/1.0/uploader/themes/lineQueue/status',function(S, Node, StatusBase, ProgressBar) {
    var $ = Node.all,
    	LOG_PRE = '[LineQueue: status] ';
    
    /**
     * @name LineQueueStatus
     * @class 状态类
     * @constructor
     * @extends Base
     * @requires Node
     */
    function Status(target, config) {
        var self = this;
        //调用父类构造函数
        Status.superclass.constructor.call(self,target, config);
        self.set('target', $(target));
    }
    Status.type = StatusBase.type;
    S.extend(Status, StatusBase, /** @lends Status.prototype*/{
        /**
         * 等待上传时状态层内容
         */
        _waiting : function() {
            var self = this, 
                uploader = self.get('uploader'),
                queue = self.get('queue'),
                fileContainer = self.get('file'),
                id = $(fileContainer).attr('data-file-id');
            //不存在文件大小，直接退出
            if(fileContainer.length <= 0){
            	S.log(LOG_PRE + 'Cannot find this file');
            	return false;
            }
            $(fileContainer).addClass('upload-waiting');
        },
        /**
         * 开始上传后改成状态层内容
         */
        _start : function(data) {
            var self = this, 
            	// tpl = self.get('tpl'),
            	// startTpl = tpl.start,
                target = self.get('target'),
                uploader = self.get('uploader'),
                curQueueItem = self.get('file'),
                uploadType = uploader.get('type');
            $(curQueueItem).replaceClass('upload-waiting', 'uploading');
            //如果是ajax异步上传，加入进度显示
            if (uploadType == 'ajax') {
                var progressContainer = $('.J_ProgressBar', curQueueItem),
                	progressBar = $('.J_UploadingProgress', progressContainer);
                self.set('progressBar', progressBar);
                // var	progressBar = new ProgressBar(progressContainer);
                // progressBar.set('width', $(progressContainer).width());
                // progressBar.set('tpl', '<span class="progress-mask J_UploadingProgress" style="width: {value}; "></span>')
                // progressBar.render();
                // progressBar.set('value', '100');
                // self.set('progressBar', progressBar);
            }
        },
        /**
         * 正在上传时候刷新状态层的内容
         * @param data
         */
        _progress : function(data){
            var self = this,
                //已经加载的字节数
                loaded = data.loaded,
                //当前文件字节总数
                total = data.total,
                //百分比
                val = Math.ceil(loaded/total * 100),
                uploader = self.get('uploader'),
                // fileContainer = self.get('file'),
                // id = $(fileContainer).attr('id'),
                //进度条
                progressBar = self.get('progressBar');
            if(!progressBar){
            	S.log(LOG_PRE + 'Cannot find progress bar');
            	return false;
            };
            // progressBar.set('value', (100 - val));
            $(progressBar).width(100 - val + '%');
        },
        /**
         * 文件上传成功后
         */
        _success : function(){
            var self = this, 
                curQueueItem = self.get('file'),
                uploader = self.get('uploader'),
                loaded = uploader.get('loaded');
            $(curQueueItem).replaceClass('uploading', 'upload-success');
            setTimeout(function(){
            	$(curQueueItem).replaceClass('upload-success', 'upload-done');
            	
				// D.attr(curQueueItem, 'data-url', fileUrl);
				// if(!mainPic){
					// AjaxUploader.setMainPic(curQueueItem);
				// }
			}, 1000);
			// S.log(uploader.get('queue'), 'dir');
        },
        _restore: function(){
       		var self = this, 
                curQueueItem = self.get('file'),
                uploader = self.get('uploader'),
                loaded = uploader.get('loaded'),
                message = uploader.get('message');
            $(curQueueItem).replaceClass('upload-waiting', 'upload-done');
        },
        /**
         * 上传失败后改成状态层内容
         */
        _error : function(data) {
            if(!S.isObject(data) || !data.msg){
                data = {
                	msg : '文件上传失败！'
            	};
            }
            var self = this, 
                curQueueItem = self.get('file'),
                id = $(curQueueItem).attr('data-file-id'),
                uploader = self.get('uploader'),
                queue = self.get('queue'),
                message = uploader.get('message');
            message.send(data.msg, 'error');
            $(curQueueItem).replaceClass('uploading', 'upload-error');
            setTimeout(function(){
            	queue.remove(id);
				// $(curQueueItem).remove();
			}, 1000);
        }
    }, {ATTRS : /** @lends Status*/{
        /**
         * 模板
         */
        tpl : {value : {
            waiting : '<div class="clearfix"><div class="f-l">0%</div><div class="f-l uploader-icon del-icon J_DelFile"></div></div>',
            start : '<div class="clearfix"><div class="J_ProgressNum"><img class="loading" src="http://img01.taobaocdn.com/tps/i1/T1F5tVXjRfXXXXXXXX-16-16.gif" alt="loading" /></div>' +
                '</div> ',
            success : '<div class="uploader-icon success-icon">100%</div>',
            cancel : '<div>已经取消上传，<a href="#reUpload" class="J_ReUpload">点此重新上传</a> </div>',
            error : '<div class="upload-error">{msg}<a href="#fileDel" class="J_FileDel">点此删除</a></div>'
        }
        }
    }});
    return Status;
}, {
	requires : [
		'node',
		// '../../queue/progressBar',
		'../../queue/status',
		'../../plugins/progressBar/progressBar'
	]
});