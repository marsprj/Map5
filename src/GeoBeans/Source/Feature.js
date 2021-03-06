/**
 * @classdesc
 * Feature数据源类。
 *
 *	var source = new GeoBeans.Source.Feature({
 * 					"geometryName": "shape"
 * 				});
 * 
 * @class
 * @extends {GeoBeans.Source}
 * @param {object} options options
 * @api stable
 */
GeoBeans.Source.Feature = GeoBeans.Class(GeoBeans.Source, {

	_features : [],
	_geometryName : "geometry",

	initialize : function(options){
		this._features = [];
		if(isValid(options)){
			this._geometryName = isValid(options.geometryName) ? options.geometryName : "geometry";	
			if(isValid(options.features)){
				this._features.length = 0;
				var that = this;
				options.features.forEach(function(f){
					this._features.push(f);
				});
			}
		}
	},

	destroy : function(){
	}
});

GeoBeans.Source.Feature.prototype.getGeometryName = function(){
	return this._geometryName;
}

/**
 * 设置Source的Features
 * @param {Array.<GeoBeans.Feature>} features 要素集合
 * @public
 */
GeoBeans.Source.Feature.prototype.setFeatures = function(features){
	this._features.length = 0;
	if(features){
		var that = this;
		features.forEach(function(f){
			that._features.push(f);
		});
	}
}

/**
 * 获得符合查询条件的Feature
 * @param  {GeoBeans.Filter} filter  查询过滤器
 * @param  {GeoBeans.Handler} success 	   查询成功的回调函数
 * @param  {GeoBeans.Handler} failure	   查询失败的回调函数
 * @public
 * @deprecated 功能集成到query方法上，该函数不再支持。
 */
GeoBeans.Source.Feature.prototype.getFeatures = function(filter, success, failure){
	var query = new GeoBeans.Query({
		"filter" : filter
	});
	this.query(query,success,failure);
}

/**
 * 添加Feature
 * @param {GeoBeans.Feature} feature 要素
 */
GeoBeans.Source.Feature.prototype.addFeature = function(feature){
	if(isValid(feature)){
		this._features.push(feature);
	}
}


/**
 * 添加Feature数组
 * @param {Array.<GeoBeans.Feature>} features 要素数组
 * @public
 */
GeoBeans.Source.Feature.prototype.addFeatures = function(features){
	if(isValid(features)){
		for(var i = 0; i < features.length;++i){
			this.addFeature(features[i]);
		}
	}
};

/**
 * 删除Features
 * @param  {GeoBeans.Filter} filter 过滤器
 * @public
 */
GeoBeans.Source.Feature.prototype.removeFeatures = function(filter){

}


/**
 * 删除feature
 * @public
 * @param  {GeoBeans.Feature} feature 要素
 */
GeoBeans.Source.Feature.prototype.removeFeature = function(feature){
	for(var i = 0; i < this._features.length;++i){
		if(this._features[i] == feature){
			this._features.splice(i,1);
			feature.destroy();
			feature = null;
			return;
		}
	}
}
/**
 * 更新Features的值
 * @param  {Object} properties 属性值
 * @param  {GeoBeans.Filter} filter     过滤器
 * @public
 */
GeoBeans.Source.Feature.prototype.updateFeatures = function(properties, filter){

}

/**
 * 获得指定范围的的Feature
 * @param  {GeoBeans.Envelope} extent 空间范围
 * @param  {GeoBeans.Handler} success 	   查询成功的回调函数
 * @param  {GeoBeans.Handler} failure	   查询失败的回调函数
 * @public
 */
GeoBeans.Source.Feature.prototype.getFeaturesByExtent = function(extent, success, failure){
	var target = this.selectByExtent(extent, this._features);
	success.execute(target);
}

/**
 * 过滤features
 * @param  {GeoBeans.Filter} filter  查询过滤器
 * @return {Array.<GeoBeans.Feature>}  目标Feature集合
 */
GeoBeans.Source.Feature.prototype.select = function(filter, features){

	return this.selectByFilter(filter, this._features, null, null);
}

/**
 * 矩形范围选择
 */
