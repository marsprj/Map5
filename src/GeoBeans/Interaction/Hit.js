/**
 * @classdesc
 * 拾取要素控制
 * @class
 * @extends {GeoBeans.Interaction}
 */
GeoBeans.Interaction.Hit = GeoBeans.Class(GeoBeans.Interaction, {
	
	_map : null,
	_layer : null,
	_condition : null,
	onmousemove : null,
	_onchange    : null,
	_tolerance : 4,
	
	_ptsymbol : null,
	_lnsymbol : null,
	_rnsymbol : null,
	
	initialize : function(options){
		GeoBeans.Interaction.prototype.initialize.apply(this, arguments);

		this._type = GeoBeans.Interaction.Type.HIT;

		if(isValid(options.map)){
			this._map = options.map;	
		}
		if(isValid(options.layer)){
			this._layer = options.layer;	
		}
		if(isValid(options.condition)){
			this._condition = options.condition;	
		}

		this._ptsymbol = this.createPointSymbolizer();
		this._lnsymbol = this.createLineSymbolizer();
		this._rnsymbol = this.createPolygonSymbolizer();
	},

	destory : function(){
		this._layer = null;
		this.enabled(false); 
		GeoBeans.Interaction.prototype.destory.apply(this, arguments);		
	},
	
	enable : function(f){
		if(this._map==null){
			return;
		}
		this.enabled = f;
		if(this.enabled){
			var x_o = null;
			var y_o = null;
			var that = this;
			this.onmousemove = function(e){
				if(x_o==null){
					x_o = e.layerX;
					y_o = e.layerY;
				}
				else{
					var offset_x = Math.abs(e.layerX-x_o);
					var offset_y = Math.abs(e.layerY-y_o);
					if(offset_x>that._tolerance || offset_y>that._tolerance){
						//console.log(dis);
						x_o = e.layerX;
						y_o = e.layerY;					
						var mp = that._map.getViewer().toMapPoint(e.layerX, e.layerY);
						that.selectByPoint(mp.x, mp.y);
					}
				}
			};
			this._map.canvas.addEventListener("mousemove", this.onmousemove);
		}
		else{
			this._map.canvas.addEventListener("mousemove", this.onmousemove);
			this.onmousemove = null;
		}
	},

	// hit : function(x, y){
	// 	if(this._layer==null){
	// 		return;
	// 	}
		
	// 	var source = this._layer.getSource();
	// 	if(!isValid(source)){
	// 		return;
	// 	}
	// 	var success = {
	// 		target : this,
	// 		execute : function(features){

	// 			// this.target.selection = [];
	// 			// var len = features.length;
	// 			// if(len>0){
	// 			// 	for(i=0; i<len; i++){
	// 			// 		f = features[i];
	// 			// 		g = f.geometry;
	// 			// 		if(g!=null){
	// 			// 			if(g.hit(x, y, layer.map.tolerance)){
	// 			// 				layer.selection.push(f);
	// 			// 			}
	// 			// 		}
	// 			// 	}	
	// 			// }				
				
	// 			// layer.highlight(layer.selection);
	// 			// if(isValid(this._onchange)){
	// 			// 	this._onchange(layer.selection);
	// 			// }
	// 		}
	// 	};
	// 	source.getFeatures(null,success,null);
		
	// },

	highlight : function(features){
		var renderer = this._map.renderer;
		renderer.clearRect(0,0,this._map.getWidth(),this._map.getHeight());
		var len = features.length;	
		for(var i=0; i<len; i++){
			var g = features[i].getGeometry();
			switch(g.type){
				case GeoBeans.Geometry.Type.POINT:
				case GeoBeans.Geometry.Type.MULTIPOINT:
					renderer.setSymbolizer(this._ptsymbol);
					renderer.drawGeometry(g,this._ptsymbol,this._map.getViewer());
					break;
				case GeoBeans.Geometry.Type.LINESTRING:
				case GeoBeans.Geometry.Type.MULTILINESTRING:
					renderer.setSymbolizer(this._lnsymbol);
					renderer.drawGeometry(g,this._lnsymbol,this._map.getViewer());
					break;
				case GeoBeans.Geometry.Type.POLYGON:
				case GeoBeans.Geometry.Type.MULTIPOLYGON:
					renderer.setSymbolizer(this._rnsymbol);
					renderer.drawGeometry(g,this._rnsymbol,this._map.getViewer());
					break;
			}
		}
	},

	createPointSymbolizer : function(){
		var symbolizer;
		symbolizer = new GeoBeans.Symbolizer.PointSymbolizer();
		symbolizer.size = 20;
		symbolizer.fillColor = "rgba(255,0,0,0.25)";
		symbolizer.outLineWidth = 1.0;
		symbolizer.outLineColor = "rgba(255,255,0,0.55)";
		symbolizer.outLineCap	= GeoBeans.Style.Stroke.LineCapType.ROUND;
		symbolizer.outLineJoin  = GeoBeans.Style.Stroke.LineJoinType.ROUND;
		symbolizer.showOutline = true;
		return symbolizer
	},

	createLineSymbolizer : function(){
		var symbolizer;
		symbolizer = new GeoBeans.Symbolizer.LineSymbolizer();
		symbolizer.width = 1;
		symbolizer.color = "Red";
		symbolizer.lineCap	= GeoBeans.Style.Stroke.LineCapType.ROUND;
		symbolizer.lineJoin  = GeoBeans.Style.Stroke.LineJoinType.ROUND;
		return symbolizer;
	},
	
	createPolygonSymbolizer : function(){
		var symbolizer;
		symbolizer = new GeoBeans.Symbolizer.PolygonSymbolizer();
		symbolizer.size = 5;
		symbolizer.fillColor = "rgba(255,0,0,0.25)";
		symbolizer.outLineWidth = 1.0;
		symbolizer.outLineColor = "rgba(255,255,0,0.55)";
		symbolizer.outLineCap	= GeoBeans.Style.Stroke.LineCapType.ROUND;
		symbolizer.outLineJoin  = GeoBeans.Style.Stroke.LineJoinType.ROUND;
		symbolizer.showOutline = true;
		return symbolizer
	},
});

