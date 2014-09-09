GeoBeans.WFSWorkspace = GeoBeans.Class(GeoBeans.Workspace, {
	server : null,
	service: "wfs",
	version: "1.0.0",
	
	initialize : function(name,server,version){
		GeoBeans.Workspace.prototype.initialize.apply(this, arguments);
		
		this.server = server;
		this.version = version;
	},
	
	destory : function(){
		this.server = null;
		this.version = null;
		
		GeoBeans.Workspace.prototype.destory.apply(this, arguments);
	},
	
	getFeatureTypes : function(callback){
		
		var that = this;
		
		var params = "service=" + this.service + "&version=" + this.version + "&request=getCapabilities";
		
		$.ajax({
			type	:"get",
			url		: this.server,
			//data	: encodeURI(params),
			dataType: "xml",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(xml, textStatus){
				var fts = that.parseFeatureTypes(xml);
				callback(fts);
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
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
	
	
});
