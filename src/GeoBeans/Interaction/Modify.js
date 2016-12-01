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
	_tolerance   : 30, //Pixel
	_source		 : null,

	_modifying   : false,	//是否处于修改状态的标志位置
	_target 	 : null,	//modify的目标feature
	_info		 : null,	

	initialize : function(options){
		GeoBeans.Interaction.prototype.initialize.apply(this, arguments);

		this._features = [];
		if(isValid(options.map)){
			this._map = options.map;	
		}
		if(isValid(options.layer)){
			this._layer = options.layer;	
		}
		if(isValid(options.features)){
			//this._features = options.features;
			var that = this;
			options.features.forEach(function(f){
				that._features.push(f);
			})
		}
		this._source = new GeoBeans.Source.Feature({
			features : this._features
		});

		this._type = GeoBeans.Interaction.Type.MODIFY;

		this.initMouseListener();
	},
	
	destory : function(){
		GeoBeans.Interaction.prototype.destory.apply(this, arguments);
	},

	CLASS_NAME : "GeoBeans.Interaction.Modify"
});

GeoBeans.Interaction.Modify.prototype.setFeatures = function(features){
	if(!isValid(features)){
		this._features.length = 0;
		return;
	}
	var that = this;
	features.forEach(function(f){
		that._features.push(f);
	})
}

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

	var x_o = undefined;
	var y_o = undefined;

	this._mousedown = function(evt){
		evt.preventDefault();

		if(that._target!=null){
			//1.设置modifying标志位，进入编辑状态。
			that._modifying = true;
			//2.记录drag的状态，并设置drag为disabled状态。
			if(isValid(drag)){
				drag_enabled = drag.isEnabled();
				drag.enable(false);
			}
			//3.判断点击位置
			var pos =  that._map.getViewer().toMapPoint(evt.layerX, evt.layerY);
			that.hitGeometry(that._target.getGeometry(), pos);

			var geometry = that._target.getGeometry();
			switch(geometry.type){
				case GeoBeans.Geometry.Type.POINT:{		
				}
				break;
				case GeoBeans.Geometry.Type.MULTIPOINT:
				break;
				case GeoBeans.Geometry.Type.LINESTRING:{
					var pos =  that._map.getViewer().toMapPoint(evt.layerX, evt.layerY);
					that.modifyLineString(geometry, pos, that._info);
				}
				break;
				case GeoBeans.Geometry.Type.MULTILINESTRING:{

				}
				break;
				case GeoBeans.Geometry.Type.POLYGON:{
					that.modifyPolygon(geometry, pos, that._info);
				}
				break;
				case GeoBeans.Geometry.Type.MULTIPOLYGON:{
					that.modifyMultiPolygon(geometry, pos, that._info);
				}
				break;
			}
		}
		else{
			that._modifying = false;
			console.log("....");	
		}
	}

	this._mousemove = function(evt){
		evt.preventDefault();

		if(that._modifying){
			//处于编辑状态
			console.log("process modification");

			var pos =  that._map.getViewer().toMapPoint(evt.layerX, evt.layerY);
			var geometry = that._target.getGeometry();
			switch(geometry.type){
				case GeoBeans.Geometry.Type.POINT:{					
					that.modifyPoint(geometry, pos);					
				}
				break;
				case GeoBeans.Geometry.Type.MULTIPOINT:
				case GeoBeans.Geometry.Type.LINESTRING:{
					that.updateLineString(geometry, pos, that._info);
				}
				break;
				case GeoBeans.Geometry.Type.MULTILINESTRING:{

				}
				break;
				case GeoBeans.Geometry.Type.POLYGON:{
					that.updatePolygon(geometry, pos, that._info);
				}
				break;
				case GeoBeans.Geometry.Type.MULTIPOLYGON:{
					that.updateMultiPolygon(geometry, pos, that._info);
				}
				break;
			}
		}
		else{
			if(that._features.length>0){
				if(that.x_o==undefined){
					that.x_o = evt.layerX;
					that.y_o = evt.layerY;
				}
				else{
					var pixel_tolerance = 2;
					var offset_x = Math.abs(evt.layerX - that.x_o);
					var offset_y = Math.abs(evt.layerY - that.y_o);
					if(offset_x>pixel_tolerance || offset_y>pixel_tolerance){

						that.x_o = evt.layerX;
						that.y_o = evt.layerY;					
						var mp = that._map.getViewer().toMapPoint(evt.layerX, evt.layerY);
						that.selectByPoint(mp.x, mp.y);
					}
				}	
			}
		}

		// if(modifying){
		// 	//当前处于编辑状态
		// 	var geometry = target.getGeometry();
		// 	switch(geometry.type){
		// 		case GeoBeans.Geometry.Type.POINT:{
		// 			var pt = that._map.getViewer().toMapPoint(evt.layerX, evt.layerY);
		// 			geometry.set(pt.x, pt.y);
		// 			that._layer.refresh(true);
		// 			that._map.drawSelection();
		// 		}
		// 		break;
		// 		case GeoBeans.Geometry.Type.LINESTRING:{
		// 			var info = this.hitLine(geometry);
		// 			console.log(geometry.type);
		// 		}
		// 		break;
		// 		case GeoBeans.Geometry.Type.MULTILINESTRING:{
		// 			//SnapMultiLine();
		// 			console.log(geometry.type);
		// 		}
		// 		break;
		// 		case GeoBeans.Geometry.Type.POLYGON:
		// 		case GeoBeans.Geometry.Type.MULTIPOLYGON:{
					
		// 			console.log(geometry.type);
		// 		}
		// 	}
		// }
		
	}

	this._mouseup = function(evt){
		evt.preventDefault();

		if(isValid(that._target)){
			drag.enable(drag_enabled);
		}
		that._modifying = false;
		console.log("mouse up ");
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

			//var tolerance = this._map.getViewer().getTolerance();
			var t = this._tolerance * this._map.getResolution();
			query = this.createDwithinlQuery(pt, t);
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

GeoBeans.Interaction.Modify.prototype.hitGeometry = function(geometry, pt){

	this._info = null;
	var t = this._tolerance * this._map.getViewer().getResolution();
	switch(geometry.type){
		case GeoBeans.Geometry.Type.POINT:
		case GeoBeans.Geometry.Type.MULTIPOINT:
		case GeoBeans.Geometry.Type.LINESTRING:{
			//var t = viewer.getTolerance();
			this._info = this.hitLine(geometry.getPoints(), pt, t);			
		}
		break;
		case GeoBeans.Geometry.Type.MULTILINESTRING:{
		}
		break;
		case GeoBeans.Geometry.Type.POLYGON:{
			this._info = this.hitPolygon(geometry, pt, t);			
		}
		break;
		case GeoBeans.Geometry.Type.MULTIPOLYGON:{
			this._info = this.hitMultiPolygon(geometry, pt, t);	
		}
		break;
	}
}

GeoBeans.Interaction.Modify.prototype.hitPolygon = function(polygon, pt, t){

	var rings = polygon.getRings();
	var length = rings.length;
	for(var i=0; i<length; i++){
		var r = rings[i];
		var info = this.hitLine(r.getPoints(), pt, t);
		if(info!=null){
			break;
		}
	}
	if(info==null){
		return null;
	}
	else{
		return {
			ring : i,
			segment : info.segment,
			vertex  : info.vertex,
			pos : {
						x : pt.x,
						y : pt.y,
			}		
		};	
	}
}

GeoBeans.Interaction.Modify.prototype.hitMultiPolygon = function(multipolygon, pt, t){

	var polygons = multipolygon.getPolygons();
	var length = polygons.length;
	for(var i=0; i<length; i++){
		var polygon = polygons[i];
		var info = this.hitPolygon(polygon, pt, t);
		if(info!=null){
			break;
		}
	}
	if(info==null){
		return null;
	}
	else{
		return {
			polygon : i,
			ring : info.ring,
			segment : info.segment,
			vertex  : info.vertex,
			pos : {
						x : pt.x,
						y : pt.y,
			}		
		};	
	}
}


/**
 * 给定点pt和容差t,计算pt点击到line的那个位置
 * @param {Array.<GeoBeans.Geometry.Point>} pts 线
 * @description 点击位置包括线段(segment)上和顶点(vertex)上。顶点的优先级高于线段。
 * @private 
 */
GeoBeans.Interaction.Modify.prototype.hitLine = function(pts, pt, t){
	
	var num = pts.length-1;
	var pt0=null, pt1=null;
	var pedal = null;
	var info = null;
	
	for(var i=0; i<num; i++){
		pt0 = pts[i];
		pt1 = pts[i+1];
		var x0 = pt0.x;
		var y0 = pt0.y;
		var x1 = pt1.x;
		var y1 = pt1.y;

		//pedal在线段外，判断是否是落到顶点上。
		//计算与前点的距离,判断
		d = Math.sqrt(Math.pow(y0-pt.y, 2)+Math.pow(x0-pt.x, 2));
		if(d<t){
			//说明选择到了顶点
			info = {
				segment :  i,
				vertex  :  i,
				pos : {
					x : pt.x,
					y : pt.y,
				}
			}
			return info;
		}
		else{
			//没有hit到顶点，判断是否是hit到了线。
			pedal = GeoBeans.Utility.pedal(pt.x, pt.y, pt0.x, pt0.y, pt1.x, pt1.y);

			if(Math.abs(x0-x1)<Math.ESPLON){
				//vertical 
				var miny = y0 < y1 ? y0 : y1;
				var maxy = y0 > y1 ? y0 : y1;

				if((y>miny) && (y<maxy)){				
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
						return info;
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
						return info;	
					}
				}
			}		
			else{
				var minx = x0 < x1 ? x0 : x1;
				var maxx = x0 > x1 ? x0 : x1;
				var x = pedal.x;
				var y = pedal.y;
				if((x>minx) && (x<maxx)){
					//这种情况下，pedal位于线段上
					//计算鼠标点垂足点的距离
					d = Math.sqrt(Math.pow(pt.y-y, 2)+Math.pow(pt.x -x, 2));
					if(d<t){
						info = {
							segment :  i,
							vertex  : -1,
							pos : {
								x : pt.x,
								y : pt.y,
							}
						}
						return info;
					}
				}
			}
		}		
	}

	if(info==null){
		//说明没有捕捉到线段和顶点，需要判断最后一个顶点是否被捕捉到
		pt0 = pts[i];
		d = Math.sqrt(Math.pow(y0-pt.y, 2)+Math.pow(x0-pt.x, 2));
		if(d<t){
			info = {
				segment :  i-1,
				vertex  :  i,
				pos : {
					x : pt.x,
					y : pt.y,
				}
			}
			return info;
		}
	}

	return info;
}

