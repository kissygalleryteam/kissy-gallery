KISSY.add("gallery/reflection/1.0/index",function(S, Reflection){
    return Reflection;
}, {
    requires:["./reflection"]
});/**
* KISSY.Reflection
* @author ԪȪ<yuanquan.wxr@taobao.com>
* @version:1-0-0
*/
KISSY.add('gallery/reflection/1.0/reflection',function(S) {
    var D = S.DOM;
    /**
	* Reflection Class
	* @constructor
	*/
    function Reflection(selectors, option) {
        this.defaultHeight = 0.5;
        this.defaultOpacity = 0.5;
        /*�����캯��û�д���selectorsʱ��Ĭ�ϴ������.reflectѡ�����ͼƬ*/
        this.add(selectors || '.reflect', option);
    }
    /**
	* add one reflection
	*/
    Reflection.prototype._addOne = function(image, options) {
        /*����ӹ�Ӱ��ͼƬ�Ƴ�Ӱ*/
        this._removeOne(image);
        var doptions = {
            "height": this.defaultHeight,
            "opacity": this.defaultOpacity
        }
        if (options) {
            for (var i in doptions) {
                if (!options[i]) options[i] = doptions[i];
            }
        } else {
            options = doptions;
        }
        try {
            var d = D.create('<div></div>');
            var p = typeof image == 'object' ? image: D.get(image);
            var newClasses = p.className.replace("reflect", "");
            var reflectionHeight = Math.floor(p.height * options['height']);
            var divHeight = Math.floor(p.height * (1 + options['height']));
            var reflectionWidth = p.width;
            var canvas = D.create('<canvas></canvas>');
            /*�߼������ʹ�û���ʵ�ֵ�Ӱ*/
            if (canvas.getContext) {
                /* Copy original image's classes & styles to div */
                d.className = newClasses;
                p.className = 'reflected';
                d.style.cssText = p.style.cssText;
                p.style.cssText = 'vertical-align: bottom';
                var context = canvas.getContext("2d");
                canvas.style.height = reflectionHeight + 'px';
                canvas.style.width = reflectionWidth + 'px';
                canvas.height = reflectionHeight;
                canvas.width = reflectionWidth;
                d.style.width = reflectionWidth + 'px';
                d.style.height = divHeight + 'px';
                p.parentNode.replaceChild(d, p);
                d.appendChild(p);
                d.appendChild(canvas);
                context.save();
                context.translate(0, p.height - 1);
                context.scale(1, -1);
                context.drawImage(p, 0, 0, reflectionWidth, p.height);
                context.restore();
                // https://developer.mozilla.org/samples/canvas-tutorial/6_1_canvas_composite.html
                context.globalCompositeOperation = "destination-out";
                var gradient = context.createLinearGradient(0, 0, 0, reflectionHeight);                
                gradient.addColorStop(0, "rgba(255, 255, 255, " + (1 - options['opacity']) + ")");
                gradient.addColorStop(1, "rgba(255, 255, 255, 1.0)");
                context.fillStyle = gradient;
                context.rect(0, 0, reflectionWidth, reflectionHeight);
                context.fill();
            } else {
                /* Fix hyperlinks */
                if (p.parentElement.tagName == 'A') {
                    d = D.create('<a></a>');
                    d.href = p.parentElement.href;
                }
                /* Copy original image's classes & styles to div */
                d.className = newClasses;
                p.className = 'reflected';
                d.style.cssText = p.style.cssText;
                p.style.cssText = 'vertical-align: bottom';
                var reflection = D.create('<img>');
                reflection.src = p.src;
                reflection.style.width = reflectionWidth + 'px';
                reflection.style.display = 'block';
                reflection.style.height = p.height + "px";
                reflection.style.marginBottom = "-" + (p.height - reflectionHeight) + 'px';
                // http://msdn.microsoft.com/en-us/library/ms532972(v=vs.85).aspx
                reflection.style.filter = 'progid:DXImageTransform.Microsoft.BasicImage(mirror=1,rotation=2) progid:DXImageTransform.Microsoft.Alpha(opacity=' + (options['opacity'] * 100) + ', style=1, finishOpacity=0, startx=0, starty=0, finishx=0, finishy=' + (options['height'] * 100) + ')';
                d.style.width = reflectionWidth + 'px';
                d.style.height = divHeight + 'px';
                p.parentNode.replaceChild(d, p);
                d.appendChild(p);
                d.appendChild(reflection);
            }
        } catch(e) {}
    };
    /**
	* remove one reflection
	*/
    Reflection.prototype._removeOne = function(image) {
        image = D.get(image);
        if (image && image.className == "reflected") {
            image.className = image.parentNode.className;
            image.parentNode.parentNode.replaceChild(image, image.parentNode);
        }
    };
    /**
	* remove reflections those have selectors
	*/
    Reflection.prototype.remove = function(selectors) {
        var rimages = D.query(selectors);
        var _this = this;
        S.each(rimages,  function(img, index) {
            _this.removeOne(img);
        });
    };
    /**
	* add reflections those have selectors
	*/
    Reflection.prototype.add = function(selectors, option) {
        var rimages = D.query(selectors);
        var _this = this;
        S.each(rimages,  function(img, index) {
            imgReady(img,function(){
                var rheight = parseFloat(D.attr(img, 'data-rheight'));
                var ropacity = parseFloat(D.attr(img, 'data-ropacity'));
                _this._addOne(img, option || {
                    'height': rheight,
                    'opacity': ropacity
                });
            });
        });
    };

    function imgReady(img ,fn){
        if(img.complete){
            fn();
        }else{
            S.Event.on(img,"load",fn);
        }
    }
    
    return Reflection;
});
