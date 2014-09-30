GeoBeans.Layer = GeoBeans.Class({
	
	id : null,
	
	name : null,
	
	visible : true,
	
	srid : "EPSG:4326",
	
	extent : null,
	
	map : null,
	
	events : null,
	
	initialize : function(name){
		//GeoBeans.Class.prototype.initialize.apply(this, arguments);
		
		this.name = name;
		this.events = new GeoBeans.Events();
	},
	
	destory : function(){
		this.name = null;
		this.events = null;
		
		//GeoBeans.Class.prototype.destory.apply(this, arguments);
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
	
	load : null,
	
	unregisterEvents : function(){
		
	},

	cleanup : function(){},
	
	CLASS_NAME : "GeoBeans.Layer"
});
