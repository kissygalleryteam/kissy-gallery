/**
 * demo5 js代码不仅仅是这些
 */
KISSY.ready(function(S) {
    S.use('switchable,searchsuggest', function(S,Switchable,SearchSuggest) {
        var DOM = S.DOM, Event = S.Event,
            form = DOM.get("#J_TSearchForm"),
            q = form["q"],
            searchType = form["search_type"],
            __fp_sug,
            tab_as,
            tabpanels,
            tabs = DOM.query("#J_TSearchTabs li"),
            SEARCH_TYPE_LIST = ["item", "mall", "shop", "auction", "taoba", "share"],
            switchToTab = function(n) {
                if (!__fp_sug) return;

                if (n == 1) {
                    __fp_sug.sug.dataSource = 'http://suggest.taobao.com/sug?area=b2c&code=utf-8&extras=1&callback=KISSY.Suggest.callback';
                } else {
                    __fp_sug.sug.dataSource = 'http://suggest.taobao.com/sug?code=utf-8&extras=1&callback=KISSY.Suggest.callback';
                }
                __fp_sug.sug._dataCache = {};

                var curRel = searchType.value;
                __fp_sug.ON = curRel === 'item' || curRel === 'mall';
            };
        DOM.addClass(form.parentNode, "ks-switchable-content");
        DOM.addClass("#J_TSearchTabs", "ks-switchable-nav");

        var tabPanelDiv = DOM.create("<div class='tab-panel'></div>");

        for (var i = 0; i < tabs.length; i++) {
            form.parentNode.appendChild(tabPanelDiv.cloneNode(true));
        }
        DOM.get(".tab-panel", form.parentNode).appendChild(form);

        tab_as = DOM.query("#J_TSearchTabs a");
        tabpanels = DOM.query(".tab-panel", DOM.get("#J_TSearchTabs").parentNode);
        searchType = form["search_type"];

        var searchTab = new Switchable.Tabs(DOM.get("#J_TSearchTabs").parentNode, {
            activeTriggerCls:'current',
            triggerType:'click'
        });
        Event.on(tab_as, "click", function(e) {
            e.preventDefault();
        });
        searchTab.on("switch", function(ev) {
            var n = ev.currentIndex,
                ori = ev.originalEvent.type;
            tabpanels[n].appendChild(form);
            searchType.value = SEARCH_TYPE_LIST[n];
            switchToTab(n);
        });


        __fp_sug = new SearchSuggest({
            'q': q,
            'form': form,
            'placeholder': 'data-default'
        });
    });
});
