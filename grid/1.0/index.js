KISSY.add("gallery/grid/1.0/index",function(S,util,store,grid,editGrid,loadMask){
    return {
		Util : util,
		Store : store,
        Grid : grid,
        EditGrid : editGrid,
		LoadMask : loadMask
    };
},{
    requires:["./util","./store","./grid","./editGrid","./loadMask"]
});