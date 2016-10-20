GeoBeans.Layer.ClusterLayer = GeoBeans.Class(GeoBeans.Layer.FeatureLayer,{

	symbolizers : null,

	cluster : null,

	showGeometry : false,
	
	CLASS_NAME : "GeoBeans.Layer.ClusterLayer",

	initialize : function(options){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		if(isValid(options)){
			if(isValid(options.name)){
				this.name = options.name;
			}
			if(isValid(options.source)){
				this._source = options.source;
			}

			if(isValid(options.showGeometry)){
				this.showGeometry = options.showGeometry;
			}else{
				this.showGeometry = false;
			}
			this.geometryType = GeoBeans.Geometry.Type.POINT;
		}
		this.createSymbolizer();
		this.cluster = null;
	},

	destory : function(){
		GeoBeans.Layer.FeatureLayer.prototype.destory.apply(this, arguments);
		this.symbolizers = null;
		this.cluster = null;
	},	

});

/**
 * 绘制
 * @public
 */
GeoBeans.Layer.ClusterLayer.prototype.draw = function(){
	if(!this.isVisible()){
		this.clear();
		return;
	}
	var success = {
		target : this,
		execute : function(features){
			if(!isValid(features)){
				return;
			}
			var layer = this.target;
			layer.clear();

			if(layer.showGeometry){
				layer.drawLayerFeatures(features);
			}


			if(!isValid(layer.cluster)){
				layer.cluster = new GeoBeans.Cluster(features,layer.map);
			}

			var flag = layer.getIconLoaded();
			if(flag){
				layer.drawClusterLayer();
			}else{
				layer.loadIcon();
			}

			
		}
	};
	this._source.getFeatures(null,success,null);
};



/**
 * 创建图标
 * @private
 */
GeoBeans.Layer.ClusterLayer.prototype.createSymbolizer = function(){
	var symbolizers = [];

	var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
	var symbol = new GeoBeans.Style.Symbol();
	symbol.icon = "../images/marker.png";
	symbolizer.symbol = symbol;
	symbolizers.push(symbolizer);

	var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
	var symbol = new GeoBeans.Style.Symbol();
	symbol.icon = "../images/m0.png";
	symbolizer.symbol = symbol;
	symbolizers.push(symbolizer);	

	var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
	var symbol = new GeoBeans.Style.Symbol();
	symbol.icon = "../images/m1.png";
	symbolizer.symbol = symbol;
	symbolizers.push(symbolizer);

	var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
	var symbol = new GeoBeans.Style.Symbol();
	symbol.icon = "../images/m2.png";
	symbolizer.symbol = symbol;
	symbolizers.push(symbolizer);


	var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
	var symbol = new GeoBeans.Style.Symbol();
	symbol.icon = "../images/m3.png";
	symbolizer.symbol = symbol;
	symbolizers.push(symbolizer);		


	var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
	var symbol = new GeoBeans.Style.Symbol();
	symbol.icon = "../images/m4.png";
	symbolizer.symbol = symbol;
	symbolizers.push(symbolizer);

	this.symbolizers = symbolizers;
};


/**
 * 判断图标是否已经加载完成
 * @private
 * @return {boolean} 加载完成结果
 */
GeoBeans.Layer.ClusterLayer.prototype.getIconLoaded = function(){
	var flag = true;
	for(var i = 0; i < this.symbolizers.length;++i){
		symbolizer = this.symbolizers[i];
		if(symbolizer.icon==null){
			symbolizer.icon = new Image();
			symbolizer.icon.crossOrigin="anonymous";
			symbolizer.icon.src = symbolizer.symbol.icon;			
		}
		else{
			if(symbolizer.icon.src!=symbolizer.symbol.icon){
				symbolizer.icon = null;
				symbolizer.icon = new Image();
				symbolizer.icon.crossOrigin="anonymous"	;
				symbolizer.icon.src = symbolizer.symbol.icon;
			}
		}
		if(symbolizer.icon.complete){
			
		}else{
			flag = false;
			return false;
		}
	}
	return true;
};


