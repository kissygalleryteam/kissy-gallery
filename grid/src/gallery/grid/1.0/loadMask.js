KISSY.add("gallery/grid/1.0/loadMask",function(S,util){	

	/** 
		@exports S.LP as KISSY.LP
	*/

	/**
	* 屏蔽指定元素，并显示加载信息
	* @memberOf S.LP
	* @class 加载屏蔽类
	* @property {String|DOM|Node} el 要屏蔽的元素，选择器、Dom元素或Node元素
	* @param {String|DOM|Node} element 要屏蔽的元素，选择器、Dom元素或Node元素
	* @param {Object} config 配置信息<br>
	* 1) msg :加载时显示的加载信息<br>
	* 2) msgCls : 加载时显示信息的样式
	*/
    var LoadMask = function (element, config) {
		var _self = this;
		
        _self.el = element;
		LoadMask.superclass.constructor.call(_self, config);
		_self._init();
    };

	S.extend(LoadMask, S.Base);
    //对象原型
    S.augment(LoadMask, 
	/** @lends S.LP.LoadMask.prototype */	
	{
		/**
		* 加载时显示的加载信息
		* @field 
		* @default Loading...
		*/
        msg: 'Loading...',
		/**
		* 加载时显示的加载信息的样式
		* @field
		* @default x-mask-loading
		*/
        msgCls: 'x-mask-loading',
		/**
		* 加载控件是否禁用
		* @type Boolean
		* @field
		* @default false
		*/
        disabled: false,
		_init:function(){
			var _self =this;
			_self.msg = _self.get('msg')|| _self.msg;
		},
        /**
		* @description 设置控件不可用
		*/
        disable: function () {
            this.disabled = true;
        },
        /**
		* @private 设置控件可用
		*/
        enable: function () {
            this.disabled = false;
        },

        /**
		* @private 加载已经完毕，解除屏蔽
		*/ 
        onLoad: function () {
            util.unmaskElement(this.el);
        },

        /**
		* @private 开始加载，屏蔽当前元素
		*/ 
        onBeforeLoad: function () {
            if (!this.disabled) {
                util.maskElement(this.el, this.msg, this.msgCls);

            }
        },
        /**
        * 显示加载条，并遮盖元素
        */
        show: function () {
            this.onBeforeLoad();
        },

        /**
        * 隐藏加载条，并解除遮盖元素
        */
        hide: function () {
            this.onLoad();
        },

        /*
		* 清理资源
		*/
        destroy: function () {
			this.el = null;   
        }
    });

	S.LP.LoadMask = LoadMask;

	return LoadMask;
}, {requires : ["./util"]});