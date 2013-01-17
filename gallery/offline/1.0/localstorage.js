/**
 * @fileoverview 基于localStorage的离线存储
 * @author 伯方<bofang.zxj@taobao.com>
 **/
KISSY.add('gallery/offline/1.0/localstorage',function(S) {
	var re = {},
		DEADLINE_KEY = 'DEADLINE-KEY',
		ls, oDeadline;
	S.mix(re, {
		/**
		 * 初始化，对过期时间处理
		 * @return {Object} this
		 */
		init: function() {
			var initDate = new Date().getTime();
			ls = localStorage;
			oDeadline = S.JSON.parse(ls.getItem(DEADLINE_KEY)) || {};
			//遍历oDeadline里面所有设置了过期时间的key
			for(var i in oDeadline) {
				if(oDeadline.hasOwnProperty(i)) {
					dateKey = parseInt(oDeadline[i], 10);
					dateBet = dateKey - initDate;
					if(dateBet <= 0) {
						this.removeItem(i);
						delete oDeadline[i];
						this._saveDeadLine();
					} else {
						this._deadlineKey(i, dateBet);
					}
				}
			}
			return this;
		},
		setItem: function(key, value, deadline) {
			if(deadline) {
				var numDeadline = parseInt(deadline, 10),
					nowDate = new Date().getTime();
				oDeadline[key] = numDeadline + nowDate;
				this._deadlineKey(key, numDeadline);
				this._saveDeadLine();
			}
			ls.setItem(key, value);
			return true;
		},
		getItem: function(key) {
			return ls.getItem(key);
		},
		removeItem: function(key) {
			ls.removeItem(key);
			delete oDeadline[key];
			this._saveDeadLine();
			return !this.getItem(key);
		},
		clear: function() {
			ls.clear();
			return this.size() === 0;
		},
		size: function() {
			//-1是因为本身的用来保存时间的key占用了一个
			var len = ls.length;
			return ls[DEADLINE_KEY] ? len - 1 : len;
		},
		getAll: function(isObject) {
			var len = ls.length,
				oTemp = {},
				key;
			for(i = 0; i < len; i++) {
				key = ls.key(i);
				oTemp[key] = ls.getItem(key);
				if(key === DEADLINE_KEY) {
					delete oTemp[key];
				}
			}
			if(isObject) {
				return oTemp;
			}
			return S.JSON.stringify(oTemp);
		},
		timeRemain: function(key) {
			//如果本身已经不存在这个key了
			if(!ls[key]) {
				return 0;
			}
			if(key in oDeadline) {
				return oDeadline[key] - new Date().getTime();
			} else {
				return -1;
			}
		},
		usedByte: function() {
			var tempLen = this.getAll().length;
			//统计时间的key有可能还没有
			if(ls[DEADLINE_KEY]) {
				tempLen += S.JSON.stringify(oDeadline).length;
				tempLen += DEADLINE_KEY.length;
			}


			return tempLen;
		},
		/**
		 * 删除过期的key
		 * @param  {String} key      过期的字段
		 * @param  {Numver} deadline 过期的时间
		 */
		_deadlineKey: function(key, deadline) {
			var self = this;
			S.later(function() {
				ls.removeItem(key);
				delete oDeadline[key];
				self._saveDeadLine();
			}, deadline);
		},
		/**
		 * 保存过期时间
		 */
		_saveDeadLine: function() {
			ls.setItem(DEADLINE_KEY, S.JSON.stringify(oDeadline));
		}
	});
	//re.init();
	return re;

});