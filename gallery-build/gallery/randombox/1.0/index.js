/**
 * NOTE RandomBox 模拟摇奖器
 * @author wb-huxiaoqi
 */
	
	KISSY.add("gallery/randombox/1.0/index",function(S){
	    var $ = S.all,
		Event = S.Event;
		var DefaultCfg = {
				rollTimes:4,
				cls:"sel-item",
				duration:40,
				speedSteps:[1,2,5]
			};
		
		function RandomBox(cfg,callback){
			var self = this;
				if(!(self instanceof RandomBox)){	//确保this指向RandomBox实例
					return new RandomBox();
				}
				//合并配置
				self.config = S.mix(DefaultCfg,cfg);				
				//id 数组
				self.list = self.config.list;
				//dom数量
				self.domNum = self.list.length;
				//旋转圈数
				self.rollTimes = self.config.rollTimes;
				//样式类名
				self.cls = self.config.cls;
				//其实索引
				self.beginIndex = 0;
				//正常速度
				self.duration = self.config.duration;
				//速度倍率
				self.speedSteps = self.config.speedSteps;
				//初始化
				self._init();
				//定义回调函数
				self.callback = typeof callback == "function" ? callback : undefined;
		}
		
		S.augment(RandomBox,{
			_init:function(){
				var self = this,
					domNum = self.domNum;
				
				self.$domList = [];
				
				self.curRollTimes = 0;
				//构建对象数组
				for(var i = 0; i < domNum; i++){
					self.$domList[i] = $(self.list[i]);
				}
				//获取变化次数
				self.changeTimes = domNum *  self.rollTimes;

				//获取结束节点id
				if(self.config.finalId){
					
					self.finalId = self.config.finalId;
					
					self.finalNum = self.changeTimes + self.indexOfArray(self.list,self.finalId)+1;

				}else{
					//获取结束索引
					self.finalNum = self.getRandomNum(self.changeTimes,self.changeTimes + domNum);
					
					self.finalId = self.list[self.finalNum % domNum];
				}
			},
			//控制旋转		
			rolling:function(){
				var self = this;
				
				self.choose(self.$domList[self.beginIndex % self.domNum]);	
				
				self.beginIndex += 1;

				//每次选择节点控制一次
				self.start();	
				
				if(self.beginIndex == self.finalNum){
					self._clearInterval();
					//调用回调函数
					self.callback(self.curTarget);
				}
			},
			//设置定时器
			_setInterval:function(duration){
				var self = this;
				self.interval = setInterval(function(){self.rolling();}, duration);
			},
			//清除定时器
			_clearInterval:function(){
				var self = this;
				 clearInterval(self.interval);
			},
			/**
			 * TODO 控制旋转速度
			 * @returns
			 */
			start:function(){
				var self = this,
					duration = self.duration,
					speedSteps = self.speedSteps;
				//停止旋转
				self.stop();
				
				if(self.beginIndex < self.finalNum){								
					if(self.beginIndex > self.finalNum - 10){
						self._setInterval(duration * speedSteps[2]);
					}
					else if(self.beginIndex <= self.finalNum - 10 && self.beginIndex >= self.finalNum - 20){
						self._setInterval(duration * speedSteps[1]);
					}else{
						self._setInterval(duration * speedSteps[0]);
					}
				}
			},
			stop:function(){
				var self = this;
				self._clearInterval();
			},
			/**
			 * TODO 重置
			 * @returns
			 */
			reset:function(){
				var self = this,
					$domList = self.$domList,
					domNum = self.domNum,
					cls = self.cls;
					//停止
					self.stop();
					self.beginIndex = 0;
					self._init();
					//样式重置
					for(var i = 0,len = domNum;i<len;i++){
						$domList[i].hasClass(cls) ? $domList[i].removeClass(cls) : null;
					}
			},
			/**
			 * TODO 选中某个元素
			 * @param $obj
			 * @returns
			 */
			choose:function($obj){
				var self = this;
				S.each(self.$domList,function(i){
					i.removeClass(self.cls);
				});
				$obj.addClass(self.cls);
				self.curTarget = "#" + $obj.attr("id") || "";
			},
			/**
			 * TODO 获取随机数
			 * @param min
			 * @param max  (option)
			 */
			getRandomNum:function(min,max){
				if(min){
					if(!max){
						return parseInt(Math.random()*min);
					}else{
						return parseInt(Math.random()*(max-min)+min);
					}
				}
				return  0;
			},
			indexOfArray:function(arr,str){
				for(var i = 0,len = arr.length;i < len; i++){
					if(arr[i] == str){
						return i;
					}
				}
				return -1;
			}
		});
		//将RandomBox绑定S 
		S.RandomBox = RandomBox;
		return RandomBox;
	});
