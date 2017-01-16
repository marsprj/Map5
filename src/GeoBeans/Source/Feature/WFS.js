/**
 * @classdesc
 * WFS类型的数据源类。
 *
 *	var source = new GeoBeans.Source.Feature.WFS({
 * 					"url" : 'http://..',
 * 					"version" : "1.0.0",
 * 					"featureNS" : 'http://www.radi.ac.cn',
 * 					"featurePrefix" : "radi",
 * 					"featureType" : "cities",
 * 					"geometryName": "shape",
 * 					"outputFormat": "GML2"
 * 				});
 * 				
 * @class
 * @extends {GeoBeans.Source.Feature}
 * @param 	{object} options options
 * @api stable
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
	_sourceName : null,
	_mapName : null,

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
		this._sourceName = isValid(options.sourceName) ? options.sourceName : null;
		this._mapName = isValid(options.mapName) ? options.mapName : null;
	},

	destroy : function(){
		GeoBeans.Source.Feature.prototype.destory.apply(this, arguments);
	},

	parseFeatures : function(xml){
		var that = this;
		
		var f = null;
		var g = null;
		var features = new Array();
		var format = new GeoBeans.Format.GML();
		$(xml).find("featureMember").each(function() {
            f = that.parseFeature($(this).children()[0], format);
			features.push(f);
        });		
		return features;
	},
	
	parseFeature : function(xml, format){
		
		var that = this;
		var geometry = null;
		var properties = {};
		var fid = this.parseFID($(xml).attr("fid"));
		
		$(xml).children().each(function(){
			var pnode = this;
			var field = pnode.tagName.substr(pnode.tagName.indexOf(":")+1);
			if(field == that._geometryName){
				var gnode = $(this).children()[0];
				geometry = format.read(gnode);
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
	var xml = null;

	if(isValid(query)){
		if(query instanceof GeoBeans.Filter){
			var filter = query;
			var condition = new GeoBeans.Query({
				filter : filter
			});
			xml = this.serializeQuery(condition, mapName,sourceName);
		}
		else if(query instanceof GeoBeans.Query){
			//将query对象序列化为xml字符串
			var sourceName = this._sourceName;
			var mapName = this._mapName;
			xml = this.serializeQuery(query, mapName,sourceName);
		}
		else{
			if(isValid(failure)){
				failure.execute("query type error");
			}
			return;
		}
	}
	else{
		var condition = new GeoBeans.Query({
			filter : null
		});
		xml = this.serializeQuery(query, mapName,sourceName);
	}
	
	$.ajax({
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
			if(isValid(success)){
				success.execute(that._features);
			}
		},
		error	: function(e){
			if(isValid(failure)){
				failure.execute(e.message);
			}
		}
	});
}

/**
 * 添加Feature
 * @param {GeoBeans.Feature} feature 要素
 * @public
 * @override
 */
GeoBeans.Source.Feature.prototype.addFeature = function(feature){
	if(isValid(feature)){
		this._features.push(feature);
	}
}


/**
 * 添加Feature数组
 * @param {Array.<GeoBeans.Feature>} features 要素数组
 * @public
 * @override
 */
GeoBeans.Source.Feature.prototype.addFeatures = function(features){
	if(isValid(features)){
		for(var i = 0; i < features.length;++i){
			this.addFeature(features[i]);
		}
	}
};



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
	for (var f in fields){
		var fn = doc.createElement("wfs:PropertyName");
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
	for (var f in fields){
		var fnode = xmlDoc.createElement("wfs:PropertyName");
		$(fnode).text(fields[f]);
		$(onode).append(fnode);
	}

	return onode;
}


/**
 * 获取字段
 * @param  {GeoBeans.Handler} success 获取成功回调函数
 * @param  {GeoBeans.Handler} failure 获取失败回调函数
 */
GeoBeans.Source.Feature.WFS.prototype.getFields = function(success,failure){
	var params = "service=" + "wfs" 
			+ "&version=" + this._version
			+ "&request=describeFeatureType" 
			+ "&typeName=" + this._featureType;
	if(isValid(this._sourceName)){
		params += "&sourceName=" + this._sourceName;
	}
	if(isValid(this._mapName)){
		params += "&mapName=" + this._mapName;	
	}
	var that = this;
	$.ajax({
		type : "get",
		url	 : this._url,
		data : encodeURI(params),
		contentType : "text/xml",
		dataType: "xml",
		async	: true,
		beforeSend: function(XMLHttpRequest){
		},
		success	: function(xml, textStatus){
			var fields = that.parseFields(xml);
			if(isValid(success)){
				success.execute(fields);
			}
		},
		error	: function(e){
			if(isValid(failure)){
				failure.execute(e.message);
			}
		}
	});	
};

