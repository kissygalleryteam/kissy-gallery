/**
 * 二手模板队列处理
 * @author 紫英(橘子)<daxingplay@gmail.com>
 */
KISSY.add('gallery/form/1.0/uploader/themes/lineQueue/queue',function(S, Node, QueueBase, Status) {
    var EMPTY = '',
    	$ = Node.all,
    	LOG_PRE = '[LineQueue:queue] ';

    /**
     * @name Queue
     * @class 模板的队列类
     * @constructor
     * @extends Base
     * @requires Node
     */
    function Queue(config) {
        var self = this;
        //调用父类构造函数
        Queue.superclass.constructor.call(self, config);
    }
    S.extend(Queue, QueueBase, /** @lends Queue.prototype*/{
        /**
         * 运行Status
         * @param {Object} file  文件数据
         * @return {Status} 状态实例
         */
        _renderStatus : function(file) {
            var self = this,
            	file = file.target,
            	elStatus;
            if (!file.length){
            	S.log(LOG_PRE + 'Cannot get file data.');
            	return false;
            };
            // S.log(file, 'dir');
            //状态层
            elStatus = file.children('.J_FileStatus');
            //实例化状态类
            return new Status(elStatus, {
            	queue : self,
            	file : file
        	});
        }
    }, {ATTRS : /** @lends Queue*/{
        /**
         * 模板
         */
        tpl: {
        	value: ['<li id="J_LineQueue-{id}" data-file-id="{id}" data-url="{sUrl}" data-name="{name}" data-size="{textSize}">',
						'<div class="J_Wrapper wrapper">',
							'<div class="tb-pic120">',
								'<a href="javascript:void(0);"><img class="J_ItemPic" src="{sUrl}" /></a>',
							'</div>',
							'<div class="pic-mask"></div>',
							'<div class="tips-uploading"><div class="progress-bar J_ProgressBar"><span class="progress-mask J_UploadingProgress"></span></div><p class="tips-text">上传中，请稍候</p></div>',
							'<div class="tips-upload-success"><span class="progress-bar"></span><p class="tips-text">上传成功！</p></div>',
							'<div class="tips-upload-error"><span class="progress-bar"></span><p>上传失败</p><p>请重新尝试！</p></div>',
							'<div class="tips-upload-waiting">等待上传，请稍候</div>',
							'<div class="upload-op-mask"></div>',
							'<div class="upload-operations">',
								'<a class="J_SetMainPic set-as-main" data-file-id="{id}" href="#">设为主图</a>',
								'<a class="J_DeleltePic del-pic" data-file-id="{id}" href="#">删除</a>',
							'</div>',
						'</div>',
					'</li>'].join('')
        }
    }});
    return Queue;
}, {
	requires : [
		'node',
		'../../queue/base',
		'./status'
	]
});