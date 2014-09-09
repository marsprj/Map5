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
			callback(this.fields);
			return;
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
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				this.fields = that.parseFields(xml);
				callback(this.fields);
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
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
		
		var f = new GeoBeans.Field(name, type);
		
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
	}
});