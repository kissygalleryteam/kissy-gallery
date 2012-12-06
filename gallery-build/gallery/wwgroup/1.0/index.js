KISSY.add("gallery/wwgroup/1.0/index",function(S, Wwgroup){
    return Wwgroup;
}, {
    requires:["./wwgroup"]
});/**
 * 旺群点灯组件
 * @author bangyan@taobao.com
 */
KISSY.add('gallery/wwgroup/1.0/wwgroup', function (S) {

	/**
	 * 定义旺旺群钩子作用类
	 * @var {String} WWG_CLS
	 */
	var WWG_CLS = '.J_WWGroup';

	/**
	 * 定义旺群四种图标状态
	 * @var {String} WWG_ICON_MINI
	 * @var {String} WWG_ICON_SMALL
	 * @var {String} WWG_ICON_MEDIUM
	 * @var {String} WWG_ICON_LARGE
	 */
	var WWG_ICON_MINI = 'wwg-mini',
		WWG_ICON_SMALL = 'wwg-small',
		WWG_ICON_MEDIUM = 'wwg-medium',
		WWG_ICON_LARGE = 'wwg-large';

	/**
	 * 获取旺群图标类型
	 * @method _getWWGIcon
	 * @param {KISSY.Node} node 需要点灯的钩子节点
	 * @return {String} 旺群图标类型
	 */
	function _getWWGIcon(node) {

		//获取当前钩子节点的 data-icon 属性
		var attr = node.attr('data-icon'),
			WWGIcon;

		//根据类型选择图标状态，默认使用 small 类型
		switch (attr) {
			case 'mini':
				WWGIcon = WWG_ICON_MINI;
				break;
			case 'small':
				WWGIcon = WWG_ICON_SMALL;
				break;
			case 'medium':
				WWGIcon = WWG_ICON_MEDIUM;
				break;
			case 'large':
				WWGIcon = WWG_ICON_LARGE;
				break;
			default:
				WWGIcon = WWG_ICON_SMALL;
			}

		//返回图标 CSS 类名
		return WWGIcon;

	}

	/**
	 * 加载旺群 CSS 文件
	 * @method _loadWWGCSS
	 */
	function _loadWWGCSS () {
		
		var CSS_STYLE = '.wwg-mini,.wwg-small,.wwg-medium,.wwg-large{cursor:pointer;display:inline-block;vertical-align:middle;overflow:hidden;}.wwg-mini{background:url(http://img02.taobaocdn.com/tps/i2/T1m206XhdDXXXXXXXX-25-20.gif) no-repeat;width:25px;height:20px;overflow:hidden;}.wwg-small{background:url(http://img04.taobaocdn.com/tps/i4/T1fdykXgtiXXXXXXXX-63-20.gif) no-repeat;width:63px;height:20px;overflow:hidden;}.wwg-medium{background:url(http://img03.taobaocdn.com/tps/i3/T1QLB6XgVDXXXXXXXX-42-33.gif) no-repeat;width:42px;height:33px;overflow:hidden;}.wwg-large{background:url(http://img01.taobaocdn.com/tps/i1/T1o2J6XoFFXXXXXXXX-84-33.gif) no-repeat;width:84px;height:33px;overflow:hidden;}.wwg-hack-for-ie{background:none;}';
		
		S.one('head').append('<style>' + CSS_STYLE + '</style>');
		
	}

	/**
	 * 定义旺群初始化方法
	 * @method WWGroup
	 */
	function WWGroup() {

		//加载旺群样式代码
		_loadWWGCSS();

		//遍历所有旺群节点
		S.all(WWG_CLS).each(function (v) {

			//获得旺群 CSS 类名称
			var WWGIcon = _getWWGIcon(v), anchor;

			//节点结构处理
			v.addClass(WWGIcon);
			v.attr('title', '点击这里围观该群');

			//点击弹出旺旺对话框
			v.on('click', function (e) {

				//获得群号
				var groupId = S.one(e.currentTarget).attr('data-group');

				window.open('aliim:tribevisit?uid=&tribeid=' + groupId, '_self');
				
				//hack ie 下的动态 gif 停滞 bug
				if (S.UA.ie) {
					S.all(WWG_CLS).addClass('wwg-hack-for-ie');
					S.all(WWG_CLS).removeClass('wwg-hack-for-ie');
				}

			});

		});

	}

	return WWGroup;

});