/**
 * 设置Hit的onchange事件响应函数，当选择集发生变化时候，触发onchange事件，通知调用者选择集发生变化。<br>
 * onchange函数包含一个参数，该参数是一个features集合([])，即选择集。<br>
 * function onchange(features){<br>
 * }<br>
 * @public
 * @param  {function} handler onchange事件响应函数
 */
GeoBeans.Interaction.Hit.prototype.onchange = function(handler){
	this._onchange = handler;
}

/**
 * 点查询
 * @private
 */
GeoBeans.Interaction.Hit.prototype.selectByPoint = function(x, y){

	var viewer = this._map.getViewer();

	var query = null;
	switch(this._layer.getGeometryType()){			
		case GeoBeans.Geometry.Type.POINT:
		case GeoBeans.Geometry.Type.MULTIPOINT:
		case GeoBeans.Geometry.Type.LINESTRING:
		case GeoBeans.Geometry.Type.MULTILINESTRING:{
			var tolerance = viewer.getTolerance();
			//var buffer = pt.buffer(tolerance);
			//query = that.createSpatialQuery(buffer);
			var pt = new GeoBeans.Geometry.Point(x, y);
			query = this.createDwithinlQuery(pt, tolerance);
		}
		break;
		case GeoBeans.Geometry.Type.POLYGON:
		case GeoBeans.Geometry.Type.MULTIPOLYGON:{
			query = this.createSpatialQuery(pt);
		}
	}
	

	//查询结果的回调函数类，接口实现GeoBeans.Handler。
	var success = {
		target : this,
		execute : function(features){
					
			if(features.length>0){
				this.target.highlight([features[0]]);
				if(isValid(this.target._onchange)){				
					this.target._onchange(features[0], x, y);
				}
			}			
		}
	}


	this._layer.getSource().query(query, success);
}

/**
 * 创建DistanceBujffer查询Filter
 * @private
 * @param  {GeoBeans.Geometry} g 几何对象
 * @param  {float} 			   d 距离
 * @return {GeoBeans.Query}       查询条件对象
 */
GeoBeans.Interaction.Hit.prototype.createDwithinlQuery = function(g,d){
	// Filter
	var filter = new GeoBeans.Filter.DistanceBufferFilter();
	filter.geometry = g;
	filter.distance = d;
	filter.operator = GeoBeans.Filter.SpatialFilter.OperatorType.SpOprDWithin;
	var source = this._layer.getSource();
	filter.propName = source.getGeometryName();

	var query = new GeoBeans.Query({
		/*"typeName"	: featureType.getName(),*/
		"filter"	: filter
	});

	return query;
}

/**
 * 创建Spatial查询Filter
 * @private
 * @param  {GeoBeans.Geometry} g 几何对象
 * @return {GeoBeans.Query}       查询条件对象
 */
GeoBeans.Interaction.Hit.prototype.createSpatialQuery = function(g){
	// Filter
	var filter = new GeoBeans.Filter.SpatialFilter();
	filter.geometry = g;
	filter.operator = GeoBeans.Filter.SpatialFilter.OperatorType.SpOprIntersects;
	var source = this._layer.getSource();
	filter.propName = source.getGeometryName();

	var query = new GeoBeans.Query({
		/*"typeName"	: featureType.getName(),*/
		"filter"	: filter
	});

	return query;
}