GeoBeans.Layer.RippleLayer = GeoBeans.Class(GeoBeans.Layer,{
	featureType : null,
	dbName : null,
	typeName : null,
	option : null,

	// 请求
	xhr : null,

	// 每次波纹的起始时间
	beginTime : null,

	// // 波纹的纹理数
	// lineNumber : 3,

	filter : null,


	defaultOption : {
		radius : 10,
		scale : 2.5,
		period : 4,
		lineNumber : 3,
		type : "stroke",
		color : "#FFFF00",
		alpha : 1,
		showEffect : true
	},

	initialize : function(name,dbName,typeName,option,filter){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);

		this.dbName = dbName;
		this.typeName = typeName;
		this.option = option;
		var o = this._getOption(option);
		this.option = o;

		this.filter = filter;
	},


	cleanup : function(){
		GeoBeans.Layer.prototype.destory.apply(this, arguments);
		this.option = null;
		this.dbName = null;
		this.typeName = null;
		this.beginTime = null;
		this.xhr = null;
		this.features = null;
		var index = this.map.hitRippleLayers.indexOf(this);
		if(index != -1){
			this.map.hitRippleLayers.splice(index,1);
		}
	},

	_getOption : function(option){

		if(option == null){
			return this.defaultOption;
		}
		var radius = option.radius;
		if(radius == null){
			radius = this.defaultOption.radius;
		}	

		var scale = option.scale;
		if(scale == null){
			scale = this.defaultOption.scale;
		}

		var period = option.period;
		if(period == null){
			period = this.defaultOption.period;
		}

		var lineNumber = option.lineNumber;
		if(lineNumber == null){
			lineNumber = this.defaultOption.lineNumber;
		}

		var type = option.type;
		if(type == null){
			type = this.defaultOption.type;
		}

		var color = option.color;
		if(color == null){
			color = this.defaultOption.color;
		}

		var alpha = option.alpha;
		if(alpha == null){
			alpha = this.defaultOption.alpha;
		}

		var field = option.field;

		var radiusField = option.radiusField;
		var colorField = option.colorField;


		var showEffect = option.showEffect;
		if(showEffect == null){
			showEffect = true;
		}
		return {
			radius : radius,
			scale : scale,
			period : period,
			lineNumber : lineNumber,
			type : type,
			color : color,
			alpha : alpha,
			field : field,
			showEffect : showEffect,
			radiusField : radiusField,
			colorField : colorField
		};
	},


	// setMap : function(map){
	// 	GeoBeans.Layer.prototype.setMap.apply(this, arguments);
	// 	window.rippleLayer = this;
	// 	window.map = this.map;
	// 	window.requestNextAnimationFrame(this.map.rippleLayerAnimate);
	// 	this.renderer.context.globalCompositeOperation = "lighter";
	// },

	// 
	setMap : function(map){
		// GeoBeans.Layer.prototype.setMap.apply(this, arguments);
		// window.rippleLayer = this;
		// window.map = this.map;
		// window.requestNextAnimationFrame(this.map.rippleLayerAnimate);
		// this.renderer.context.globalCompositeOperation = "lighter";
		map.beginAnimate();
		this.map = map;
		this.canvas = this.map.animateCanvas;
		this.renderer = this.map.animateRenderer;
	},

	load : function(){
		if(this.features == null && this.xhr == null){
			this.getFeatures();
		}
		
		this.flag = GeoBeans.Layer.Flag.LOADED;
	},


	// animate : function(time){
	// 	// console.log("animate");
	// 	var layer = this.rippleLayer;
	// 	var layer = this;
	// 	layer.renderer.clearRect();
	// 	layer.draw(time);

	// 	// var requestID = window.requestNextAnimationFrame(layer.animate);

	// 	layer.requestID = requestID;
	// },


	// draw : function(){
	// 	var symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
	// 	var x = Math.random() *(135-70) + 70;
	// 	var y = Math.random() * (60-18) + 18;  
	// 	var point = new GeoBeans.Geometry.Point(x,y);
	// 	this.renderer.drawGeometry(point,symbolizer,this.map.transformation);
	// 	this.map.drawLayersAll();
	// },

	// 获取所有的元素
	getFeatures : function(){
		var featureType = this.getFeatureType();
		if(featureType == null){
			return;
		}
		this.featureType = featureType;

		var fields = [this.featureType.geomFieldName];	
		var radiusField = this.option.radiusField;
		if(radiusField != null && $.inArray(radiusField,fields) == -1){
			fields.push(radiusField);
		}
		var colorField = this.option.colorField;
		if(colorField != null && $.inArray(colorField,fields) == -1){
			fields.push(colorField);
		}

		
		this.get_time = new Date();
		this.xhr = this.featureType.getFeaturesFilterAsync2(null,this.dbName,this.filter,null,null,fields,
			null,this,this.getFeatures_callback);
		// this.getJson();
	},

	// 测试json数据
	getJson : function(){
		var url = "hospital.json";
		var features = [];
		var featureType = this.getFeatureType();
		var that = this;
		var time = new Date();
		$.getJSON('hospital.json',function(data){
			var item = null,id = null,x = null,y = null;
			var point = null;
			var feature = null,values = null;
			for(var i = 0; i < data.length;++i){
				item = data[i];
				id = item.id;
				x = item.x;
				y = item.y;
				point = new GeoBeans.Geometry.Point(x,y);
				values = [];
				values.push(id);
				values.push(null);
				values.push(point);
				feature = new GeoBeans.Feature(featureType,id,point,values);
				features.push(feature);
			}
			that.features = features;
			console.log(new Date() - time);
			that.draw();
		});

	},

	getFeatures_callback : function(layer,features){
		if(layer == null || features == null ||  !$.isArray(features)){
			return;
		}
		// console.log(new Date() - layer.get_time);
		layer.xhr = null;
		layer.features = features;
		layer.draw();
	},


	// 获取featureType
	getFeatureType : function(){
		if(this.featureType != null){
			return this.featureType;
		}else{
			if(this.map != null){
				var workspace = new GeoBeans.WFSWorkspace("tmp",
				this.map.server,"1.0.0");
				this.featureType = new GeoBeans.FeatureType(workspace,
					this.typeName);
				if(this.featureType.fields == null){
					this.featureType.fields = this.featureType
					.getFields(null,this.dbName);
				}
				return this.featureType;
			}
		}
		return null;
	},


	// draw : function(time){
	// 	this.renderer.clearRect();
	// 	if(!this.visible){
	// 		this.map.drawLayersAll();
	// 		return;
	// 	}
	// 	if(this.option == null){
	// 		return;
	// 	}
	// 	var field = this.option.field;
	// 	if(field != null){
	// 		this.drawByField(time);
	// 	}else{
	// 		this.drawByRadius(time);
	// 	}
	// },

	// // 相同的半径绘制
	// drawByRadius : function(time){
	// 	if(this.features == null){
	// 		return;
	// 	}
	// 	var hex = this.option.color;
	// 	var alpha = this.option.alpha;
	// 	var color = new GeoBeans.Color();
	// 	color.setByHex(hex,alpha);

	// 	// 半径
	// 	var radius = this.option.radius;


	// 	// 计算半径
	// 	var scale = this.option.scale;
	// 	var maxRadius = radius * scale;

	// 	var period = this.option.period;

	// 	// 半径每毫秒增量
	// 	var radiusDelta = (maxRadius - radius) / (period * 1000);

	// 	// 绘制方式
	// 	var type = this.option.type;

	// 	// 效果展示
	// 	var showEffect = this.option.showEffect;


	// 	// 经历的时间
	// 	var elapsedTime = 0;
	// 	if(this.beginTime == null){
	// 		this.beginTime = time;
	// 	}else{
	// 		elapsedTime = time - this.beginTime;
	// 		if(elapsedTime > period * 1000){
	// 			elapsedTime = 0;
	// 			this.beginTime = time;
	// 		}
	// 	}


	// 	var radiusByTime = radiusDelta * elapsedTime;
	// 	var radiusByLineNumber = (maxRadius - radius)/this.option.lineNumber;
	// 	var radiusArray = [];
	// 	for(var i = 0; i < this.option.lineNumber; ++i){
	// 		var r = radius + radiusByLineNumber*i;
	// 		r += radiusByTime;
	// 		if(r > maxRadius){
	// 			r = r - maxRadius + radius;
	// 		}
	// 		// var alpha = 1 - (r - radius)/(maxRadius - radius);
	// 		var opacity = alpha *(1- (r - radius)/(maxRadius - radius));
	// 		radiusArray.push({
	// 			radius : r,
	// 			alpha : opacity
	// 		});
	// 	}



	// 	var context = this.renderer.context;
	// 	context.fillStyle = color.getRgba();

	// 	var feature = null,geometry = null;
	// 	for(var i = 0; i < this.features.length;++i){
	// 		feature = this.features[i];
	// 		if(feature == null){
	// 			continue;
	// 		}
	// 		geometry = feature.geometry;
	// 		if(!(geometry instanceof GeoBeans.Geometry.Point)){
	// 			continue;
	// 		}
	// 		spt = this.map.transformation.toScreenPoint(geometry.x,geometry.y);
	// 		context.beginPath();
	// 		context.arc(spt.x,spt.y,radius,0,Math.PI*2);
	// 		context.fill();
			
	// 		// 绘制波纹
	// 		if(showEffect){
	// 			for(var j = 0; j < radiusArray.length;++j){
	// 				var obj = radiusArray[j];
	// 				var alpha = obj.alpha;
	// 				var r = obj.radius;
	// 				var color = new GeoBeans.Color();
	// 				color.setByHex(hex,alpha)
	// 				if(type == "stroke"){
	// 					context.strokeStyle = color.getRgba();
	// 					context.beginPath();
	// 					context.arc(spt.x,spt.y,r,0,Math.PI*2);
	// 					context.stroke();
	// 					context.closePath();
	// 				}else if(type == "fill"){
	// 					context.fillStyle = color.getRgba();
	// 					context.beginPath();
	// 					context.arc(spt.x,spt.y,r,0,Math.PI*2);
	// 					context.fill();
	// 					context.closePath();					
	// 				}
	// 			}
	// 		}

	// 	}
	// 	var dragControlIndex = this.map.controls.find(GeoBeans.Control.Type.DRAG_MAP);
	// 	var dragControl = this.map.controls.get(dragControlIndex);
	// 	var scrollControlIndex = this.map.controls.find(GeoBeans.Control.Type.SCROLL_MAP);
	// 	var scrollControl = this.map.controls.get(scrollControlIndex);
	// 	if(!(dragControl.draging) && scrollControl.count == 0){
	// 		// console.log("redraw");
	// 		this.map.drawLayersAll();
	// 	}

	// },

	// // 按照字段值大小来绘制
	// drawByField : function(time){

	// 	var field = this.option.field;
	// 	var features = this.features;
	// 	if(field == null || features == null){
	// 		return;
	// 	}

	// 	var hex = this.option.color;
	// 	var scale = this.option.scale;
	// 	var period = this.option.period;
	// 	var type = this.option.type;
	// 	var lineNumber = this.option.lineNumber;
	// 	var showEffect = this.option.showEffect;
	// 	var alpha = this.option.alpha;

	// 	var color = new GeoBeans.Color();
	// 	color.setByHex(hex,alpha);


	// 	// 经历的时间
	// 	var elapsedTime = 0;
	// 	if(this.beginTime == null){
	// 		this.beginTime = time;
	// 	}else{
	// 		elapsedTime = time - this.beginTime;
	// 		if(elapsedTime > period * 1000){
	// 			elapsedTime = 0;
	// 			this.beginTime = time;
	// 		}
	// 	}


	// 	var context = this.renderer.context;
	// 	context.fillStyle = color.getRgba();

	// 	var featureType = this.getFeatureType();
	// 	var fieldIndex = featureType.getFieldIndex(field);
	// 	var f = null,values = null, value = null, geometry = null,spt = null;
	// 	var radiusDelta = null,maxRadius = null,radiusByTime = null,radiusByLineNumber = null;
	// 	for(var i = 0; i < features.length;++i){
	// 		f = features[i];
	// 		if(f == null){
	// 			continue;
	// 		}
	// 		geometry = f.geometry;
	// 		if(!(geometry instanceof GeoBeans.Geometry.Point)){
	// 			continue;
	// 		}

	// 		values = f.values;
	// 		if(values == null){
	// 			continue;
	// 		}
	// 		value = values[fieldIndex];

	// 		var r = this.option.radius(value);

	// 		if(r == null){
	// 			continue;
	// 		}
	// 		spt = this.map.transformation.toScreenPoint(geometry.x,geometry.y);
	// 		context.beginPath();
	// 		context.arc(spt.x,spt.y,r,0,Math.PI*2);
	// 		context.fill();

	// 		if(showEffect){
	// 			maxRadius = r * scale;

	// 			radiusDelta = (maxRadius - r) / (period * 1000);

	// 			radiusByTime = radiusDelta * elapsedTime;

	// 			radiusByLineNumber = (maxRadius - r) / lineNumber;

	// 			var radiusArray = [];
	// 			for(var j = 0; j < lineNumber;++j){
	// 				var lr = r + radiusByLineNumber*j;
	// 				lr += radiusByTime;
	// 				if(lr > maxRadius){
	// 					lr = lr - maxRadius + r;
	// 				}

	// 				var opacity = alpha *(1- (lr - r)/(maxRadius - r));

	// 				var color = new GeoBeans.Color();
	// 				color.setByHex(hex,opacity);
	// 				if(type == "stroke"){
	// 					context.strokeStyle = color.getRgba();
	// 					context.beginPath();
	// 					context.arc(spt.x,spt.y,lr,0,Math.PI*2);
	// 					context.stroke();
	// 					context.closePath();
	// 				}else if(type == "fill"){
	// 					context.fillStyle = color.getRgba();
	// 					context.beginPath();
	// 					context.arc(spt.x,spt.y,lr,0,Math.PI*2);
	// 					context.fill();
	// 					context.closePath();					
	// 				}				
	// 			}
	// 		}
	// 	}
	// 	var dragControlIndex = this.map.controls.find(GeoBeans.Control.Type.DRAG_MAP);
	// 	var dragControl = this.map.controls.get(dragControlIndex);
	// 	var scrollControlIndex = this.map.controls.find(GeoBeans.Control.Type.SCROLL_MAP);
	// 	var scrollControl = this.map.controls.get(scrollControlIndex);
	// 	if(!(dragControl.draging) && scrollControl.count == 0){
	// 		this.map.drawLayersAll();
	// 	}
	// },





	unregisterHitEvent : function(){
		this.content = null;
	},



	hit : function(x, y){
		if(this.features==null || !this.visible){
			return;
		}
		
		var render = this.map.renderer;
		var transformation = this.map.transformation;
		
		var selection = [];
		
		var i=0, j=0;
		var f=null, g=null;
		var len = this.features.length;
		for(i=0; i<len; i++){
			f = this.features[i];
			g = f.geometry;
			if(g!=null){
				if(g.hit(x, y, this.map.tolerance)){
					selection.push(f);
				}
			}
		}

		if(selection.length > 0){
			var f = selection[selection.length-1];
			var point = new GeoBeans.Geometry.Point(x,y);
			var string = this.getContent(f,this.content);
			return string;
		}else{
			return null;
		}
	},

	// 获取查询字段
	getFeaturesByHitContent : function(content){
		if(content == null){
			return;
		}
		var fields = this.getHitFields(content);
		if(fields.length == 0){
			return;
		}
		var featureType = this.getFeatureType();
		if(featureType == null){
			return;
		}
		var geomField = this.featureType.geomFieldName
		if($.inArray(geomField,fields) == -1){
			fields.push(geomField);
		}
		if(this.option.field != null){
			if($.inArray(this.option.field,fields) == -1){
				fields.push(this.option.field);
			}
		}
		var maxFeatures = 1000000;
		this.featureType.getFeaturesFilterAsync2(null,this.dbName,this.filter,maxFeatures,null,fields,
			null,this,this.getFeaturesHit_callback);
	},
	getFeaturesHit_callback : function(layer,features){
		if(layer == null || features == null){
			return;
		}

		layer.features = features;
	},

	// 获取字段
	getHitFields : function(string){
		var fields = [];
		while(string.indexOf("{") != -1){
			var b = string.indexOf("{");
			var e = string.indexOf("}");
			var field = string.slice(b+1,e);
			if($.inArray(field,fields) == -1){
				fields.push(field);
			}
			
			string = string.slice(e+1,string.length);
		}	
		return fields;	
	},

	//获取要显示的tooltip
	getContent : function(feature,content){
		if(feature == null || content == null ){
			return "";
		}
		var fields = this.getHitFields(content);
		if(fields == null){
			return "";
		}
		var values = feature.values;
		if(values == null){
			return "";
		}
		var featureType = this.getFeatureType();
		if(featureType == null){
			return "";
		}
		var field = null;
		var fieldIndex = null;
		var value = null;
		for(var i = 0; i < fields.length; ++i){
			field = fields[i];	
			fieldIndex = featureType.getFieldIndex(field);
			if(fieldIndex != -1){
				value = values[fieldIndex];
				if(value != null){
					content = content.replace("{" + field + "}",value);
				}
			}
		}
		return content;
	},

	// 设置显示的内容
	setHitContent : function(content){
		if(content != this.content){
			this.content = content;
			this.getFeaturesByHitContent(content);
		}
	},

	// 统一绘制
	draw : function(time){
		// this.renderer.clearRect();
		if(!this.visible){
			// this.map.drawLayersAll();
			return;
		}
		if(this.option == null){
			return;
		}

		this.drawRipple(time);		
	},


	drawRipple : function(time){
		var ooo = new Date();
		if(this.features == null || this.option == null){
			return;
		}
		var viewer = this.map.viewer;
		var features = this.getViewerFeatures(viewer,this.features);
		var radiusField = this.option.radiusField;
		var colorField = this.option.colorField;

		var scale = this.option.scale;
		var period = this.option.period;
		var type = this.option.type;
		var lineNumber = this.option.lineNumber;
		var showEffect = this.option.showEffect;
		var alpha = this.option.alpha;

		var radius = this.option.radius;
		var color = this.option.color;



		// 经历的时间
		var elapsedTime = 0;
		if(this.beginTime == null){
			this.beginTime = time;
		}else{
			elapsedTime = time - this.beginTime;
			if(elapsedTime > period * 1000){
				elapsedTime = 0;
				this.beginTime = time;
			}
		}

		var featureType = this.getFeatureType();
		var radiusFieldIndex = featureType.getFieldIndex(radiusField);
		var colorFieldIndex = featureType.getFieldIndex(colorField);

		var context = this.renderer.context;

		var f = null,values = null,radiusValue = null,colorValue = null,geometry = null,spt = null;
		var maxRadius = null,radiusDelta = null,radiusByTime = null,radiusByLineNumber = null;
		for(var i = 0; i < features.length;++i){
			f = features[i];
			if(f == null){
				continue;
			}
			geometry = f.geometry;
			if(!(geometry instanceof GeoBeans.Geometry.Point)){
				continue;
			}
			values = f.values;
			if(values == null){
				continue;
			}
			// 计算半径
			var r = null;
			if (typeof radius  == "function"){
				radiusValue = values[radiusFieldIndex];
				r = radius(radiusValue);
			}else{
				r = radius;
			}

			// 计算颜色
			var c = null;
			if (typeof color  == "function"){
				colorValue = values[colorFieldIndex];
				c = color(colorValue,this);
			}else{
				c = color;
			}			

			var radiusColor = new GeoBeans.Color();
			radiusColor.setByHex(c,alpha);
			context.fillStyle = radiusColor.getRgba();

			spt = this.map.transformation.toScreenPoint(geometry.x,geometry.y);
			context.beginPath();
			context.arc(spt.x,spt.y,r,0,Math.PI*2);
			context.fill();


			// 当前基础半径为r，颜色为c
			if(showEffect){
				maxRadius = r * scale;

				radiusDelta = (maxRadius - r) / (period * 1000);

				radiusByTime = radiusDelta * elapsedTime;

				radiusByLineNumber = (maxRadius - r) / lineNumber;
				for(var j = 0; j < lineNumber;++j){
					var lr = r + radiusByLineNumber*j;
					lr += radiusByTime;
					if(lr > maxRadius){
						lr = lr - maxRadius + r;
					}

					var opacity = alpha *(1- (lr - r)/(maxRadius - r));

					var effectColor = new GeoBeans.Color();
					effectColor.setByHex(c,opacity);
					if(type == "stroke"){
						context.strokeStyle = effectColor.getRgba();
						context.beginPath();
						context.arc(spt.x,spt.y,lr,0,Math.PI*2);
						context.stroke();
						context.closePath();
					}else if(type == "fill"){
						context.fillStyle = effectColor.getRgba();
						context.beginPath();
						context.arc(spt.x,spt.y,lr,0,Math.PI*2);
						context.fill();
						context.closePath();					
					}				
				}
			}
		}
		// context.closePath();
		// console.log(new Date() - ooo);
		var dragControlIndex = this.map.controls.find(GeoBeans.Control.Type.DRAG_MAP);
		var dragControl = this.map.controls.get(dragControlIndex);
		var scrollControlIndex = this.map.controls.find(GeoBeans.Control.Type.SCROLL_MAP);
		var scrollControl = this.map.controls.get(scrollControlIndex);
		if(!(dragControl.draging) && scrollControl.count == 0){
			// this.map.drawLayersAll();
			
		}else{
			// this.renderer.clearRect();
		}
	},

	// 获取当前范围内的
	getViewerFeatures : function(viewer,features){
		var time = new Date();
		if(viewer == null || features == null){
			return [];
		}
		var array = [],feature = null,point = null;
		for(var i = 0; i < features.length;++i){
			feature = features[i];
			if(feature == null){
				continue;
			}
			point = feature.geometry;
			if(point == null){
				continue;
			}

			if(viewer.contain(point.x,point.y)){
				array.push(feature);
			}
		}
		// console.log(new Date()- time);
		return array;
	},


});