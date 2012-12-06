/**
 * @fileoverview MultiSelect
 * @desc 模拟MultiSelect的功能，能排除已选择的项，有单选，全选的功能。
 * @author 常胤<satans17@gmail.com>
 */
 


KISSY.add('gallery/couple-select/1.0/couple-select', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event,
        DOT = '.',
		
		ATTR_ID = 'data-id',

        EVENT_ADD = 'add',
        EVENT_REMOVE = 'remove',
        EVENT_CHANGE = 'change',

        CLS_SOURCE = "source",
        CLS_TARGET = "target",
        CLS_OPTION = 'option',
		CLS_SELECT = 'select',
		CLS_SELECTED = "selected";

    /**
	 * 复选框
	 * @param {String} [triggerCls = 'S_ViewCode'] 触发元素的class。注释具体格式参见jsdoc规范。
	 * @return
	 */
    function Coupleselect(container, config){
	
        var self = this;

        config = S.merge(Coupleselect.Config, config);
		
        /**
         * the container of widget
         * @type HTMLElement
         */
        self.container = S.get(container);

        /**
         * 配置参数
         * @type Object
         */
        self.config = config;

        self._init();
    }
	

    
    S.augment(Coupleselect, S.EventTarget, {

        /**
         * init Coupleselect
         */
        _init: function() {
            var self = this, cfg = self.config;
			
			self.source = S.get(DOT+CLS_SOURCE,self.container);
			self.target = S.get(DOT+CLS_TARGET,self.container);
			self.options = S.query(DOT+CLS_OPTION,self.source);
			
			//初始化source中所有的option
			S.each(self.options, function(item){
				//给option绑定事件
				self._sourceOptionEvent(item);
				
				//向target中增加默认选中的option
				if(DOM.hasClass(item,CLS_SELECTED)){
					self.addOption(item);
				}
			});
			
			//绑定按钮事件
			self._bindButtonEvent();
        },
		
		/**
		 * 增加option
		 * @param {Object} option
		 */
		addOption: function(option){
			var self = this, newel = option.cloneNode(true);
			
			//隐藏当前option并且标记为已选择
			DOM.hide(option);
			DOM.addClass(option,CLS_SELECTED);
			
			//给target.option绑定事件
			self._targetOptionEvent(newel);
			//增加至target中
			self.target.appendChild(newel);
			
			self.fire(EVENT_ADD,{
				target: newel,
				id: DOM.attr(newel,ATTR_ID),
				text: DOM.text(newel)
			});	
			self.fire(EVENT_CHANGE,{
				selected: self.getSelected()
			});
		},
		
		/**
		 * 移除option
		 * @param {Object} option
		 */
		removeOption: function(option){
			var self= this, id = DOM.attr(option,ATTR_ID),
				text = DOM.text(option);
				
			//console.log(option);
			//在target中移除此option
			option.parentNode.removeChild(option);

			//将source中对应的option显示出来，并且去掉已选择标记
			S.each(self.options,function(el){
				if(DOM.attr(el,ATTR_ID)==id){
					DOM.show(el);
					DOM.removeClass(el,CLS_SELECTED);
					return false;
				}
			});
			
			self.fire(EVENT_REMOVE,{
				id: id,
				text: text
			});	
			self.fire(EVENT_CHANGE,{
				selected: self.getSelected()
			});
			

			
		},
		
		/**
		 * 增加option
		 * @param {Object} all
		 */
		add: function(selector){
			var self= this;
				options = selector? S.filter(self.options,function(el){
					return DOM.hasClass(el,CLS_SELECT);
				}) : S.filter(self.options,function(el){
					return el.style.display != "none";
				});	
				
			S.each(options,function(el){
				DOM.removeClass(el,CLS_SELECT);
				self.addOption(el);
			});
		},
		
		/**
		 * 移除option
		 * @param {Object} all
		 */
		remove: function(selector){
			var self= this, allselected = S.query(".option",self.target),
				options = selector? S.filter(allselected,function(el){
					return DOM.hasClass(el,CLS_SELECT);
				}) : allselected;
			
			S.each(options,function(el){
				DOM.removeClass(el,CLS_SELECT);
				self.removeOption(el);
			});
		},
		
		/**
		 * 获取所有已选择的
		 */
		getSelected: function(){
			var self = this,selected = [];
			S.each(S.query(DOT+CLS_OPTION,self.target),function(item){
				selected.push([DOM.attr(item,ATTR_ID),DOM.text(item)]);
			});
			return selected;
		},
		
		/**
		 * 给source.option绑定事件
		 */
		_sourceOptionEvent: function(option){
			var self = this;
			//给option绑定事件
			//单击选中/取消选中
			Event.on(option,"click",function(ev){
				DOM.toggleClass(option,CLS_SELECT);
			});
			//双击增加option
			Event.on(option,"dblclick",function(ev){
				self.addOption(option)
			})
		},
		
		/**
		 * 给target.option绑定事件
		 */
		_targetOptionEvent: function(option){
			var self = this;
			//单击选中/取消选中
			Event.on(option,"click",function(ev){
				DOM.toggleClass(option,CLS_SELECT);
			});
			//双击增加option
			Event.on(option,"dblclick",function(ev){
				self.removeOption(option)
			})
		},
		
		/**
		 * 绑定按钮事件
		 *  - button.add: 增加
		 *  - button.remove：移除
		 *  - button.addall：增加所有
		 *  - button.removeall:移除所有
		 */
		_bindButtonEvent: function(){
			var self = this;
			
			//btn.add
			Event.on(S.query(".J_add",self.container),"click",function(ev){
				self.add(DOT+CLS_SELECT);
			});
			
			//btn.remove
			Event.on(S.query(".J_remove",self.container),"click",function(ev){
				self.remove(DOT+CLS_SELECT);
			});
			
			//btn.add
			Event.on(S.query(".J_addall",self.container),"click",function(ev){
				self.add();
			});
			
			//btn.remove
			Event.on(S.query(".J_removeall",self.container),"click",function(ev){
				self.remove();
			});
		}
		
		
	});

    return Coupleselect;
});KISSY.add("gallery/couple-select/1.0/index",function(S, CS){
    return CS;
}, {
    requires:["./couple-select"]
});
