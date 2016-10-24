/**
 * @classdesc
 * 要素图层
 * @class
 * @extends {GeoBeans.Layer}
 */
GeoBeans.Layer.FeatureLayer = GeoBeans.Class(GeoBeans.Layer, {
	
	features : [],
	_source : null,	
	style : null,		
	geometryType : null,
	
	featureType : null,
	
	enableHit : false,
	hitControl : null,
	onhit : null,				//function onhit(layer, features)

	CLASS_NAME : "GeoBeans.Layer.FeatureLayer",

	// initialize : function(name){
	// 	GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		
	// 	this.featureType = null;
	// 	this.features = [];
	// },
	
	/**
	 * new GeoBeans.Layer.FeatureLayer({
	 * 	"name" : "layername",
	 *  "geometryType" : GeoBeans.Geometry.Type.POINT,
	 *  "source" : new GeoBeans.Source.Feature.GeoJSON({
	 *  	"url" : "http://127.0.0.1/Map5/example/all/data/geojson/point-samples.json",
	 *   	"geometryName" : "geometry",
	 *    }),		
	 *  "style" : new GeoBeans.Style({
	 * 
	 *  }),
	 * "featureType" : featureType,
	 * });
	 */
	initialize : function(options){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		
		this.name = options.name;
		this.geometryType = options.geometryType;
		this._source = options.source;
		this.style = options.style;
		this.featureType = options.featureType;
		this.features = [];
	},
	
	destroy : function(){
		this.features = null;
		this._source = null,
		this.style = null;
		this.renderer = null;
		this.geometryType = null;
		
		this.featureType = null;
		
		GeoBeans.Layer.prototype.destroy.apply(this, arguments);
	},

	setMap : function(map){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);	
	},
	

	getFeatures : function(){
		return this.features;
	},
	
	getFeature : function(i){
		if(i<0 || i>=this.features.length){
			return null;
		}
		return this.features[i];
	},

	getFeatureByID : function(id){
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
		this.flag = GeoBeans.Layer.Flag.READY;
	},
	
	count : function(){
		return this.features.length;
	},
	
	// draw : function(){
	// 	if(!this.isVisible()){
	// 		this.drawBackground();
	// 		return;
	// 	}
		
	// 	var viewer = this.map.getViewer();
	// 	var extent = viewer.getExtent();
	// 	var rotation = viewer.getRotation();
	// 	if(this.rotation != rotation){
	// 		this.flag = GeoBeans.Layer.Flag.READY;
	// 	}
	// 	this.rotation = rotation;
	// 	// if(extent != null && this.viewer != null && extent.equal(this.viewer)
	// 	// 	&& this.flag == GeoBeans.Layer.Flag.LOADED){
	// 	// 	this.flag = GeoBeans.Layer.Flag.LOADED;
	// 	// 	var bboxFilter = new GeoBeans.Filter.BBoxFilter(this.featureType.geomFieldName,this.viewer);
	// 	// 	var features = this.selectFeaturesByFilter(bboxFilter,this.features);
	// 	// 	this.drawLabelFeatures(features);
	// 	// 	this.drawClickLayer();
	// 	// 	return;
	// 	// }
		
	// 	this.viewer = new GeoBeans.Envelope(extent.xmin,extent.ymin,
	// 		extent.xmax,extent.ymax);
	// 	this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
	// 	var bboxFilter = new GeoBeans.Filter.BBoxFilter(this.featureType.geomFieldName,this.viewer);
	// 	var query = new GeoBeans.Query({
	// 		typeName : this.name,
	// 		fields : null,		// 字段
	// 		maxFeatures : null, //返回结果数
	// 		offset : null,		//偏移量
	// 		orderby : null,		//排序类
	// 		filter : bboxFilter 	//查询过滤条件
	// 	});
	// 	var handler = {
	// 		target: this,
	// 		execute : function(features){
	// 			console.log("count:" + features.length);
	// 			this.target.drawLayerFeatures(features);
	// 		}
	// 	}
	// 	this.query(query,handler);

	// 	var hitCanvas = this.hitCanvas;
	// 	if(hitCanvas != null){
	// 		this.renderer.drawImage(hitCanvas,0,0,hitCanvas.width,hitCanvas.height);
	// 	}

	// 	this.flag = GeoBeans.Layer.Flag.LOADED;

	// },

	//绘制要素
	// ？？ 这个features内所有的feature的symbolizer都一样，否则和Layer的draw有什么区别？
	drawLayerFeatures : function(features){
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
			//放到selection里面干什么？
			var selection = this._source.select(rule.filter,features);
			if(rule.symbolizer != null){
				if(rule.symbolizer.symbol != null){
					this.renderer.drawIcons(selection, rule.symbolizer, this.map.getViewer());
				}else{
					this.drawFeatures(selection, rule.symbolizer);
				}	
			}

			if(rule.textSymbolizer != null){
				this.labelFeatures(selection,rule.textSymbolizer);
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
		//？？直接调用getField就可以，又何必多此一举先获得index
		var geomFieldIndex = featureType.findField(geomFieldName);
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

		var geomType = this.getGeometryType();
		var style = null; 
		switch(geomType){
			case GeoBeans.Geometry.Type.POINT:
			case GeoBeans.Geometry.Type.MULTIPOINT:{
				style = new GeoBeans.Style.FeatureStyle();
				var rule = new GeoBeans.Style.Rule();
				var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
				rule.symbolizer = symbolizer;
				style.addRule(rule);
				break;
			}
			case GeoBeans.Geometry.Type.LINESTRING:
			case GeoBeans.Geometry.Type.MULTILINESTRING:{
				style = new GeoBeans.Style.FeatureStyle();
				var rule = new GeoBeans.Style.Rule();
				var symbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
				rule.symbolizer = symbolizer;
				style.addRule(rule);
				break;
			}
			case GeoBeans.Geometry.Type.POLYGON:
			case GeoBeans.Geometry.Type.MULTIPOLYGON:{
				style = new GeoBeans.Style.FeatureStyle();
				var rule = new GeoBeans.Style.Rule();
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
		if(features == null ||features.length==0){
			return;
		}

		var viewer = this.map.getViewer();
		this.renderer.save();		
		for(var i=0,len=features.length; i<len; i++){
			feature = features[i];
			
			var s = symbolizer;
			if(isValid(feature.symbolizer)){
				//如果feature本身带symbolizer,则使用feature自带的symbolizer；否则使用Layer定义的symbolizer
				s = feature.symbolizer;
			}

			if(isValid(s)){
				this.renderer.setSymbolizer(s);
				if(isValid(s.symbol)){
					//如果定义了符号，则使用符号渲染
					this.renderer.drawIcon2(feature, s, viewer);
				}
				else{
					//否则，使用简单方式渲染
					this.renderer.draw(feature, s, viewer);
				}
			}

			if(isValid(feature.textSymbolizer)){
				this.renderer.save();
				var textSymbolizer = feature.textSymbolizer;
				this.renderer.setSymbolizer(textSymbolizer);
				var text = null, value = null,labelProp = null;
				var labelText = textSymbolizer.labelText;
				if(labelText == null || labelText.length == 0){
					labelProp = textSymbolizer.labelProp;
				}else{
					text = labelText;
				}
				if(text == null){
					value = feature.getValue(labelProp);
				}else{
					value = text;
				}
				var label = new GeoBeans.PointLabel();
				label.geometry = feature.geometry;
				label.textSymbolizer = textSymbolizer;
				if(text == null){
					value = feature.getValue(labelProp);
				}else{
					value = text;
				}
				label.text = value;
				label.computePosition(this.renderer,this.map.getViewer());

				this.renderer.drawLabel(label);	
				this.renderer.restore();
			}

			// if(isValid(feature.symbolizer)){
			// 	this.renderer.setSymbolizer(feature.symbolizer);
			// 	this.renderer.draw(feature, feature.symbolizer, this.map.getViewer());
			// }
			// else{
			// 	if(isValid(symbolizer)){
			// 		this.renderer.setSymbolizer(symbolizer);
			// 		this.renderer.draw(feature, symbolizer, this.map.getViewer());
			// 	}	
			// }
		}
		this.renderer.restore();
	},


	// 加上碰撞检测的文字样式
	// ？？？这里不做碰撞检测
	// ？？？即便是做碰检测，Maplex类已经实现了，这里又何必再实现一次？
	// 解释： 这个是参考Auge.GIS里面写的，每个图层进行判断，然后添加到maplex里面。
	// labelFeatures : function(features,symbolizer){
	// 	if(features == null || features.length == 0){
	// 		return;
	// 	}

	// 	this.renderer.save();
	// 	this.renderer.setSymbolizer(symbolizer);
	// 	var feature = features[0];
	// 	var text = null;
	// 	var labelText = symbolizer.labelText;
	// 	if(labelText == null || labelText.length == 0){
	// 		var labelProp = symbolizer.labelProp;
	// 		// if(labelProp != null){
	// 		// 	var findex = feature.featureType.findField(labelProp);
	// 		// }
	// 	}else{
	// 		text = labelText;
	// 	}

	// 	var value = null;
	// 	var geometry = null;
	// 	var label = null;
	// 	for(var i=0,len=features.length; i<len; i++){
	// 		feature = features[i];
	// 		geometry = feature.geometry;
	// 		if(geometry == null){
	// 			continue;
	// 		}
	// 		label = new GeoBeans.PointLabel();
	// 		label.geometry = geometry;
	// 		label.textSymbolizer = symbolizer;
	// 		if(text == null){
	// 			value = feature.getValue(labelProp);
	// 		}else{
	// 			value = text;
	// 		}
	// 		label.text = value;
	// 		label.computePosition(this.renderer,this.map.getViewer());
	// 		label.adjustPosition(this.canvas.width,this.canvas.height);
	// 		if(!this.map.maplex.isCollision(label)){
	// 			this.map.maplex.addLabel(this.name,label);
	// 		}
	// 	}		

	// 	this.renderer.restore();

	// },
	
	// 图层单独绘制，不进行碰撞检测
	labelFeatures : function(features,symbolizer){
		if(!isValid(features) || !isValid(symbolizer)){
			return;
		}
		this.renderer.save();
		this.renderer.setSymbolizer(symbolizer);
		var feature = features[0];
		var text = null;
		var labelText = symbolizer.labelText;
		if(labelText == null || labelText.length == 0){
			var labelProp = symbolizer.labelProp;
		}else{
			text = labelText;
		}

		var value = null;
		var geometry = null;
		var label = null;
		for(var i=0,len=features.length; i<len; i++){
			feature = features[i];
			geometry = feature.geometry;
			if(!isValid(geometry)){
				continue;
			}
			
			if(text == null){
				value = feature.getValue(labelProp);
			}else{
				value = text;
			}

			label = new GeoBeans.PointLabel();
			label.geometry = geometry;
			label.textSymbolizer = symbolizer;
			if(text == null){
				value = feature.getValue(labelProp);
			}else{
				value = text;
			}
			label.text = value;
			label.computePosition(this.renderer,this.map.getViewer());

			this.renderer.drawLabel(label);	
			
		}	
		this.renderer.restore();	

	},

	
	
	init : function(){
	},
	

	cleanup : function(){
		this.enableHit = false;
		this.map.canvas.removeEventListener('mousemove', this.hitEvent);
		this.map.canvas.removeEventListener('mousemove', this.hitTooltipEvent);
	},
	

	/***********************插入更新*******************************************/
	//插入
	//？？？这个函数是要干什么？为什么要调用track
	// 在图上采集图元进行插入更新，好像最后版本里没有用到
	beginTransaction : function(callback){
		var geomFieldIndex = this.featureType.findField(this.featureType.geomFieldName);
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


	// 获取字段值
	getFeatureValue : function(feature,fieldName){
		if(feature == null){
			return;
		}
		return feature.getValue(fieldName);
	},

	setFeatureValue : function(feature,fieldName,value){
		if(feature == null){
			return;
		}
		feature.setValue(fieldName,value);
		this.flag = GeoBeans.Layer.Flag.READY;
	},

});


/**
 * 获得图层当前的空间范围
 * @return {GeoBeans.Envelope}	图层的空间范围
 */
GeoBeans.Layer.FeatureLayer.prototype.getExtent = function(){

	var extent = new GeoBeans.Envelope();	
	if(isValid(this.features)){
		var that = this;
		this.features.forEach(function(f){
			if(isValid(f.geometry)){
				var rect = f.geometry.extent;
				if(isValid(rect)){
					extent.union(rect);
				}
			}
		});
	}
	return extent;
}

/**
 * 向图层上添加一个feature
 * @public
 * @param  {GeoBeasn.Feature} feature feature对象
 */
GeoBeans.Layer.FeatureLayer.prototype.addFeature = function(feature){
	if(isValid(feature)){
		this.features.push(feature);
	}
}

/**
 * 向图层上添加features
 * @public
 * @param  {Array.<GeoBeasn.Feature>} features feature集合
 */
GeoBeans.Layer.FeatureLayer.prototype.addFeatures = function(features){
	if(features==null){
		return;	
	}
	if(this.features == null){
		this.features = [];
	}
	if(!(features instanceof Array)){
		return ;
	}
	for(var i=0,len=features.length; i<len; i++){
		var f = features[i];
		this.features.push(f);
	}
}

/**
 * 设置图层上的features
 * @public
 * @param  {Array.<GeoBeasn.Feature>} features feature集合
 */
GeoBeans.Layer.FeatureLayer.prototype.setFeatures = function(features){
	if(!isValid(features)){
		this.features = [];
	}
	else{
		this.features = features;
	}
}

/**
 * 获得图层相关的featureType
 * @public
 * @return  {GeoBeasn.FeatureType} 图层相关的featureType
 */
// GeoBeans.Layer.FeatureLayer.prototype.getFeatureType = function(){
// 	return this.featureType;
// }

/**
 * 获得给定字段的最大最小值
 * @public
 * @return  {Object} 最大最小值
 */
GeoBeans.Layer.FeatureLayer.prototype.getMinMaxValue = function(fname){
	var minmax = {
		min : 0,
		max : 0
	};
	if(!isValid(this.features)){
		return minmax;
	}
	var min = null;
	var max = null;
	var feature = null;

	for(var i = 0; i < this.features.length; ++i){
		feature = this.features[i];
		if(feature == null){
			continue;
		}
		var value = feature.getValue(fname);
		if(value == null){
			continue;
		}
		value = parseFloat(value);
		if(min == null){
			min = value;
		}else{
			min = (value < min ) ? value : min; 
		}
		if(max == null){
			max = value;
		}else{
			max = (value > max) ? value : max;
		}			

	}
	return {
		min : min,
		max : max
	};
}

/**
 * 启用Feature拾取功能
 * @param  {boolean} enable 是否启用拾取功能
 */
GeoBeans.Layer.FeatureLayer.prototype.enableHit = function(enable){
	this.enableHit = enable;
	if(enable){
		if(!isValid(this.hitControl)){
			this.hitControl = new GeoBeans.Control.FeatureHitControl(this, this.onhit);
			this.hitControl.enable(enable);
		}
	}
	else{
		if(isValid(this.hitControl)){
			this.hitControl.enable(false);
		}
		this.hitControl = null;
	}
}

/************************************************************************************/
/*
/************************************************************************************/
GeoBeans.Layer.FeatureLayer.prototype.draw = function(){
	if(!this.isVisible()){
		this.clear();
		return;
	}
	
	var viewer = this.map.getViewer();
	var mapContainer = this.map.getContainer();

	var extent = viewer.getExtent();
	var rotation = viewer.getRotation();
	if(this.rotation != rotation){
		this.flag = GeoBeans.Layer.Flag.READY;
	}
	this.rotation = rotation;	
	this.viewer = new GeoBeans.Envelope(extent.xmin,extent.ymin,
										extent.xmax,extent.ymax);
	
	/*
	var bboxFilter = new GeoBeans.Filter.BBoxFilter(this.featureType.geomFieldName,this.viewer);
	var query = new GeoBeans.Query({
		typeName : this.name,
		fields : null,		// 字段
		maxFeatures : null, //返回结果数
		offset : null,		//偏移量
		orderby : null,		//排序类
		filter : bboxFilter 	//查询过滤条件
	});*/
	var handler = {
		target: this,
		execute : function(features){
			console.log("count:" + features.length);
			this.target.renderer.clearRect(0,0,this.target.map.getWidth(),this.target.map.getHeight());
			this.target.drawLayerFeatures(features);
		}
	}
	this._source.getFeaturesByExtent(this.viewer, handler);

	var hitCanvas = this.hitCanvas;
	if(hitCanvas != null){
		this.renderer.drawImage(hitCanvas,0,0,hitCanvas.width,hitCanvas.height);
	}

	this.flag = GeoBeans.Layer.Flag.LOADED;
}

GeoBeans.Layer.FeatureLayer.prototype.getGeometryType = function(){
	return this.geometryType;
}


/**
 * 查询
 * @public
 * @param  {GeoBeasn.Filter} filter 查询过滤器
 * @return {GeoBeans.Feature}        目标要素集合
 */
GeoBeans.Layer.FeatureLayer.prototype.query = function(query, handler){
	if(!isValid(query)){
		if(isValid(handler)){
			handler.execute(null);
		}
		return;
	}

	if(isValid(this._source)){
		this._source.query(query,handler);
	}
}
