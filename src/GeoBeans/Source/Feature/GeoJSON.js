/**
 * @classdesc
 * GeoJSON类型的数据源类。
 * @class
 */
GeoBeans.Source.Feature.GeoJSON = GeoBeans.Class(GeoBeans.Source.Feature, {

	_url : "",
	_format : null,

	_loaded : false,
	
	initialize : function(options){

		this._url = isValid(options.url) ? options.url : "";		
		this._format = new GeoBeans.Format.GeoJson(options.geometryName);

		GeoBeans.Source.Feature.prototype.initialize.apply(this, arguments);
	},

	destroy : function(){
		this._format = null;
		this._url = null;

		GeoBeans.Source.Feature.prototype.destory.apply(this, arguments);
	},
});

/**
 * 获得符合查询条件的Feature
 * @param  {GeoBeans.Filter} filter  查询过滤器
 * @param  {GeoBeans.Handler} success 	   查询成功的回调函数
 * @param  {GeoBeans.Handler} failure	   查询失败的回调函数
 * @public
 * @override
 */
GeoBeans.Source.Feature.GeoJSON.prototype.getFeatures = function(filter, success, failure){

	if(this._loaded){
		if(isValid(filter)){
			success.execute(this._features);
		}else{
			var target = filter(filter,this._features);
			success.execute(target);
		}
	}
	else{
		var that = this;
		$.ajax({
			type	:"get",
			url		: this._url,
			dataType: "text",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(text, textStatus){
				that._loaded = true;
				that._features = that._format.readFeatures(text);
				if(!isValid(filter)){
					success.execute(that._features);
				}else{
					var target = that.filter(filter,that._features);
					success.execute(target);
				}
			},
			complete: function(XMLHttpRequest, textStatus){

			},
			error	: function(e){
				failure.execute("sss");
			}
		});
	}
}

/**
 * 获得指定范围的的Feature
 * @param  {GeoBeans.Envelope} extent 空间范围
 * @param  {GeoBeans.Handler} success 	   查询成功的回调函数
 * @param  {GeoBeans.Handler} failure	   查询失败的回调函数
 * @public
 * @override
 */
GeoBeans.Source.Feature.GeoJSON.prototype.getFeaturesByExtent = function(extent, success, failure){
	if(this._loaded){
		if(!isValid(extent)){
			success.execute(this._features);
		}else{
			var target = this.selectByExtent(extent,this._features);
			success.execute(target);
		}
	}
	else{
		var that = this;
		$.ajax({
			type	:"get",
			url		: this._url,
			dataType: "text",
			async	: true,
			beforeSend: function(XMLHttpRequest){
			},
			success	: function(text, textStatus){
				that._loaded = true;
				that._features = that._format.readFeatures(text);
				if(!isValid(extent)){
					success.execute(that._features);
				}else{
					var target = that.selectByExtent(extent,that._features);
					success.execute(target);
				}
			},
			error	: function(e){
				failure.execute(e.message);
			}
		});
	}
}


/**
 * 过滤features
 * @param  {GeoBeans.Filter} filter  查询过滤器
 * @return {Array.<GeoBeans.Feature>}  目标Feature集合
 */
GeoBeans.Source.Feature.prototype.filter = function(filter, features){

	var target = [];

	return target;
}

/**
 * 过滤features
 * @param  {GeoBeans.Filter} filter  查询过滤器
 * @return {Array.<GeoBeans.Feature>}  目标Feature集合
 */
GeoBeans.Source.Feature.prototype.filterByExtent = function(extent, features){

	var target = [];
	features.forEach(function(f){
		var g = f.getGeometry();
		if(isValid(g)){
			if(g.type===GeoBeans.Geometry.Type.POINT){
				extent.contains(g.x, g.y);
			}
			else{
				var r = g.getExtent();
				extent.contains(g.x, g.y);
			}
		}
	})

	return target;
}
