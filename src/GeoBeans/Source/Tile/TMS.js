/**
 * @classdesc
 * Tile Map Service(TMS)格式的数据源。
 *
 *	var layer = new GeoBeans.Source.Tile.TMS({,
 *		url: "http://a.tile.openstreetmap.org/",
 *		srs: GeoBeans.Proj.WebMercator,
 *		format : "image/png"
 *	});
 *	
 * @class
 * @extends {GeoBeans.Source.Tile}
 * @param 	{object} options options
 * @api stable
 */
GeoBeans.Source.Tile.TMS = GeoBeans.Class(GeoBeans.Source.Tile,{

	_url : null,		//http://a.tile.openstreetmap.org/
	_format : "png",	//image/png

	_srs : GeoBeans.Proj.WebMercator,
	_isWGS84 : false,

	_TID : "{zoom}/{col}/{row}.{format}",


	/*	ORIGIN :{
        x: -20037508.3427892,
        y:  20037508.3427892
    },*/
	TMS_URL : "http://a.tile.openstreetmap.org/1/0/1.png",

    IMG_WIDTH : 256,
    IMG_HEIGHT: 256,
		
	MIN_ZOOM_LEVEL: 1,
	MAX_ZOOM_LEVEL: 18,	
	SRS : GeoBeans.Proj.WebMercator,
	FULL_EXTENT : GeoBeans.Proj.WebMercator.EXTENT,
	
	// FULL_EXTENT : {
	// 			xmin:-20037508.3427892,
	// 			ymin:-20037508.3427892,
	// 			xmax:20037508.3427892,
	// 			ymax:20037508.3427892
	// },
    
	RESOLUTIONS : [
				78271.51696402031, 
				39135.75848201016, 
				19567.87924100508, 
				9783.939620502539, 
				4891.96981025127, 
				2445.984905125635, 
				1222.992452562817, 
				611.4962262814087, 
				305.7481131407043, 
				152.8740565703522, 
				76.43702828517608, 
				38.21851414258804, 
				19.10925707129402, 
				9.554628535647009,
				4.777314267823505,
				2.388657133911752,
				1.194328566955876,
				0.5971642834779381],

				
	resolution : 1,
	rows : 0,
	cols : 0,
	/**
	 * 设置的中心点有可能在Tile中间
	 **/
	offset_x : 0.0,
	offset_y : 0.0,
	
	lrow : 0,
	urow : 0,
	lcol : 0,
	rcol : 0,	

	CLASS_NAME : "GeoBeans.Source.Tile.TMS",

	/**
	 * new GeoBeans.Source.Tile.TMS({
	 * 		"url" : '/TMS/maprequest?services=world_image'
	 * })
	 */
	initialize : function(options){
		GeoBeans.Source.Tile.prototype.initialize.apply(this, arguments);

		this._url = options.url;
		
		if(isValid(options.format)){
			this.format = options.format.substring(options.format.lastIndexOf("/")+1);
		}

		this._srs = options.srs;
		if(isValid(options.srs)){
			this._srs = options.srs;
			this.FULL_EXTENT = this._srs.EXTENT;
			if(this._srs.SRID != GeoBeans.SrsType.WebMercator){
				this._isWGS84 = true;
			}
		}
	},

	destroy : function(){
		GeoBeans.Source.Tile.prototype.destroy.apply(this, arguments);
	},
});

GeoBeans.Source.Tile.TMS.prototype.getResolution = function(zoom){
	if( zoom < this.MIN_ZOOM_LEVEL){
		return this.RESOLUTIONS[0];
	}
	else if(zoom > this.MAX_ZOOM_LEVEL){
		return this.RESOLUTIONS[this.RESOLUTIONS.length-1];
	}
	else{
		return this.RESOLUTIONS[zoom-1]; 	
	}
}

/**
 * 根据resolution，计算最接近的zoom
 * @param  {float} resolution  分辨率
 * @return {integer}            zoom
 * @public
 */
