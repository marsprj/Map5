/**
 * @classdesc
 * Map5的Feature要素集类。
 * @class
 */
GeoBeans.FeatureType = GeoBeans.Class({
	
	workspace	: null,
	name		: null,
	title		: null,
	keywords	: null,
	srs			: null,
	extent		: null,
	fields		: null,
	geomFieldName: null,
	count 		: null,	

	// 最大最小值
	minMaxValue : null,	

	// 返回的getFeature的参数
	callback_obj : null,	

	initialize : function(workspace,name){
		this.workspace = workspace;
		this.name = name;
	},
	
	destory : function(){
		this.workspace = null;
		this.name = null;
		this.title = null;
		this.keywords = null;
		this.srs = null;
		this.extent = null;
		this.geomFieldName = null;
	},
	
	setName : function(name){
		this.name = name;
	},

	getName : function(){
		return this.name;
	},
	
	setTitle : function(title){
		this.title = title;
	},
	
	setKeywords : function(keywords){
		this.keywords = keywords;
	},
	
	setSrs : function(srs){
		this.srs = srs;
	},
	
	setExtent : function(extent){
		this.extent = extent;
	},
	
	getFields : function(){
		return this.fields;
	},

	getFieldsAsync : function(obj,callback){
		if(this.fields!=null && this.fields.length != 0){
			if(callback != null){
				callback(obj,this.fields);
			}
			return;
		}
		
		var that = this;
		var url = this.workspace.server; 
		
		var params = "service=" + this.workspace.service 
			+ "&version=" + this.workspace.version 
			+ "&request=describeFeatureType" 
			+ "&typeName=" + this.name;
		
		$.ajax({
			type	:"get",
			url		: url,
			data	: encodeURI(params),
			dataType: "xml",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.fields = that.parseFields(xml);
				if(callback != null){
					callback(obj,that.fields);
				}
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});		
	},
	
	getFieldIndex : function(field_name){
		var fields = this.getFields();
		for(var i=0, len=fields.length; i<len; i++){
			var f = fields[i];
			if(f.name == field_name){
				return i;
			}
		}
		return -1;
	},
	
	parseFields : function(xml){
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
	},
	
	parseField : function(xml){
		var name = $(xml).attr("name");
		var nullable = $(xml).attr("nillable");
		var xtype = $(xml).attr("type");
		var type = this.parseFieldType(xtype);
		var length = $(xml).attr("length");

		var f = new GeoBeans.Field(name, type, this,length);
		
		if(type==GeoBeans.FieldType.GEOMETRY){
			var geomType = this.parseGeometryType(xtype);
			f.setGeomType(geomType);
			this.geomFieldName = name;
		}
		
		return f;
	},
	
	parseFieldType : function(xtype){
		if(xtype.substr(0,3) == "gml"){
			return GeoBeans.FieldType.GEOMETRY;
		}		
		return xtype.substring(4, xtype.length);
	},
	
	parseGeometryType : function(xtype){
		return (xtype.substr(4, xtype.length-16));
	},
	
	// getFeatures : function(mapName,sourceName,maxFeatures,offset,fields){		
	// 	var that = this;
	// 	var url = this.workspace.server; 
		
	// 	var params = "service=" + this.workspace.service 
	// 		+ "&version=" + this.workspace.version 
	// 		+ "&request=getFeature" + "&typeName=" 
	// 		+ this.name;
		
	// 	if(mapName != null){
	// 		params += "&mapName=" + mapName;
	// 	}
	// 	if(sourceName != null){
	// 		params += "&sourceName=" + sourceName;
	// 	}
	// 	if(maxFeatures != null){
	// 		params += "&maxFeatures=" + maxFeatures;
	// 	}
	// 	if(offset != null){
	// 		params += "&offset=" + offset;
	// 	}
	// 	var fieldsParams = "";
	// 	if(fields != null){
	// 		for(var i = 0; i < fields.length;++i){
	// 			fieldsParams += fields[i];
	// 			if(i < fields.length -1){
	// 				fieldsParams += ",";
	// 			}
	// 		}
	// 	}
	// 	if(fieldsParams.length != 0){
	// 		params += "&fields=" + fieldsParams;
	// 	}

	// 	//解析需要fields
	// 	that.fields = that.getFields(mapName,sourceName);
		
	// 	$.ajax({
	// 		type	:"get",
	// 		url		: url,
	// 		// data	: encodeURI(params),
	// 		data	: encodeURI(encodeURI(params)),
	// 		dataType: "xml",
	// 		async	: false,
	// 		beforeSend: function(XMLHttpRequest){
	// 		},
	// 		success	: function(xml, textStatus){
	// 			var features = that.parseFeatures(xml);
	// 			that.features = features;
	// 			// if(callback != undefined){
	// 			// 	callback(that, features);
	// 			// }
	// 		},
	// 		complete: function(XMLHttpRequest, textStatus){
	// 		},
	// 		error	: function(){
	// 		}
	// 	});
	// 	return this.features;
	// },

	// getFeaturesAsync : function(maxFeatures,offset,fields,callback){
	// 	var that = this;
	// 	var url = this.workspace.server; 
	// 	// var url = "http://192.168.111.82/Map5/example/feature4.xml";

		
	// 	var params = "service=" + this.workspace.service 
	// 		+ "&version=" + this.workspace.version 
	// 		+ "&request=getFeature" + "&typeName=" 
	// 		+ this.name;
		
		
	// 	if(maxFeatures != null){
	// 		params += "&maxFeatures=" + maxFeatures;
	// 	}
	// 	if(offset != null){
	// 		params += "&offset=" + offset;
	// 	}
	// 	var fieldsParams = "";
	// 	if(fields != null){
	// 		for(var i = 0; i < fields.length;++i){
	// 			fieldsParams += fields[i];
	// 			if(i < fields.length -1){
	// 				fieldsParams += ",";
	// 			}
	// 		}
	// 	}
	// 	if(fieldsParams.length != 0){
	// 		params += "&fields=" + fieldsParams;
	// 	}

	// 	that.fields = that.getFields();
		
	// 	$.ajax({
	// 		type	:"get",
	// 		url		: url,
	// 		data	: encodeURI(encodeURI(params)),
	// 		dataType: "xml",
	// 		async	: true,
	// 		beforeSend: function(XMLHttpRequest){
	// 		},
	// 		success	: function(xml, textStatus){
	// 			var features = that.parseFeatures(xml);
	// 			// that.features = features;
	// 			if(callback != undefined){
	// 				callback(features);
	// 			}
	// 		},
	// 		complete: function(XMLHttpRequest, textStatus){
	// 		},
	// 		error	: function(XMLHttpRequest,textStatus,error){
	// 			console.log("textStatus:" + textStatus);
	// 			console.log("error:" + error);
	// 		}
	// 	});		
	// },
	

	getFeaturesAsync : function(maxFeatures,offset,fields,obj,callback){
		var that = this;
		var url = this.workspace.server; 

		
		var params = "service=" + this.workspace.service 
			+ "&version=" + this.workspace.version 
			+ "&request=getFeature" + "&typeName=" 
			+ this.name;
		
	
		if(maxFeatures != null){
			params += "&maxFeatures=" + maxFeatures;
		}
		if(offset != null){
			params += "&offset=" + offset;
		}
		var fieldsParams = "";
		if(fields != null){
			for(var i = 0; i < fields.length;++i){
				fieldsParams += fields[i];
				if(i < fields.length -1){
					fieldsParams += ",";
				}
			}
		}
		if(fieldsParams.length != 0){
			params += "&fields=" + fieldsParams;
		}

		// that.fields = that.getFields();
		if(this.fields == null){
			return;
		}
		
		var xhr = $.ajax({
			type	:"get",
			url		: url,
			data	: encodeURI(encodeURI(params)),
			dataType: "xml",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var features = that.parseFeatures(xml);
				// that.features = features;
				if(callback != undefined){
					callback(obj,features);
				}
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(XMLHttpRequest,textStatus,error){
				console.log("textStatus:" + textStatus);
				console.log("error:" + error);
			}
		});
		return xhr;
	},


	getFeatureBBoxGet : function(mapName,sourceName,
			viewer,maxFeatures,offset){
		var that = this;
		var url = this.workspace.server; 
		
		var params = "service=" + this.workspace.service 
			+ "&version=" + this.workspace.version 
			+ "&request=getFeature" + "&typeName=" 
			+ this.name;

		if(mapName != null){
			params += "&mapName=" + mapName;
		}
		if(sourceName != null){
			params += "&sourceName=" + sourceName;
		}
		if(viewer != null){
			var xmin = viewer.xmin;
			var xmax = viewer.xmax;
			var ymin = viewer.ymin;
			var ymax = viewer.ymax;
			var viewerStr = "";
			if(xmax - xmin < 0.01){
				viewerStr = viewer.toString();
			}else{
				viewerStr = xmin.toFixed(6) + "," + ymin.toFixed(6) + ","
							+ xmax.toFixed(6) + "," + ymax.toFixed(6);
			}

			params += "&bbox=" + viewerStr; 				
		}
		if(maxFeatures != null){
			params += "&maxFeatures=" + maxFeatures;
		}
		if(offset != null){
			params += "&offset=" + offset;
		}

		//解析需要fields
		that.fields = that.getFields(mapName,sourceName);

		$.ajax({
			type	:"get",
			url		: url,
			data	: encodeURI(params),
			dataType: "xml",
			async	: false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){

				var features = that.parseFeatures(xml);
				that.features = features;
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
		return that.features;
	},

	getFeaturesBBox : function(callback,viewer,filter){
		var xmin = viewer.xmin;
		var xmax = viewer.xmax;
		var ymin = viewer.ymin;
		var ymax = viewer.ymax;

		var viewerStr = xmin.toFixed(2) + "," + ymin.toFixed(2) + ","
						+ xmax.toFixed(2) + "," + ymax.toFixed(2);


		// var viewerStr = viewer.toString();
		var that = this;
		var url = this.workspace.server;
		
		var xml = this.buildGetFeatureXMLBboxFilter(viewer,filter);	
		$.ajax({
			// type	:"get",
			type : "post",
			url		: url,
			// data	: encodeURI(params),
			data : xml,
			// contentType: "application/xml",
			contentType : "text/xml",
			dataType: "xml",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var features = that.parseFeatures(xml);
				if(callback != undefined){
					callback(that, features);
				}
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
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
		
		var fid = this.parseFID($(xml).attr("fid"));
				
		var fields = this.getFields();
		var values = new Array();
		
		var g = null;
		var f = null;
		var len = this.fields.length;
		for(var i=0; i<len; i++){
			f = this.fields[i];
			if(f.type==GeoBeans.FieldType.GEOMETRY){
				var gml = $(xml).find(f.name + ":first").children()[0];
				if(gml==null){
					values.push(null);			
				}
				else{
					g = reader.read(gml);
					values.push(g);		
				}
			}
			else{
				var val = $(xml).find(f.name + ":first");
				values.push( (val==null||val.length == 0) ? null :  val.text());
			}
		}

		return (new GeoBeans.Feature(this, fid, g, values));
	},
	
	parseFID : function(strfid){
		var dot = strfid.indexOf(".");
		return strfid.substring(dot+1, strfid.length);
	},

	buildGetFeatureXMLBboxFilter : function(bbox,filter){
		var xml = "";
		var workspaceName = this.workspace.workspaceName;
		var xmlns_wfs = "xmlns:wfs=\"http://www.opengis.net/wfs\"";
		var xmlns_workspace = "xmlns:" + workspaceName
							+ "=\"" + this.workspace.xmlnsWorkspace
							+ "\"";
		var xmlns_gml = "xmlns:gml=\"http://www.opengis.net/gml\"";
		var xmlns_xsi = "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"";
		var xmlns_schemaLocation = "xsi:schemaLocation=\"http://www.opengis.net/wfs "
				+ "http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd\"";
		var xmlns_ogc = "xmlns:ogc=\"http://www.opengis.net/ogc\" ";
		xml += "<wfs:GetFeature service=\"WFS\" version=\"1.0.0\" "
			+ " " + xmlns_wfs
			+ " " + xmlns_ogc
			+ " " + xmlns_workspace
			+ " " + xmlns_gml
			+ " " + xmlns_xsi
			+ " " + xmlns_schemaLocation
			+ ">"
			+ "<wfs:Query typeName=\"" + this.name + "\">"
			+ 	"<ogc:Filter>";
		var filterXml = "";
		var bboxXml = ""
		if(bbox != null && bbox != undefined){
			bboxXml += "<ogc:BBOX>"
			// + "<ogc:PropertyName>" + this.geomFieldName + "</ogc:PropertyName>"
			// + "<ogc:PropertyName>" + "shape" + "</ogc:PropertyName>"
			+ "<gml:Box>"
			+ "<gml:coordinates>" + bbox.xmin + "," + bbox.ymin + " "
			+ bbox.xmax + "," + bbox.ymax + "</gml:coordinates>"
			+ "</gml:Box>"
			+ "</ogc:BBOX>";
		}
		if(filter != null && filter != undefined){
			var field = filter.field;
			var value = filter.value;
			filterXml += "<ogc:PropertyIsEqualTo>"
			+ "<ogc:PropertyName>" + field + "</ogc:PropertyName>"
			+ "<ogc:Literal>" + value + "</ogc:Literal>"
			+ "</ogc:PropertyIsEqualTo>";
		}

		if(filterXml != "" && bboxXml != ""){
			xml += "<And>"
				+ filterXml
				+ bboxXml
				+ "</And>";
		}else if(filterXml != "" && bboxXml == ""){
			xml += filterXml;
		}else if(filterXml == "" && bboxXml != ""){
			xml += bboxXml;
		}
		xml += "</ogc:Filter>"
		+ "</wfs:Query>"
		+ "</wfs:GetFeature>";


		return xml;
	},

	// getCount : function(mapName,sourceName,viewer){
	// 	var that = this;
	// 	var url = this.workspace.server; 
		
	// 	var params = "service=" + this.workspace.service 
	// 		+ "&version=" + this.workspace.version 
	// 		+ "&request=GetCount" 
	// 		+ "&typeName=" + this.name;
	// 	if(mapName != null){
	// 		params += "&mapName=" + mapName;
	// 	}
	// 	if(sourceName != null){
	// 		params += "&sourceName=" + sourceName;
	// 	}
	// 	if(viewer != null){
	// 		params += "&bbox=" + viewer.toString();
	// 	}
		
	// 	$.ajax({
	// 		type	:"get",
	// 		url		: url,
	// 		data	: encodeURI(params),
	// 		dataType: "xml",
	// 		async	: false,
	// 		beforeSend: function(XMLHttpRequest){
	// 		},
	// 		success	: function(xml, textStatus){
	// 			// that.fields = that.parseFields(xml);
	// 			that.count = that.parseCount(xml);
	// 		},
	// 		complete: function(XMLHttpRequest, textStatus){
	// 		},
	// 		error	: function(){
	// 		}
	// 	});
	// 	return that.count;
	// },

	// parseCount : function(xml){
	// 	// 错误信息
	// 	if($(xml).find("ExceptionText").length != 0){
	// 		var text = $(xml).find("ExceptionText").text();
	// 		if(text != ""){
	// 			return  text;
	// 		}
	// 	}
	// 	var count = $(xml).find("Count").text();
	// 	return parseInt(count);
	// },

	getFeaturesWithin : function(mapName,sourceName,point){
		var that = this;
		var url = this.workspace.server; 

		var xml = this.buildGetFeaturesXMLWithin(mapName,sourceName,point);
		$.ajax({
			type	:"post",
			url		: url,
			 contentType: "text/xml",
			dataType: "xml",
			// dataType: "text",
			data : xml,
			async	: false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var features = that.parseFeatures(xml);
				that.features = features;
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
		return that.features;
	},

	getFeaturesWithinAsync : function(mapName,sourceName,point,callback,fields,obj){
		var that = this;
		var url = this.workspace.server; 

		var xml = this.buildGetFeaturesXMLWithin(mapName,sourceName,point,fields);
		$.ajax({
			type	:"post",
			url		: url,
			contentType: "text/xml",
			dataType: "xml",
			data : xml,
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var features = that.parseFeatures(xml);
				if(callback != undefined){
					callback(obj,features);
				}
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});		
	},

	buildGetFeaturesXMLWithin : function(mapName,sourceName,point,fields){
		var xml = "";
		xml += "<wfs:GetFeature service=\"WFS\" version=\"1.1.0\" ";
		if(mapName != null){
			xml += "mapName=\"" + mapName + "\" ";
		}
		if(sourceName != null){
			xml += "sourceName=\"" + sourceName + "\" ";
		}
		var fieldsXML = "";
		if(fields != null){
			for(var i = 0; i < fields.length;++i){
				var field = fields[i];
				if(field == null){
					continue;
				}
				fieldsXML += "<wfs:PropertyName>" + field + "</wfs:PropertyName>";
			}
		}

		var gmlWriter = new GeoBeans.Format.GML.Writer(GeoBeans.Format.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(point);
		xml +=  "xmlns:world=\"www.world.ac.cn\" "
	         +  "xmlns:wfs=\"http://www.opengis.net/wfs\" "
	         +  "xmlns:gml=\"http://www.opengis.net/gml\" "
	         +  "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "
	         +  "xsi:schemaLocation=\"http://www.opengis.net/wfs "
	         +  "http://schemas.opengis.net/wfs/1.1.0/wfs.xsd\">"
	         +  "<wfs:Query typeName=\"" + this.name +  "\">"
	         + 	fieldsXML
	         +  "	<Filter>"
	         + 	"		<Within>"
	         +	"			<PropertyName>" + this.geomFieldName + "</PropertyName>"
	         +				geomGml
	         + 	"		</Within>"
	         + 	"	</Filter>"
	         + 	"</wfs:Query>"
	         + 	"</wfs:GetFeature>";	
	    return xml;
	},

	// 较为通用的查询fitler
	getFeaturesFilter : function(mapName,sourceName,filter,maxFeatures,offset,fields,orderby){
		var that = this;
		var url = this.workspace.server;

		var xml = this.buildGetFeatureFilterXML(mapName,sourceName,
			filter,maxFeatures,offset,fields,orderby);
		
		this.fields = this.getFields(mapName,sourceName);

		$.ajax({
			type : "post",
			url	 : url,
			data : xml,
			// contentType: "application/xml",
			contentType : "text/xml",
			dataType: "xml",
			async	: false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var features = that.parseFeatures(xml);
				that.features = features;
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
		return that.features;
	},


	getFeaturesFilterAsync : function(mapName,sourceName,filter,maxFeatures,offset,fields,orderby,callback){
		var that = this;
		var url = this.workspace.server;

		var xml = this.buildGetFeatureFilterXML(mapName,sourceName,
			filter,maxFeatures,offset,fields,orderby);
		
		this.fields = this.getFields(mapName,sourceName);

		$.ajax({
			type : "post",
			url	 : url,
			data : xml,
			// contentType: "application/xml",
			contentType : "text/xml",
			dataType: "xml",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var features = that.parseFeatures(xml);
				if(callback != undefined){
					callback(features);
				}
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(XMLHttpRequest,textStatus,error){
				console.log("textStatus:" + textStatus);
				console.log("error:" + error);
			}
		});
	},

	// 带有object的回调函数
	getFeaturesFilterAsync2 : function(mapName,sourceName,filter,maxFeatures,offset,fields,orderby,obj,callback){
		var that = this;
		var url = this.workspace.server;

		var xml = this.buildGetFeatureFilterXML(mapName,sourceName,
			filter,maxFeatures,offset,fields);
		
		this.fields = this.getFields(mapName,sourceName);

		// 设置返回的参数
		this.callback_obj = obj;

		var xhr = $.ajax({
			type : "post",
			url	 : url,
			data : xml,
			// contentType: "application/xml",
			contentType : "text/xml",
			dataType: "xml",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var features = that.parseFeatures(xml);
				if(callback != undefined){
					callback(that.callback_obj,features);
				}
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(XMLHttpRequest,textStatus,error){
				// console.log("textStatus:" + textStatus);
				// console.log("error:" + error);
			}
		});		
		return xhr;
	},

	// XML getFeature
	// @deprecated
	buildGetFeatureFilterXML : function(mapName,sourceName,
			filter,maxFeatures,offset,fields,orderby){

		var str = '<?xml version="1.0" encoding="UTF-8"?>' 
			 + "<wfs:GetFeature service=\"WFS\" version=\"1.0.0\" " 
			 + 	"outputFormat=\"GML2\" "
			 // +  "xmlns:world=\"www.world.ac.cn\" "
	         +  "xmlns:wfs=\"http://www.opengis.net/wfs\" "
	         +	"xmlns:ogc=\"http://www.opengis.net/ogc\" "
	         +  "xmlns:gml=\"http://www.opengis.net/gml\" "
	         +  "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "
	         +  "xsi:schemaLocation=\"http://www.opengis.net/wfs "
	         +  "http://schemas.opengis.net/wfs/1.1.0/wfs.xsd\" ";
	   	if(mapName != null){
	   		str += "mapName=\"" + mapName + "\" ";
	   	}     
	   	if(sourceName != null){
	   		str += "sourceName=\"" + sourceName + "\" ";
	   	}
	  
	   	if(maxFeatures != null){
	   		str += "maxFeatures=\"" + maxFeatures + "\" ";
	   	}
	   	if(offset != null){
	   		str += "offset=\"" + offset + "\" ";
	   	}
	   
	   	str += "/>";
		var xml = $.parseXML(str);

		var queryXML = xml.createElement("wfs:Query");
		$(queryXML).attr('typeName',this.name);

		if(fields != null){
			for(var i = 0; i < fields.length; ++i){
				var fieldXML = xml.createElement("wfs:PropertyName");
				$(fieldXML).text(fields[i]);
				$(queryXML).append(fieldXML);
			}
		}
		
		var filterWriter = new GeoBeans.FilterWriter();
		var filterXML = filterWriter.write(xml,filter);
		$(queryXML).append(filterXML);

		if(orderby != null){
	   		var orderbyXML = this.buildOrderbyXML(xml,orderby);
	   		$(queryXML).append(orderbyXML);
	   	}
		$("GetFeature",xml).append(queryXML);
		var xmlString = (new XMLSerializer()).serializeToString(xml);
		return xmlString;
	},

	// @deprecated
	buildOrderbyXML : function(xml,orderby){
		if(orderby == null){
			return "";
		}
		var orderbyXML = xml.createElement("ogc:OrderBy");
		var flag = orderby.isAsc();
		if(flag){
			$(orderbyXML).attr("order","asc");
		}else{
			$(orderbyXML).attr("order","desc");
		}
		var count = orderby.getFieldCount();
		var fieldXML = null, field = null;
		for(var i = 0; i < count; ++i){
			field = orderby.getField(i);
			if(field != null){
				fieldXML = xml.createElement("wfs:PropertyName");
				$(fieldXML).text(field);
				$(orderbyXML).append(fieldXML);
			}
		}
		return orderbyXML;
	},

	// getFeatureFilterCount : function(mapName,sourceName,filter){
	// 	var that = this;
	// 	var url = this.workspace.server;

	// 	var xml = this.buildGetFeatureFilterCountXML(mapName,sourceName,
	// 		filter);
		

	// 	$.ajax({
	// 		type : "post",
	// 		url	 : url,
	// 		data : xml,
	// 		contentType : "text/xml",
	// 		dataType: "xml",
	// 		async	: false,
	// 		beforeSend: function(XMLHttpRequest){
	// 		},
	// 		success	: function(xml, textStatus){
	// 			that.count = that.parseCount(xml);
	// 		},
	// 		complete: function(XMLHttpRequest, textStatus){
	// 		},
	// 		error	: function(){
	// 		}
	// 	});
	// 	return that.count;
	// },

	// buildGetFeatureFilterCountXML : function(mapName,sourceName,filter){
	// 	var str = '<?xml version="1.0" encoding="UTF-8"?>' 
	// 		 + "<wfs:GetCount service=\"WFS\" version=\"1.0.0\" " 
	// 		 + 	"outputFormat=\"GML2\" "
	// 		 +  "xmlns:world=\"www.world.ac.cn\" "
	//          +  "xmlns:wfs=\"http://www.opengis.net/wfs\" "
	//          +	"xmlns:ogc=\"http://www.opengis.net/ogc\" "
	//          +  "xmlns:gml=\"http://www.opengis.net/gml\" "
	//          +  "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "
	//          +  "xsi:schemaLocation=\"http://www.opengis.net/wfs "
	//          +  "http://schemas.opengis.net/wfs/1.1.0/wfs.xsd\" ";
	//    	if(mapName != null){
	//    		str += "mapName=\"" + mapName + "\" ";
	//    	}     
	//    	if(sourceName != null){
	//    		str += "sourceName=\"" + sourceName + "\" ";
	//    	}
	   	
	//    	str += "/>";
	// 	var xml = $.parseXML(str);

	// 	var queryXML = xml.createElement("wfs:Query");
	// 	$(queryXML).attr('typeName',this.name);

	// 	var filterWriter = new GeoBeans.FilterWriter();
	// 	var filterXML = filterWriter.write(xml,filter);
	// 	$(queryXML).append(filterXML);
	// 	$("GetCount",xml).append(queryXML);
	// 	var xmlString = (new XMLSerializer()).serializeToString(xml);
	// 	return xmlString ;
	// },

	// getFeatureFilterCountAsync : function(mapName,sourceName,filter,obj,callback){
	// 	var that = this;
	// 	var url = this.workspace.server;

	// 	var xml = this.buildGetFeatureFilterCountXML(mapName,sourceName,
	// 		filter);
		
	// 	// 设置返回的参数
	// 	this.callback_obj = obj;
		
	// 	$.ajax({
	// 		type : "post",
	// 		url	 : url,
	// 		data : xml,
	// 		contentType : "text/xml",
	// 		dataType: "xml",
	// 		async	: true,
	// 		beforeSend: function(XMLHttpRequest){
	// 		},
	// 		success	: function(xml, textStatus){
	// 			var count = that.parseCount(xml);
	// 			if(callback != null){
	// 				callback(that.callback_obj,count);
	// 			}
	// 		},
	// 		complete: function(XMLHttpRequest, textStatus){
	// 		},
	// 		error	: function(){
	// 		}
	// 	});
	// 	return that.count;
	// },

	// getFeatureFilterOutput : function(mapName,sourceName,filter,maxFeatures,offset){
	// 	var url = this.workspace.server; 

	// 	var str = '<?xml version="1.0" encoding="UTF-8"?><a/>' ;
	// 	var xml = $.parseXML(str);
	// 	var filterWriter = new GeoBeans.FilterWriter();
	// 	var filterXML = filterWriter.write(xml,filter);
	// 	$(filterXML).attr("xmlns:ogc","http://www.opengis.net/ogc");
	// 	$(filterXML).attr("xmlns:gml","http://www.opengis.net/gml");
	// 	var xmlString = (new XMLSerializer()).serializeToString(filterXML);
	// 	var params = "service=" + this.workspace.service 
	// 		+ "&version=" + this.workspace.version 
	// 		+ "&request=getFeature" + "&typeName=" 
	// 		+ this.name 
	// 		+ "&outputFormat=shape-zip"
	// 		+ "&filter=" + xmlString;
	// 	if(mapName != null){
	// 		params += "&mapName=" + mapName;
	// 	}
	// 	if(sourceName != null){
	// 		params += "&sourceName=" + sourceName;
	// 	}
	// 	return url + "?" + params;
	// },

	CLASS_NAME : "GeoBeans.FeatureType"
});

// GeoBeans.FeatureType.prototype.query = function(filter){
// 	var that = this;
// 	var url = this.workspace.server;

// 	var xml = this.buildGetFeatureFilterXML(mapName,sourceName,
// 		filter,maxFeatures,offset,fields);
	
// 	this.fields = this.getFields(mapName,sourceName);

// 	// 设置返回的参数
// 	this.callback_obj = obj;

// 	var xhr = $.ajax({
// 		type : "post",
// 		url	 : url,
// 		data : xml,
// 		// contentType: "application/xml",
// 		contentType : "text/xml",
// 		dataType: "xml",
// 		async	: true,
// 		beforeSend: function(XMLHttpRequest){
// 		},
// 		success	: function(xml, textStatus){
// 			var features = that.parseFeatures(xml);
// 			if(callback != undefined){
// 				callback(that.callback_obj,features);
// 			}
// 		},
// 		complete: function(XMLHttpRequest, textStatus){
// 		},
// 		error	: function(XMLHttpRequest,textStatus,error){
// 			// console.log("textStatus:" + textStatus);
// 			// console.log("error:" + error);
// 		}
// 	});		
// 	return xhr;
// }



/**
 * [query description]
 * @param  {[type]} filter [description]
 * @return {[type]}        [description]
 */
GeoBeans.FeatureType.prototype.query = function(query, handler){
	var that = this;
	var url = this.workspace.server;
	
	var mapName = null;
	var sourceName = null;

	//将query对象序列化为xml字符串
	var xml = this.writeQuery(query, mapName,sourceName);

	var xhr = $.ajax({
		type : "post",
		url	 : url,
		data : xml,
		// contentType: "application/xml",
		contentType : "text/xml",
		dataType: "xml",
		async	: true,
		beforeSend: function(XMLHttpRequest){
		},
		success	: function(xml, textStatus){
			var features = that.parseFeatures(xml);
			if(isValid(handler)){
				handler.execute(features);
			}
		},
		complete: function(XMLHttpRequest, textStatus){
		},
		error	: function(XMLHttpRequest,textStatus,error){
			// console.log("textStatus:" + textStatus);
			// console.log("error:" + error);
		}
	});		
	return xhr;
}

GeoBeans.FeatureType.prototype.writeFilter = function(query){

}

/**
 * 生成Query的XML格式
 * @private
 * @param  {[type]} query      [description]
 * @param  {[type]} mapName    [description]
 * @param  {[type]} sourceName [description]
 * @return {[type]}            [description]
 */
GeoBeans.FeatureType.prototype.writeQuery = function(query, mapName, sourceName){

	var str = '<?xml version="1.0" encoding="UTF-8"?>'
			+ '<wfs:GetFeature service="WFS" version="1.0.0" outputFormat="GML2" ' 
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
	$(qnode).attr("typeName", this.name);
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
	var onode = this.writeOrderby(orderby, doc);
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
 * @param  {[type]} orderby [description]
 * @return {[type]}         [description]
 */
GeoBeans.FeatureType.prototype.writeOrderby = function(orderby, xmlDoc){
	if(!isValid(orderby)){
		return null;
	}
	var onode = xmlDoc.createElement("ogc:OrderBy");
	$(onode).attr("order", orderby.isAsc() ? "asc" : "desc");

	var fields = orderby.getFields();
	for (field in fields){
		fnode = xml.createElement("wfs:PropertyName");
		$(fnode).text(field);
		$(onode).append(fnode);
	}

	return onode;
}
