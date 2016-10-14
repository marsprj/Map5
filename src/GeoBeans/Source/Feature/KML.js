/**
 * @classdesc
 * KML类型的数据源类。
 * @class
 */
GeoBeans.Source.Feature.KML = GeoBeans.Class(GeoBeans.Source.Feature, {
	_url : "",
	_format : null,

	_loaded : false,
	
	initialize : function(options){

		this._url = isValid(options.url) ? options.url : "";		
		this._format = new GeoBeans.Format.KML({
			geometryName :options.geometryName
		});

		GeoBeans.Source.Feature.prototype.initialize.apply(this, arguments);
	},

	destroy : function(){
		GeoBeans.Source.Feature.prototype.destory.apply(this, arguments);
	},
});


/**
 * 获得指定范围的的Feature
 * @param  {GeoBeans.Envelope} extent 空间范围
 * @param  {GeoBeans.Handler} success 	   查询成功的回调函数
 * @param  {GeoBeans.Handler} failure	   查询失败的回调函数
 * @public
 * @override
 */
GeoBeans.Source.Feature.KML.prototype.getFeaturesByExtent = function(extent, success, failure){
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
			dataType: "xml",
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

