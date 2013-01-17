KISSY.use("gallery/waterfallx/1.0/waterfallx, template", function(S, Waterfall, Template) {
    var $ = S.all;
    var tpl = Template($('#tpl').html()),
        nextpage = 1,
        waterfall = new Waterfall.Loader({
            container: "#wrapper",
            load: function(success, end) {
                $('#loadingPins').show();
                S.ajax({
                    data: {
                        'method': 'flickr.photos.search',
                        'api_key': '5d93c2e473e39e9307e86d4a01381266',
                        'tags': 'rose',
                        'page': nextpage,
                        'per_page': 20,
                        'format': 'json'
                    },
                    url: 'http://api.flickr.com/services/rest/',
                    dataType: "jsonp",
                    jsonp: "jsoncallback",
                    success: function(d) {
                        // 如果数据错误, 则立即结束
                        if (d.stat !== 'ok') {
                            alert('load data error!');
                            end();
                            return;
                        }
                        // 如果到最后一页了, 也结束加载
                        nextpage = d.photos.page + 1;
                        if (nextpage > d.photos.pages) {
                            console.log(d.photos.pages)
                            end();
                            return;
                        }
                        // 拼装每页数据
                        var items = [];
                        S.each(d.photos.photo, function(item) {
                            items.push(new S.Node(tpl.render(item)));
                        });
                        success(items);
                    }
                });
            },
            colWidth: 228
        });
})
