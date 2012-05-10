KISSY.ready(function(S) {
    var frame = S.one("#mainframe");
    S.all("#nav a").each(function() {
        var url = this.attr("href"),
            target = this.attr('target');
        if(target != '_blank'){
            this.attr("href", "index.html#" + url.replace(".html", ""));
            this.on("click", function(ev) {
                //ev.halt();
                frame.attr("src", url);
            });
        }
    });

    if (window.location.hash) {
        frame.attr("src", window.location.hash.replace("#", "") + ".html");
    } else {
        frame.attr("src", "home.html");
    }


    function reinitIframe() {
        var iframe = document.getElementById("mainframe");
        if (!iframe)return;
        try {
            var bHeight = iframe.contentWindow.document.body.scrollHeight;
            var dHeight = iframe.contentWindow.document.documentElement.scrollHeight;
            var height = Math.max(bHeight, dHeight);
            iframe.height = height;
        } catch (ex) {
        }
    }

    window.setInterval(function() {
        reinitIframe();
    }, 1000);
});
