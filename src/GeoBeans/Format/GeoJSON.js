/**
 * @classdesc
 * GeoJSON数据格式类
 * @class
 */
GeoBeans.Format.GeoJson = GeoBeans.Class(GeoBeans.Format,{
	
	initialize : function(){

	},
});

/**
 * 读取features
 * @public
 * @param  {string} 			geoJson [geoJson字符串]
 * @param  {Array.<Field>} 	fields  [字段数组]
 * @return {Array.<Feature>}         	[feature数组]
 */
GeoBeans.Format.GeoJson.prototype.read = function(geoJson,fields){
	if(geoJson == null || fields == null){
		return null;
	}

	var type = geoJson.type;
	var that = this;
	if(type == "FeatureCollection"){
		var features = [];
		$(geoJson.features).each(function(){
			var feature = that.readFeature(this,fields);
			if(feature != null){
				features.push(feature);	
			}
		});
		return features;
	}else if(type == "Feature"){
		var feature = this.readFeature(geoJson,fields);
		if(feature != null){
			return [feature];
		}
	}
	return null;
}


/**
 * geoJson读取字段fields
 * @public
 * @param  {string} geoJson 	[geoJson字符串]
 * @return {Array.<Field>}    [字段数组]
 */
GeoBeans.Format.GeoJson.prototype.readFields = function(geoJson){
	if(geoJson == null){
		return null;
	}

	var type = geoJson.type;

	var featureType = new GeoBeans.FeatureType();
	featureType.fields = [];

	var fields = [];
	var that = this;
	if(type == "FeatureCollection"){
		$(geoJson.features).each(function(){
			var fields = that.readFieldsByFeature(this);
			that.addFields(featureType,fields);
		});
	}else if(type == "Feature"){
		var fields = this.readFieldsByFeature(this);
		this.addFields(featureType,fields);
	}


	// 增加geometry字段
	var field = new GeoBeans.Field("geometry",GeoBeans.FieldType.GEOMETRY,featureType,null);

	var geomType = this.readGeometryType(geoJson);
	field.setGeomType(geomType);
	featureType.fields.push(field);
	return featureType.fields;
};


/**
 * 从geoJson中读取geometry的类型
 * @private
 * @param  {string} 					geoJson [geoJson字符串]
 * @return {GeoBeans.Geometry.Type}         	[geometry类型]
 */
GeoBeans.Format.GeoJson.prototype.readGeometryType = function(geoJson){
	if(geoJson == null){
		return null;
	}

	var type = geoJson.type;

	var geomType = null;
	if(type == "FeatureCollection"){
		var features = geoJson.features;
		if(features != null){
			var feature = features[0];
			if(feature != null){
				var geometryJson = feature.geometry;
				geomType = this.readGeometryTypeByGeometry(geometryJson);
			}
		}
	}else if(type == "Feature"){
		var geometryJson = geoJson.geometry;
		geomType = this.readGeometryTypeByGeometry(geometryJson);
	}
	return geomType;
};


/**
 * 从geometry部分的geojson读取geometry的类型
 *  "geometry": {
	    "type": "Point",
	    "coordinates": [125.6, 10.1]
	},
 * @private
 * @param  {string}					geoJson [geoJson字符串]
 * @return {GeoBeans.Geometry.Type}         	[geometry类型]
 */
GeoBeans.Format.GeoJson.prototype.readGeometryTypeByGeometry = function(geoJson){
	if(geoJson == null){
		return null;
	}
	var type = geoJson.type;
	var geomType = null;
	switch(type){
		case "Point":{
			geomType = GeoBeans.Geometry.Type.POINT;
			break;
		}
		case "LineString":{
			geomType = GeoBeans.Geometry.Type.LINESTRING;
			break;
		}
		case "Polygon":{
			geomType = GeoBeans.Geometry.Type.POLYGON;
			break;
		}
		case "MultiPoint":{
			geomType = GeoBeans.Geometry.Type.MULTIPOINT;
			break;
		}
		case "MultiPolygon":{
			geomType = GeoBeans.Geometry.Type.MULTIPOLYGON;
			break;
		}
		case "MultiLineString":{
			geomType = GeoBeans.Geometry.Type.MULTILINESTRING;
			break;
		}
		case "GeometryCollection":{
			geomType = GeoBeans.Geometry.Type.COLLECTION;
			break;
		}
		default:
			break;
	}
	return geomType;
};


