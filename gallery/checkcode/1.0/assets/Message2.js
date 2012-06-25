/*
 * @name:消息组件 Message2
 * @description:重构Message DPL后的版本
 *      使用该组件是Message需遵循一定的命名约定：
 *          titile:.msg-tit
 *          content:.msg-cnt
 * @author:yanmu.wj@taobao.com
 * @date:2012-03-16
 * @param:
 *      msg[Selector|HTMLElement]:消息HTML Dom
 * @changelog:
 *      2012-04-28 新增从内容源获取内容
 */
KISSY.add('Message2',function(S){
    var $ = S.all;
    var Message2 = function(msg,source){
        this.msg = S.one(msg);
        this.title = this.msg && this.msg.one('.msg-tit');
        this.content = this.msg && this.msg.one('.msg-cnt');

        //内容源Object，不直接显示content，而是从源更新内容this.source[content]
        this.source = S.isPlainObject(source) ? source : null;

        this.type = this._getType();
    };
    var _Message2 = function(msg,source){
        return new Message2(msg,source);
    };
    S.augment(Message2,{
        change:function(type,cfg){
            if(!this.msg) return this;

            this.show();

            var type = type && type.toUpperCase() || '';
            switch(type){
                case 'OK':
                case 'ERROR':
                case 'TIPS':
                case 'NOTICE':
                case 'ATTENTION':
                case 'QUESTION':
                case 'STOP':
                    this._changeType(type);
                    break;
                default:break;
            }

            this.type = this._getType();
            this._changeText(cfg);

            return this;
        },
        _changeType:function(t){
            var cls = this.msg.attr('class'),
                rtype = /\bmsg-ok\b|\bmsg-error\b|\bmsg-tips\b|\bmsg-notice\b|\bmsg-attention\b|\bmsg-question\b|\bmsg-stop\b/g;
            if(cls.match(rtype)){
                this.msg.attr('class',cls.replace(rtype,'msg-'+t.toLowerCase()));
            }else{
                this.msg.addClass('msg-'+t.toLowerCase());
            }
        },
        _changeTitle:function(s){
            if(!this.title || !S.isString(s)) return;
            this.title.html(s);
        },
        _changeContent:function(s){
            if(!this.content || !S.isString(s)) return;
            this.content.html(this.source ? this.source[s] || '' : s);
        },
        _changeText:function(cfg){
            /*
             * 如果传入对象 title = cfg.title,content = cfg.content
             * 如果传入字符串 content = cfg
             */
            var _title = S.isObject(cfg) && S.isString(cfg.title) ? cfg.title : '',
                _content = S.isObject(cfg) && S.isString(cfg.content) ? cfg.content : (S.isString(cfg) ? cfg : '');

            this._changeTitle(_title);
            this._changeContent(_content);

            //如果没有内容切换到weak模式
            if(!_title && !_content && this.msg){
                this.msg.addClass('msg-weak');
            }
        },
        ok:function(cfg){
            this.change('ok',cfg);
            return this;
        },
        error:function(cfg){
            this.change('error',cfg);
            return this;
        },
        tips:function(cfg){
            this.change('tips',cfg);
            return this;
        },
        notice:function(cfg){
            this.change('notice',cfg);
            return this;
        },
        attention:function(cfg){
            this.change('attention',cfg);
            return this;
        },
        question:function(cfg){
            this.change('question',cfg);
            return this;
        },
        stop:function(cfg){
            this.change('stop',cfg);
            return this;
        },
        weak:function(){
            this.msg.replaceClass('msg','msg-weak');
            this.msg.replaceClass('msg-b','msg-b-weak');
        },
        _getType:function(){
            var type = '',
                cls = this.msg.attr('class');

            if(cls.match(/\bmsg-(b-)?error\b/)){
                type = 'ERROR';
            }else if(cls.match(/\bmsg-(b-)?-tips\b/)){
                type = 'TIPS';
            }else if(cls.match(/\bmsg-(b-)?-attention\b/)){
                type = 'ATTENTION';
            }else if(cls.match(/\bmsg-(b-)?-notice\b/)){
                type = 'NOTICE';
            }else if(cls.match(/msg-ok|msg-b-ok/)){
                type = 'OK';
            }else if(cls.match(/\bmsg-(b-)?-question\b/)){
                type = 'QUESTION';
            }else if(cls.match(/\bmsg-(b-)?-stop\b/)){
                type = 'STOP';
            }

            return type;
        },
        isHide:function(){
            return this.msg.css('visibility') == 'hidden' || this.msg.css('display') == 'none';
        },
        hide:function(){
            this.msg.css('visibility','hidden').removeClass('show').addClass('hide');
            return this;
        },
        show:function(){
            this.msg.css('visibility','visible').removeClass('hide').addClass('show');
            return this;
        },
        laterHide:function(timeout){
            S.later(this.hide,timeout,false,this);
            return this;
        }
    })

    return _Message2;
});
