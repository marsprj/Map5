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
	
	// getFields : function(callback){
	getFields : function(mapName,sourceName){
		if(this.fields!=null){
			return this.fields;
		}
		
		var that = this;
		var url = this.workspace.server; 
		//var url = "http://127.0.0.1/Map5/example/wfs/cities-schema-1.0.0.xml";
		
		var params = "service=" + this.workspace.service 
			+ "&version=" + this.workspace.version 
			+ "&request=describeFeatureType" 
			+ "&typeName=" + this.name;
		if(mapName != null){
			params += "&mapName=" + mapName;
		}
		if(sourceName != null){
			params += "&sourceName=" + sourceName;
		}
		
		$.ajax({
			type	:"get",
			url		: url,
			data	: encodeURI(params),
			dataType: "xml",
			async	: false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				that.fields = that.parseFields(xml);
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
		
		return this.fields;
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
		
		var f = new GeoBeans.Field(name, type, this);
		
		if(type==GeoBeans.FieldType.GEOMETRY){
			var geomType = this.parseGeometryType(xtype);
			f.setGeomType(geomType);
			this.geomFieldName = name;
		}
		
		return (f);
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
	
	// getFeatures : function(callback){
	getFeatures : function(mapName,sourceName,maxFeatures,offset){		
			
		var that = this;
		var url = this.workspace.server; 
		//var url = "http://127.0.0.1/Map5/example/wfs/wfs-cities-1.0.0.xml";
		
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
		if(maxFeatures != null){
			params += "&maxFeatures=" + maxFeatures;
		}
		if(offset != null){
			params += "&offset=" + offset;
		}
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
				// if(callback != undefined){
				// 	callback(that, features);
				// }
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
		return this.features;
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

			var viewerStr = xmin.toFixed(2) + "," + ymin.toFixed(2) + ","
							+ xmax.toFixed(2) + "," + ymax.toFixed(2);
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
				// if(callback_layer != undefined){
				// 	callback_layer(features,callback);
				// }else{
				// 	if(callback != undefined){
				// 		callback(features);
				// 	}
				// }
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
		
		// var params = "service=" + this.workspace.service + "&version=" 
		// 			+ this.workspace.version + "&request=getFeature" 
		// 			+ "&typeName=" + this.name + "&bbox=" + viewerStr;

		
		// if(filter!= null && filter != undefined){
		// 	var field = filter.field;
		// 	var value = filter.value;
		// 	params = ""
		// 	params += "&filter=<Filter><PropertyIsEqualTo><PropertyName>"
		// 			+ field + "</PropertyName><Literal>" + value 
		// 			+ "</Literal></PropertyIsEqualTo></Filter>";
		// }
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
		var reader  = new GeoBeans.Geometry.GML.Reader(GeoBeans.Geometry.GML.Version.v_2_0);
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
				values.push( val==null ? null :  val.text());
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

	getCount : function(mapName,sourceName,viewer){
		var that = this;
		var url = this.workspace.server; 
		//var url = "http://127.0.0.1/Map5/example/wfs/cities-schema-1.0.0.xml";
		
		var params = "service=" + this.workspace.service 
			+ "&version=" + this.workspace.version 
			+ "&request=GetCount" 
			+ "&typeName=" + this.name;
		if(mapName != null){
			params += "&mapName=" + mapName;
		}
		if(sourceName != null){
			params += "&sourceName=" + sourceName;
		}
		if(viewer != null){
			params += "&bbox=" + viewer.toString();
		}
		
		$.ajax({
			type	:"get",
			url		: url,
			data	: encodeURI(params),
			dataType: "xml",
			async	: false,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				// that.fields = that.parseFields(xml);
				that.count = that.parseCount(xml);
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
		return that.count;
	},

	parseCount : function(xml){
		var count = $(xml).find("Count").text();
		return parseInt(count);
	}
	
});