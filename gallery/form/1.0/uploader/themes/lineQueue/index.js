/**
 * @fileoverview 横排队列上传主题
 * @author 紫英（橘子）<daxingplay@gmail.com>
 * @date 2012-01-11
 */
KISSY.add('gallery/form/1.0/uploader/themes/lineQueue/index', function(S, Node, DefaultTheme, Queue){
	
	var $ = Node.all;
	
	function LineQueue(config){
		var self = this;
        //调用父类构造函数
        LineQueue.superclass.constructor.call(self, config);
	}
	
	S.extend(GrayQueue, DefaultTheme, /** @lends GrayQueue.prototype*/{
		
	})
	
	return LineQueue;
	
}, {
	requires: [
		'node',
		'../default/index',
		'./queue',
		'./style.css'
	]
});
