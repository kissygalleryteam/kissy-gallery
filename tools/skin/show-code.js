/**
 * 文档
 * @author fool2fish<fool2fish@gmail.com>
 */

KISSY.ready(function(S){

    var D = S.DOM, E = S.Event, doc = document;
	
	
	/**显示和隐藏源码*****************************************************************/
	
    var TRIGGER_CLS = 's-view-code', DEMO_CLS = 's-demo', CODE_CLS = 's-code', 
        SHOW_CODE = '显示源码', HIDE_CODE = '隐藏源码';
    
    E.on(doc.body,'click',function(e){ 
        var t = e.target;
        if(D.hasClass(t,TRIGGER_CLS)){
            e.preventDefault();
            var code = D.next(t);
            if(!code || !D.hasClass(code,CODE_CLS)){
                var demo = D.prev(t,'.'+DEMO_CLS);
                code = createCode(t,demo);
            }
            toggleShow(t,code);
        }
    });

    function createCode(trigger,demo){
		var code = demo.innerHTML;
		var lines = code.match(/\n/g);
		if(lines && lines.length){
			if(lines.length>30){
				lines = 30;
			}else{
				lines= lines.length;
			}
		}else{
			lines = 10;
		}
		lines = lines * 1.5;
		
        var codeBox = D.create('<textarea class="'+CODE_CLS+'" style="height:'+lines+'em"></textarea>');
        D.insertAfter(codeBox,trigger);
        codeBox.value = S.UA.ie ? '请使用非ie内核刘浏览器查看。' : formatCode(code);
        return codeBox;
    }

    function formatCode(code){
        code = code.replace(/^[\r\n]+|[\s\r\n]+$/g,'');
        var tabs = code.match(/^\s*/)[0];
        code = code.replace(new RegExp(tabs,'g'),'');
        return code;
    }

    function toggleShow(trigger,code){
        if(trigger.innerHTML == SHOW_CODE){
            code.style.display = 'block';
            trigger.innerHTML = HIDE_CODE;
        }else{
            code.style.display = 'none';
            trigger.innerHTML = SHOW_CODE;
        }
    }
	
	
});