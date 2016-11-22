GeoBeans.Layer.RippleLayer = GeoBeans.Class(GeoBeans.Layer.FeatureLayer,{
	
	beginTime : null,

	// 颜色
	color : null,

	colorField : null,

	// 起始的透明度
	opacity : null,

	// 波纹的周期
	period : null,

	// 波纹条数
	lineNumber : null,

	// 放大比例
	scale : null,

	// 类型，是线还是圆
	type : null,

	// 波纹点的半径
	radius : null,

	// 波纹点使用的字段
	radiusField : null,

	currentFeatures : null,


	initialize : function(options){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		if(isValid(options)){
			if(isValid(options.name)){
				this.name = options.name;
			}

			if(isValid(options.color)){
				this.color = options.color;
			}

			if(isValid(options.colorField)){
				this.colorField = options.colorField;
			}

			if(isValid(options.opacity)){
				this.opacity = options.opacity;
			}

			if(isValid(options.period)){
				this.period = options.period;
			}else{
				this.period = 4;
			}

			if(isValid(options.lineNumber)){
				this.lineNumber = options.lineNumber;
			}else{
				this.lineNumber = 3;
			}

			if(isValid(options.geometryType)){
				this.geometryType = options.geometryType;
			}

			if(isValid(options.source)){
				this._source = options.source;
			}

			if(isValid(options.radius)){
				this.radius = options.radius;
			}

			if(isValid(options.radiusField)){
				this.radiusField = options.radiusField;
			}

			if(isValid(options.scale)){
				this.scale = options.scale;
			}else{
				this.scale = 5;
			}

			if(isValid(options.type)){
				this.type = options.type;
			}else{
				this.type = "stroke";
			}

			if(isValid(options.visible)){
				this.setVisible(options.visible);
			}
		}
	},

	setMap : function(){
		GeoBeans.Layer.FeatureLayer.prototype.setMap.apply(this, arguments);
		// window.layer = this;
		// window.requestNextAnimationFrame(this.animate);
		this.map.beginAnimate();
	},
});

/**
 * 是否是动画图层
 * @private
 * @return {Boolean} 
 */
GeoBeans.Layer.RippleLayer.prototype.isAnimation = function(){
	return true;
};


/**
 * 绘制
 * @private
 * @param  {int} time 时间
 */
GeoBeans.Layer.RippleLayer.prototype.draw = function(time){
	if(!isValid(time)){
		return;
	}

	if(!this.isVisible()){
		this.clear();
		return;
	}

	var viewer = this.map.getViewer();
	var extent = viewer.getExtent();

	var viewer =  new GeoBeans.Envelope(extent.xmin,extent.ymin,
										extent.xmax,extent.ymax);
	
	if(isValid(this.viewer) && this.viewer.equal(viewer)){
		this.clear();
		this.animate(this.currentFeatures,time);
		return;
	}else{
		this.viewer = viewer;
	}
	var success = {
		target : this,
		time : time,
		execute : function(features){
			if(!isValid(features)){
				return;
			}
			var layer = this.target;
			layer.currentFeatures = features;
			layer.clear();

			layer.animate(features,time);
			
		}
	};
	this._source.getFeaturesByExtent(viewer, success);
};


/**
 * 绘制动画
 * @private
 */
GeoBeans.Layer.RippleLayer.prototype.animate = function(features,time){
	if(!isValid(features) || !isValid(time)){
		return;
	}

	var elapsedTime = 0;
	if(this.beginTime == null){
		this.beginTime = time;
	}else{
		elapsedTime = time - this.beginTime;
		if(elapsedTime > this.period * 1000){
			elapsedTime = 0;
			this.beginTime = time;
		}
	}


	var feature = null,geometry = null,r = null,c = null,maxRadius = null;
	var colorFieldValue = null,radiusFieldValue = null;
	var radiusDelta = null,radiusByTime = null,radiusByLineNumber = null;
	for(var i = 0; i < features.length; ++i){
		feature = features[i];
		if(!isValid(feature)){
			continue;
		}

		geometry = feature.geometry;
		if(!(geometry instanceof GeoBeans.Geometry.Point)){
			continue;
		}

		if(typeof this.radius  == "function"){
			radiusFieldValue = feature.getValue(this.radiusField);
			r = this.radius(radiusFieldValue);
		}else{
			r = this.radius;
		}
		if(!isValid(r) || r < 0){
			continue;
		}

		if(typeof this.color == "function"){
			colorFieldValue = feature.getValue(this.colorField);
			c = this.color(colorFieldValue)
		}else{
			c = this.color;
		}
		if(!isValid(c)){
			continue;
		}

		var radiusColor = new GeoBeans.Color();
		radiusColor.setHex(c,this.opacity);
		var context = this.renderer.context;
		context.fillStyle = radiusColor.getRgba();

		spt = this.map.getViewer().toScreenPoint(geometry.x,geometry.y);
		context.beginPath();
		context.arc(spt.x,spt.y,r,0,Math.PI*2);
		context.fill();

		maxRadius = r * this.scale;


		radiusDelta = (maxRadius - r) / (this.period * 1000);

		radiusByTime = radiusDelta * elapsedTime;

		radiusByLineNumber = (maxRadius - r) / this.lineNumber;

		// 绘制波纹效果
		for(var j = 0; j < this.lineNumber;++j){
			var lr = r + radiusByLineNumber*j;
			lr += radiusByTime;
			if(lr > maxRadius){
				lr = lr - maxRadius + r;
			}

			var opacity = this.opacity *(1- (lr - r)/(maxRadius - r));

			var effectColor = new GeoBeans.Color();
			effectColor.setHex(c,opacity);
			if(this.type == "stroke"){
				context.strokeStyle = effectColor.getRgba();
				context.beginPath();
				context.arc(spt.x,spt.y,lr,0,Math.PI*2);
				context.stroke();
				context.closePath();
			}else if(this.type == "fill"){
				context.fillStyle = effectColor.getRgba();
				context.beginPath();
				context.arc(spt.x,spt.y,lr,0,Math.PI*2);
				context.fill();
				context.closePath();					
			}				
		}
	}
}