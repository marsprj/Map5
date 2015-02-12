
GeoBeans.Layer.FeatureLayer = GeoBeans.Class(GeoBeans.Layer, {
	
	features : null,
	
	style : null,
		
	geometryType : null,
	
	featureType : null,
	
	enableHit : false,
	selection : null,
	unselection : null,

	hitControl : null,
	hitEvent : null,
	hitTooltipEvent : null,

	//选中的绘制图层
	hitCanvas : null,
	hitRenderer : null,

	//缓冲区图层
	bufferCanvas : null,
	bufferRenderer : null,
	bufferFeatures : null,
	bufferSymbolizer : null,


	//绘制辅助元素
	bufferTracker : null,
	
	initialize : function(name){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		
		this.featureType = null;
		
		this.selection = [];
		this.unselection = [];

	},
	
	destory : function(){
		this.features = null;
		this.style = null;
		this.renderer = null;
		this.geometryType = null;
		
		this.featureType = null;
		
		GeoBeans.Layer.prototype.destroy.apply(this, arguments);
	},
	
	addFeature : function(feature){
		if(feature!=null){
			this.features.push(feature);
		}
	},
	
	addFeatures : function(featuers){
		if(features==null){
			return;	
		}
		if(!(features instanceof Array)){
			return ;
		}
		for(var i=0,len=features.length; i<len; i++){
			var f = features[i];
			this.features.push(f);
		}
	},
	
	getFeature : function(i){
		if(i<0){
			return null;
		}
		if(i>=this.features.length){
			return null;
		}
		return this.features[i];
	},
	
	setStyle : function(style){
		this.style = style;
	},
	
	count : function(){
		return this.features.length;
	},
	
	draw : function(){
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
			var features = this.selectFeatures(rule.filter);						
			this.drawFeatures(features, rule.symbolizer);
		}
	},
	/******************************************************************/
	/* Draw Layer                                                     */
	/******************************************************************/
	drawLayer : function(){
		// this.renderer.clearRect();

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
			var features = this.selectFeatures(rule.filter);

			if(rule.symbolizer instanceof GeoBeans.Style.TextSymbolizer){
				this.labelFeatures(features, rule.symbolizer);
			}
			else{
				if(rule.symbolizer instanceof GeoBeans.Style.PointSymbolizer){
					var symbolizer = rule.symbolizer;
					if(symbolizer.icon_url!=null){
						this.renderer.drawIcons(features, rule.symbolizer, this.map.transformation);
					}else{
						this.drawFeatures(features, rule.symbolizer);
					}
				}
				else{
					this.drawFeatures(features, rule.symbolizer);
				}
			}
		}
	},
	
	
