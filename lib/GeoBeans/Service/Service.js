GeoBeans.Service = GeoBeans.Class({

	name : null,

	mapName : null,

	url : null,

	layers : null,

	srid : null,

	extent : null,

	thumb : null,

	initialize : function(name,mapName,url,layers,srid,extent,thumb){
		this.name = name;
		this.mapName = mapName;
		this.url = url;
		this.layers = layers;
		this.srid = srid;
		this.extent = extent;
		this.thumb = thumb;
	},


	getWMSLayers : function(){
		if(!$.isArray(this.layers)){
			return null;
		}
		var layer = null,name = null;
		var layerArray = [];
		for(var i = 0; i < this.layers.length;++i){
			layer = this.layers[i];
			if(layer != null){
				layerArray.push(layer.name);
			}
		}
		return layerArray;
	},


});