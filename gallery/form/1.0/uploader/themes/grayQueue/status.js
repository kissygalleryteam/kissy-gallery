KISSY.add('gallery/form/1.0/uploader/themes/grayQueue/status',function(S, Node,ProgressBar, StatusBase) {
    var EMPTY = '',$ = Node.all;
    
    /**
     * @name GrayQueueStatus
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
            var self = this, tpl = self.get('tpl'),waitingTpl = tpl.waiting,
                uploader = self.get('uploader'),
                queue = self.get('queue'),
                file = self.get('file'),
                id = file.id,
                //所有文件大小
                total = uploader.get('total'),
                //等待上传的文件大小
                size = file.size,
                //刷新状态层内容
                $content = self._changeDom(waitingTpl),
                //删除图标元素
                $del = $content.children('.J_DelFile');
            //点击删除图标
            if($del.length){
                $del.on('click',function(ev){
                    //删除队列中的文件
                    queue.remove(id);
                    //文件总字节数需要减去该文件大小
                    total  -= size;
                    $('#J_TotalSize').text(StatusBase.convertByteSize(total));
                    uploader.set('total',total);
                })
            }
            //不存在文件大小，直接退出
            if(!size) return false;
            //如果不存在已经加载字节数，那么设置为0
            if(!total){
                total = size;
                uploader.set('loaded',0);
            }else{
                //总字节数加上当前文件字节数
                total += size;
            }
            //改变总字节数，StatusBase.convertByteSize方法，会将345345改成kb或mb单位显示
            $('#J_TotalSize').text(StatusBase.convertByteSize(total));
            uploader.set('total',total);
        },
        /**
         * 开始上传后改成状态层内容
         */
        _start : function(data) {
            var self = this, tpl = self.get('tpl'),startTpl = tpl.start,
                target = self.get('target'),
                uploader = self.get('uploader'),
                uploadType = uploader.get('type'),
                $content;
            if (!S.isString(startTpl)) return false;
            //改变状态层内容
            $content = self._changeDom(startTpl);
            //如果是ajax异步上传，加入进度显示
            if (uploadType == 'ajax') {
                var progressBar;
                //如果不存在进度条，先初始化进度条组件
                if(!uploader.get('progressBar')){
                    progressBar = new ProgressBar($('#J_ProgressBar'));
                    progressBar.render();
                    uploader.set('progressBar',progressBar);
                }
                //清零进度条
                uploader.get('progressBar').set('value',0);
                //将进度百分比设置为0%
                var $progressNum = $content.children('.J_ProgressNum');
                $progressNum.html("0%");
                self.set('elProgressNum',$progressNum);
            }
            //给li增加current-upload-file样式
            var $parent = target.parent();
            $parent.addClass('current-upload-file');
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
                //进度条
                proccessBar = uploader.get('progressBar'),
                //所有文件的字节总数
                allFileTotal = uploader.get('total'),
                //所有文件已经加载的字节数
                allFileLoaded = uploader.get('loaded'),
                $elProgressNum = self.get('elProgressNum');
            if(!$elProgressNum.length || proccessBar == EMPTY) return false;
            $elProgressNum.html(val + '%');
            //改变总进度显示
            loaded += allFileLoaded;
            val = Math.ceil(loaded/allFileTotal * 100);
            proccessBar.set('value',val);
            $('#J_TotalProgressNum').text(val + '%');
        },
        /**
         * 文件上传成功后
         */
        _success : function(){
            var self = this, tpl = self.get('tpl'),successTpl = tpl.success,
                //状态层容器
                target = self.get('target'),
                queue = self.get('queue'),
                file = self.get('file'),
                size = file.size,
                uploader = self.get('uploader'),
                loaded = uploader.get('loaded');
            if (!S.isString(successTpl)) return false;
            self._changeDom(successTpl);
            //删除li的current-upload-file样式
            var $parent = target.parent();
            $parent.removeClass('current-upload-file');
            if(!size) return false;
            //设置所有文件已经加载的字节数
            loaded += size;
            uploader.set('loaded',loaded);
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
}, {requires : ['node','../../plugins/progressBar/progressBar','../../queue/status']});