/**
 * 解析字段
 * @private
 */
GeoBeans.Source.Feature.WFS.prototype.parseFields = function(xml){
	if($(xml).find("ExceptionText").length != 0){
		var text = $(xml).find("ExceptionText").text();
		return text;
	}
	var that = this;
	var f = null;
	var fields = new Array();
	$(xml).find("sequence").children().each(function() {
        f = that.parseField(this);
		fields.push(f);
    });
	
	return fields;
};
/**
 * 解析字段
 * @private
 */
GeoBeans.Source.Feature.WFS.prototype.parseField = function(xml){
	var name = $(xml).attr("name");
	var nullable = $(xml).attr("nillable");
	var xtype = $(xml).attr("type");
	var type = this.parseFieldType(xtype);
	var length = $(xml).attr("length");

	var f = new GeoBeans.Field(name, type, null,length);
	
	if(type==GeoBeans.Field.Type.GEOMETRY){
		var geomType = this.parseGeometryType(xtype);
		f.setGeomType(geomType);
		this.geomFieldName = name;
	}
	
	return f;	
}

/**
 * 解析字段类型
 * @private
 */
GeoBeans.Source.Feature.WFS.prototype.parseFieldType = function(xtype){
	if(xtype.substr(0,3) == "gml"){
		return GeoBeans.Field.Type.GEOMETRY;
	}		
	return xtype.substring(4, xtype.length);
};
	
/**
 * 解析空间属性类型
 * @private
 */
GeoBeans.Source.Feature.WFS.prototype.parseGeometryType = function(xtype){
	return (xtype.substr(4, xtype.length-16));
};



/**
 * 删除要素
 * @public
 * @param  {GeoBeans.Feature} feature 删除的要素
 * @param  {GeoBeans.Handler} success 删除成功的回调函数
 * @param  {GeoBeans.Handler} failure 删除失败的回调函数
 */
GeoBeans.Source.Feature.WFS.prototype.removeFeature = function(feature,success,failure){
	if(!isValid(feature)){
		return;
	}

	var str = '<?xml version="1.0" encoding="UTF-8"?>'
			+ '<wfs:Transaction  service="WFS" version="' + this._version + '" outputFormat="' + this._outputFormat + '" ' 
			+ 'xmlns:wfs="http://www.opengis.net/wfs" '
			+ 'xmlns:ogc="http://www.opengis.net/ogc" '
			+ 'xmlns:gml="http://www.opengis.net/gml" '
			+ 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
			+ 'xsi:schemaLocation="http://www.opengis.net/wfs '
			+ 'http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" />';

	var doc = $.parseXML(str);
	var root = $(doc).find("Transaction")[0];
	if(isValid(this._sourceName)){
		$(root).attr("sourceName", this._sourceName);	
	}
	if(isValid(this._mapName)){
		$(root).attr("mapName", this._mapName);	
	}
	var dnode = doc.createElement("wfs:Delete");
	$(dnode).attr("name", this._featureType);
	$(root).append(dnode);

	var fid = feature.fid;
	if(!isValid(fid)){
		return;
	}


	var filter = new GeoBeans.Filter.IDFilter();
	filter.addID(this._featureType + "." + fid);
	var fw = new GeoBeans.FilterWriter();
	var fnode = fw.write(doc,filter);
	if(isValid(fnode)){
		$(dnode).append(fnode);
	}

	var xml = (new XMLSerializer()).serializeToString(doc);
	var that = this;
	$.ajax({
		type : "post",
		url	 : this._url,
		data : xml,
		contentType : "text/xml",
		dataType: "xml",
		async	: true,
		beforeSend: function(XMLHttpRequest){
		},
		success	: function(xml, textStatus){
			var result = that.parseTransactionResp(xml);
			if(isValid(success)){
				success.execute(result);
			}
		},
		error: function(e){
			if(isValid(failure)){
				failure.execute(e.message);
			}
		}
	});

};

/**
 * 解析Transaction
 * @private
 */
