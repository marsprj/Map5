/**
 * @classdesc
 * WFS类型的数据源类。
 * @class
 */
GeoBeans.Source.Feature.WFS = GeoBeans.Class(GeoBeans.Source.Feature, {

	_url : null,
	_version : null,		//"1.0.0"
	_featureNS: null,		//'http://www.radi.ac.cn',
    _featurePrefix: null,	//'radi',
	_featureType : null,
	_geometryName : null,
	_outputFormat : "GML2",
	_srsName : 'EPSG:4326', //'EPSG:3857',

	/**
	 * new GeoBeans.Source.Feature.WFS({
	 * 		"url" : 'http://..',
	 * 		"version" : "1.0.0",
	 * 		"featureNS" : 'http://www.radi.ac.cn',
	 * 		"featurePrefix" : "radi",
	 * 		"featureType" : "cities",
	 * 		"geometryName": "shape",
	 * 		"outputFormat": "GML2"
	 * })
	 */
	initialize : function(options){
		GeoBeans.Source.Feature.prototype.initialize.apply(this, arguments);

		this._url = options.url;
		this._featureNS = options.featureNS;
		this._featurePrefix = options.featurePrefix;
		this._featureType = options.featureType;
		this._geometryName = isValid(options.geometryName) ? options.geometryName : "geometry";
		this._version = isValid(options.version) ? options.version : "1.0.0";
	},

	destroy : function(){
		GeoBeans.Source.Feature.prototype.destory.apply(this, arguments);
	},

	parseFeatures : function(xml){
		var that = this;
		
		var f = null;
		var g = null;
		var features = new Array();
		var reader  = new GeoBeans.Format.GML.Reader(GeoBeans.Format.GML.Version.v_2_0);
		$(xml).find("featureMember").each(function() {
            f = that.parseFeature($(this).children()[0], reader);
			features.push(f);
        });		
		return features;
	},
	
	parseFeature : function(xml, reader){
		
		var that = this;
		var geometry = null;
		var properties = {};
		var fid = this.parseFID($(xml).attr("fid"));
		
		$(xml).children().each(function(){
			var pnode = this;
			var field = pnode.tagName.substr(pnode.tagName.indexOf(":")+1);
			if(field == that._geometryName){
				var gnode = $(this).children()[0];
				geometry = reader.read(gnode);
			}
			else{
				var value = $(this).text();
				properties[field] = value;
			}
		});

		return new GeoBeans.Feature({
			"fid" : fid,
			"geometry" : geometry,
			"properties" : properties,
		});
	},
	
	parseFID : function(strfid){
		return strfid.substring(strfid.indexOf(".")+1);
	},
});

/**
 * 获得符合查询条件的Feature
 * @param  {GeoBeans.Filter} filter  查询过滤器
 * @param  {GeoBeans.Handler} success 	   查询成功的回调函数
 * @param  {GeoBeans.Handler} failure	   查询失败的回调函数
 * @public
 * @override
 */
GeoBeans.Source.Feature.WFS.prototype.getFeatures = function(filter, success, failure){
	var query = new GeoBeans.Query({
		"filter" : filter
	});
	this.query(query, success, failure);
}

/**
 * 获得指定范围的的Feature
 * @param  {GeoBeans.Envelope} extent 空间范围
 * @param  {GeoBeans.Handler} success 	   查询成功的回调函数
 * @param  {GeoBeans.Handler} failure	   查询失败的回调函数
 * @public
 * @override
 */
GeoBeans.Source.Feature.WFS.prototype.getFeaturesByExtent = function(extent, success, failure){
	var propName = this._geometryName;
	var filter = new GeoBeans.Filter.BBoxFilter(propName,extent);

	this.getFeatures(filter, success, failure);
}


/**
 * 获得符合查询条件的Feature
 * @param  {GeoBeans.Query} query  查询器
 * @param  {GeoBeans.Handler} success 	   查询成功的回调函数
 * @param  {GeoBeans.Handler} failure	   查询失败的回调函数
 * @public
 * @override
 */