GeoBeans.Source.Feature.prototype.selectByExtent = function(extent,features,maxFeatures,offset){
	var target = [];
	features.forEach(function(f){
		var g = f.getGeometry();
		if(isValid(g)){
			if(g.type===GeoBeans.Geometry.Type.POINT){
				if(extent.contains(g.x, g.y)){
					target.push(f);
				}
			}
			else{
				var r = g.getExtent();
				if(extent.intersects(r)){
					target.push(f);
				}
			}
		}
	})

	return target;
}


/************************************************************************************/
/************************************************************************************/

/**
 * 获得符合查询条件的Feature
 * @param  {GeoBeans.Query} query  查询器
 * @param  {GeoBeans.Handler} success 	   查询成功的回调函数
 * @param  {GeoBeans.Handler} failure	   查询失败的回调函数
 * @public
 */
GeoBeans.Source.Feature.prototype.query = function(query, success, failure){
	if(!isValid(query)){
		if(isValid(success)){
			success.execute(this._features);
		}
		return;
	}
	// 缺少orderby
	var filter = query.getFilter();
	var maxFeatures = query.getMaxFeatures();
	var offset = query.getOffset();
	var orderby = query.getOrderby();

	var features = this._features;

	var result = this.selectByFilter(filter,features,maxFeatures,offset);
	if(isValid(success)){ 
		success.execute(result);
	}
}

// ？？？下面几个selectXXX全都归到query函数里面
	// 已经修改为query读取的方式了
GeoBeans.Source.Feature.prototype.selectByFilter = function(filter,features,maxFeatures,offset){
	if(filter == null){
		return features;
	}
	var type = filter.type;
	var target = features; 
	switch(type){
		case GeoBeans.Filter.Type.FilterID:{
			target = this.selectByIDFilter(filter,features,maxFeatures,offset);
			break;
		}
		case GeoBeans.Filter.Type.FilterComparsion:{
			target = this.selectByComparsion(filter,features,maxFeatures,offset);
			break;
		}
		case GeoBeans.Filter.Type.FilterLogic:{
			target = this.selectFeatureByLogic(filter,features,maxFeatures,offset);
			break;
		}
		case GeoBeans.Filter.Type.FilterSpatial:{
			target = this.selectBySpatial(filter,features,maxFeatures,offset);
			break;
		}
	}
	return target;
}

GeoBeans.Source.Feature.prototype.selectByIDFilter = function(filter,features,maxFeatures,offset){
	if(filter == null){
		return features;
	}
	var ids = filter.ids;
	if(ids == null){
		return features;
	}

	var total =null;
	if(maxFeatures != null){
		total = maxFeatures;
	}
	if(offset != null && offset != 0){
		total += offset;
	}

	var target = [];
	for(var i = 0; i < features.length; ++i){
		var feature = features[i];
		var fid = feature.fid;
		if(ids.indexOf(fid) != -1){
			target.push(feature);
			if(total != null && target.length == total){
				break;
			}
		}
	}
	
	var result = null;
	if(maxFeatures != null && offset != null && offset != 0){
		result = target.slice(offset,total);
	}else if(maxFeatures != null && (offset == null || offset == 0)){
		result = target.slice(0,maxFeatures);
	}else if(maxFeatures == null && offset != null && offset != 0){
		result = target.slice(offset);
	}else{
		result = target;
	}
	return result;
}

