GeoBeans.WFSWorkspace = GeoBeans.Class(GeoBeans.Workspace, {
	server : null,
	service: "wfs",
	version: "1.0.0",
	featureTypes : null,
	xmlns : null,
	xmlnsWorkspace : null,
	workspaceName : null,
	
	initialize : function(name,server,version){
		GeoBeans.Workspace.prototype.initialize.apply(this, arguments);
		
		this.server = server;
		this.version = version;
		this.featureTypes = null;
		//获得工作区的名称
		var index_1 = server.lastIndexOf("/");
		var str_1 = server.substr(0,index_1);
		var index_2 = str_1.lastIndexOf("/");
		this.workspaceName = str_1.substr(index_2 + 1,str_1.length);

	},
	
	destory : function(){
		this.server = null;
		this.version = null;
		this.featureTypes = null;
		
		GeoBeans.Workspace.prototype.destory.apply(this, arguments);
	},
	
	getFeatureTypes : function(callback){
		if(this.featureTypes!=null){
			return this.featureTypes;
		}
		
		var that = this;
		
		var params = "service=" + this.service + "&version=" + this.version + "&request=getCapabilities";
		
		$.ajax({
			type	:"get",
			url		: this.server,
			data	: encodeURI(params),
			dataType: "xml",
			async	: false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.featureTypes = that.parseFeatureTypes(xml);
				that.xmlns = $(xml).children("WFS_Capabilities").attr("xmlns");
				var workspanceNameXmlns = "xmlns:" + that.workspaceName;
				that.xmlnsWorkspace = $(xml).children("WFS_Capabilities").attr(workspanceNameXmlns);
				//callback(fts);
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
		return this.featureTypes;
	},
	
	getFeatureType : function(name){
		var types = this.getFeatureTypes();
		var len = types.length;
		for(var i=0; i<len; i++){
			var type = types[i];
			if(type.name == name){
				return type;
			}
		}
		return null;
	},
	
	parseFeatureTypes : function(xml){
		var ft = null;
		var fts = new Array();
		
		var that = this;
		$(xml).find("FeatureType").each(function() {
            ft = that.parseFeatureType(this);
			fts.push(ft);
        });
		return fts;
	},
	
	parseFeatureType : function(xml){
		var name		= $(xml).children("Name:first").text();
		var title		= $(xml).children("Title:first").text();
		var keywords	= $(xml).children("Keywords:first").text();
		var srs			= $(xml).children("SRS:first").text();
		var bound		= $(xml).children("LatLongBoundingBox:first");
		
		var xmin = parseFloat($(bound).attr("minx"));
		var xmax = parseFloat($(bound).attr("maxx"));
		var ymin = parseFloat($(bound).attr("miny"));
		var ymax = parseFloat($(bound).attr("maxy"));
		
		var extent = new GeoBeans.Envelope(xmin,ymin,xmax,ymax);
		
		var ft = new GeoBeans.FeatureType(this);
		ft.setName(name);
		ft.setTitle(title);
		ft.setKeywords(keywords);
		ft.setSrs(srs);
		ft.setExtent(extent);
		
		return ft;
	},

	//缓冲区查询
	queryByBuffer : function(distance,geometry,
				featureType,callback){
		if(distance == null || distance < 0 ||
			geometry == null || featureType == null){
			return;
		}
		var geomFieldName = featureType.geomFieldName;
		var gmlWriter = new GeoBeans.Geometry.GML.Writer(GeoBeans.Geometry.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(geometry);
		var typeName = featureType.name;
		
		var xml = this.buildBufferXML(typeName,geomFieldName,
						geometry,distance);
		$.ajax({
			type	:"post",
			url		: this.server,
			contentType: "text/xml",
			data	: xml,
			dataType: "xml",
			async	: false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var features = featureType.parseFeatures(xml);
				callback(features);
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});	
	},

	buildBufferXML : function(typeName,geomFieldName,
			geometry,distance){
		var xml = "";
		var workspaceName = this.workspaceName;
		var xmlns_wfs = "xmlns:wfs=\"http://www.opengis.net/wfs\"";
		var xmlns_workspace = "xmlns:" + workspaceName
							+ "=\"" + this.xmlnsWorkspace
							+ "\"";
		var xmlns_gml = "xmlns:gml=\"http://www.opengis.net/gml\"";
		var xmlns_xsi = "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"";
		var xmlns_schemaLocation = "xsi:schemaLocation=\"http://www.opengis.net/wfs "
				+ "http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd\"";

		var gmlWriter = new GeoBeans.Geometry.GML.Writer(GeoBeans.Geometry.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(geometry);
		xml += "<wfs:GetFeature service=\"WFS\" version=\"1.0.0\" "
			+ " " + xmlns_wfs
			+ " " + xmlns_workspace
			+ " " + xmlns_gml
			+ " " + xmlns_xsi
			+ " " + xmlns_schemaLocation
			+ ">"
			+ "<wfs:Query typeName=\"" + typeName + "\">"
			+ 	"<Filter>"
			+ 		"<DWithin>"
			+			"<PropertyName>" + geomFieldName + "</PropertyName>"
			+			geomGml
			+			"<Distance>" + distance + "</Distance>"
			+		"</DWithin>"
			+	"</Filter>"
			+ "</wfs:Query>"
			+ "</wfs:GetFeature>";
		return xml;	
	},
	
	//插入
	transaction : function(featureType,geometry,values,callback){
		var url = this.server;
		var xml = this.buildTransactionXML(featureType,geometry,values);
		$.ajax({
			type	:"post",
			url		: url,
			// data	: encodeURI(xml),
			data : xml,
			dataType: "xml",
			contentType: "text/xml",
			async	: false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(result, textStatus){
				var xml = $(result);
				var successStatus = xml.find("SUCCESS");
				if(successStatus.length != 0){
					var insertResult = xml.find("InsertResult");
					if(insertResult.length != 0){
						var featureId = insertResult.find("FeatureId").attr("fid");
						featureId = featureId.substr(featureId.lastIndexOf(".") + 1,featureId.length);
						callback(featureId);
						that.features = null;
						that.map.draw();
						return;
					}
				}
				var exception = xml.find("ServiceExceptionReport");
				if(exception.length != 0){
					var exceptionStr = xml.find("ServiceException").text();
					callback(exceptionStr);
					return;
				}

				// callback("insert failed");
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error : function(){
			}
		});	
	},

	buildTransactionXML : function(featureType,geometry,values){
		if(featureType == null || geometry == null || values == null){
			return;
		}
		var xml = "";
		var name = featureType.name;
		var workspaceName = this.workspaceName;
		var xmlns_wfs = "xmlns:wfs=\"http://www.opengis.net/wfs\"";
		var xmlns_workspace = "xmlns:" + workspaceName
							+ "=\"" + this.xmlnsWorkspace
							+ "\"";
		var xmlns_gml = "xmlns:gml=\"http://www.opengis.net/gml\"";
		var xmlns_xsi = "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"";
		var xmlns_schemaLocation = "xsi:schemaLocation=\"http://www.opengis.net/wfs "
				+ "http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd\"";

		var valueXml = "";
		for(var i = 0; i < values.length; ++i){
			var valueObj = values[i];
			var field = valueObj.field;
			var value = valueObj.value;
			if(featureType.getFieldIndex(field) == -1){
				continue;
			}
			valueXml += "<" + workspaceName + ":" + field + ">";
			valueXml += value;
			valueXml += "</" + workspaceName + ":" + field + ">";
		}

		var gmlWriter = new GeoBeans.Geometry.GML.Writer(GeoBeans.Geometry.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(geometry);

		var geometryXml = "";
		geometryXml += "<" + workspaceName + ":" + featureType.geomFieldName + ">";
		geometryXml += geomGml;
		geometryXml += "</" + workspaceName + ":" + featureType.geomFieldName + ">";

		xml += "<wfs:Transaction service=\"WFS\" version=\"1.0.0\" "
			+ " " + xmlns_wfs
			+ " " + xmlns_workspace
			+ " " + xmlns_gml
			+ " " + xmlns_xsi
			+ " " + xmlns_schemaLocation
			+ ">";
		xml += "<wfs:Insert>";
		xml += "<" + workspaceName + ":" + name + ">";
		xml += valueXml;
		xml += geometryXml;
		xml += "</" + workspaceName + ":" + name + ">";
		xml += "</wfs:Insert>";
		xml += "</wfs:Transaction>";
		return xml;
	},

	// 获取唯一值
	getValue : function(typename,field,mapName,callback,order){
		if(typename == null ||field == null 
			|| callback == null){
			return;
		}
		if(order == null){
			order = "asc";
		}
		var that = this;
		var params = "service=" + this.service
			+ "&version=" +  this.version 
			+ "&request=GetValue&typeName=" + typename 
			+ "&field=" + field + "&type=unique&order=" 
			+ order;
		if(mapName != null){
			params += "&mapName=" + mapName;
		}
		
		$.ajax({
			type	:"get",
			url		: this.server,
			data	: encodeURI(params),
			dataType: "xml",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var values = that.parseValues(xml);
				callback(values);
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});		
	},

	parseValues : function(xml){
		var values = [];
		$(xml).find("Value").each(function(){
			var value = $(this).text();
			values.push(value);
		});
		return values;
	},	

	getMinMaxValue : function(typename,field,mapName,callback){
		if(typename == null ||field == null 
			|| callback == null){
			return;
		}
		var that = this;
		var params = "service=" + this.service
			+ "&version=" +  this.version 
			+ "&request=GetValue&typeName=" + typename 
			+ "&field=" + field + "&type=minmax" 
		if(mapName != null){
			params += "&mapName=" + mapName;
		}
		$.ajax({
			type	:"get",
			url		: this.server,
			data	: encodeURI(params),
			dataType: "xml",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var valueObj = that.pareseMinMaxValue(xml);
				callback(valueObj);
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});		
	},

	pareseMinMaxValue : function(xml){
		var min = $(xml).find("Min").text();
		var max = $(xml).find("Max").text();
		var obj = new Object();
		obj.min = parseFloat(min);
		obj.max = parseFloat(max);
		return obj;
	}

});
