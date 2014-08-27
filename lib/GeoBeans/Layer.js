GeoBeans.Layer = GeoBeans.Class({
	
	id : null,
	
	name : null,
	
	visible : true,
	
	srid : "EPSG:4326",
	
	extent : null,
	
	map : null,
	
	initialize : function(name){
		this.name = name;
	},
	
	destory : function(){
		this.name = null;
	},
	
	setName : function(newName){
		this.name = newName
	},
	
	setMap : function(map){
		this.map = map;
	},
	
	setVisiable : function(visible){
		this.visible = visible;
	},
	
	getExtent : function(){
		return this.extent;
	},
	
	draw : null,
	
	load : null
});
