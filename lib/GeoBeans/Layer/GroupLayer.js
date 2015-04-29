GeoBeans.Layer.GroupLayer = GeoBeans.Class(GeoBeans.Layer,{
	layers : null,

	initialize : function(name){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		this.name = name;
		this.layers = [];
	},

	addLayer : function(layer){
		if(layer == null){
			return;
		}
		this.layers.push(layer);
	}
});