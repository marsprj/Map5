
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
		this.features = [];
		
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
	
	addFeatures : function(features){
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

	getFeatureByID : function(id){
		if(this.features == null){
			return null;
		}
		var feature = null;
		for(var i = 0; i < this.features.length; ++i){
			feature = this.features[i];
			if(feature != null && feature.fid == id){
				return feature;
			}
		}
		return null;
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
			style = this.getDefaultStyle();
			if(style == null){
				return;
			}
			this.style = style;
		}
		rules = style.rules;
		if(rules.length==0){
			return;
		}
		for(var i=0; i<rules.length; i++){
			var rule = rules[i];
			// var features = this.selectFeatures(rule.filter);
			var features = this.selectFeaturesByFilter(rule.filter);
			if(rule.symbolizer != null){
				// if(rule.symbolizer.icon_url!=null){
				if(rule.symbolizer.symbol != null){
					this.renderer.drawIcons(features, rule.symbolizer, this.map.transformation);
				}else{
					this.drawFeatures(features, rule.symbolizer);
				}	
			}

			if(rule.textSymbolizer != null){
				this.labelFeatures(features,rule.textSymbolizer);
			}
		}
	},
	getGeomType : function(){
		var featureType = this.featureType;
		if(featureType == null){
			return null;
		}	
		var geomFieldName = featureType.geomFieldName;
		if(geomFieldName == null){
			return null;
		}
		var geomFieldIndex = featureType.getFieldIndex(geomFieldName);
		if(geomFieldIndex == null){
			return null;
		}
		var geomField = featureType.fields[geomFieldIndex];
		if(geomField == null){
			return null;
		}
		var geomType = geomField.geomType;
		return geomType;
	},

	//获取点线面的样式
	getDefaultStyle : function(){
		var geomType = this.getGeomType();
		var style = null; 
		switch(geomType){
			case GeoBeans.Geometry.Type.POINT:
			case GeoBeans.Geometry.Type.MULTIPOINT:{
				style = new GeoBeans.Style.FeatureStyle("default",
					GeoBeans.Style.FeatureStyle.GeomType.Point);
				var rule = new GeoBeans.Rule();
				var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
				rule.symbolizer = symbolizer;
				style.addRule(rule);
				break;
			}
			case GeoBeans.Geometry.Type.LINESTRING:
			case GeoBeans.Geometry.Type.MULTILINESTRING:{
				style = new GeoBeans.Style.FeatureStyle("default",
					GeoBeans.Style.FeatureStyle.GeomType.LineString);
				var rule = new GeoBeans.Rule();
				var symbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
				rule.symbolizer = symbolizer;
				style.addRule(rule);
				break;
			}
			case GeoBeans.Geometry.Type.POLYGON:
			case GeoBeans.Geometry.Type.MULTIPOLYGON:{
				style = new GeoBeans.Style.FeatureStyle("default",
					GeoBeans.Style.FeatureStyle.GeomType.Polygon);
				var rule = new GeoBeans.Rule();
				var symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer(); 
				rule.symbolizer = symbolizer;
				style.addRule(rule);
				break;
			}
			default :
				break;
		}

		return style;
	},
	
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
		
		this.renderer.save();
		this.renderer.setSymbolizer(symbolizer);
		
		var feature = features[0];
		var text = null;
		var labelText = symbolizer.labelText;
		if(labelText == null || labelText.length == 0){
			var labelProp = symbolizer.labelProp;
			if(labelProp != null){
				var findex = feature.featureType
					.getFieldIndex(labelProp);
			}
		}else{
			text = labelText;
		}
		
		var value = null;
		var geometry = null;
		var label = null;
		for(var i=0,len=features.length; i<len; i++){
			feature = features[i];
			geometry = feature.geometry;
			if(geometry == null){
				continue;
			}
			label = new GeoBeans.PointLabel();
			label.geometry = geometry;
			label.textSymbolizer = symbolizer;
			if(text == null){
				value = feature.values[findex];
			}else{
				value = text;
			}
			label.text = value;
			label.computePosition(this.renderer,this.map.transformation);
			// label.adjustPosition(mapObj.width,mapObj.height);
			// this.renderer.label(label.geometry, value, symbolizer, this.map.transformation);
			this.renderer.drawLabel(label);
		}
		this.renderer.restore();
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
			if(symbolizer instanceof GeoBeans.Symbolizer.TextSymbolizer){
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
		if(filter == null){
			return this.features;
		}
		var type = filter.type;
		if(type == GeoBeans.Filter.Type.FilterComparsion){
			var field = null;
			var value = null;
			var expression1 = filter.expression1;
			if(expression1 != null){
				if(expression1.type == 
					GeoBeans.Expression.Type.PropertyName){
					field = expression1.name;
				}else if(expression1.type == 
					GeoBeans.Expression.Type.Literal){
					value = expression1.value;
				}
			}
			
			var expression2 = filter.expression2;
			if(expression2 != null){
				if(expression2.type == 
					GeoBeans.Expression.Type.PropertyName){
					field = expression2.name;
				}else if(expression2.type == 
					GeoBeans.Expression.Type.Literal){
					value = expression2.value;
				}
			}
		}
		if(field == null || value == null){
			return this.features;
		}
		var selection = [];
		var findex = this.featureType.getFieldIndex(field);
		if(findex >= 0){
			var feature = null;
			var length = this.features.length;
			for(var i = 0; i < length; ++i){
				feature = this.features[i];
				fvalue = feature.values[findex];
				if(fvalue == value){
					selection.push(feature);
				}
			}
		}
		return selection;
	},

	selectFeaturesByFilter : function(filter){
		if(filter == null){
			return this.features;
		}
		var type = filter.type;
		var selection = this.features;
		switch(type){
			case GeoBeans.Filter.Type.FilterID:{
				selection = this.selectFeaturesByIDFilter(filter);
				break;
			}
			case GeoBeans.Filter.Type.FilterComparsion:{
				selection = this.selectFeaturesByComparsion(filter);
				break;
			}
			case GeoBeans.Filter.Type.FilterLogic:{
				break;
			}
			case GeoBeans.Filter.Type.FilterSpatial:{
				break;
			}
		}
		return selection;
	},

	selectFeaturesByIDFilter : function(filter){
		if(filter == null){
			return this.features;
		}
		var ids = filter.ids;
		if(ids == null){
			return this.features;
		}
		var selection = [];
		for(var i = 0; i < this.features.length; ++i){
			var feature = this.features[i];
			var fid = feature.fid;
			if(ids.indexOf(fid) != -1){
				selection.push(feature);
			}
		}
		return selection;
	},

	selectFeaturesByComparsion : function(filter){
		if(filter == null){
			return this.features;
		}
		var oper = filter.operator;
		if(oper == GeoBeans.ComparisionFilter.OperatorType.ComOprEqual){
			var field = null;
			var value = null;
			var expression1 = filter.expression1;
			if(expression1 != null){
				if(expression1.type == 
					GeoBeans.Expression.Type.PropertyName){
					field = expression1.name;
				}else if(expression1.type == 
					GeoBeans.Expression.Type.Literal){
					value = expression1.value;
				}
			}
			
			var expression2 = filter.expression2;
			if(expression2 != null){
				if(expression2.type == 
					GeoBeans.Expression.Type.PropertyName){
					field = expression2.name;
				}else if(expression2.type == 
					GeoBeans.Expression.Type.Literal){
					value = expression2.value;
				}
			}
			if(field == null || value == null){
				return this.features;
			}
			var selection = [];
			var findex = this.featureType.getFieldIndex(field);
			if(findex >= 0){
				var feature = null;
				var length = this.features.length;
				for(var i = 0; i < length; ++i){
					feature = this.features[i];
					fvalue = feature.values[findex];
					if(fvalue == value){
						selection.push(feature);
					}
				}
			}
			return selection;
		}
		return this.features;
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
		
		this.hitRenderer.clearRect(0,0,this.hitCanvas.height,this.hitCanvas.width);
		this.map.drawLayersAll();
		if(callback!=undefined){
			var point = new GeoBeans.Geometry.Point(x,y);
			callback(this, this.selection,point);
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
		map.mapDiv[0].addEventListener('mousemove', this.hitEvent);
		this.events.addEvent('mousemove', this.hitEvent);
	},

	unRegisterHitEvent : function(){
		this.map.mapDiv[0].removeEventListener('mousemove',this.hitEvent);
		this.hitRenderer.clearRect(0,0,this.hitCanvas.height,this.hitCanvas.width);
		this.map.drawLayersAll();
		this.hitEvent = null;
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
			if(symbolizer instanceof GeoBeans.Symbolizer.TextSymbolizer){
				var findex = feature.featureType.getFieldIndex(symbolizer.field);
				this.hitRenderer.label(feature.geometry, feature.values[findex], symbolizer, this.map.transformation);
			}
			else{
				this.hitRenderer.draw(feature, symbolizer, this.map.transformation);
			}
			this.hitRenderer.restore();
		}
		rules = null;

		// this.map.drawHitLayer();
		this.map.drawLayersAll();
	},	

	cleanup : function(){
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
					layer.hitTooltip(evt.layerX, evt.layerY, callback);
				}
			}
			
		};

		map.canvas.addEventListener("mousemove", this.hitTooltipEvent);
	},

	unregisterHitTooltipEvent : function(){
		this.map.canvas.removeEventListener("mousemove",this.hitTooltipEvent);
		this.hitTooltipEvent = null;
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
	getBufferTracker : function(){
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
		return this.bufferTracker;
	},

	//线缓冲区
	queryByBufferLine : function(distance,callback){
		var bufferTracker = this.getBufferTracker(); 
		bufferTracker.trackBufferLine(this,distance,callback,this.callbackQueryByBufferTrack);
	},



	//圆缓冲区
	queryByBufferCircle : function(callback){
		var bufferTracker = this.getBufferTracker();
		bufferTracker.trackBufferCircle(this,callback,this.callbackQueryByBufferTrack);
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

		var workspace = layer.workspace;
		if(workspace == null){
			return;
		}
		workspace.queryByBuffer(distance,geometry,featureType,callback);

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
		this.workspace.transaction(this.featureType,geometry,values,callback);
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
