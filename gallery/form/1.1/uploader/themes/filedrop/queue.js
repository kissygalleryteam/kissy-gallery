KISSY.add('gallery/form/1.1/uploader/themes/filedrop/queue',function(S, Node, QueueBase, Status) {
    var EMPTY = '',$ = Node.all;

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

    Queue.event = QueueBase.event;
    Queue.status = Status.type;
    S.extend(Queue, QueueBase, /** @lends Queue.prototype*/{
        /**
         * 运行Status
         * @param {Object} file  文件数据
         * @return {Status} 状态实例
         */
        _renderStatus : function(file) {
            var self = this,$file = file.target,elStatus;
            if (!$file.length) return false;
            //状态层
            elStatus = $file.children('.J_FileStatus');
            //实例化状态类
            return new Status(elStatus, {queue : self,file : file});
        }
        /**
         * 向列表添加li元素（文件信息）
         * @param {Object} data 文件对象数据
         * @return {NodeList}
         */
        // _appendFileHtml:function (data) {
        //     var self = this, $target = self.get('target'),
        //         //文件信息显示模板
        //         tpl = self.get('tpl'),
        //         data1 = {},
        //         hFile = S.substitute(tpl, data);
        //         data1.name = data.name;
        //         data1.fileSize = data.fileSize;
        //         data1.fileId = data.id;
        //         hFile = S.substitute(tpl, data1);
        //         // console.log(data, hFile);
        //     return $(hFile).hide().appendTo($target).data('data-file', data);

        // },
    }, {ATTRS : /** @lends Queue*/{
        /**
         * 模板
         */
        tpl : {value :
            '<tr calss="upload-img">' + 
            '<td width="60%" class="img-name">{name}</td>' +
            '<td width="25%" class="img-size">{size}KB</td>' +
            '<td width="15%" class="img-operate J_FileStatus J_Delete"><a href="#" title="移除" data-id="{id}">移除</a></td>' +
            '</tr>'            
        },
        hook:{
            //状态
            STATUS:'.J_FileStatus'
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
