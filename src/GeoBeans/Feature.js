/**
 * @classdesc
 * Map5的要素类。
 * @class
 */
GeoBeans.Feature = GeoBeans.Class({
	
	featureType : null,
	
	fid 	 : null,
	geometry : null,
	values	 : null,
	symbolizer: null,
	
	initialize : function(featureType, fid, geometry, values){
		this.featureType = featureType;
		this.fid = fid;
		this.geometry = geometry;	
		this.values = values;
	},
	
	destroy : function(){
		this.featureType = null;
		this.geometry = null;
		this.values = null;
	},


	setValue : function(field,value){
		var fields = this.featureType.getFields();
		for(var i = 0; i < fields.length; ++i){
			var f = fields[i];
			if(f.name == field){
				this.values[i] = value;
				return;
			}
		}
	},

	getValue : function(field){
		var fields = this.featureType.getFields();
		for(var i = 0; i < fields.length; ++i){
			var f = fields[i];
			if(f.name == field){
				return this.values[i];
			}
		}
	}
});