GeoBeans.Source.Feature.prototype.selectByComparsion = function(filter,features,maxFeatures,offset){
	if(filter == null){
		return features;
	}
	
	var total =null;
	if(maxFeatures != null){
		total = maxFeatures;
	}
	if(offset != null && offset != 0){
		total += offset;
	}

	var oper = filter.operator;
	var target = [];

	var field = null;
	var value = null;
	var expression1 = filter.expression1;
	if(expression1 != null){
		if(expression1.type == GeoBeans.Expression.Type.PropertyName){
			field = expression1.name;
		}else if(expression1.type == GeoBeans.Expression.Type.Literal){
			value = expression1.value;
		}
	}

	var expression2 = filter.expression2;
	if(expression2 != null){
		if(expression2.type == GeoBeans.Expression.Type.PropertyName){
			field = expression2.name;
		}else if(expression2.type == GeoBeans.Expression.Type.Literal){
			value = expression2.value;
		}
	}

	switch(oper){
		case GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprEqual:{
			if(field == null || value == null){
				target = features;
				break;
			}


			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue == value){
					target.push(feature);
				}
				if(total != null && target.length == total){
					break;
				}
			}
			break;
		}
		case GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprNotEqual:{
			if(field == null || value == null){
				target = features;
				break;
			}


			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue != value){
					target.push(feature);
				}
				if(total != null && target.length == total){
					break;
				}
			}
			break;
		}
		case GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprLessThan:{
			if(field == null || value == null){
				target = features;
				break;
			}


			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue < value){
					target.push(feature);
				}
				if(total != null && target.length == total){
					break;
				}
			}				
			break;
		}
		case GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprGreaterThan:{
			if(field == null || value == null){
				target = features;
				break;
			}


			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue > value){
					target.push(feature);
				}
				if(total != null && target.length == total){
					break;
				}
			}
			break;
		}
		case GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprLessThanOrEqual:{
			if(field == null || value == null){
				target = features;
				break;
			}


			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue <= value){
					target.push(feature);
				}
				if(total != null && target.length == total){
					break;
				}
			}
			break;
		}
		case GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprGreaterThanOrEqual:{
			if(field == null || value == null){
				target = features;
				break;
			}


			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue >= value){
					target.push(feature);
				}
				if(total != null && target.length == total){
					break;
				}
			}
			break;
		}
		case GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsLike:{
			if(field == null || value == null){
				target = features;
				break;
			}


			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue.like(value)){
					target.push(feature);
				}
				if(total != null && target.length == total){
					break;
				}
			}
			break;
		}
		case GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsNull:{
			// if(field == null || value == null){
			// 	target = features;
			// 	break;
			// }
			var properyName = filter.properyName;
			var field = properyName.name;


			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue == null){
					target.push(feature);
				}
				if(total != null && target.length == total){
					break;
				}
			}
			break;
		}
		case GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsBetween:{
			var expression = filter.expression;
			var lowerBound = filter.lowerBound;
			var upperBound = filter.upperBound;

			var field = expression.name;
			var lowerValue = lowerBound.value;
			var upperValue = upperBound.value;
			if(field == null || lowerValue == null || upperValue == null){
				target = features;
				break;
			}


			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue >= lowerValue && fvalue <= upperValue){
					target.push(feature);
				}
				if(total != null && target.length == total){
					break;
				}

			}

			break;
		}
	}
	var result = null;
	if(maxFeatures != null && offset != null && offset != 0){
		result = target.slice(offset,total);
	}else if(maxFeatures != null && (offset == null || offset == 0)){
		result = target.slice(0,maxFeatures);
	}else if(maxFeatures == null && offset != null && offset != 0){
		result = target.slice(offset);
	}else{
		result = target;
	}
	return result;
}

	// 逻辑查询
GeoBeans.Source.Feature.prototype.selectFeatureByLogic = function(filter,features,maxFeatures,offset){
	if(filter == null){
		return features;
	}

	var total =null;
	if(maxFeatures != null){
		total = maxFeatures;
	}
	if(offset != null && offset != 0){
		total += offset;
	}

	var target = features;

	var oper = filter.operator;
	switch(oper){
		case GeoBeans.Filter.LogicFilter.OperatorType.LogicOprAnd:{
			target = this.selectFeatureByLogicAnd(filter,features,maxFeatures,offset); 
			break;
		}
		case GeoBeans.Filter.LogicFilter.OperatorType.LogicOprOr:{
			target = this.selectFeatureByLogicOr(filter,features,maxFeatures,offset);
			break;
		}
		case GeoBeans.Filter.LogicFilter.OperatorType.LogicOprNot:{
			target = this.selectFeatureByLogicNot(filter,features,maxFeatures,offset);
			break;
		}
		default:
			break;
	}

	return target;
}

