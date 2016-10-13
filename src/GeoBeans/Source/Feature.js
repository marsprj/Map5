/**
 * @classdesc
 * Feature数据源类。
 * @class
 * @extends {GeoBeans.Source}
 */
GeoBeans.Source.Feature = GeoBeans.Class(GeoBeans.Source, {

	_features : [],

	initialize : function(options){

	},

	destroy : function(){
	}
});

/**
 * 获得符合查询条件的Feature
 * @param  {GeoBeans.Filter} filter  查询过滤器
 * @param  {GeoBeans.Handler} success 	   查询成功的回调函数
 * @param  {GeoBeans.Handler} failure	   查询失败的回调函数
 * @public
 */
GeoBeans.Source.Feature.prototype.getFeatures = function(filter, success, failure){
	
}


/**
 * 过滤features
 * @param  {GeoBeans.Filter} filter  查询过滤器
 * @return {Array.<GeoBeans.Feature>}  目标Feature集合
 */
GeoBeans.Source.Feature.prototype.select = function(filter, features){

	var target = [];

	return target;
}


/**
 * 获得指定范围的的Feature
 * @param  {GeoBeans.Envelope} extent 空间范围
 * @param  {GeoBeans.Handler} success 	   查询成功的回调函数
 * @param  {GeoBeans.Handler} failure	   查询失败的回调函数
 * @public
 */