/**
 * 从feature部分读取field
 * { 
 *      "type": "Feature", 
 *      "properties": { 
 *		"name": "Saguenay (Arrondissement Latterière)" 
 *	 }, 
 *	"geometry": { 
 *		"type": "Point", 
 *		"coordinates": [ 
 *			-75.849253579389796, 47.6434349837781 
 *		]
 *	} 
 * }
 * @private
 * @param  {string} 			featureJson [geoJson字符串]
 * @return {Array.<Object>}             	[字段的数组]
 */
GeoBeans.Format.GeoJson.prototype.readFieldsByFeature = function(featureJson){
	if(featureJson == null){
		return;
	}
	var properties = featureJson.properties;
	if(properties == null){
		return null;
	}

	var fields = [];

	var keys = Object.keys(properties);
	var key = null;
	for(var i = 0; i < keys.length;++i){
		key = keys[i];
		if(key == null){
			continue;
		}
		var value = properties[key];
		var valueType = typeof(value);
		var type = null;
		if(valueType == "string"){
			type = GeoBeans.FieldType.STRING;
		}else if(valueType == "number"){
			type = GeoBeans.FieldType.DOUBLE;
		}

		var fieldObj = {
			name : key,
			type : type
		};
		fields.push(fieldObj);
	}

	return fields;
};


/**
 * 判断是否添加field到featureType中
 * @param {FeatureType} 		featureType []
 * @param {Array.<Object>} 	fieldsArray [字段数组]
 */
GeoBeans.Format.GeoJson.prototype.addFields = function(featureType,fieldsArray){
	if(featureType == null || fieldsArray == null){
		return;
	}

	var fields = featureType.fields;

	for(var i = 0; i < fieldsArray.length;++i){
		var fieldObj = fieldsArray[i];
		var name = fieldObj.name;
		var index = featureType.getFieldIndex(name);
		if(index == -1){
			var field = new GeoBeans.Field(name,fieldObj.type,featureType,null);
			featureType.fields.push(field);
		}
	}
};	

/**
 * 从feature部分的geoJson读取Feature
 * { 
 *      "type": "Feature", 
 *      "properties": { 
 *		"name": "Saguenay (Arrondissement Latterière)" 
 *	 }, 
 *	"geometry": { 
 *		"type": "Point", 
 *		"coordinates": [ 
 *			-75.849253579389796, 47.6434349837781 
 *		]
 *	} 
 * }
 * @param  {string} 			geoJson [geoJson字符串]
 * @param  {Array.<Field>} 	fields  [字段数组]
 * @return {Feautre}        			[返回要素]
 */
GeoBeans.Format.GeoJson.prototype.readFeature = function(geoJson,fields){
	if(geoJson == null || fields == null){
		return null;
	}

	var type = geoJson.type;
	if(type != "Feature"){
		return null;
	}
	var featureType = null;
	var field = fields[0];
	if(field != null){
		featureType = field.featureType;
	}else{
		featureType = new GeoBeans.FeatureType();
	}

	var fid = this.readID(geoJson);
	if(fid == null){
		fid = GeoBeans.Utility.uuid();
	}

	var geometry = this.readGeometry(geoJson.geometry);

	var values = this.readProperties(geoJson.properties,fields);

	if(geometry != null && values != null && fid != null && featureType != null){
		return new GeoBeans.Feature(featureType,fid,geometry,values);
	}else{
		return null;
	}
};


/**
 * 读取id
 * @private
 * @param  {string} geoJson [geoJson字符串]
 * @return {string}         [id值]
 */