GeoBeans.Source.Feature.prototype.selectFeatureByLogicAnd = function(filter,features,maxFeatures,offset){
	if(filter == null){
		return features;
	}

	var total =null;
	if(maxFeatures != null){
		total = maxFeatures;
	}
	if(offset != null && offset != 0){
		total += offset;
	}

	var target = features;
	var filters = filter.filters;
	for(var i = 0; i < filters.length;++i){
		var f = filters[i];
		target = this.selectByFilter(f,target,null,null);
	}

	var result = null;
	if(maxFeatures != null && offset != null && offset != 0){
		result = target.slice(offset,total);
	}else if(maxFeatures != null && (offset == null || offset == 0)){
		result = target.slice(0,maxFeatures);
	}else if(maxFeatures == null && offset != null && offset != 0){
		result = target.slice(offset);
	}else{
		result = target;
	}
	return result;
}

GeoBeans.Source.Feature.prototype.selectFeatureByLogicOr = function(filter,features,maxFeatures,offset){
	if(filter == null){
		return features;
	}

	var total =null;
	if(maxFeatures != null){
		total = maxFeatures;
	}
	if(offset != null && offset != 0){
		total += offset;
	}

	var target = [];
	var filters = filter.filters;
	for(var i = 0; i < filters.length;++i){
		var f = filters[i];
		var selected = this.selectByFilter(f,features,null,null);
		target = this.concatArray(target,selected);
		if(total != null && target.length >= total){
			break;
		}
	}

	var result = null;
	if(maxFeatures != null && offset != null && offset != 0){
		result = target.slice(offset,total);
	}else if(maxFeatures != null && (offset == null || offset == 0)){
		result = target.slice(0,maxFeatures);
	}else if(maxFeatures == null && offset != null && offset != 0){
		result = target.slice(offset);
	}else{
		result = target;
	}
	return result;
}

GeoBeans.Source.Feature.prototype.concatArray = function(array1,array2){
	if(!$.isArray(array1) || !$.isArray(array2)){
		return;
	}
	var array = array1.slice(0,array1.length);
	for(var i = 0; i < array2.length;++i){
		if($.inArray(array2[i],array) == -1){
			array.push(array2[i]);
		}
	}
	return array;
}

GeoBeans.Source.Feature.prototype.selectFeatureByLogicNot = function(filter,features,maxFeatures,offset){
	if(filter == null){
		return features;
	}
	var total =null;
	if(maxFeatures != null){
		total = maxFeatures;
	}
	if(offset != null && offset != 0){
		total += offset;
	}

	var f = filter.filters[0];
	var target = this.selectByFilter(f,features,maxFeatures,offset);
	var s = [];
	for(var i = 0; i < features.length; ++i){
		if($.inArray(features[i],target) == -1){
			s.push(features[i]);
		}
		if(total != null && target.length >= total){
			break;
		}
	}
	var result = null;
	if(maxFeatures != null && offset != null && offset != 0){
		result = target.slice(offset,total);
	}else if(maxFeatures != null && (offset == null || offset == 0)){
		result = target.slice(0,maxFeatures);
	}else if(maxFeatures == null && offset != null && offset != 0){
		result = target.slice(offset);
	}else{
		result = target;
	}
	return result;

}
	
GeoBeans.Source.Feature.prototype.selectBySpatial = function(filter,features,maxFeatures,offset){
	if(filter == null){
		return features;
	}
	var oper = filter.operator;
	var target = features;
	switch(oper){
		case GeoBeans.Filter.SpatialFilter.OperatorType.SpOprBBox:{
			target = this.selectByBBoxFilter(filter,features,maxFeatures,offset);
			break;
		}
		case GeoBeans.Filter.SpatialFilter.OperatorType.SpOprIntersects:{
			target = this.selectByIntersectsFilter(filter,features,maxFeatures,offset);
			break;
		}
		case GeoBeans.Filter.SpatialFilter.OperatorType.SpOprDWithin:{
			target = this.selectByDWithinFilter(filter,features,maxFeatures,offset);
			break;
		}
		default:
			break;
	}
	return target;
}

