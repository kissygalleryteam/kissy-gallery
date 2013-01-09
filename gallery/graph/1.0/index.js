/**
 * KISSY Graph
 * 基于SVG VML的图表组件 支持ie6+ chrome firefox safari opera .eg
 * @author 飞长<veryued@gmail.com>
 */

KISSY.add('gallery/graph/1.0/index', function(S, SumDetail){

    function Graph(){}
    
    Graph.SumDetail = SumDetail;

    return Graph;

}, {
    requires: ['./sumDetail']
});