GeoBeans.Format.GeoJson.prototype.readID = function(geoJson){
	if(geoJson == null){
		return null;
	}
	var id = geoJson.id;
	return id;
};


/**
 * 从geometry部分geoJson读取geometry
 *   "geometry": {
	    "type": "Point",
	    "coordinates": [125.6, 10.1]
	  },
 * @private
 * @param  {string}  	geoJson [geoJson字符串]
 * @return {Geometry}         [空间geometry]
 */
GeoBeans.Format.GeoJson.prototype.readGeometry = function(geoJson){
	if(geoJson == null){
		return null;
	}
	var type = geoJson.type;
	var geometry = null;
	switch(type){
		case "Point":{
			geometry = this.readPoint(geoJson);
			break;
		}
		case "LineString":{
			geometry = this.readLineString(geoJson);
			break;
		}
		case "Polygon":{
			geometry = this.readPolygon(geoJson);
			break;
		}
		case "MultiPoint":{
			geometry = this.readMultiPoint(geoJson);
			break;
		}
		case "MultiPolygon":{
			geometry = this.readMultiPolygon(geoJson);
			break;
		}
		case "MultiLineString":{
			geometry = this.readMultiLineString(geoJson);
			break;
		}
		case "GeometryCollection":{
			geometry = this.readGeometryCollection(geoJson);
			break;
		}
		default:
			break;
	}
	return geometry;
};


/**
 * 读取point
 * @private
 * @param  {string} geoJson [geoJson字符串]
 * @return {Point}          []
 */
GeoBeans.Format.GeoJson.prototype.readPoint = function(geoJson){
	if(geoJson == null){
		return null;
	}
	if(geoJson.type != "Point"){
		return null;
	}
	var coordinates = geoJson.coordinates;
	return this.readPointCoords(coordinates);
};


/**
 * 读取lineString
 * @private
 * @param  {string} 		geoJson [geoJson字符串]
 * @return {LineString}         
 */
GeoBeans.Format.GeoJson.prototype.readLineString = function(geoJson){
	if(geoJson == null){
		return null;
	}
	if(geoJson.type != "LineString"){
		return null;
	}

	var coordinates = geoJson.coordinates;
	return this.readLineStringCoords(coordinates);
};


/**
 * 读取polygon
 * @private
 * @param  {string} 	geoJson [geoJson字符串]
 * @return {Polygon}         	
 */
GeoBeans.Format.GeoJson.prototype.readPolygon = function(geoJson){
	if(geoJson == null){
		return null;
	}
	if(geoJson.type != "Polygon"){
		return null;
	}
	var coordinates = geoJson.coordinates;
	return this.readPolygonCoords(coordinates);
};


/**
 * 读取MultiPoint
 * @private
 * @param  {string} 	geoJson [geoJson字符串]
 * @return {MultiPoint}       
 */
GeoBeans.Format.GeoJson.prototype.readMultiPoint = function(geoJson){
	if(geoJson == null){
		return null;
	}
	if(geoJson.type != "MultiPoint"){
		return null;
	}

	var points = [];
	var coordinates = geoJson.coordinates;
	for(var i = 0; i < coordinates.length;++i){
		var point = this.readPointCoords(coordinates[i]);
		if(point != null){
			points.push(point);
		}
	}
	if(points.length != 0){
		return new GeoBeans.Geometry.MultiPoint(points);
	}else{
		return null;
	}
};

/**
 * 读取MultiLineString
 * @private
 * @param  {string} 		geoJson [geoJson字符串]
 * @return {MultiString}          
 */
GeoBeans.Format.GeoJson.prototype.readMultiLineString = function(geoJson){
	if(geoJson == null){
		return null;
	}
	if(geoJson.type != "MultiLineString"){
		return null;
	}
	var lines = [];
	var coordinates = geoJson.coordinates;
	for(var i = 0; i < coordinates.length;++i){
		var line = this.readLineStringCoords(coordinates[i]);
		if(line != null){
			lines.push(line);
		}
	}
	if(lines.length != 0){
		return new GeoBeans.Geometry.MultiLineString(lines);
	}else{
		return null;
	}
};


