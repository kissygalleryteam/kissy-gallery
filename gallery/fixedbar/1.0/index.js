/**
 * @file index.js
 * @brief
 * @version
 * @date 2012-12-26
 */
/*jshint browser:true,devel:true */

/**
 * 固定组件,不支持IE6
 */

KISSY.add('gallery/fixedbar/1.0/index', function(S) {

	"use strict";

	/*
	 * config = {
	 *		top:123,
	 *		floor:300
	 * }
	 * */
	function FixedBar(id,cfg) {
		if(S.UA.ie == 6){
			return;
		}
		if (this instanceof FixedBar) {

			this.con = S.one(id);

			FixedBar.superclass.constructor.call(this, cfg);
			this.init();

		} else {
			return new FixedBar(id,cfg);
		}
	}

	FixedBar.ATTRS = {
		top:{
			value: 0
		},
		bottom:{
			value: 0
		},
		floor:{
			value: 10000000000
		}
	};

	S.extend(FixedBar, S.Base, {

		init: function() {
			var that = this;

			if(!that.con){
				return;
			}

			var top = that.get('top');
			var bottom= that.get('bottom');
			var floor = that.get('floor');
			var ntop = that.con.offset().top;
			var nbottom = S.one('body').height() - (that.con.offset().top + that.con.height());
			var oposition = that.con.css('position');
			var otop = Number(that.con.css('top').replace('px',''));
			var body = S.one('body');

			S.Event.on(window, "scroll", function() {
				var sTop = S.DOM.scrollTop();
				var sBottom = body.height() - sTop - S.DOM.viewportHeight();

				if((top + that.con.height() + sTop) >= floor){
					if(that.con.css('position') == 'absolute'){
						return;
					}
					that.con.css({
						position:'absolute',
						top:that.con.offset().top
					});
				} else if((sTop + top) > ntop){
					if(that.con.css('position') == 'fixed'){
						return;
					}
					that.con.css({
						position:'fixed',
						top:top
					});
				} else {
					if(that.con.css('position') == oposition){
						return;
					}
					that.con.css({
						position:oposition,
						top:otop
					});
				}
			});
		},

		destory: function(){

		}
	});

	return FixedBar;

}, {
	requires: ['base','node']
});


