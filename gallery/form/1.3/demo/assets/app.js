
KISSY.ready(function(){


    KISSY.use('gallery/feedback',function(S,Feedback){
        var feedback = new Feedback('body',{title:'向作者提问或建议',url:'https://github.com/kissyteam/kissy-gallery/issues?direction=desc&sort=created&state=open'});
        feedback.render();
    });

    jQuery('.bs-docs-sidenav').affix({
        offset: {
            top: function () { return jQuery(window).width() <= 980 ? 290 : 210 }, bottom:270
        }
    })
});