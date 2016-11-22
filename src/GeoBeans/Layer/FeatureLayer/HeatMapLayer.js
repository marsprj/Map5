/**
 * @classdesc
 * 热力图
 * @class
 */
GeoBeans.Layer.HeatMapLayer = GeoBeans.Class(GeoBeans.Layer.FeatureLayer, {

	// HeatMap参数
	field  : null,
	radius : 40,

	//是否显示Geometry
	showGeometry : false,

	//热力图实例
	heatmap : null,
	container : null,

	CLASS_NAME : "GeoBeans.Layer.HeatMapLayer",

	initialize : function(options){
		//GeoBeans.Layer.FeatureLayer.prototype.initialize.apply(this, arguments);
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		this.apply(options);
		//this.initHeatMap();
	},
	
	destory : function(){
		
		GeoBeans.Layer.FeatureLayer.prototype.destory.apply(this, arguments);
	},

});

/**
 * 刷新图层
 * @deprecated
 */
GeoBeans.Layer.HeatMapLayer.prototype.draw = function(){
	this.drawHeatMap();
	this.flag = GeoBeans.Layer.Flag.LOADED;
}

/**
 * 刷新图层
 * @public
 * @override
 */
GeoBeans.Layer.HeatMapLayer.prototype.refresh = function(){
	this.drawHeatMap();
	this.flag = GeoBeans.Layer.Flag.LOADED;	
}

/**
 * 绘制热力图
 * @private
 */
GeoBeans.Layer.HeatMapLayer.prototype.drawHeatMap = function(){	

	if(!isValid(this.features)){
		return;
	}
	
	var viewer = this.map.getViewer();
	var extent = viewer.getExtent();
	var filter = new GeoBeans.Filter.BBoxFilter(null,extent);
	var query = new GeoBeans.Query({
		typeName : this.name,
		fields : null,		// 字段
		maxFeatures : null, //返回结果数
		offset : null,		//偏移量
		orderby : null,		//排序类
		filter : filter 	//查询过滤条件
	});

	var handler = {
		target: this,
		execute : function(features){
			console.log("count:" + features.length);
			this.target.setData(features);

			if(this.target.showGeometry){
				this.target.drawLayerFeatures(features);
			}
		}
	}
	
	this.query(query,handler);
}

/**
 * 初始化参数
 * @private
 * @param  {Object} options 参数
 */
GeoBeans.Layer.HeatMapLayer.prototype.apply = function(options){
	//1.name
	if(isValid(options.name)){
		this.name = options.name;
	}

	//2.field
	if(isValid(options.field)){
		this.field = options.field;
	}
	//3.radius
	if(isValid(options.radius)){
		this.radius = options.radius;
	}

	// 4.source
	if(isValid(options.source)){
		this._source = options.source;
	}	

	if(isValid(options.showGeometry)){
		this.showGeometry = options.showGeometry;
	}

	if(isValid(options.visible)){
		this.setVisible(options.visible);
	}
}

/**
 * 设置Layer所属地图
 * @public
 * @override
 * @param {GeoBeans.Map} map 地图对象。
 */
GeoBeans.Layer.HeatMapLayer.prototype.setMap = function(map){

	GeoBeans.Layer.prototype.setMap.apply(this, arguments);	

	var width  = this.map.getWidth();
	var height = this.map.getHeight();

	this.div = document.createElement("div");
	this.div.className = "heatmap";	
	this.div.style.cssText = "height:" + height + "px;width:" + width + "px;";

	this.heatmap = 	h337.create({
	  	container: this.div,
	  	radius : this.radius
	});	


	// 将heatmap控件生成的canvas替换原本的图层canvas
	var heatMapCanvas = this.div.children[0];
	var mapContainer = this.map.getContainer();
	var canvas = $(mapContainer).find(".map5-canvas[id='" + this.name + "']");
	if(canvas.length == 1){
		var prev = canvas.prev();
		canvas.remove();
		prev.after(heatMapCanvas);
		this.canvas = heatMapCanvas;
		this.canvas.className = "map5-canvas";
		this.canvas.id = this.name;
		this.renderer = new GeoBeans.Renderer(this.canvas);
	}
}


GeoBeans.Layer.HeatMapLayer.prototype.setData = function(features){

	var viewer = this.map.getViewer();

	var point_s = null,point = null;
	var f = null, geometry = null;
	var max = null,min = null,points = [];
	var that = this;


	features.forEach(function(f){
		geometry = f.geometry;
		if(geometry != null){

			if(geometry.type == GeoBeans.Geometry.Type.POINT){

				value = f.getValue(that.field);
				if(!isValid(value)){
					value = 1;
					min = value;
					max = value;
				}else{
					if(min == null){
						min = value;
					}else{
						min = Math.min(min,value);
					}

					if(max == null){
						max = value;
					}else{
						max = Math.max(max,value);	
					}
					
				}
				point_s = viewer.toScreenPoint(geometry.x,geometry.y);

				point = {
					x : point_s.x,
					y : point_s.y,
					value : value
					// radius : 16
				};
				points.push(point);
			}
		}
	});

	var data = {
		max : max,
		min : min,
		data : points
	};

	this.heatmap.setData(data);
};