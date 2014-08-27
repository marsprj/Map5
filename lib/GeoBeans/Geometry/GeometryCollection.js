GeoBeans.Geometry.GeometryCollection = GeoBeans.Class(GeoBeans.Geometry,{
	
	components : null,
	
	initialize : function(components){
		this.components = [];
		if(components!=null){
			
		}
	},
	
	addComponents : function(components){
		if(!(components instanceof Array)){
			components = [components];
		}
		for(var i=0,len=components.length; i<len; i++){
			this.addComponent(components[i]);
		}
	},
	
	addComponent : function(component){
		this.components.push(component);
	}
});