/**
 * 根据聚类进行绘制
 * @private
 */
GeoBeans.Layer.ClusterLayer.prototype.drawClusterLayer = function(){
	if(!isValid(this.cluster)){
		return;
	}

	

	// 绘制图标
	var clusters = this.cluster.getClusters();
	var cluster = null;
	var clustersArray = [[],[],[],[],[],[]];
	for(var i = 0;i < clusters.length;++i){
		cluster = clusters[i];
		if(cluster == null){
			continue;
		}
		cluster.geometry = this.cluster.getClusterCenter(cluster);
		var count = cluster.features.length;
		var number = this.getSymbolizerNumber(count);
		var radius = this.getIconWidth(number);
		cluster.radius = radius;
		clustersArray[number].push(cluster);
	}

	for(var i = 0; i < clustersArray.length;++i){
		var clustersItem = clustersArray[i];
		this.renderer.setSymbolizer(this.symbolizers[i]);
		this.renderer.drawIcons(clustersItem,this.symbolizers[i],this.map.getViewer());
	}


	// 写文字
	var textSymbolizer = new GeoBeans.Symbolizer.TextSymbolizer();
	textSymbolizer.font.family = "Microsoft Yahei";
	textSymbolizer.font.weight = GeoBeans.Style.Font.WeightType.Bold;
	textSymbolizer.fill.color.setHex("#000000",1);

	this.renderer.setSymbolizer(textSymbolizer);
	for(var i = 0; i < clusters.length;++i){
		var text = clusters[i].features.length;
		if(text == 1){
			continue;
		}
		var point_s = this.map.getViewer().toScreenPoint(clusters[i].geometry.x,clusters[i].geometry.y);
		var textWidth = this.renderer.context.measureText(text).width;
		this.renderer.context.fillText(text, point_s.x-textWidth/2, point_s.y+6);
	}
};


/**
 * 加载图标
 * @private
 */
GeoBeans.Layer.ClusterLayer.prototype.loadIcon = function(){
	var symbolizer = null;
	this.loadIconFlag = true;

	for(var i = 0; i < this.symbolizers.length;++i){
		symbolizer = this.symbolizers[i];
		if(symbolizer.icon==null){
			symbolizer.icon = new Image();
			symbolizer.icon.crossOrigin="anonymous";
			symbolizer.icon.src = symbolizer.symbol.icon;			
		}
		else{
			if(symbolizer.icon.src!=symbolizer.symbol.icon){
				symbolizer.icon = null;
				symbolizer.icon = new Image();
				symbolizer.icon.crossOrigin="anonymous";
				symbolizer.icon.src = symbolizer.symbol.icon;
			}
		}
		if(symbolizer.icon.complete){
			
		}else{
			var that = this;
			that.loadIconFlag = false;
			symbolizer.icon.onload = function(){
				console.log("loading" + symbolizer.icon);
				if(!that.loadIconFlag){
					that.loadIcon();
				}
			};
		}
	}

	if(this.loadIconFlag){
		this.drawClusterLayer();
	}
};

/**
 * 根据聚类个数获取图标序号
 * @private
 * @param  {integer} count 聚类个数
 * @return {integer}       图标序号
 */
GeoBeans.Layer.ClusterLayer.prototype.getSymbolizerNumber = function(count){
	if(count == 1){
		return 0;
	}else if(count > 1 && count < 10){
		return 1;
	}else if(count >= 10 && count < 20){
		return 2;
	}else if(count >= 20 && count < 30){
		return 3;
	}else if(count >= 30 && count < 40){
		return 4;
	}else if(count >= 40){
		return 5;
	}
};

/**
 * 获取图标宽度
 * @private
 * @param  {integer} number 第一个图标
 * @return {integer}        图标宽度
 */
GeoBeans.Layer.ClusterLayer.prototype.getIconWidth = function(number){
	var symbolizer = this.symbolizers[number];
	if(symbolizer == null){
		return null;
	}
	var icon = symbolizer.icon;
	if(icon == null){
		return null;
	}

	var width = icon.width;
	if(width == null){
		return null;
	}
	return width/2;
};