//	drawFeatures : function(rule){
//		var feature = null;
//		for(var i=0,len=this.features.length; i<len; i++){
//			feature = this.features[i];
//			this.map.renderer.draw(feature, rule.symbolizer, this.map.transformation);
//		}
//	},

	drawFeatures : function(features, symbolizer){		
		if(features.length==0){
			return;
		}
		

		this.renderer.save();
		this.renderer.setSymbolizer(symbolizer);
		for(var i=0,len=features.length; i<len; i++){
			feature = features[i];
			if((symbolizer!=null) && (symbolizer!='undefined')){
				this.renderer.draw(feature, symbolizer, this.map.transformation);
			}
		}
		this.renderer.restore();
	},
	
	labelFeatures : function(features, symbolizer){
		var len = features.length;
		if(len == 0){
			return;
		}
		
		this.map.renderer.save();
		this.map.renderer.setSymbolizer(symbolizer);
		
		var feature = features[0];
		var findex = feature.featureType.getFieldIndex(symbolizer.field);
		for(var i=0,len=features.length; i<len; i++){
			feature = features[i];
			this.map.renderer.label(feature.geometry, feature.values[findex], symbolizer, this.map.transformation);
		}
		this.map.renderer.restore();
	},
	
	drawFeature : function(feature, symbolizer){

		var rules = this.selectRules(feature);
		var len = rules.length;
		for(var i=0; i<len; i++){
			var r = rules[i];
			if( (symbolizer==null) || (symbolizer=='undefined')){
				symbolizer = r.symbolizer;
			}
			this.map.renderer.save();
			this.map.renderer.setSymbolizer(symbolizer);
			if(symbolizer instanceof GeoBeans.Style.TextSymbolizer){
				var findex = feature.featureType.getFieldIndex(symbolizer.field);
				this.map.renderer.label(feature.geometry, feature.values[findex], symbolizer, this.map.transformation);
			}
			else{
				this.map.renderer.draw(feature, symbolizer, this.map.transformation);
			}
			this.map.renderer.restore();
		}
		rules = null;
	},
	
	clearFeature : function(feature){
		switch(feature.geometry.type){
			case GeoBeans.Geometry.Type.POINT:
			case GeoBeans.Geometry.Type.MULTIPOINT:{
					var s = this.getSymbolizer(feature);
					this.map.renderer.clear(feature.geometry, this.map.bgColor, s.size, this.map.transformation);	
				}
				break;
			default:{
				this.map.renderer.clear(feature.geometry, this.map.bgColor, 0, this.map.transformation);
			}
		}
	},
	
	selectFeatures : function(filter){
		if(filter==null){
			return this.features;
		}
		
		var selection = [];
		var fname = filter.field;
		var value = null;
		var findex = this.featureType.getFieldIndex(fname);
		if(findex >= 0){
			var f = null;
			var len = this.features.length;
			for(var i=0; i<len; i++){
				f = this.features[i];
				value = f.values[findex];
				if(value==filter.value){
					selection.push(f);
				}
			}
		}
		
		return selection;
	},
	
	selectRules : function(f){
		var rules = [];
		
		if(this.style!=null){
			var len = this.style.rules.length;
			for(var i=0; i<len; i++){
				var r = this.style.rules[i];
				if(r.filter!=null){
					var fname = r.filter.field;
					var value = null;
					var findex = this.featureType.getFieldIndex(fname);
					value = f.values[findex];
					if(value==r.filter.value){
						rules.push(r);
					}	
				}
				else{
					rules.push(r);
				}
			}
		}
		return rules;
	},
	
	getSymbolizer : function(feature){
		var rules = this.selectRules(feature);
		var len = rules.length;
		for(var i=0; i<len; i++){
			var r = rules[i];
			var s = r.symbolizer;
			if(!(s instanceof GeoBeans.Style.TextSymbolizer)){
				return s;
			}
		}
		return null;
	},
	/******************************************************************/
	/* Draw Layer End                                                 */
	/******************************************************************/

	setHitControl : function(control){
		if((control==null) || (control=='undefined')){
			return;
		}
		this.hitControl = null;
		this.hitControl = control;
	},
	
	init : function(){
	},
	
	enableHit : function(enable){
		this.enableHit = enable;
	},
	
	hit : function(x, y, callback){
		if(this.features==null){
			return;
		}
		
		var render = this.map.renderer;
		var transformation = this.map.transformation;
		
		// this.unselection = this.selection;
		this.selection = [];
		
		var i=0, j=0;
		var f=null, g=null;
		var len = this.features.length;
		for(i=0; i<len; i++){
			f = this.features[i];
			g = f.geometry;
			if(g!=null){
				if(g.hit(x, y, this.map.tolerance)){
					this.selection.push(f);
				}
			}
		}
		
		// //去掉this.unselection中仍被hit的feature
		// var of=null, nf=null;
		// var on = this.unselection.length;
		// var nn = this.selection.length;
		// for(i=on; i>=0; i--){
		// 	of = this.unselection[i];
		// 	for(j=0; j<nn; j++){
		// 		nf = this.selection[j];
		// 		if(of==nf){
		// 			this.unselection.splice(i,1);
		// 			break;
		// 		}
		// 	}
		// }
		
		// //重绘未被选中的Feature
		// on = this.unselection.length;
		// for(i=0; i<on; i++){
		// 	of = this.unselection[i];
		// 	this.clearFeature(of);
		// 	this.drawFeature(of);
		// }
		
		this.hitRenderer.clearRect(0,0,this.hitCanvas.height,this.hitCanvas.width);
		this.map.drawHitLayer();
		if(callback!=undefined){
			callback(this, this.selection);
		}
	},
	
	registerHitEvent : function(callback){
		var map = this.map;
		var layer = this;
		var x_o = null;
		var y_o = null;
		var tolerance = 10;

		this.hitCanvas = document.createElement("canvas");
		this.hitCanvas.width = this.canvas.width;
		this.hitCanvas.height = this.canvas.height;

		this.hitRenderer  = new GeoBeans.Renderer(this.hitCanvas);


		this.hitEvent = function(evt){
			if(x_o==null){
				x_o = evt.layerX;
				y_o = evt.layerY;
			}
			else{
				var dis = Math.abs(evt.layerX-x_o) + Math.abs(evt.layerY-y_o);
				if(dis > tolerance){
					
					x_o = evt.layerX;
					y_o = evt.layerY;
				
					var mp = map.transformation.toMapPoint(evt.layerX, evt.layerY);
					
					layer.hit(mp.x, mp.y, callback);
				}
			}
			
		};
		map.canvas.addEventListener('mousemove', this.hitEvent);
		this.events.addEvent('mousemove', this.hitEvent);
	},

	unRegisterHitEvent : function(){
		this.map.canvas.removeEventListener('mousemove',this.hitEvent);
		this.hitRenderer.clearRect(0,0,this.hitCanvas.height,this.hitCanvas.width);
		this.map.drawHitLayer();
	},
	//绘制选中的图层
	drawHitFeature : function(feature, symbolizer){

		var rules = this.selectRules(feature);
		var len = rules.length;
		for(var i=0; i<len; i++){
			var r = rules[i];
			if( (symbolizer==null) || (symbolizer=='undefined')){
				symbolizer = r.symbolizer;
			}
			this.hitRenderer.save();
			this.hitRenderer.setSymbolizer(symbolizer);
			if(symbolizer instanceof GeoBeans.Style.TextSymbolizer){
				var findex = feature.featureType.getFieldIndex(symbolizer.field);
				this.hitRenderer.label(feature.geometry, feature.values[findex], symbolizer, this.map.transformation);
			}
			else{
				this.hitRenderer.draw(feature, symbolizer, this.map.transformation);
			}
			this.hitRenderer.restore();
		}
		rules = null;

		this.map.drawHitLayer();
	},	

	cleanup : function(){

		// this.enableHit(false);
		this.enableHit = false;
		this.map.canvas.removeEventListener('mousemove', this.hitEvent);
		this.map.canvas.removeEventListener('mousemove', this.hitTooltipEvent);
		
	},
	

	registerHitTooltipEvent : function(callback){
		var map = this.map;
		var layer = this;
		var x_o = null;
		var y_o = null;
		var tolerance = 10;

		this.hitTooltipEvent = function(evt){
			if(x_o==null){
				x_o = evt.layerX;
				y_o = evt.layerY;
			}
			else{
				var dis = Math.abs(evt.layerX-x_o) + Math.abs(evt.layerY-y_o);
				if(dis > tolerance){
					
					x_o = evt.layerX;
					y_o = evt.layerY;
				
					// var mp = map.transformation.toMapPoint(evt.layerX, evt.layerY);
					
					// layer.hitTooltip(mp.x, mp.y, callback);
					layer.hitTooltip(evt.layerX, evt.layerY, callback);
				}
			}
			
		};

		map.canvas.addEventListener("mousemove", this.hitTooltipEvent);
	},

	hitTooltip : function(x, y, callback){
		if(this.features==null || callback == null){
			return;
		}
		var map = this.map;
		var mp = map.transformation.toMapPoint(x, y);

		var layerX = mp.x;
		var layerY = mp.y;

		var render = this.map.renderer;
		var transformation = this.map.transformation;

		var i=0, j=0;
		var f=null, g=null;
		var len = this.features.length;
		for(i=0; i<len; i++){
			f = this.features[i];
			g = f.geometry;
			if(g!=null){
				if(g.hit(layerX, layerY, this.map.tolerance)){
					callback(this,x,y,f);
					return;
				}
			}
		}
		callback(this,x,y,null);		
	},

