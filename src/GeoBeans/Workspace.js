/**
 * @classdesc
 * 数据源类。
 * @class
 */
GeoBeans.Workspace = GeoBeans.Class({
	name : null,
	
	initialize : function(name){
		this.name = name;
	},
	
	destory : function(){
		this.name = null;
	}
});
