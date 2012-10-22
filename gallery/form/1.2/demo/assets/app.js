!function ($) {

    $(function(){
        // fix sub nav on scroll
        var $win = $(window)
            , $nav = $('.subnav')
            , navHeight = $('.navbar').first().height()
            , navTop = $('.subnav').length && $('.subnav').offset().top - navHeight
            , isFixed = 0

        processScroll()

        $win.on('scroll', processScroll)

        function processScroll() {
            var i, scrollTop = $win.scrollTop()
            if (scrollTop >= navTop && !isFixed) {
                isFixed = 1
                $nav.addClass('subnav-fixed')
            } else if (scrollTop <= navTop && isFixed) {
                isFixed = 0
                $nav.removeClass('subnav-fixed')
            }
        }
    })

}(window.jQuery)
KISSY.ready(function(){
    KISSY.use('gallery/feedback',function(S,Feedback){
        var feedback = new Feedback('body',{title:'向作者提问或建议',url:'https://github.com/kissyteam/kissy-gallery/issues?direction=desc&sort=created&state=open'});
        feedback.render();
    });
})