GeoBeans.Source.Tile.TMS.prototype.getFitZoom = function(resolution){
	var length = this.RESOLUTIONS.length;
	if(resolution > this.RESOLUTIONS[0]){
		return 1;
	}
	else if(resolution < this.RESOLUTIONS[length-1]){
		return length;
	}
	else{
		var b,u;
		for(var i=1; i<length; i++){
			u = this.RESOLUTIONS[i-1];
			b = this.RESOLUTIONS[i];

			/*
			 * 1) resolution的两层之间，说明这两层可能时最合适的层。
			 * 2) 判断resolution与上下两层的距离，较近的一层为目标层。
			 */ 
			if((resolution>=b) && (resolution<=u)){
				var d_b = Math.abs(resolution - b);
				var d_u = Math.abs(resolution - u);

				var zoom = d_u < d_b ? i : i+1;
				return zoom;
			}
		}
	}
}


/**
 * computeTileBound
 * @return {GeoBeans.Envelope} tileCompand
 * @protected
 * @override
 */
GeoBeans.Source.Tile.TMS.prototype.computeTileBound = function(extent, tile_size){
	var ve = this.getValidView(extent);
	
	var col_min = Math.floor((ve.xmin - this.FULL_EXTENT.xmin) / tile_size);
	var col_max = Math.ceil ((ve.xmax - this.FULL_EXTENT.xmin) / tile_size);
	var row_min = Math.floor((this.FULL_EXTENT.ymax - ve.ymax) / tile_size);
	var row_max = Math.ceil ((this.FULL_EXTENT.ymax - ve.ymin) / tile_size);
	
	return {
		rmin:row_min,
		rmax:row_max,
		cmin:col_min,
		cmax:col_max
	};
}

/**
 * 生成tile的ID
 * @param  {integer} row  行
 * @param  {integer} col  列
 * @param  {integer} zoom 层
 * @return {Tile}      	  tile对象
 * @protected
 * @override
 */
GeoBeans.Source.Tile.TMS.prototype.makeTileID = function(row, col, zoom){
	return this._TID.replace("{col}"	,col)
					.replace("{row}"	,row)
					.replace("{zoom}"	,zoom)
					.replace("{format}"	,this._format);
}

/**
 * 生成tile的URL
 * @param  {string} url  
 * @param  {string} tid
 * @return {string} tile url
 * @protected
 * @override
 */
GeoBeans.Source.Tile.TMS.prototype.makeTileURL = function(url,tid){

	var turl = "";
	var length = url.length;
	if(url[length-1] == "/"){
		turl = url + tid;
	}
	else{
		turl = url + "/" + tid;
	}
	return turl;
}

GeoBeans.Source.Tile.TMS.prototype.getTilePosisiton = function(row, col, tile_size){
	
	var x = this.FULL_EXTENT.xmin + col * tile_size;
	var y = this.FULL_EXTENT.ymax - row * tile_size;

	var pos = null;
	if(this.isWGS84()){
		// var proj = new GeoBeans.proj();
		// var pt0  = proj.toLonLat(x, y);
		// var pt1  = proj.toLonLat(x+tile_size, y+tile_size);
		// pos = {
		// 	"x" : pt0.x,
		// 	"y" : pt0.y,
		// 	"width" : Math.abs(pt1.x - pt0.x),
		// 	"height": Math.abs(pt1.y - pt1.y)
		// }
	}
	else{
		pos = {
			"x" : x,
			"y" : y,
			"width" : tile_size,
			"height": tile_size,
	 	}
	}

	return pos;
}

GeoBeans.Source.Tile.TMS.prototype.getRows = function(zoom){
	return Math.pow(2,(zoom-1));
}

GeoBeans.Source.Tile.TMS.prototype.getCols = function(zoom){
	return Math.pow(2,(zoom));
}

GeoBeans.Source.Tile.TMS.prototype.isWGS84 = function(){
	return this._isWGS84;
}