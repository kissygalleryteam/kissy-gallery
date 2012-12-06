KISSY.use("gallery/suggest/1.0/", function(S, Suggest) {

    // Google
    var dataUrl = 'http://www.google.com.hk/complete/search?client=hp&hl=zh-CN&sugexp=ekjrth&gs_nf=3&gs_rn=0&gs_ri=hp&cp=1&gs_id=9';
    var sug = new Suggest('#gq', dataUrl, {
        resultFormat: '',
        containerCls: 'g-sug',
        // Suggest 会对 callbackFn 的值自动添加对应函数到 window 上, 不需要用户自动设置
        callbackFn: 'google.ac.h'
    });

    // google: window.google.ac.h(["ni",[["牛博网","73,248 结果","0z"],["牛博网首页","12,200,617 结果","1z"],["你是准备替党说话 还是准备替老百姓说话","136,545 结果","2z"],["nike","117,000,000 结果","3"],["nikon","127,000,000 结果","4"],["nissan","135,000,000 结果","5"],["nine west","40,000,000 结果","6"],["nike鞋","3,380,000 结果","7"],["倪萍 再婚","36,400 结果","8"],["牛年祝福语","582,000 结果","9"]]])
    // taobao: g_ks_suggest_callback({"result": [["nike 正品", "2170000"], ["nike 专柜 正品", "834000"], ["nike 短袖", "242000"], ["nike 板 鞋", "989000"], ["nike 女鞋", "253000"], ["nike 运动鞋", "550000"], ["nike 包", "295000"], ["nike 鞋", "3160000"], ["nike 单肩包", "38500"], ["nike 09", "786000"]]})
    sug.on('dataReturn', function() {
        this.returnedData = this.returnedData[1] || [];
    });

});