/**
 * 点查询
 * @private
 */
GeoBeans.Interaction.Modify.prototype.selectByPoint = function(x, y){

	var viewer = this._map.getViewer();

	var query = null;
	switch(this._layer.getGeometryType()){			
		case GeoBeans.Geometry.Type.POINT:
		case GeoBeans.Geometry.Type.MULTIPOINT:
		case GeoBeans.Geometry.Type.LINESTRING:
		case GeoBeans.Geometry.Type.MULTILINESTRING:{
			//var tolerance = viewer.getTolerance();
			var t = this._tolerance * viewer.getResolution();
			//var buffer = pt.buffer(tolerance);
			//query = that.createSpatialQuery(buffer);
			var pt = new GeoBeans.Geometry.Point(x, y);
			query = this.createDwithinlQuery(pt, t);
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

			this.target._modifying = false;	
			if(features.length>0){
				this.target._target = features[0];

				this.target._map.getSelection().setFeatures([features[0]]);

				console.log("selected");
			}
			else{
				this.target._target = null;
			}
		}
	}

	this._source.query(query, success);
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

/**
 * 创建Spatial查询Filter
 * @private
 * @param  {GeoBeans.Geometry} g 几何对象
 * @return {GeoBeans.Query}       查询条件对象
 */
GeoBeans.Interaction.Modify.prototype.createSpatialQuery = function(g){
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

/**
 * 编辑点
 * @param  {GeoBeans.Geometry.Point} pt         待编辑的点要素
 * @param  {GeoBeans.Geometry.Point} pos 		新的点位置
 * private
 */
GeoBeans.Interaction.Modify.prototype.modifyPoint = function(pt, pos){
	pt.set(pos.x, pos.y);
	this._layer.refresh(true);
	this._map.drawSelection();
}

/**
 * 编辑线
 * @param  {GeoBeans.Geometry.LineString} line  待编辑的线
 * @param  {GeoBeans.Geometry.Point} pos 		新的点位置
 * @param  {Object} info 		hit信息
 * @private
 */
GeoBeans.Interaction.Modify.prototype.modifyLineString = function(line, pos, info){
	if(!isValid(info)){
		return;
	}

	var pts = line.getPoints();
	if(info.vertex>=0){
		pts[info.vertex].set(pos.x, pos.y);
	}
	else{
		var pt = pos.clone();
		pts.splice(info.segment+1, 0, pt);
	}
	this._layer.refresh(true);
	this._map.drawSelection();
}

/**
 * 编辑线
 * @param  {GeoBeans.Geometry.LineString} line  待编辑的线
 * @param  {GeoBeans.Geometry.Point} pos 		新的点位置
 * @param  {Object} info 		hit信息
 * @private
 */
GeoBeans.Interaction.Modify.prototype.updateLineString = function(line, pos, info){
	if(!isValid(info)){
		return;
	}

	var pts = line.getPoints();
	if(info.vertex>=0){
		pts[info.vertex].set(pos.x, pos.y);
	}
	else{
		pts[info.segment+1].set(pos.x, pos.y);
	};

	this._layer.refresh(true);
	this._map.drawSelection();
}

/**
 * 编辑线
 * @param  {GeoBeans.Geometry.LineString} line  待编辑的线
 * @param  {GeoBeans.Geometry.Point} pos 		新的点位置
 * @param  {Object} info 		hit信息
 * @private
 */
GeoBeans.Interaction.Modify.prototype.modifyPolygon = function(polygon, pos, info){
	if(!isValid(info)){
		return;
	}

	var ring = polygon.getRings()[info.ring];

	var pts = ring.getPoints();
	if(info.vertex>=0){
		pts[info.vertex].set(pos.x, pos.y);
	}
	else{
		var pt = pos.clone();
		pts.splice(info.segment+1, 0, pt);
	}
	this._layer.refresh(true);
	this._map.drawSelection();
}

/**
 * 编辑线
 * @param  {GeoBeans.Geometry.LineString} line  待编辑的线
 * @param  {GeoBeans.Geometry.Point} pos 		新的点位置
 * @param  {Object} info 		hit信息
 * @private
 */
GeoBeans.Interaction.Modify.prototype.updatePolygon = function(polygon, pos, info){
	if(!isValid(info)){
		return;
	}

	var ring = polygon.getRings()[info.ring];
	var pts = ring.getPoints();

	if(info.vertex>=0){
		pts[info.vertex].set(pos.x, pos.y);
	}
	else{
		pts[info.segment+1].set(pos.x, pos.y);
	};

	this._layer.refresh(true);
	this._map.drawSelection();
}

GeoBeans.Interaction.Modify.prototype.modifyMultiPolygon = function(multipolygon, pos, info){
	if(!isValid(info)){
		return;
	}

	var polygon = multipolygon.getPolygons()[info.polygon];
	this.modifyPolygon(polygon, pos, info);
}

GeoBeans.Interaction.Modify.prototype.updateMultiPolygon = function(multipolygon, pos, info){
	if(!isValid(info)){
		return;
	}

	var polygon = multipolygon.getPolygons()[info.polygon]
	this.updatePolygon(polygon, pos, info);
}