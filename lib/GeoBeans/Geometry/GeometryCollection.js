GeoBeans.Geometry.GeometryCollection = GeoBeans.Class(GeoBeans.Geometry,{
	
	components : null,
	
	initialize : function(components){
		this.components = [];
		if(components!=null){
			this.components = components;
		}
		this.type = GeoBeans.Geometry.Type.COLLECTION;
		this.extent = this.getExtent();
	},

	hit : function(x,y,t){
		if(this.extent == null){
			return false;
		}

		if(!this.extent.contain(x,y)){
			return false;
		}
		for(var i = 0; i < this.components.length;++i){
			var geometry = this.components[i];
			var ret = geometry.hit(x,y,t);
			if(ret){
				return true;
			}
		}
			
		return false;
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
		this.extent = this.getExtent();
	},


	getExtent : function(){
		if(this.components== null){
			return null;
		}

		var geometry = null;
		var extent = null, g_extent = null;
		for(var i = 0; i < this.components.length;++i){
			geometry = this.components[i];
			if(geometry == null){
				continue;
			}
			g_extent = geometry.extent;
			if(g_extent == null){
				continue;
			}
			if(extent == null){
				extent = new GeoBeans.Envelope(g_extent.xmin,g_extent.ymin,g_extent.xmax,g_extent.ymax);
			}else{
				extent.union(g_extent);
			}
		}

		return extent;
	},

});