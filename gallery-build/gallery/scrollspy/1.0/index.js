/**
 * @fileoverview KISSY版的Scroll Spy，根据当前窗口滚动的位置，高亮相应的导航
 * @author: 七念<qinian.wmq@taobao.com>
 **/
KISSY.add('gallery/scrollspy/1.0/index',function(S){
    var $ = S.all, $1 = S.one;
    
    function ScrollSpy (config) {
        this.init(config);
        this.refresh();
    }
    
    S.augment(ScrollSpy, {
        constructor: ScrollSpy,
        refresh: function _refresh() {
            this.targets = [];
            this.offsets = [];
            $(this.navSelector).each(function (item) {
                var dataHref = item.attr("data-href"),
                    targetContent = $1(dataHref);
                
                if (/^#\w/.test(dataHref) && targetContent.length) {
                    this.targets.push(dataHref);
                    this.offsets.push(targetContent.offset().top);
                }
            }, this);
        },
        process: function _process() {
            var scrollTop = this.$scrollElement.scrollTop() + this.offset
            , offsets = this.offsets
            , targets = this.targets
            , activeTarget = this.activeTarget
            , i;
            
            scrollTop += offsets[0];
            for (i = offsets.length; i--;) {
                activeTarget != targets[i]
                  && scrollTop >= offsets[i]
                  && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
                  && this.activate( targets[i] );
            }
        },
        activate: function _activate(target) {
            var active;
            this.activeTarget = target;

            active = $(".active", this.navContainer);
            active && active.removeClass("active");

            $(this.activerSelector + ":has([data-href=" + target + "])").addClass("active");
        },
        init: function _init(config) {
            var conf = config;
            
            this.offset = conf.offset;
            this.navSelector = conf.navSelector;
            this.navContainer = conf.navContainer;
            this.activerSelector = conf.activerSelector;
            
            var process = S.bind(this.process, this),
                $element = $(conf.scrollArea);
            this.$scrollElement = $element.on('scroll', process);
        }
    });
    
    return ScrollSpy;
}, {
    requires : [ "sizzle"]
});
