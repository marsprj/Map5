/**
 * Map5的要素修改交互类
 * @class
 * @description 实现Map5与用户的交互进行要素修改的功能
 * @extends {GeoBeans.Interaction}
 */
GeoBeans.Interaction.Modify = GeoBeans.Class(GeoBeans.Interaction, {
	_map	: null,
	_layer	: null,
	//_condition: GeoBeans.Interaction.ModifyType.MODIFY,
	_onchange    : null,
	_features	 : [],
	_mousedown   : null,
	_mousemove	 : null,
	_mouseup	 : null,

	initialize : function(options){
		//GeoBeans.Class.prototype.initialize.apply(this, arguments);

		if(isValid(options.map)){
			this._map = options.map;	
		}
		if(isValid(options.layer)){
			this._layer = options.layer;	
		}
		if(isValid(options.features)){
			this._features = options.features;	
		}

		this._type = GeoBeans.Interaction.Type.MODIFY;

		this.initMouseListener();
	},
	
	destory : function(){
		GeoBeans.Interaction.prototype.destory.apply(this, arguments);
	},

	CLASS_NAME : "GeoBeans.Interaction.Modify"
});

GeoBeans.Interaction.Modify.prototype.getFeatures = function(){
	return this._features;
}

GeoBeans.Interaction.Modify.prototype.cleanup = function(){
	var mapContainer = this._map.getContainer();
	mapContainer.removeEventListener("mousedown", this._mousedown);
	mapContainer.removeEventListener("mouseup",this._mouseup);
	mapContainer.removeEventListener("mousemove",this._mousemove);

	this._mousedown = null;
	this._mouseup = null;
	this._mousemove = null;
}

/**
 * 初始化Modify Interaction
 * @private
 */
GeoBeans.Interaction.Modify.prototype.initMouseListener = function(){

	var that = this;
	var target = null;
	var drag_enabled = false;
	var drag = that._map.getControl(GeoBeans.Control.Type.DRAG_MAP);
	var modifying = false;

	this._mousedown = function(evt){
		evt.preventDefault();

		if(!isValid(modify._features)){
			return;
		}
		if(that._features.length == 0){
			return;
		}

		var pt = that._map.getViewer().toMapPoint(evt.layerX,evt.layerY);
		var query = that.createQuery(pt);

		var success = {
			execute : function(features){
				if(features.length>0){
					target = features[0];

					//设置状态为正在编辑
					modifying = true;

					//记录drag的状态，并设置drag为disabled状态。
					if(isValid(drag)){
						drag_enabled = drag.isEnabled();
						drag.enable(false);
					}
				}
				else{
					target = null;
				}
			}
		}

		var source = new GeoBeans.Source.Feature({
			features : that._features
		})

		source.query(query, success);
	}

	this._mousemove = function(evt){
		evt.preventDefault();
		
		if(target == null){
			return;
		}

		if(modifying){
			//当前处于编辑状态
			var geometry = target.getGeometry();
			switch(geometry.type){
				case GeoBeans.Geometry.Type.POINT:{
					var pt = that._map.getViewer().toMapPoint(evt.layerX, evt.layerY);
					geometry.set(pt.x, pt.y);

					that._layer.refresh(true);
					that._map.drawSelection();
				}
				break;
				case GeoBeans.Geometry.Type.LINESTRING:{
					var info = this.hitLine(geometry);
					console.log(geometry.type);
				}
				break;
				case GeoBeans.Geometry.Type.MULTILINESTRING:{
					//SnapMultiLine();
					console.log(geometry.type);
				}
				break;
				case GeoBeans.Geometry.Type.POLYGON:
				case GeoBeans.Geometry.Type.MULTIPOLYGON:{
					
					console.log(geometry.type);
				}
			}
		}
		
	}

	this._mouseup = function(evt){
		evt.preventDefault();

		if(isValid(target)){
			drag.enable(drag_enabled);
		}
		modifying = false;
	}

	var mapContainer = this._map.getContainer();
	mapContainer.addEventListener("mousedown", this._mousedown);
	mapContainer.addEventListener("mouseup",this._mouseup);
	mapContainer.addEventListener("mousemove",this._mousemove);
}

