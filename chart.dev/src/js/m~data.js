KISSY.add("chart~data",function(S){
    P = S.namespace("chart");
    /**
     * @constructor 图表数据
     */
    function Data(data){
    }
    S.augment(Data,{
        axis : function(){},
        elements : function(){}
    });
    P.Data = Data;
});
