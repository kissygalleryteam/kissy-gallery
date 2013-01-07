/**
 * @fileoverview 离线存储存储
 * @author 伯方<bofang.zxj@taobao.com>
 **/
KISSY.add('gallery/offline/1.0/index',function(S, LocalStorage, IeOffline) {
	var DomBase = typeof window.localStorage !== 'undefined' ? LocalStorage : S.UA.ie < 8 ? IeOffline : null;
	DomBase.init();
	/**
	 * @name Offline
	 * @class 离线存储
	 * @constructor
	 * @extends Base
	 * @example
	 * var offline = new Offline();
	 * offline.setItem('key','value',20000);
	 */
	function Offline() {
		//调用父类构造函数
		Offline.superclass.constructor.call(this);
	}
	// 方法
	S.extend(Offline, S.Base, /** @lends Offline.prototype*/ {
		/**
		 * 设置本地存储
		 * @param {String} key      字段
		 * @param {String} value    值
		 * @param {Number} deadline 过期时间（单位毫秒）
		 * @return {Boolean} 成功就则返回true，失败返回false
		 */
		setItem: function(key, value, deadline) {
			var numDeadline = parseInt(deadline, 10);
			if(!S.isString(key) || !S.isString(value) || S.trim(key) === '') {
				S.error('Format error');
				return false;
			}
			S.Offline.fire('setItem', {
				key: key,
				value: value,
				deadline: deadline
			});
			return DomBase.setItem(key, value, numDeadline);
		},
		/**
		 * 根据字段获取本地存储的值
		 * @param  {String} key 字段名
		 * @return {String}     值
		 */
		getItem: function(key) {
			if(!S.isString(key)) {
				S.error('Need String');
				return null;
			}
			return DomBase.getItem(key);
		},
		/**
		 * 删除本地存储的字段
		 * @param  {String} key 需要删除的字段名
		 * @return {Boolean}    成功则返回true，失败返回false
		 */
		removeItem: function(key) {
			if(!S.isString(key)) {
				S.error('Need String');
				return false;
			}
			S.Offline.fire('removeItem', {
				key: key
			});
			return DomBase.removeItem(key);
		},
		/**
		 * 清空本地存储的字段
		 * @return {Boolean}  成功则返回true，失败返回false
		 */
		clear: function() {
			S.Offline.fire('clear');
			return DomBase.clear();
		},
		/**
		 * 获取全部存储的字段（默认是String）
		 * @param  {Boolean} isObject 是否需要返回对象
		 * @return {String | Object}  全部字段，字符串或者是对象
		 */
		getAll: function(isObject) {
			return DomBase.getAll(isObject);
		},
		/**
		 * 获取本地存储里面字段的个数
		 * @return {Number} 个数
		 */
		size: function() {
			return DomBase.size();
		},
		/**
		 * 获取单个字段的剩余保存时间
		 * @param  {String} key 字段名
		 * @return {Number}     毫秒数 返回-1表示永久存储
		 */
		timeRemain: function(key) {
			if(!S.isString(key)) {
				S.error('Need String');
				return false;
			}
			return DomBase.timeRemain(key);
		},
		/**
		 * 浏览器中总共使用的字节数
		 * @return {Number} 字节数
		 */
		usedByte: function() {
			return DomBase.usedByte();
		}
	});
	//绑定属性在KISSY上，方便调用
	S.Offline = new Offline();
	return Offline;

}, {
	requires: ['./localstorage', './ie-offline']
});