GeoBeans.Source.Feature.WFS.prototype.query = function(query, success, failure){

	var that = this;	
	var mapName = null;
	var sourceName = null;

	//将query对象序列化为xml字符串
	var xml = this.serializeQuery(query, mapName,sourceName);

	var xhr = $.ajax({
		type : "post",
		url	 : this._url,
		data : xml,
		// contentType: "application/xml",
		contentType : "text/xml",
		dataType: "xml",
		async	: true,
		beforeSend: function(XMLHttpRequest){
		},
		success	: function(xml, textStatus){
			that._features = that.parseFeatures(xml);
			success.execute(that._features);
		},
		error	: function(e){
			failure.execute(e.message);
		}
	});		
	return xhr;
}


/**
 * 生成Query的XML格式
 * @private
 * @param  {GeoBeans.Query} query      查询对象
 * @param  {string}			mapName    地图名称
 * @param  {string}			sourceName 数据源名称
 * @return {string}            		   XML格式的Query
 */
GeoBeans.Source.Feature.WFS.prototype.serializeQuery = function(query, mapName, sourceName){

	var str = '<?xml version="1.0" encoding="UTF-8"?>'
			+ '<wfs:GetFeature service="WFS" version="' + this._version + '" outputFormat="' + this._outputFormat + '" ' 
			+ 'xmlns:wfs="http://www.opengis.net/wfs" '
			+ 'xmlns:ogc="http://www.opengis.net/ogc" '
			+ 'xmlns:gml="http://www.opengis.net/gml" '
			+ 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
			+ 'xsi:schemaLocation="http://www.opengis.net/wfs '
			+ 'http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" />';

	var doc = $.parseXML(str);
	var root = $(doc).find("GetFeature")[0];

	// set mapName and sourceName attribute
	if(isValid(mapName)){
		$(root).attr("mapName", mapName);
	}
	if(isValid(sourceName)){
		$(root).attr("sourceName", sourceName);	
	}
	// set maxFeatures
	var maxFeatures = query.getMaxFeatures();
	if(isValid(maxFeatures)){
		$(root).attr("maxFeatures", maxFeatures);		
	}
	// set offset
	var offset = query.getOffset();
	if(isValid(offset)){
		$(root).attr("offset", offset);
	}

	/**************************************************************/
	/* Query Node
	/**************************************************************/
	// create query node
	var qnode = doc.createElement("wfs:Query");
	$(qnode).attr("typeName", this._featurePrefix + ":"  + this._featureType);
	$(root).append(qnode);

	// set fields
	var fields = query.getFields();
	for (f in fields){
		fn = doc.createElement("wfs:PropertyName");
		$(fn).text(fields[f]);
		$(qnode).append(fn);
	}

	// set filter node
	var fw = new GeoBeans.FilterWriter();
	var fnode = fw.write(doc, query.getFilter());
	if(isValid(fnode)){
		$(qnode).append(fnode);
	}

	// set orderby
	var orderby = query.getOrderby();
	var onode = this.serializeOrderby(orderby, doc);
	if(isValid(onode)){
		$(qnode).append(onode);	
	}

	// serial xml document to string
	var xml = (new XMLSerializer()).serializeToString(doc);
	return xml;
}

/**
 * 生成Orderby的XML格式
 * @private
 * @param  {GeoBeans.Query.OrderBy} orderby  排序对象
 * @return {string}         		 字符串格式的Orderby对象
 */
GeoBeans.Source.Feature.WFS.prototype.serializeOrderby = function(orderby, xmlDoc){
	if(!isValid(orderby)){
		return null;
	}
	var onode = xmlDoc.createElement("ogc:OrderBy");
	$(onode).attr("order", orderby.isAsc() ? "asc" : "desc");

	var fields = orderby.getFields();
	for (f in fields){
		fnode = xmlDoc.createElement("wfs:PropertyName");
		$(fnode).text(fields[f]);
		$(onode).append(fnode);
	}

	return onode;
}