/***********************缓冲区*******************************************/
	//线缓冲区
	queryByBufferLine : function(distance,callback){
		if(this.bufferTracker == null){
			var bufferTracker = new GeoBeans.Control.TrackBufferControl();
			var index = this.map.controls.find(bufferTracker.type); 
			if(index == -1){
				this.bufferTracker = bufferTracker;
				this.map.controls.add(this.bufferTracker);
			}else{
				this.bufferTracker = this.map.controls.get(index);
			}
		}
		this.bufferTracker.trackBufferLine(this,distance,callback,this.callbackQueryByBufferTrack);
	},



	//圆缓冲区
	queryByBufferCircle : function(callback){
		if(this.bufferTracker == null){
			var bufferTracker = new GeoBeans.Control.TrackBufferControl();
			var index = this.map.controls.find(bufferTracker.type); 
			if(index == -1){
				this.bufferTracker = bufferTracker;
				this.map.controls.add(this.bufferTracker);
			}else{
				this.bufferTracker = this.map.controls.get(index);
			}
		}		
		this.bufferTracker.trackBufferCircle(this,callback,this.callbackQueryByBufferTrack);
	},

	//回调函数，调用wfs的
	callbackQueryByBufferTrack : function(layer,distance,geometry,callback){
		if(geometry == null || distance < 0){
			return;
		}

		var featureType = layer.featureType;
		if(featureType == null){
			return;
		}
		var geomFieldName = featureType.geomFieldName;
		var gmlWriter = new GeoBeans.Geometry.GML.Writer(GeoBeans.Geometry.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(geometry);

		var params = "service=WFS&version=1.0.0&request=GetFeature&typeName="
					+ layer.typeName + "&filter=<Filter><DWithin><PropertyName>"
					+ geomFieldName + "</PropertyName>" + geomGml + "<Distance>" 
					+ distance + "</Distance></DWithin></Filter>";	


		// var xml = "<wfs:GetFeature service=\"WFS\" version=\"1.0.0\" "
		// 		+ "xmlns:radi=\"www.radi.ac.cn\" " 
		// 		+  "xmlns:wfs=\"http://www.opengis.net/wfs\" "
		// 		// +  "xmlns=\"http://www.opengis.net/ogc\" "
		// 		+  "xmlns:gml=\"http://www.opengis.net/gml\" "
		// 		+  "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "
		// 		+  "xsi:schemaLocation=\"http://www.opengis.net/wfs "
		// 		+  " http://schemas.opengis.net/wfs/1.1.0/wfs.xsd\">"
		// 		+  "<wfs:Query typeName=\"radi:cities\">"
		// 		+    "<Filter>"
		// 		+      "<DWithin>"
		// 		+        "<PropertyName>the_geom</PropertyName>"
		// 		+          "<gml:Point srsName=\"http://www.opengis.net/gml/srs/epsg.xml#4326\">"
		// 		+            "<gml:coordinates>-74.817265,40.5296504</gml:coordinates>"
		// 		+          "</gml:Point>"
		// 		+		  "<Distance>30.292283235956472</Distance>"
		// 		+        "</DWithin>"
		// 		+      "</Filter>"
		// 		+  "</wfs:Query>"
		// 		+"</wfs:GetFeature>";						
		var xml = layer.buildBufferXML(geomFieldName,geometry,distance);
		// var url = layer.workspace.server; 	
		var url = "/geoserver/wfs?";

		// var xml2 = "<wfs:GetFeature service='WFS' version='1.0.0'   "
  //      +"outputFormat='GML2'   "
  //      +"xmlns:opengis='http://www.cetusOpengis.com'   "
  //      +"xmlns:wfs='http://www.opengis.net/wfs'   "
  //      +"xmlns:ogc='http://www.opengis.net/ogc'   "
  //      +"xmlns:gml='http://www.opengis.net/gml'   "
  //      +"xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance'   "
  //      +"xsi:schemaLocation='http://www.opengis.net/wfs   http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd'>    "
  //      +"<wfs:Query typeName='aqi:gc_aqi_ranking'>    "
  //     +"<ogc:Filter>    "
  //     +"<ogc:PropertyIsEqualTo>"
  //     +"<ogc:PropertyName>time_point</ogc:PropertyName>"
  //     +"<ogc:Literal>2015-02-04T13:00:00</ogc:Literal>"
  //     +"</ogc:PropertyIsEqualTo>"
  //    +"</ogc:Filter>"    
  //      +"</wfs:Query>"    
  //   +"</wfs:GetFeature>";
						
		$.ajax({
			type	:"post",
			url		: url,
			// data	: encodeURI(params),
			contentType: "application/xml",
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


	buildBufferXML : function(geomFieldName,geometry,distance){
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

		var gmlWriter = new GeoBeans.Geometry.GML.Writer(GeoBeans.Geometry.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(geometry);
		xml += "<wfs:GetFeature service=\"WFS\" version=\"1.0.0\" "
			+ " " + xmlns_wfs
			+ " " + xmlns_workspace
			+ " " + xmlns_gml
			+ " " + xmlns_xsi
			+ " " + xmlns_schemaLocation
			+ ">"
			+ "<wfs:Query typeName=\"" + this.typeName + "\">"
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
	//用户调用绘制缓冲区图层的
	drawBufferFeatures : function(features,symbolizer){
		this.bufferFeatures = features;
		this.bufferSymbolizer = symbolizer;
		this.drawBufferFeaturesCanvas();
		this.map.drawLayersAll();
	},

	// 用户清除缓冲区
	clearBufferFeatures : function(){
		this.bufferFeatures = null;
		this.drawBufferFeaturesCanvas();
		this.map.drawLayersAll();		
	},
	// 在缓冲区canvas上绘制缓冲区图层，
	drawBufferFeaturesCanvas : function(){
		
		if(this.bufferCanvas == null){
		//获取buffer的情况
			this.bufferCanvas = document.createElement("canvas");
			this.bufferCanvas.width = this.canvas.width;
			this.bufferCanvas.height = this.canvas.height;

			this.bufferRenderer = new GeoBeans.Renderer(this.bufferCanvas);			
		}

		this.bufferRenderer.clearRect(0,0,this.bufferCanvas.width,this.bufferCanvas.height);
		if(this.bufferFeatures == null || this.bufferFeatures.length == 0){
			return;
		}
		this.bufferRenderer.save();
		this.bufferRenderer.setSymbolizer(this.bufferSymbolizer);
		for(var i=0,len=this.bufferFeatures.length; i<len; i++){
			feature = this.bufferFeatures[i];
			if((this.bufferSymbolizer!=null) && (this.bufferSymbolizer!='undefined')){
				this.bufferRenderer.draw(feature, this.bufferSymbolizer,
										this.map.transformation);
			}
		}
		this.bufferRenderer.restore();		
	},


	//插入
	beginTransaction : function(callback){
		var geomFieldIndex = this.featureType.getFieldIndex(this.featureType.geomFieldName);
		var geomField = this.featureType.fields[geomFieldIndex];
		var geomType = geomField.geomType;

		
		var tracker = this.getTransactionTracker();

		switch(geomType){
			case GeoBeans.Geometry.Type.POINT:
				tracker.trackPoint(this.transactionCallback,callback,this);
				break;
			case GeoBeans.Geometry.Type.LINESTRING:
				tracker.trackLine(this.transactionCallback,callback,this,false);
				break;
			case GeoBeans.Geometry.Type.MULTILINESTRING:
				tracker.trackLine(this.transactionCallback,callback,this,true);
				break;
			case GeoBeans.Geometry.Type.POLYGON:
				tracker.trackPolygon(this.transactionCallback,callback,this,false);
				break;
			case GeoBeans.Geometry.Type.MULTIPOLYGON:
				tracker.trackPolygon(this.transactionCallback,callback,this,true);
				break;
			default:
				break;
		}
	},

	transactionCallback : function(geometry,userCallback,layer){
		userCallback(geometry,layer);
	},


	transaction : function(geometry,values,callback){
		for(var i = 0; i < values.length; ++i){
			var valueObj = values[i];
			var field = valueObj.field;
			var value = valueObj.value;

		}
		
		//点图层 cities
		// var xml1 = "<wfs:Transaction service=\"WFS\" version=\"1.0.0\" "
		// 	    + "xmlns:wfs=\"http://www.opengis.net/wfs\"    xmlns:radi=\"www.radi.ac.cn\" "
		// 	    + "xmlns:gml=\"http://www.opengis.net/gml\" "
		// 	    + "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "   
		// 		+ "xsi:schemaLocation=\"http://www.opengis.net/wfs "
		// 		+ "http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd\">"
		// 		+ 		"<wfs:Insert>"
		// 		+ 			"<radi:cities>"
		// 		+ 				"<radi:name>test</radi:name>"
		// 		+ 				"<radi:country>China</radi:country>"
		// 		+ 				"<radi:the_geom>"
		// 		+ 					"<gml:Point srsName=\"http://www.opengis.net/gml/srs/epsg.xml#4326\">"
		// 		+ 						"<gml:coordinates xmlns:gml=\"http://www.opengis.net/gml\" "
		// 		+ 						"decimal=\".\" cs=\",\" ts=\" \">116,42</gml:coordinates>"
		// 		+ 					"</gml:Point>"
		// 		+ 				"</radi:the_geom>"
		// 		+ 			"</radi:cities>"
		// 		+ "</wfs:Insert>"
		// 		+ "</wfs:Transaction>";	

		//线图层 linestring
		// var xml1 = "<wfs:Transaction service=\"WFS\" version=\"1.0.0\" "
		// 	    + "xmlns:wfs=\"http://www.opengis.net/wfs\"    xmlns:radi=\"www.radi.ac.cn\" "
		// 	    + "xmlns:gml=\"http://www.opengis.net/gml\" "
		// 	    + "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "   
		// 		+ "xsi:schemaLocation=\"http://www.opengis.net/wfs "
		// 		+ "http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd\">"
		// 		+ 		"<wfs:Insert>"
		// 		+ 			"<radi:rivers>"
		// 		+ 				"<radi:name>test</radi:name>"
		// 		+ 				"<radi:country>China</radi:country>"
		// 		+ 				"<radi:the_geom>"
		// 		+ 					"<gml:MultiLineString>"				
		// 		+						"<gml:lineStringMember>"
		// 		+ 							"<gml:LineString>"
		// 		+ 								"<gml:coordinates xmlns:gml=\"http://www.opengis.net/gml\" "
		// 		+ 								"decimal=\".\" cs=\",\" ts=\" \">-46.468842729970326,-83.67952522255193 -28.30860534124629,11.3946587537092 82.07715133531158,89.02077151335313 </gml:coordinates>"
		// 		+ 							"</gml:LineString>"
		// 		+						"</gml:lineStringMember>"
		// 		+					"</gml:MultiLineString>"
		// 		+ 				"</radi:the_geom>"
		// 		+ 			"</radi:rivers>"
		// 		+ "</wfs:Insert>"
		// 		+ "</wfs:Transaction>";

		// 线图层 reivers MultiLineString
		// var xml1 = "<wfs:Transaction service=\"WFS\" version=\"1.0.0\" "
		// 	    + "xmlns:wfs=\"http://www.opengis.net/wfs\"    xmlns:radi=\"www.radi.ac.cn\" "
		// 	    + "xmlns:gml=\"http://www.opengis.net/gml\" "
		// 	    + "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "   
		// 		+ "xsi:schemaLocation=\"http://www.opengis.net/wfs "
		// 		+ "http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd\">"
		// 		+ 		"<wfs:Insert>"
		// 		+ 			"<radi:rivers>"
		// 		+ 				"<radi:name>test</radi:name>"
		// 		+ 				"<radi:country>China</radi:country>"
		// 		+ 				"<radi:the_geom>"
		// 		+ 					"<gml:MultiLineString>"				
		// 		+						"<gml:lineStringMember>"
		// 		+ 							"<gml:LineString>"
		// 		+ 								"<gml:coordinates xmlns:gml=\"http://www.opengis.net/gml\" "
		// 		+ 								"decimal=\".\" cs=\",\" ts=\" \">-46.468842729970326,-83.67952522255193 -28.30860534124629,11.3946587537092 82.07715133531158,89.02077151335313 </gml:coordinates>"
		// 		+ 							"</gml:LineString>"
		// 		+						"</gml:lineStringMember>"
		// 		+						"<gml:lineStringMember>"
		// 		+ 							"<gml:LineString>"
		// 		+ 								"<gml:coordinates xmlns:gml=\"http://www.opengis.net/gml\" "
		// 		+ 								"decimal=\".\" cs=\",\" ts=\" \">116,39 60,-10</gml:coordinates>"
		// 		+ 							"</gml:LineString>"
		// 		+						"</gml:lineStringMember>"
		// 		+					"</gml:MultiLineString>"
		// 		+ 				"</radi:the_geom>"
		// 		+ 			"</radi:rivers>"
		// 		+ "</wfs:Insert>"
		// 		+ "</wfs:Transaction>";

		// 面图层 country MultiPolygon
		// var xml1 = "<wfs:Transaction service=\"WFS\" version=\"1.0.0\" "
		// 	    + "xmlns:wfs=\"http://www.opengis.net/wfs\"    xmlns:radi=\"www.radi.ac.cn\" "
		// 	    + "xmlns:gml=\"http://www.opengis.net/gml\" "
		// 	    + "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" "   
		// 		+ "xsi:schemaLocation=\"http://www.opengis.net/wfs "
		// 		+ "http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd\">"
		// 		+ 		"<wfs:Insert>"
		// 		+ 			"<radi:country>"
		// 		+ 				"<radi:name>test</radi:name>"
		// 		+ 				"<radi:geom>"
		// 		+ 					"<gml:MultiPolygon>"				
		// 		+						"<gml:polygonMember>"
		// 		+ 							"<gml:Polygon>"
		// 		+								"<gml:outerBoundaryIs>"
		// 		+									"<gml:LinearRing>"
		// 		+ 										"<gml:coordinates xmlns:gml=\"http://www.opengis.net/gml\" "
		// 		+ 										"decimal=\".\" cs=\",\" ts=\" \">-14.78,-56.62 52.88,-37.74 29.38,-59.47 -14.78,-56.62</gml:coordinates>"
		// 		+ 									"</gml:LinearRing>"
		// 		+								"</gml:outerBoundaryIs>"
		// 		+							"</gml:Polygon>"
		// 		+ 						"</gml:polygonMember>"
		// 		+					"</gml:MultiPolygon>"
		// 		+ 				"</radi:geom>"
		// 		+ 			"</radi:country>"
		// 		+ 		"</wfs:Insert>"
		// 		+ "</wfs:Transaction>";	

		var xml = this.buildTransactionXML(geometry,values);
		var url = "/geoserver/wfs?";
		console.log(xml);
		var that = this;

		$.ajax({
			type	:"post",
			url		: url,
			// data	: encodeURI(xml),
			data : xml,
			dataType: "xml",
			contentType: "application/xml",
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

				callback("insert failed");
			},
			complete: function(XMLHttpRequest, textStatus){
			},
			error : function(){
			}
		});	

	},

	//构建POST内容
	buildTransactionXML : function(geometry,values){
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

		var valueXml = "";
		for(var i = 0; i < values.length; ++i){
			var valueObj = values[i];
			var field = valueObj.field;
			var value = valueObj.value;
			if(this.featureType.getFieldIndex(field) == -1){
				continue;
			}
			valueXml += "<" + workspaceName + ":" + field + ">";
			valueXml += value;
			valueXml += "</" + workspaceName + ":" + field + ">";
		}

		var gmlWriter = new GeoBeans.Geometry.GML.Writer(GeoBeans.Geometry.GML.Version.v_2_0);
		var geomGml = gmlWriter.write(geometry);

		var geometryXml = "";
		geometryXml += "<" + workspaceName + ":" + this.featureType.geomFieldName + ">";
		geometryXml += geomGml;
		geometryXml += "</" + workspaceName + ":" + this.featureType.geomFieldName + ">";

		xml += "<wfs:Transaction service=\"WFS\" version=\"1.0.0\" "
			+ " " + xmlns_wfs
			+ " " + xmlns_workspace
			+ " " + xmlns_gml
			+ " " + xmlns_xsi
			+ " " + xmlns_schemaLocation
			+ ">";
		xml += "<wfs:Insert>";
		xml += "<" + workspaceName + ":" + this.name + ">";
		xml += valueXml;
		xml += geometryXml;
		xml += "</" + workspaceName + ":" + this.name + ">";
		xml += "</wfs:Insert>";
		xml += "</wfs:Transaction>";
		return xml;
	},

	getTransactionTracker : function(){
		var tracker = null;
		var index = this.map.controls.find(GeoBeans.Control.Type.TRACKTRANSACTION); 
		if(index == -1){
			tracker = new GeoBeans.Control.TrackControl.TrackTransactionControl();
			this.map.controls.add(tracker);
		}else{
			tracker = this.map.controls.get(index);
		}
		return tracker;
	},

	CLASS_NAME : "GeoBeans.Layer.FeatureLayer"
});