GeoBeans.Interaction.Modify.prototype.createQuery = function(pt){
	var query = null;
	switch(this._layer.getGeometryType()){			
		case GeoBeans.Geometry.Type.POINT:
		case GeoBeans.Geometry.Type.MULTIPOINT:
		case GeoBeans.Geometry.Type.LINESTRING:
		case GeoBeans.Geometry.Type.MULTILINESTRING:{

			var tolerance = this._map.getViewer().getTolerance();
			query = this.createDwithinlQuery(pt, tolerance);
		}
		break;
		case GeoBeans.Geometry.Type.POLYGON:
		case GeoBeans.Geometry.Type.MULTIPOLYGON:{
			query = this.createSpatialQuery(pt);
		}
	}
	return query;
}

/**
 * 创建DistanceBujffer查询Filter
 * @private
 * @param  {GeoBeans.Geometry} g 几何对象
 * @param  {float} 			   d 距离
 * @return {GeoBeans.Query}       查询条件对象
 */
GeoBeans.Interaction.Modify.prototype.createDwithinlQuery = function(g,d){
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

GeoBeans.Interaction.Modify.prototype.createDistanceBufferFilterQuery = function(g, r){
	var source = this._layer.getSource();
	var filter = new GeoBeans.Filter.DistanceBufferFilter(
						source.getGeometryName(),
						g,
						r);
	
	var query = new GeoBeans.Query({
		"typeName"	: this._layer.getName(),
		"filter"	: filter
	});

	return query;
}

/**
 * 给定点pt和容差t,计算pt点击到line的那个位置
 * @param {GeoBeans.Geometry.LineString} line 线
 * @description 点击位置包括线段(segment)上和顶点(vertex)上。顶点的优先级高于线段。
 * @private 
 */
GeoBeans.Interaction.Modify.prototype.hitLine = function(line, pt, t){
	
	var points = line.getPoints();
	var num = points.length-1;
	var p0=null, p1=null;
	var pedal = null;
	var info = null;
	
	for(var i=0; i<num; i++){
		p0 = this.points[i];
		p1 = this.points[i+1];
		var x0 = pt0.x;
		var y0 = pt0.y;
		var x1 = pt1.x;
		var y1 = pt1.y;
		
		pedal = GeoBeans.Utility.pedal(pt.x, pt.y, p0.x, p0.y, p1.x, p1.y);

		if(Math.abs(x0-x1)<Math.ESPLON){
			//vertical 
			var miny = y0 < y1 ? y0 : y1;
			var maxy = y0 > y1 ? y0 : y1;

			if((y>miny) && (y<ymax)){				
				//这种情况下，pedal位于线段上
				d = Math.abs(x-x0);
				if(d<t){
					info = {
						segment :  i,
						vertex  : -1,
						pos : {
							x : pt.x,
							y : pt.y,
						}
					}
				}
			}
			else{
				//pedal在线段外，判断是否是落到顶点上。
				//计算与前点的距离,判断
				d = Math.sqrt(Math.pow(y0-y, 2)+Math.pow(x0-x, 2));
				if(d<t){
					info = {
						segment :  i,
						vertex  :  i,
						pos : {
							x : pt.x,
							y : pt.y,
						}
					}	
				}
			}
		}		
		else{
			var minx = x0 < x1 ? x0 : x1;
			var maxx = x0 > x1 ? x0 : x1;
			if((x>minx) && (x<xmax)){
				//这种情况下，pedal位于线段上
				d = Math.abs(x-x0);
				if(d<t){
					info = {
						segment :  i,
						vertex  : -1,
						pos : {
							x : pt.x,
							y : pt.y,
						}
					}
				}
			}
			else{
				//pedal在线段外，判断是否是落到顶点上。
				//计算与前点的距离,判断
				d = Math.sqrt(Math.pow(y0-y, 2)+Math.pow(x0-x, 2));
				if(d<t){
					info = {
						segment :  i,
						vertex  :  i,
						pos : {
							x : pt.x,
							y : pt.y,
						}
					}	
				}
			}
		}
	}

	if(info==null){
		//说明没有捕捉到线段和顶点，需要判断最后一个顶点是否被捕捉到
		p0 = this.points[i];
		d = Math.sqrt(Math.pow(y0-y, 2)+Math.pow(x0-x, 2));
		if(d<t){
			info = {
				segment :  i-1,
				vertex  :  i,
				pos : {
					x : pt.x,
					y : pt.y,
				}
			}	
		}
	}

	return info;
}