GeoBeans.Source.Feature.prototype.selectByBBoxFilter = function(filter,features,maxFeatures,offset){
	if(filter == null){
		return features;
	}

	var extent = filter.extent;

	// var geomType = this.getGeomType();

	var target = [];

	var total =null;
	if(maxFeatures != null){
		total = maxFeatures;
	}
	if(offset != null && offset != 0){
		total += offset;
	}

	for(var i = 0; i < features.length;++i){
		var f = features[i];
		var g = f.geometry;
		if(g == null){
			continue;
		}
		var g_extent = g.extent;
		if(extent.intersects(g_extent)|| extent.containOther(g_extent)){
			target.push(f);
		}
		if(total != null && target.length == total){
			break;
		}
	}
	var result = null;
	if(maxFeatures != null && offset != null && offset != 0){
		result = target.slice(offset,total);
	}else if(maxFeatures != null && (offset == null || offset == 0)){
		result = target.slice(0,maxFeatures);
	}else if(maxFeatures == null && offset != null && offset != 0){
		result = target.slice(offset);
	}else{
		result = target;
	}
	return result;
}


GeoBeans.Source.Feature.prototype.selectByIntersectsFilter = function(filter,features,maxFeatures,offset){
	if(filter == null){
		return features;
	}
	var target = [];

	var total =null;
	if(maxFeatures != null){
		total = maxFeatures;
	}
	if(offset != null && offset != 0){
		total += offset;
	}
	var geometry = filter.geometry;
	if(!isValid(geometry)){
		return features;
	}

	for(var i = 0; i < features.length;++i){
		var f = features[i];
		if(f == null){
			continue;
		}
		var g = f.geometry;
		if(g == null){
			continue;
		}
		if(g instanceof GeoBeans.Geometry.Point){
			if(geometry instanceof GeoBeans.Geometry.Polygon 
				|| geometry instanceof GeoBeans.Geometry.MultiPolygon){
				var extent = geometry.extent;
				if(!extent.contains(g.x,g.y)){
					continue;
				}
				if(geometry.hit(g.x,g.y,5)){
					target.push(f);
				}
			}
		}
		if(geometry instanceof GeoBeans.Geometry.Point){
			if(g.hit(geometry.x,geometry.y,5)){
				target.push(f);
			}
		}

		if(total != null && target.length == total){
			break;
		}
	}

	var result = null;
	if(maxFeatures != null && offset != null && offset != 0){
		result = target.slice(offset,total);
	}else if(maxFeatures != null && (offset == null || offset == 0)){
		result = target.slice(0,maxFeatures);
	}else if(maxFeatures == null && offset != null && offset != 0){
		result = target.slice(offset);
	}else{
		result = target;
	}
	return result;
};


GeoBeans.Source.Feature.prototype.selectByDWithinFilter = function(filter,features,maxFeatures,offset){
	if(!isValid(filter)){
		return features;
	}

	var target = [];

	var total =null;
	if(maxFeatures != null){
		total = maxFeatures;
	}
	if(offset != null && offset != 0){
		total += offset;
	}	
	var distance = filter.distance;
	var geometry = filter.geometry;
	if(!isValid(distance) || !isValid(geometry)){
		return features;
	}


	for(var i = 0; i < features.length;++i){
		var f= features[i];
		if(!isValid(f)){
			continue;
		}
		var g = f.geometry;
		if(!isValid(g)){
			continue;
		}
		var d = g.distance(geometry);
		if(d <= distance){
			target.push(f);
		}
	}

	var result = null;
	if(maxFeatures != null && offset != null && offset != 0){
		result = target.slice(offset,total);
	}else if(maxFeatures != null && (offset == null || offset == 0)){
		result = target.slice(0,maxFeatures);
	}else if(maxFeatures == null && offset != null && offset != 0){
		result = target.slice(offset);
	}else{
		result = target;
	}
	return result;

};
/**
 * 获得给定字段的最大最小值
 * @param  {string} fname 给定字段
 * @return {Object}       最大最小值
 */
GeoBeans.Source.Feature.prototype.getMinMaxValue = function(fname){
	var minmax = {
		min : 0,
		max : 0
	};
	if(!isValid(this._features)){
		return minmax;
	}
	var min = null;
	var max = null;
	var feature = null;

	for(var i = 0; i < this._features.length; ++i){
		feature = this._features[i];
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
};