GeoBeans.Source.Feature.WFS.prototype.parseTransactionResp = function(xml){
	var exception = $(xml).find("ExceptionText").text();
	if(exception != ""){
		console.log(exception);
		return null;
	}


	var insertedCount = $(xml).find("totalInserted").text();
	var updatedCount = $(xml).find("totalUpdated").text();
	var deletedCount = $(xml).find("totalDeleted").text();
	return{
		insert : parseInt(insertedCount),
		update : parseInt(updatedCount),
		delete : parseInt(deletedCount)
	};
};

/**
 * 增加要素
 * @public
 * @param {GeoBeans.Feature} feature 要素
 * @param {GeoBeans.Handler} success 成功回调函数
 * @param {GeoBeans.Handler} failure 失败回调函数
 */
GeoBeans.Source.Feature.WFS.prototype.addFeature = function(feature,success,failure){
	if(!isValid(feature)){
		return;
	}

	var str = '<?xml version="1.0" encoding="UTF-8"?>'
			+ '<wfs:Transaction  service="WFS" version="' + this._version + '" outputFormat="' + this._outputFormat + '" ' 
			+ 'xmlns:wfs="http://www.opengis.net/wfs" '
			+ 'xmlns:world="http://www.openplans.org/world" '
			+ 'xmlns:ogc="http://www.opengis.net/ogc" '
			+ 'xmlns:gml="http://www.opengis.net/gml" '
			+ 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
			+ 'xsi:schemaLocation="http://www.opengis.net/wfs '
			+ 'http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" />';

	var doc = $.parseXML(str);
	var root = $(doc).find("Transaction")[0];

	if(isValid(this._sourceName)){
		$(root).attr("sourceName", this._sourceName);	
	}
	if(isValid(this._mapName)){
		$(root).attr("mapName", this._mapName);	
	}

	var inode = doc.createElement("wfs:Insert");

	var nnode = doc.createElement("world:" + this._featureType);

	var format = new GeoBeans.Format.GML();
	var properties = feature.getProperties();
	for(var key in properties){
		var value = properties[key];
		if(isValid(key)){
			var knode = doc.createElement("world:" + key);
			if(value instanceof GeoBeans.Geometry){
				var gml = format.write(value);
				$(knode).append(gml);
			}else{
				$(knode).text(value);	
			}
			$(nnode).append(knode);
		}
	}

	$(inode).append(nnode);
	$(root).append(inode);

	var xml = (new XMLSerializer()).serializeToString(doc);
	var that = this;

	$.ajax({
		type : "post",
		url	 : this._url,
		data : xml,
		contentType : "text/xml",
		dataType: "xml",
		async	: true,
		beforeSend: function(XMLHttpRequest){
		},
		success	: function(xml, textStatus){
			var result = that.parseTransactionResp(xml);
			if(isValid(success)){
				success.execute(result);
			}
		},
		error: function(e){
			if(isValid(failure)){
				failure.execute(e.message);
			}
		}
	});
};

/**
 * 更新要素
 * @public
 * @param  {GeoBeans.Feature} feature 要更新的要素
 * @param  {GeoBeans.Handler} success 成功回调函数
 * @param  {GeoBeans.Handler} failure 失败回调函数
 */
