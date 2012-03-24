KISSY.add('gallery/form/1.0/uploader/themes/grayQueue/queue',function(S, Node, QueueBase, Status) {
    var EMPTY = '',$ = Node.all;

    /**
     * @name grayQueueQueue
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
            var self = this,$file = file.target,elStatus;
            if (!$file.length) return false;
            //状态层
            elStatus = $file.children('.J_FileStatus');
            //实例化状态类
            return new Status(elStatus, {queue : self,file : file});
        }
    }, {ATTRS : /** @lends Queue*/{
        /**
         * 模板
         */
        tpl : {value :
            '<li id="queue-file-{id}" class="clearfix queue-file" data-name="{name}">' +
                '<div class="f-l file-name">{name}</div>' +
                '<div class="f-r file-status J_FileStatus">0%</div>' +
                '<div class="f-r file-size">{textSize}</div>' +
                '</li>'
        }
    }});
    return Queue;
}, {requires : ['node','../../queue/base','./status']});