GeoBeans.Source.Feature.prototype.getFeaturesByExtent = function(extent, success, failure){
	var target = this.selectByExtent(extent, this._features)
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
 * 查询
 * @public
 * @param  {GeoBeasn.Filter} filter 查询过滤器
 * @return {GeoBeans.Feature}        目标要素集合
 */
GeoBeans.Source.Feature.prototype.query = function(query, handler){
	if(!isValid(query)){
		if(isValid(handler)){
			handler.execute(null);
		}
		return;
	}
	// 缺少orderby
	var filter = query.getFilter();
	var maxFeatures = query.getMaxFeatures();
	var offset = query.getOffset();
	var orderby = query.getOrderby();

	var features = this.features;

	var result = this.selectFeaturesByFilter(filter,features,maxFeatures,offset);
	if(isValid(handler)){
		handler.execute(result);
	}
}

// ？？？下面几个selectXXX全都归到query函数里面
	// 已经修改为query读取的方式了
GeoBeans.Source.Feature.prototype.selectFeaturesByFilter = function(filter,features,maxFeatures,offset){
	if(filter == null){
		return features;
	}
	var type = filter.type;
	var selection = features; 
	switch(type){
		case GeoBeans.Filter.Type.FilterID:{
			selection = this.selectFeaturesByIDFilter(filter,features,maxFeatures,offset);
			break;
		}
		case GeoBeans.Filter.Type.FilterComparsion:{
			selection = this.selectFeaturesByComparsion(filter,features,maxFeatures,offset);
			break;
		}
		case GeoBeans.Filter.Type.FilterLogic:{
			selection = this.selectFeatureByLogic(filter,features,maxFeatures,offset);
			break;
		}
		case GeoBeans.Filter.Type.FilterSpatial:{
			selection = this.selectFeaturesBySpatial(filter,features,maxFeatures,offset);
			break;
		}
	}
	return selection;
}

GeoBeans.Source.Feature.prototype.selectFeaturesByIDFilter = function(filter,features,maxFeatures,offset){
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

	var selection = [];
	for(var i = 0; i < features.length; ++i){
		var feature = features[i];
		var fid = feature.fid;
		if(ids.indexOf(fid) != -1){
			selection.push(feature);
			if(total != null && selection.length == total){
				break;
			}
		}
	}
	
	var result = null;
	if(maxFeatures != null && offset != null && offset != 0){
		result = selection.slice(offset,total);
	}else if(maxFeatures != null && (offset == null || offset == 0)){
		result = selection.slice(0,maxFeatures);
	}else if(maxFeatures == null && offset != null && offset != 0){
		result = selection.slice(offset);
	}else{
		result = selection;
	}
	return result;
}

GeoBeans.Source.Feature.prototype.selectFeaturesByComparsion = function(filter,features,maxFeatures,offset){
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
	var selection = [];

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
				selection = features;
				break;
			}

			var findex = this.featureType.findField(field);
			if(findex == -1){
				selection = features;
				break;
			}

			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue == value){
					selection.push(feature);
				}
				if(total != null && selection.length == total){
					break;
				}
			}
			break;
		}
		case GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprNotEqual:{
			if(field == null || value == null){
				selection = features;
				break;
			}

			var findex = this.featureType.findField(field);
			if(findex == -1){
				selection = features;
				break;
			}

			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue != value){
					selection.push(feature);
				}
				if(total != null && selection.length == total){
					break;
				}
			}
			break;
		}
		case GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprLessThan:{
			if(field == null || value == null){
				selection = features;
				break;
			}

			var findex = this.featureType.findField(field);
			if(findex == -1){
				selection = features;
				break;
			}

			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue < value){
					selection.push(feature);
				}
				if(total != null && selection.length == total){
					break;
				}
			}				
			break;
		}
		case GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprGreaterThan:{
			if(field == null || value == null){
				selection = features;
				break;
			}

			var findex = this.featureType.findField(field);
			if(findex == -1){
				selection = features;
				break;
			}

			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue > value){
					selection.push(feature);
				}
				if(total != null && selection.length == total){
					break;
				}
			}
			break;
		}
		case GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprLessThanOrEqual:{
			if(field == null || value == null){
				selection = features;
				break;
			}

			var findex = this.featureType.findField(field);
			if(findex == -1){
				selection = features;
				break;
			}

			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue <= value){
					selection.push(feature);
				}
				if(total != null && selection.length == total){
					break;
				}
			}
			break;
		}
		case GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprGreaterThanOrEqual:{
			if(field == null || value == null){
				selection = features;
				break;
			}

			var findex = this.featureType.findField(field);
			if(findex == -1){
				selection = features;
				break;
			}

			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue >= value){
					selection.push(feature);
				}
				if(total != null && selection.length == total){
					break;
				}
			}
			break;
		}
		case GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsLike:{
			if(field == null || value == null){
				selection = features;
				break;
			}

			var findex = this.featureType.findField(field);
			if(findex == -1){
				selection = features;
				break;
			}

			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue.like(value)){
					selection.push(feature);
				}
				if(total != null && selection.length == total){
					break;
				}
			}
			break;
		}
		case GeoBeans.Filter.ComparisionFilter.OperatorType.ComOprIsNull:{
			// if(field == null || value == null){
			// 	selection = features;
			// 	break;
			// }
			var properyName = filter.properyName;
			var field = properyName.name;
			var findex = this.featureType.findField(field);
			if(findex == -1){
				selection = features;
				break;
			}

			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue == null){
					selection.push(feature);
				}
				if(total != null && selection.length == total){
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
				selection = features;
				break;
			}
			var findex = this.featureType.findField(field);
			if(findex == -1){
				selection = features;
				break;
			}

			var feature = null,fvalue = null;
			for(var i = 0; i < features.length;++i){
				feature = features[i];
				fvalue = feature.getValue(field);
				if(fvalue >= lowerValue && fvalue <= upperValue){
					selection.push(feature);
				}
				if(total != null && selection.length == total){
					break;
				}

			}

			break;
		}
	}
	var result = null;
	if(maxFeatures != null && offset != null && offset != 0){
		result = selection.slice(offset,total);
	}else if(maxFeatures != null && (offset == null || offset == 0)){
		result = selection.slice(0,maxFeatures);
	}else if(maxFeatures == null && offset != null && offset != 0){
		result = selection.slice(offset);
	}else{
		result = selection;
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

	var selection = features;

	var oper = filter.operator;
	switch(oper){
		case GeoBeans.Filter.LogicFilter.OperatorType.LogicOprAnd:{
			selection = this.selectFeatureByLogicAnd(filter,features,maxFeatures,offset); 
			break;
		}
		case GeoBeans.Filter.LogicFilter.OperatorType.LogicOprOr:{
			selection = this.selectFeatureByLogicOr(filter,features,maxFeatures,offset);
			break;
		}
		case GeoBeans.Filter.LogicFilter.OperatorType.LogicOprNot:{
			selection = this.selectFeatureByLogicNot(filter,features,maxFeatures,offset);
			break;
		}
		default:
			break;
	}

	return selection;
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

	var selection = features;
	var filters = filter.filters;
	for(var i = 0; i < filters.length;++i){
		var f = filters[i];
		selection = this.selectFeaturesByFilter(f,selection,null,null);
	}

	var result = null;
	if(maxFeatures != null && offset != null && offset != 0){
		result = selection.slice(offset,total);
	}else if(maxFeatures != null && (offset == null || offset == 0)){
		result = selection.slice(0,maxFeatures);
	}else if(maxFeatures == null && offset != null && offset != 0){
		result = selection.slice(offset);
	}else{
		result = selection;
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

	var selection = [];
	var filters = filter.filters;
	for(var i = 0; i < filters.length;++i){
		var f = filters[i];
		var selected = this.selectFeaturesByFilter(f,features,null,null);
		selection = this.concatArray(selection,selected);
		if(total != null && selection.length >= total){
			break;
		}
	}

	var result = null;
	if(maxFeatures != null && offset != null && offset != 0){
		result = selection.slice(offset,total);
	}else if(maxFeatures != null && (offset == null || offset == 0)){
		result = selection.slice(0,maxFeatures);
	}else if(maxFeatures == null && offset != null && offset != 0){
		result = selection.slice(offset);
	}else{
		result = selection;
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
	var selection = this.selectFeaturesByFilter(f,features,maxFeatures,offset);
	var s = [];
	for(var i = 0; i < features.length; ++i){
		if($.inArray(features[i],selection) == -1){
			s.push(features[i]);
		}
		if(total != null && selection.length >= total){
			break;
		}
	}
	var result = null;
	if(maxFeatures != null && offset != null && offset != 0){
		result = selection.slice(offset,total);
	}else if(maxFeatures != null && (offset == null || offset == 0)){
		result = selection.slice(0,maxFeatures);
	}else if(maxFeatures == null && offset != null && offset != 0){
		result = selection.slice(offset);
	}else{
		result = selection;
	}
	return result;

}
	
GeoBeans.Source.Feature.prototype.selectFeaturesBySpatial = function(filter,features,maxFeatures,offset){
	if(filter == null){
		return features;
	}
	var oper = filter.operator;
	var selection = features;
	switch(oper){
		case GeoBeans.Filter.SpatialFilter.OperatorType.SpOprBBox:{
			selection = this.selectFeaturesByBBoxFilter(filter,features,maxFeatures,offset);
			break;
		}
		default:
			break;
	}
	return selection;
}

GeoBeans.Source.Feature.prototype.selectFeaturesByBBoxFilter = function(filter,features,maxFeatures,offset){
	if(filter == null){
		return features;
	}

	var extent = filter.extent;

	var geomType = this.getGeomType();

	var selection = [];

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
		if(extent.intersects(g_extent)){
			selection.push(f);
		}
		if(total != null && selection.length == total){
			break;
		}
	}
	var result = null;
	if(maxFeatures != null && offset != null && offset != 0){
		result = selection.slice(offset,total);
	}else if(maxFeatures != null && (offset == null || offset == 0)){
		result = selection.slice(0,maxFeatures);
	}else if(maxFeatures == null && offset != null && offset != 0){
		result = selection.slice(offset);
	}else{
		result = selection;
	}
	return result;
}