GeoBeans.Source.Feature.WFS.prototype.updateFeature = function(feature,success,failure){
	if(!isValid(feature)){
		return;
	}

	var str = '<?xml version="1.0" encoding="UTF-8"?>'
			+ '<wfs:Transaction  service="WFS" version="' + this._version + '" outputFormat="' + this._outputFormat + '" ' 
			+ 'xmlns:wfs="http://www.opengis.net/wfs" '
			+ 'xmlns:ogc="http://www.opengis.net/ogc" '
			+ 'xmlns:gml="http://www.opengis.net/gml" '
			+ 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
			+ 'xsi:schemaLocation="http://www.opengis.net/wfs '
			+ 'http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" />';	
	var doc = $.parseXML(str);
	var root = $(doc).find("Transaction")[0];
	if(isValid(this._sourceName)){
		$(root).attr("sourceName", this._sourceName);	
	}
	if(isValid(this._mapName)){
		$(root).attr("mapName", this._mapName);	
	}

	var unode = doc.createElement("wfs:Update");
	$(unode).attr("name", this._featureType);
	$(root).append(unode);	

	var fid = feature.fid;
	if(!isValid(fid)){
		return;
	}


	var format = new GeoBeans.Format.GML();
	var properties = feature.getProperties();
	for(var key in properties){
		var value = properties[key];
		if(isValid(key)){
			if(key.toLowerCase() == "gid"){
				continue;
			}
			var pnode = doc.createElement("wfs:Property");
			var knode = doc.createElement("wfs:Name");
			$(knode).text(key);
			var vnode = doc.createElement("wfs:Value");
			if(value instanceof GeoBeans.Geometry){
				// var gml = format.write(value);
				// $(vnode).append(gml);
			}else{
				$(vnode).text(value);	
				$(pnode).append(knode);
				$(pnode).append(vnode);
				$(unode).append(pnode);
			}

		}
	}

	var filter = new GeoBeans.Filter.IDFilter();
	filter.addID(this._featureType + "." + fid);
	var fw = new GeoBeans.FilterWriter();
	var fnode = fw.write(doc,filter);
	if(isValid(fnode)){
		$(unode).append(fnode);
	}

	var xml = (new XMLSerializer()).serializeToString(doc);
	var that = this;

	$.ajax({
		type : "post",
		url	 : this._url,
		data : xml,
		contentType : "text/xml",
		dataType: "xml",
		async	: true,
		beforeSend: function(XMLHttpRequest){
		},
		success	: function(xml, textStatus){
			var result = that.parseTransactionResp(xml);
			if(isValid(success)){
				success.execute(result);
			}
		},
		error: function(e){
			if(isValid(failure)){
				failure.execute(e.message);
			}
		}
	});

}

/**
 * 获得符合查询条件的Feature个数
 * @param  {GeoBeans.Query} query  查询器
 * @param  {GeoBeans.Handler} success 	   查询成功的回调函数
 * @param  {GeoBeans.Handler} failure	   查询失败的回调函数
 * @public
 */
GeoBeans.Source.Feature.WFS.prototype.queryCount = function(query, success, failure){

	var that = this;
	var mapName = null;
	var sourceName = null;
	var xml = null;


	if(isValid(query)){
		if(query instanceof GeoBeans.Filter){
			var filter = query;
			var condition = new GeoBeans.Query({
				filter : filter
			});
			xml = this.serializeQueryCount(condition, mapName,sourceName);
		}
		else if(query instanceof GeoBeans.Query){
			//将query对象序列化为xml字符串
			var sourceName = this._sourceName;
			var mapName = this._mapName;
			xml = this.serializeQueryCount(query, mapName,sourceName);
		}
		else{
			if(isValid(failure)){
				failure.execute("query type error");
			}
			return;
		}
	}
	else{
		var condition = new GeoBeans.Query({
			filter : null
		});
		xml = this.serializeQueryCount(query, mapName,sourceName);
	}

	$.ajax({
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
			var count = that.parseCount(xml);
			if(isValid(success)){
				success.execute(count);
			}
		},
		error	: function(e){
			if(isValid(failure)){
				failure.execute(e.message);
			}
		}
	});	
}

/**
 * 生成QueryCount的XML格式
 * @private
 * @param  {GeoBeans.Query} query      查询对象
 * @param  {string}			mapName    地图名称
 * @param  {string}			sourceName 数据源名称
 * @return {string}            		   XML格式的Query
 */
GeoBeans.Source.Feature.WFS.prototype.serializeQueryCount = function(query, mapName, sourceName){

	var str = '<?xml version="1.0" encoding="UTF-8"?>'
			+ '<wfs:GetCount service="WFS" version="' + this._version + '" outputFormat="' + this._outputFormat + '" ' 
			+ 'xmlns:wfs="http://www.opengis.net/wfs" '
			+ 'xmlns:ogc="http://www.opengis.net/ogc" '
			+ 'xmlns:gml="http://www.opengis.net/gml" '
			+ 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
			+ 'xsi:schemaLocation="http://www.opengis.net/wfs '
			+ 'http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" />';

	var doc = $.parseXML(str);
	var root = $(doc).find("GetCount")[0];

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
 * 解析查询个数
 * @private
 * @param  {string} xml xml文档
 * @return {string}     个数
 */
GeoBeans.Source.Feature.WFS.prototype.parseCount = function(xml){
	var count = $(xml).find("Count").text();
	return count;
}