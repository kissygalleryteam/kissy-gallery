
KISSY.add("province", function(S){
    var $=S.all;

    function Province(container,data,config){
        var self = this,
            select = $(container).all("select"),
            cfg = S.merge({val:"val"},config||{});

        if(select.length<1 || !data){
            return;
        }

        S.mix(self,{
            select: select,
            data: data,
            config: cfg
        })

        //绑定事件
        S.each(select,function(item,index){
            $(item).on("change", function(){
                var option = $(this.options[this.selectedIndex]),
                    code = option.attr("data-val");

                self.fire("change",{
                    select:this,
                    text: option.text(),
                    val: option.attr("value"),
                    code: code
                })

                if((select.length-index)>1){
                    self.renderSelect(select[index+1],self.getCurrentData(code));
                }
            })
        })

    }

    S.augment(Province, S.EventTarget, {

        init: function(){
            this.renderFirst();
        },

        renderFirst: function(){
            this.renderSelect(this.select[0],this.data);
        },

        getCurrentData: function(code){
            var codes = code.match(/(\d{2})/g);

            //二级数据
            if(codes[1]=="00" && codes[2]=="00"){
                return this.data[code]["child"];
            }

            //三级数据
            else if(codes[1]!="00" && codes[2]=="00"){
                return this.data[[codes[0],"0000"].join("")]["child"][[codes[0],codes[1],"00"].join("")]["child"];
            }

            //无
            else{
                return null
            }
        },

        renderSelect: function(select,data,val){
            var self = this;
            select.options.length=0;
            S.each(data,function(item){
                $(select).append($('<option value="'+(self.config.val=="text"?item.name:item.code)+'" data-val="'+item.code+'">'+item.name+'</option>'))
            });
            if(val){
                $(select).val(val);
            }else{
                select.options.selectedIndex=0;
            }
        },

        focus: function(index,val) {
            var self = this,
                data = self.data,
                codes = val.match(/(\d{2})/g);

            if(index==0){
                self.renderSelect(self.select[0],data,val);
                self.renderSelect(self.select[1],{});
                self.renderSelect(self.select[2],{});
            }else if(index==1) {
                self.renderSelect(self.select[0],data,[codes[0],"0000"].join(""));
                self.renderSelect(self.select[1],data[[codes[0],"0000"].join("")]["child"],val);
                self.renderSelect(self.select[2],{});
            }else if(index==2) {
                self.renderSelect(self.select[0],data,[codes[0],"0000"].join(""));
                self.renderSelect(self.select[1],data[[codes[0],"0000"].join("")]["child"],[codes[0],codes[1],"00"].join(""));
                self.renderSelect(self.select[2],self.data[[codes[0],"0000"].join("")]["child"][[codes[0],codes[1],"00"].join("")]["child"],val);
            }

        }

    })

    return Province;

})
