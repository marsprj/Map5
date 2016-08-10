GeoBeans.GeoJsonReader = GeoBeans.Class({
		
	layerName : null,

	fields : null,


	layer : null,

	initialize : function(){

	},

	read : function(name,json){
		this.layer = null;
		this.layerName = name;
		this.fields = [];
		this.load(json);
		return this.layer;
	},

	load : function(json){
		var that = this;
		$.ajax({
			url : json,
			dataType: "json",
			async	: false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(json, textStatus){
				that.readJson(json);
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(a,b){
				console.log(b);
			}
		});		
	},

	readJson : function(json){
		if(json == null){
			return null;
		}
		var type = json.type;
		console.log(type);

		var featureType = new GeoBeans.FeatureType(null,this.layerName);
		featureType.fields = [];



		var featureLayer = new GeoBeans.Layer.FeatureLayer(this.layerName);
		featureLayer.featureType = featureType;
		featureLayer.features = [];


		this.layer = featureLayer;
		if(type == "FeatureCollection"){
			var features = this.parseFeatureCollection(json);
		}else if(type == "Feature"){
			var feature = this.parseFeature(json);
		}

		
	},

	parseFeatureCollection : function(json){
		if(json == null){
			return null;
		}

		var features = [];
		var that = this;
		json.features.each(function(){
			var feature = that.parseFeature(this);
		});
	},

	parseFeature : function(json){
		if(json == null){
			return null;
		}
		var type = json.type;
		if(type != "Feature"){
			return null;
		}

		var feature = new GeoBeans.Feature()
		var geometry = this.parseGeometry(json.geometry);

		if(geometry != null){

		}

		var properties = this.parseProperties(json.properties);
		if(properties != null){

		}
	},

	parseGeometry : function(json){
		if(json == null){
			return null;
		}
		var type = json.type;
		var geometry = null;
		switch(type){
			case "Point":{
				geometry = this.parsePoint(json);
				break;
			}
			case "LineString":{
				geometry = this.parseLineString(json);
				break;
			}
			case "Polygon":{
				geometry = this.parsePolygon(json);
				break;
			}
			case "MultiPoint":{
				geometry = this.parseMultiPoint(json);
				break;
			}
			case "MultiPolygon":{
				geometry = this.parseMultiPolygon(json);
				break;
			}
			case "MultiLineString":{
				geometry = this.parseMultiLineString(json);
				break;
			}
			case "GeometryCollection":{
				geometry = this.parseGeometryCollection(json);
				break;
			}
			default:
				break;
		}
		return geometry;
	},

	parsePoint : function(json){
		if(json == null){
			return null;
		}
		if(type != "Point"){
			return null;
		}
		var coordinates = json.coordinates;
		if(coordinates != null && $.isArray(coordinates)){
			return new GeoBeans.Geometry.Point(coordinates[0],coordinates[1]);
		}
	},

	parseLineString : function(json){

	},

	parsePolygon : function(json){

	},

	parseMultiPoint : function(json){

	},

	parseMultiPolygon : function(json){

	},

	parseMultiLineString : function(json){

	},

	parseGeometryCollection : function(json){

	},

	parseProperties : function(json){
		if(json == null){
			return null;
		}

		var keys = Object.keys(json);
		var key = null;
		for(var i = 0; i < keys.length;++i){
			key = keys[i];
			if(key == null){
				continue;
			}
			var value = json[key];
			this.addField(key,value);
		}
	},



	addField : function(fieldName,value){
		if(this.layer == null || this.layer.featureType == null){
			return;
		}
		var fields = this.layer.featureType.fields;
		if(fields == null){
			return;
		}
		var field = null;
		for(var i = 0; i < fields.length;++i){
			field = fields[i];
			if(field.name == fieldName){
				return;
			}
		}

		var type = null;
		var valueType = typeof(value);
		if(type == "string"){
			type = GeoBeans.FieldType.STRING;
		}else if(type == "number"){
			type = GeoBeans.FieldType.DOUBLE;
		}
		var field = new GeoBeans.Field(fieldName,type,this.layer.featureType,null);

		
	},

	


});