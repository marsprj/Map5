GeoBeans.FeatureType = GeoBeans.Class({
	
	workspace	: null,
	name		: null,
	title		: null,
	keywords	: null,
	srs			: null,
	extent		: null,
	fields		: null,
				
	initialize : function(workspace){
		this.workspace = workspace;
	},
	
	destory : function(){
		this.workspace = null;
		this.name = null;
		this.title = null;
		this.keywords = null;
		this.srs = null;
		this.extent = null;
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
	
	getFields : function(callback){
		if(this.fiels!=null){
			return this.fields;
		}
		
		var that = this;
		//var url = this.workspace.server 
		var url = "http://127.0.0.1/Map5/example/wfs/cities-schema-1.0.0.xml";
		
		var params = "service=" + this.service + "&version=" + this.version + "&request=describeFeatureType" + "&typeNam=" + this.name;
		
		$.ajax({
			type	:"get",
			url		: url,
			//data	: encodeURI(params),
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
	
	getFeatures : function(callback){
				
		var that = this;
		//var url = this.workspace.server 
		var url = "http://127.0.0.1/Map5/example/wfs/wfs-cities-1.0.0.xml";
		
		var params = "service=" + this.service + "&version=" + this.version + "&request=describeFeatureType" + "&typeNam=" + this.name;
	
		$.ajax({
			type	:"get",
			url		: url,
			//data	: encodeURI(params),
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
		var fields = this.getFields();
		var values = new Array();
		
		var g = null;
		var f = null;
		var len = this.fields.length;
		for(var i=0; i<len; i++){
			f = this.fields[i];
			if(f.type==GeoBeans.FieldType.GEOMETRY){
				var gml = $(xml).find(f.name + ":first").children()[0];
				g = reader.read(gml);
				values.push(g);				
			}
			else{
				var val = $(xml).find(f.name + ":first").text();
				values.push(val);				
			}
		}

		return (new GeoBeans.Feature(this, g, values));
	}
});