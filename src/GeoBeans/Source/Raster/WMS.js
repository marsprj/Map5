/**
 * @classdesc
 * WMS数据源类。
 *
 *	var source = new GeoBeans.Source.Raster.WMS({
 * 						"url" : 'http://..',
 * 						"version" : "1.1.0",
 * 						"layers"  : [
 * 								"cities","rivers","country"
 * 						],
 * 						"styles"  : [
 * 								"point","line","polygon"
 * 						],
 * 						"format"  : "image/png",
 * 						"srs"	  : "EPSG:4326",
 * 						"transparent": true
 * 				});
 * 				
 * @class
 * @extends {GeoBeans.Source.Raster}
 * @param 	{object} options options
 * @api stable
 * 
 */
GeoBeans.Source.Raster.WMS = GeoBeans.Class(GeoBeans.Source.Raster, {

	_url : null,
	_version : "1.1.0",		//"1.1.0"
	_layers  : [],			//["cities","rivers","country"]
	_styles	 : [],			//["point" ,"line",  "polygon"]
	_format	 : GeoBeans.ImageType.PNG,
	_srs	 : GeoBeans.SrsType.WGS84,
	_transparent : true,

	/**
	 * new GeoBeans.Source.Raster.WMS({
	 * 		"url" : 'http://..',
	 * 		"version" : "1.1.0",
	 * 		"layers"  : ["radi:cities","radi:rivers","radi:country"],
	 * 		"styles"  : ["point" ,"line",  "polygon"],
	 * 		"format"  : "image/png",
	 * 		"srs"	  : "EPSG:4326",
	 * 		"transparent": true
	 * })
	 */
	initialize : function(options){
		GeoBeans.Source.Raster.prototype.initialize.apply(this, arguments);

		this.apply(options);
	},

	destroy : function(){
		GeoBeans.Source.Raster.prototype.destroy.apply(this, arguments);
	}
});


GeoBeans.Source.Raster.WMS.prototype.apply = function(options){
	this._url = options.url;
	this._version = isValid(options.version) ? options.version : "1.3.0";
	this._layers  = isValid(options.layers)  ? options.layers  : [];
	this._styles  = isValid(options.styles)  ? options.styles  : [];
	this._format  = isValid(options.format)  ? options.format  : GeoBeans.Image.Type.PNG;
	this._srs     = isValid(options.srs)     ? options.srs     : GeoBeans.Srs.Type.WGS84;
	this._transparent = options.transparent;
	this._wmsNS   = isValid(options.wmsNS)   ? options.wmsNS   : "";

	if(isValid(this._url)){
		if(this._url[this._url.length-1] == "?"){
			this._url = this._url.substr(0, this._url.length-1);
		}
	}
}

/**
 * 获得指定范围和大小的Raster
 * @param  {GeoBeans.Envelope}		extent  空间范围
 * @param  {{width:100,height:100}} size    Raster大小
 * @param  {GeoBeans.Handler} 		success 成功回调函数
 * @param  {GeoBeans.Handler} 		failure 失败回调函数
 * @public
 * @override
 */
GeoBeans.Source.Raster.WMS.prototype.getRaster = function(extent, size, success, failure){
	var getmap = "{url}?service=WMS&version={version}&request=GetMap&layers={layers}&styles={styles}&bbox={bbox}&width={width}&height={height}&srs={srs}&format={format}&transparent={transparent}";
	var url = getmap.replace("{url}"	,this._url)
					.replace("{version}",this._version)
					.replace("{layers}"	,this._layers.join(","))
					.replace("{styles}"	,this._styles.join(","))
					.replace("{bbox}"	,extent.toString())
					.replace("{width}"	,size.width)
					.replace("{height}" ,size.height)
					.replace("{srs}"	,this._srs)
					.replace("{format}" ,this._format)
					.replace("{transparent}",this._transparent ? "True" : "False");

	var image = new Image();
	image.onload = function(){
		var raster = new GeoBeans.Raster({
			"image" : image,
			"extent": extent
		});
		success.execute(raster);
	}

	image.src = url + "&t=" + (new Date()).getTime();
	if(image.complete){
		var raster = new GeoBeans.Raster({
			"image" : image,
			"extent": extent
		});
		success.execute(raster);
	}
}