GeoBeans.GeoJsonReader = GeoBeans.Class({
		
	layerName : null,

	fields : null,


	layer : null,

	// 自增id
	incrementID : 0,

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
			if(features != null){
				this.layer.addFeatures(features);
			}
		}else if(type == "Feature"){
			var feature = this.parseFeature(json);
			if(feature != null){
				this.layer.addFeature(feature);
			}
		}
	},

	parseFeatureCollection : function(json){
		if(json == null){
			return null;
		}

		var features = [];
		var that = this;
		$(json.features).each(function(){
			var feature = that.parseFeature(this);
			features.push(feature);
		});

		return features;
	},

	parseFeature : function(json){
		if(json == null){
			return null;
		}
		var type = json.type;
		if(type != "Feature"){
			return null;
		}

		var fid = this.parseId(json);
		if(fid == null){
			fid = this.getFid();
		}
		if(fid == null){
			return null;
		}
		
		var geometry = this.parseGeometry(json.geometry);
		var values = this.parseProperties(json.properties);
		var feature = new GeoBeans.Feature(this.layer.featureType,fid,geometry,values);
		return feature;
	},

	parseId : function(json){
		if(json == null){
			return null;
		}
		var id = json.id;
		return id;
	},

	getFid : function(){
		if(this.layer == null){
			return null;
		}
		var id = this.layerName + "_" + this.incrementID;
		while(this.layer.getFeatureByID(id) != null){
			this.incrementID++;
			id = this.layerName + "_" + this.incrementID;
		}
		return id;
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
		if(json.type != "Point"){
			return null;
		}
		var coordinates = json.coordinates;
		return this.parsePointCoords(coordinates);
	},

	parseLineString : function(json){
		if(json == null){
			return null;
		}
		if(json.type != "LineString"){
			return null;
		}

		var coordinates = json.coordinates;
		return this.parseLineStringCoords(coordinates);
	},

	parsePointCoords : function(coordinates){
		if(coordinates == null && !($.isArray(coordinates))){
			return null;
		}
		return new GeoBeans.Geometry.Point(coordinates[0],coordinates[1]);
	},

	parseLineStringCoords : function(coordinates){
		if(coordinates == null && !($.isArray(coordinates))){
			return null;
		}

		var points = [];
		for(var i = 0; i < coordinates.length;++i){
			var point = this.parsePointCoords(coordinates[i]);
			if(point != null){
				points.push(point);
			}
		}
		if(points.length != 0){
			return new GeoBeans.Geometry.LineString(points);
		}else{
			return null;
		}
	},

	parsePolygonCoords : function(coordinates){
		if(coordinates == null && !($.isArray(coordinates))){
			return null;
		}

		var rings = [];

		for(var i = 0; i < coordinates.length;++i){
			var ring = this.parseLineStringCoords(coordinates[i]);
			if(ring != null){
				rings.push(ring);
			}
		}
		if(rings.length != 0){
			return new GeoBeans.Geometry.Polygon(rings);
		}else{
			return null;
		}
	},

	parsePolygon : function(json){
		if(json == null){
			return null;
		}
		if(json.type != "Polygon"){
			return null;
		}
		var coordinates = json.coordinates;
		return this.parsePolygonCoords(coordinates);

	},

	parseMultiPoint : function(json){
		if(json == null){
			return null;
		}
		if(json.type != "MultiPoint"){
			return null;
		}

		var points = [];
		var coordinates = json.coordinates;
		for(var i = 0; i < coordinates.length;++i){
			var point = this.parsePointCoords(coordinates[i]);
			if(point != null){
				points.push(point);
			}
		}
		if(points.length != 0){
			return new GeoBeans.Geometry.MultiPoint(points);
		}else{
			return null;
		}
	},

	parseMultiPolygon : function(json){
		if(json == null){
			return null;
		}
		if(json.type != "MultiPolygon"){
			return null;
		}

		var polygons = [];
		var coordinates = json.coordinates;

		for(var i = 0; i < coordinates.length;++i){
			var polygon = this.parsePolygonCoords(coordinates[i]);
			if(polygon != null){
				polygons.push(polygon);
			}
		}
		if(polygons.length != 0){
			return new GeoBeans.Geometry.MultiPolygon(polygons);
		}else{
			return null;
		}

	},

	parseMultiLineString : function(json){
		if(json == null){
			return null;
		}
		if(json.type != "MultiLineString"){
			return null;
		}
		var lines = [];
		var coordinates = json.coordinates;
		for(var i = 0; i < coordinates.length;++i){
			var line = this.parseLineStringCoords(coordinates[i]);
			if(line != null){
				lines.push(line);
			}
		}
		if(lines.length != 0){
			return new GeoBeans.Geometry.MultiLineString(lines);
		}else{
			return null;
		}
	},

	parseGeometryCollection : function(json){
		if(json == null){
			return null;
		}
		if(json.type != "GeometryCollection"){
			return null;
		}

		var components = [];
		var geometryJson = json.geometries;
		for(var i = 0; i < geometryJson.length;++i){
			var geometry = this.parseGeometry(geometryJson[i]);
			if(geometry != null){
				components.push(geometry);
			}			
		}		
		if(components.length != 0){
			return new GeoBeans.Geometry.GeometryCollection(components);
		}else{
			return null;
		}
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

		var values = [];
		var fields = this.layer.featureType.fields;
		var field = null,fieldName = null;
		for(var i = 0; i < fields.length;++i){
			field = fields[i];
			fieldName = field.name;
			if(json[fieldName] != null){
				values.push(json[fieldName]);
			}else{
				values.push(null);
			}
		}

		return values;
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
		if(valueType == "string"){
			type = GeoBeans.FieldType.STRING;
		}else if(valueType == "number"){
			type = GeoBeans.FieldType.DOUBLE;
		}
		var field = new GeoBeans.Field(fieldName,type,this.layer.featureType,null);

		this.layer.featureType.fields.push(field);
	},
});