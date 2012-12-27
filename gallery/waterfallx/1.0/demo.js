KISSY.ready(function(S) {
	var tpl = S.get('#tpl').innerHTML;
	var items = [];
	var ctn = S.all('#container');
    var url = "http://zhoubian.taobao.com/GetAddressAuctionNew.htm?t=1354520492506233&p=1&cidLevels=50020808,1|50020611,1|50020485,1|50020579,1|50025705,1|21,1|50020332,1|50020857,1|50008164,1|27,1|50016348,1|50016349,1|50018004,1|14,1|50012082,1|11,1|1101,1|50023904,1|50011972,1|50018222,1|50007218,1|1512,1|&level=&cidLevels=50020808,1|50020611,1|50020485,1|50020579,1|50025705,1|21,1|50020332,1|50020857,1|50008164,1|27,1|50016348,1|50016349,1|50018004,1|14,1|50012082,1|11,1|1101,1|50023904,1|50011972,1|50018222,1|50007218,1|1512,1|&addressHashKey=0&parentHashKey=1770651072&orderType=&buyType=1&isShowAllCidOrTags=false";
	for (var i = 0; i < 15; ++i) {
		items.push(S.all(tpl));
	}
    S.io.setupConfig({
        xdr : {
            subDomain : {
                proxy : '/crossdomain.htm'
            }
        }
    });
	S.use('waterfallx, template', function(S, WaterFall, Template) {
		var nextPage = 0;
		wf = new WaterFall.Loader({
			colWidth : 290,
            diff:200,
			container : '#container',
			load : function(success, end) {
				S.io.get(url, {nextPage:nextPage}, function(data) {
					var items = [];

					S.each(data.groupToAucList[0].aucInfoList, function(item) {
						//随机高度
                        item.picUrl = "http://img03.taobaocdn.com/imgextra/" + item.picUrl;

						items.push(S.all(Template(tpl).render(item)));
					});
//					success(items);
                    var method = nextPage%2 ? 'addItems' : 'preAddItems';
                    wf[method](items);
                    wf.__loading = 0;
					(++nextPage > 6) && end();
					console.log('nextPage', nextPage)
				}, 'json')
			}
		});
	});
})
