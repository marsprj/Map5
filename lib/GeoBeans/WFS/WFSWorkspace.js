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
		//ft.getFields();
		
		return ft;
	},
	
	
});
