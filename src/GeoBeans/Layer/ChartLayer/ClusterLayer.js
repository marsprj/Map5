GeoBeans.Layer.ClusterLayer = GeoBeans.Class(GeoBeans.Layer.ChartLayer,{

	// 按照像素来划分
	distance : 90,

	initialize : function(name,baseLayerName){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		this.name = name;
		this.baseLayerName = baseLayerName;
		this.createSymbolizer();
	},

	destroy : function(){
		GeoBeans.Layer.ChartLayer.prototype.destroy.apply(this, arguments);
		this.clusters = null;
		this.hitCluster = null;
		this.symbolizers = null;
	},

	setMap : function(map){
		GeoBeans.Layer.ChartLayer.prototype.setMap.apply(this, arguments);
		// this.registerClickEvent();
	},

	draw : function(){
		if(!this.isVisible()){
			this.clear();
			return;
		}
		if(this.features == null){
			this.flag = GeoBeans.Layer.Flag.LOADED;
			return;
		}


		this.renderer.clearRect(0,0,this.canvas.width,this.canvas.height);
		if(this.cluster == null){
			this.cluster =  new GeoBeans.Cluster(this.features,this.map);
		}
		
		this.drawCluster(this.cluster);
		this.flag = GeoBeans.Layer.Flag.LOADED;
	},

	// 创建图片样式
	createSymbolizer : function(){
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
	},


	getSymbolizerNumber : function(count){
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
	},

	getIconWidth : function(number){
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
	},

	getIconLoaded : function(){
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
	},

	loadIcon : function(){
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
			console.log("draw cluster")
			this.drawClusterLayer();
			// this.map.drawLayersAll();
		}
	},

	// hit click
	registerClickEvent : function(){
		if(this.hitEvent != null){
			return;
		}
		var map = this.map;
		var tolerance = 10;
		var x_o = null;
		var y_o = null;
		var that = this;
		that.hitCluster = null;
		this.hitEvent = function(evt){
			evt.preventDefault();
			if(x_o == null){
				x_o = evt.layerX;
				y_o = evt.layerY;
			}else{
				var dis = Math.abs(evt.layerX-x_o) + Math.abs(evt.layerY-y_o);
				if(dis > tolerance){
					
					x_o = evt.layerX;
					y_o = evt.layerY;					
					var cluster = that.hit(x_o,y_o);
					if(cluster == null){
						that.hitCluster = null;
						document.body.style.cursor = 'default';
					}else{
						var length = cluster.features.length;
						if(length == 1){
							that.hitCluster = null;
							document.body.style.cursor = 'default';
						}else{
							that.hitCluster = cluster;
							document.body.style.cursor = 'pointer';

							
						}
					}
				}
			}
		};

		var mapContainer = map.getContainer();
		mapContainer.addEventListener('mousemove', this.hitEvent);

		var clickEvent = function(evt){
			evt.preventDefault();
			var index = that.map.controls.find(GeoBeans.Control.Type.DRAG_MAP)
			var dragControl = that.map.controls.get(index);
			console.log(dragControl.draging);
			if(dragControl.draging){
				console.log("draging");
				return;
			}
			if(that.hitCluster == null){
				return;
			}
			that.zoomToCluster(that.hitCluster);
		};
		var mapContainer = this.map.getContainer();
		mapContainer.addEventListener("mouseup",clickEvent);
		this.clickEvent = clickEvent;
	},

	hit : function(x,y){
		if(this.clusters == null){
			return;
		}

		var cluster = null,geometry = null,pt = null,radius = null,distance = null;
		for(var i = 0; i < this.clusters.length;++i){
			cluster = this.clusters[i];
			geometry = cluster.geometry;
			var viewer = this.map.getViewer();
			pt = viewer.toScreenPoint(geometry.x,geometry.y);
			radius = cluster.radius;
			distance = GeoBeans.Utility.getDistance(pt.x,pt.y,x,y);
			if(distance < radius){
				return cluster;
			}
		}
		document.body.style.cursor = 'default';
		return null;
	},

	// 放大到一个cluster
	zoomToCluster : function(cluster){
		if(cluster == null){
			return;
		}
		var extent = this.getClusterExtent(cluster);
		var viewer = this.map.getViewer();
		extent.scale(1.2);
		if(this.map.baseLayer != null){
			var zoom = viewer.getZoomByExtent(extent);
			var center = extent.getCenter();
			viewer.setZoomCenter(zoom,center);
			this.map.clear();
		}else{
			viewer.setExtent(extent);
		}
		
		this.map.refresh();
	},

	getClusterExtent : function(cluster){
		if(cluster == null){
			return null;
		}

		var xmin = null,ymin = null, xmax = null, ymax = null;
		var features = cluster.features;
		for(var i = 0; i < features.length;++i){
			var feature = features[i];
			var geometry = feature.geometry;
			if(xmin == null){
				xmin = geometry.x;
			}else{
				xmin = (xmin < geometry.x )?xmin: geometry.x;
			}

			if(xmax == null){
				xmax = geometry.x;
			}else{
				xmax = (xmax > geometry.x)?xmax:geometry.x;
			}

			if(ymin == null){
				ymin = geometry.y;
			}else{
				ymin = (ymin < geometry.y)?ymin: geometry.y;
			}

			if(ymax == null){
				ymax = geometry.y;
			}else{
				ymax = (ymax > geometry.y)?ymax: geometry.y;
			}
		}
		return new GeoBeans.Envelope(xmin,ymin,xmax,ymax);
	},

	unRegisterClickEvent : function(){
		var mapContainer = this.map.getContainer();
		mapContainer.removeEventListener("mouseup",this.clickEvent);
		mapContainer.removeEventListener("mousemove",this.hitEvent);
		this.clickEvent = null;
		this.hitEvent = null;
	},
});

/**
 * 绘制聚类
 * @private
 */
GeoBeans.Layer.ClusterLayer.prototype.drawCluster = function(){
	if(this.cluster == null){
		return;
	}
	
	var flag = this.getIconLoaded();
	if(flag){
		this.drawClusterLayer();
	}else{
		this.loadIcon();
	}
};


/**
 * 加载完图片后，绘制图
 * @private
 */
GeoBeans.Layer.ClusterLayer.prototype.drawClusterLayer = function(){
	if(this.cluster == null){
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