/**
 * 读取MultiPolygon
 * @private
 * @param  {string} 		geoJson [geoJson字符串]
 * @return {MultiPolygon}         
 */
GeoBeans.Format.GeoJson.prototype.readMultiPolygon = function(geoJson){
	if(geoJson == null){
		return null;
	}
	if(geoJson.type != "MultiPolygon"){
		return null;
	}

	var polygons = [];
	var coordinates = geoJson.coordinates;

	for(var i = 0; i < coordinates.length;++i){
		var polygon = this.readPolygonCoords(coordinates[i]);
		if(polygon != null){
			polygons.push(polygon);
		}
	}
	if(polygons.length != 0){
		return new GeoBeans.Geometry.MultiPolygon(polygons);
	}else{
		return null;
	}
};

/**
 * 读取GeometryCollection
 * @private
 * @param  {string} 			geoJson [geoJson字符串]
 * @return {GeometryCollection}        
 */
GeoBeans.Format.GeoJson.prototype.readGeometryCollection = function(geoJson){
	if(geoJson == null){
		return null;
	}
	if(geoJson.type != "GeometryCollection"){
		return null;
	}

	var components = [];
	var geometryJson = geoJson.geometries;
	for(var i = 0; i < geometryJson.length;++i){
		var geometry = this.readGeometry(geometryJson[i]);
		if(geometry != null){
			components.push(geometry);
		}			
	}		
	if(components.length != 0){
		return new GeoBeans.Geometry.GeometryCollection(components);
	}else{
		return null;
	}	
};

/**
 * 点坐标读取坐标
 * @private
 * @param  {string} coordinates [geoJson字符串]
 * @return {Point}              [点]
 */
GeoBeans.Format.GeoJson.prototype.readPointCoords = function(coordinates){
	if(coordinates == null && !($.isArray(coordinates))){
		return null;
	}
	return new GeoBeans.Geometry.Point(coordinates[0],coordinates[1]);
};

/**
 * 线坐标字符串读取坐标
 * @private
 * @param  {string} 	coordinates [geoJson字符串]
 * @return {LineString}           [线]
 */
GeoBeans.Format.GeoJson.prototype.readLineStringCoords = function(coordinates){
	if(coordinates == null && !($.isArray(coordinates))){
		return null;
	}

	var points = [];
	for(var i = 0; i < coordinates.length;++i){
		var point = this.readPointCoords(coordinates[i]);
		if(point != null){
			points.push(point);
		}
	}
	if(points.length != 0){
		return new GeoBeans.Geometry.LineString(points);
	}else{
		return null;
	}
};

/**
 * polygon坐标值转换polgyon
 * @private
 * @param  {string} coordinates [geoJson字符串]
 * @return {Polygon}             
 */
GeoBeans.Format.GeoJson.prototype.readPolygonCoords = function(coordinates){
	if(coordinates == null && !($.isArray(coordinates))){
		return null;
	}

	var rings = [];

	for(var i = 0; i < coordinates.length;++i){
		var ring = this.readLineStringCoords(coordinates[i]);
		if(ring != null){
			rings.push(ring);
		}
	}
	if(rings.length != 0){
		return new GeoBeans.Geometry.Polygon(rings);
	}else{
		return null;
	}
};
/**
 * 读取Properties中的字段对应数值
 * @private
 * @param  {string} 			geoJson [geoJson字符串]
 * @param  {Array.<Field>} 	fields  [字段数组]
 * @return {Array}         			[字段值数组]
 */
GeoBeans.Format.GeoJson.prototype.readProperties = function(geoJson,fields){
	if(geoJson == null || fields == null){
		return null;
	}

	var values = [];
	for(var i = 0; i < fields.length;++i){
		var field = fields[i];
		var fieldName = field.name;
		if(geoJson[fieldName] != null){
			values.push(geoJson[fieldName]);
		}else{
			values.push(null);
		}
	}
	return values;
}
