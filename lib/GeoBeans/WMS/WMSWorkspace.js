GeoBeans.WMSWorkspace = GeoBeans.Class(GeoBeans.Workspace, {
	server : null,
	service: "wms",
	version: "1.1.0",
	layers : null,
	extent : null,
	
	initialize : function(name,server,version){
		GeoBeans.Workspace.prototype.initialize.apply(this, arguments);
		
		this.server = server;
		this.version = version;
		this.layers = null;
		this.extent = null;
	},
	
	destory : function(){
		this.server = null;
		this.version = null;
		this.layers = null;
		this.extent = null;
		
		GeoBeans.Workspace.prototype.destory.apply(this, arguments);
	},
	
	getLayers : function(callback){
		if(this.layers!=null){
			return this.layers;
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
				//callback(fts);
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error	: function(){
			}
		});
		return this.featureTypes;
	},

	parseCapabilities : function(xml){
		
	}
	
});
