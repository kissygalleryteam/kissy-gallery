/** @fileOverview 表格控件的入口文件，命名空间
* @author <a href="mailto:dxq613@gmail.com">董晓庆 旺旺：dxq613</a>  
* @version 1.0.1  
*/
KISSY.add("gallery/grid/1.0/index", function(S, util, store, grid, editGrid, loadMask) {

	/**
	* @namespace 表格的命名空间
	* @name Grid
	* @description 
	* 主要包括：<br>
	* 1. Util 帮助类<br>
	* 2. Store 数据缓冲类，缓存数据，通过事件跟其他控件交互<br>
	* 3. Grid 表格控件<br>
	* 4. EditGrid 可编辑控件<br>
	* 5. LoadMask 加载遮罩层，当加载数据时显示Loading
	*/
	var Grid = {
        Util : util,
        Store : store,
        Grid : grid,
        EditGrid : editGrid,
        LoadMask : loadMask
    };
    return Grid;
}, {
    requires:["./util","./store","./grid","./editGrid","./loadMask"]
});