GeoBeans.Layer.WFSLayer = GeoBeans.Class(GeoBeans.Layer, {
	
	style : null,
	
	server: null,
	url : null,
	typeName : null,
	format : "GML2",
	version : "1.0.0",
	srs : "EPSG:4326",
	features : null,
	maxFeatures : 50,
	
	
	initialize : function(name, server, typeName, format){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		
		this.name = name;
		this.server = server;
		this.typeName = typeName;
		this.format = format;
		this.image = new Image();
		
	},
	
	destory : function(){
		
		this.server= null;
		this.name = null;
		this.server = null;
		this.typeName = null;
		this.format = null;
		
		GeoBeans.Layer.prototype.destory.apply(this, arguments);
	},
	
	draw : function(){
		
		var that = this;
		
		var url;
		var extent = this.map.viewer;
		var bbox = extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax;
		//http://127.0.0.1:8080/geoserver/radi/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=radi:cities&maxFeatures=50&outputFormat=GML2&bbox=0,0,10,10
		var args = 	"&service=WFS" + 
					"&version=" + this.version +
			  		"&request=GetFeature" +
			  		"&typeName=" + this.typeName +
			  		//"&maxFeatures=" + this.maxFeatures + 
			  		"&bbox=" + bbox + 
			  		"&outputFormat=" + this.format;
		console.log(args);					
		$.ajax({
			type:"get",
			//url : "wfs-cities.xml",
			url : this.server,
			data : encodeURI(args),
			dataType : "xml",
			async : true,
			beforeSend : function(XMLHttpRequest){
				//alert("beforeSend");
			},
			success : function(xml, textStatus){
				that.features = that.parseFeatures(xml);
				that.drawLayer();
			},
			complete : function(XMLHttpRequest, textStatus){
				//alert("complete");
				},
			error: function(){
				//alert("error");
			}
		});
	},
	
	parseFeatures : function(xml){
		var f = null;
		var g = null;
		var features = new Array();
		var reader  = new GeoBeans.Geometry.GML.Reader(GeoBeans.Geometry.GML.Version.v_2_0);
		$(xml).find("the_geom").each(function(index, element) {
            //console.log($(this).html());
			g = reader.read($(this).children()[0]);
			if(g!=null){
				f = new GeoBeans.Feature(g);
				features.push(f);
			}
        });		
		return features;
	},
	
	parseFeature : function(xml){
		
	},
	
	drawFeatures : function(rule){
		var feature = null;
		for(var i=0,len=this.features.length; i<len; i++){
			feature = this.features[i];
			this.map.renderer.draw(feature, rule.symbolizer, this.map.transformation);
		}
	},
	
	drawLayer : function(){
		var style = this.style;
		if(style==null){
			return;
		}
		rules = style.rules;
		if(rules.length==0){
			return;
		}
		for(var i=0; i<rules.length; i++){
			var rule = rules[i];
			this.drawFeatures(rule);
		}
	},
	
	setStyle : function(style){
		this.style = style;
	},
	
	cleanFeatures : function(){
		
	}

});