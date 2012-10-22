/**
 * 省市区联动
 * @author 常胤<changyin@taobao.com>
 *
 */
KISSY.add("gallery/province/1.0/index",function(S, undefined){
		
	var DOM = S.DOM, Event = S.Event,
		cfg = {
			autoRender:true,
			defval: {
				text: "请选择", val: ""
			},
			rootid: 0
		};
	
	function LinkSelect(selects,data,config){
		var self = this;
		
		//默认配置
		self.config = S.merge(cfg,config||{});
	
		//select对象管理类
		self.selManager = new selManager()
		
		//初始数据集
		self.data = data;

		//初始化所有select对象
		S.each(selects,function(item,index){
			item = DOM.get(item);
			if(item){
				var objsel = self.selManager.add(item,index);
				Event.on(item,"change",function(ev){
					self._change(ev);
				})
			}
		});
		
		
		if(self.config.autoRender==true){
			var sel = self.selManager.get(0);
			if(!sel)return;
			self._render(sel,config.rootid);
			if(self.selManager.get(1)){
				self.focus(sel[0],self.getValue(sel[0]));
			}
		}

		
	}
	
	
	S.augment(LinkSelect,S.EventTarget,{
	
		//获取option的值
		getValue: function(el){
			//return (el && el.options)?(el.options[el.selectedIndex]?el.options[el.selectedIndex].value:""):"";
			if(el && el.options && el.options.length>0 && el.selectedIndex>0){
				return el.options[el.selectedIndex].value;
			}else{
				return null;
			}
		},
	
		//向前渲染
		_forward: function(el,val){
			
			var self = this,
				backEl = self.selManager.get(el);
			if(backEl){
				var thisEl = self.selManager.get(backEl.index+1);
				if(thisEl) {
					self._render(thisEl,val);
				}else{
					return;
				}
				self._forward(thisEl[0], self.getValue(thisEl[0]));
			}else{
				return;
			}
		},
		
		//向后渲染
		_backward: function(el,val){
			var self = this
				pid = self.data[val]?self.data[val][1]:null,
				forwardEl = self.selManager.get(el);

			if(forwardEl && pid){
				var thisEl = self.selManager.get(forwardEl.index-1),
					ppid = self.data[pid]?self.data[pid][1]:null;
				
				if(thisEl && pid) {
					self._render(thisEl,ppid,pid);
				}else{
					return;
				}
				
				self._backward(thisEl[0], self.getValue(thisEl[0]));
				
				
			}else{
				return;
			}

		},
	
		//select onchange事件
		_change: function(ev) {
			var self = this,
				tg = ev.target,
				thisEl = self.selManager.get(tg);

			self._forward(tg,DOM.val(tg));
		},

		
		_getData: function(objsel,pid){
			var self = this, remote = self.config.remote, options = [];
			
			if(pid===-1  || pid==="" || !objsel.data)
				return;
			
			//数据已经初始化
			if(objsel.data[pid]){
				return objsel.data[pid];
			}
			
			//数据没有初始化
			var tdata = objsel.data[pid] = [];
			
			
			//远程数据
			if(remote) {
				if(pid===0 && self.data.length>0)return;
				S.io({
					type: "POST",
					url: remote.url,
					dataType: "json",
					data: {
						parent: pid
					},
					success: function(data , textStatus , xhrObj){
						S.each(data.data,function(item){
							tdata.push([item[1],item[0]]);
						});
						self._render(objsel,pid);
					},
					error: function(data, textStatus, xhrObj){
						S.log(d, textStatus, xhrObj);
					}
				});
			}
			
			//本地数据
			S.each(self.data, function(item,key){
				// if(item.parent == pid){
					// tdata.push([key,item.text]);
					//delete self.data[key];
					// options.push([key,item.text]);
				// }
				if(item[1]==pid){
					tdata.push([key,item[0]]);
					//delete self.data[key];
					options.push([key,item[0]]);
				}
			});
			
			return options;
		},
		
			
		_render: function(objsel,pid,val) {
			var self = this, cfg = self.config, sel = objsel["0"],
				options = self._getData(objsel,pid) || [];
			
			if(!sel) return;
			
			//clear
			sel.options.length=0;
			
			//default tip
			if(options && options.length>0 && cfg.defval){
				sel.options[sel.options.length] = new Option(cfg.defval.text,cfg.defval.val);
			}
				
			//add all option
			S.each(options,function(item){
					//sel.add(new Option(item[1],item[0]),null); 
					sel.options[sel.options.length] = new Option(item[1],item[0]); 
			});
			
			if(val){
				sel.value=val;
			}

		},
		
		focus: function(sel,val){
			var self = this,
				thisEl = self.selManager.get(sel),
				pid = self.data[val]?self.data[val][1]:null;
			
			if(!pid)return;
			

			self._render(thisEl,pid,val);
			self._forward(sel,val);
			self._backward(sel,val);
		}

	
	});

	
	function selManager(){
		var store = [];
		this.add = function(item,index){
			var l = store.length;
			store[l] = {
				"index": index,
				"0": item,
				"data": {}
			};
			return store[l];
		};
		this.get = function(sel){
			var obj = null;
			if(S.isNumber(sel) && sel<=store.length){
				return store[sel];
			}
			S.each(store,function(item){
				if(item["0"]==sel){
					obj = item;
					return false;
				}
			});
			return obj;
		};
	}
	
	return LinkSelect;

});
