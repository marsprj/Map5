/**
 * @classdesc
 * WMTS数据源。
 *
 *	var layer = new GeoBeans.Source.Tile.WMTS({,
 *		url: 
 *		srs: GeoBeans.Proj.WebMercator
 *	});
 *	
 * @class
 * @extends {GeoBeans.Source.Tile}
 * @param 	{object} options options
 * @api stable
 */
GeoBeans.Source.Tile.WMTS = GeoBeans.Class(GeoBeans.Source.Tile,{

	_url : null,
	_imageSet : null,
	_matrixSet : null,
	_format : "image/png",
	_style : "",

	_srs : GeoBeans.Proj.WebMercator,
	_isWGS84 : false,

	_TID : "SERVICE=wmts&REQUEST=GetTile&VERSION=1.0.0&LAYER={imageSet}&STYLE={style}&FORMAT={format}&TILEMATRIXSET={matrixSet}&TILEMATRIX={matrixSet}:{zoom}&TILEROW={row}&TILECOL={col}",


	/*	ORIGIN :{
        x: -20037508.3427892,
        y:  20037508.3427892
    },*/
	WMTS_URL : "http://127.0.0.1/osm/1/0/1.png",

    IMG_WIDTH : 256,
    IMG_HEIGHT: 256,
		
	MIN_ZOOM_LEVEL: 1,
	MAX_ZOOM_LEVEL: 18,	
	SRS : GeoBeans.Proj.WebMercator,
	FULL_EXTENT : GeoBeans.Proj.WebMercator.EXTENT,
    
    //RESOLUTIONS : [],
	RESOLUTIONS : [			
				0.703125,	/*1*/
				0.3515625,
				0.17578125,
				0.087890625,
				0.0439453125,
				0.02197265625,
				0.010986328125,
				0.0054931640625,
				0.00274658203125,
				0.00137329101562,
				0.000686645507812,
				0.000343322753906,
				0.000171661376953,
				0.0000858306884766,
				0.0000429153442383,
				0.0000214576721191,
				0.0000107288360596,
				0.00000536441802979],
	// RESOLUTIONS : [
	// 			78271.51696402031, 
	// 			39135.75848201016, 
	// 			19567.87924100508, 
	// 			9783.939620502539, 
	// 			4891.96981025127, 
	// 			2445.984905125635, 
	// 			1222.992452562817, 
	// 			611.4962262814087, 
	// 			305.7481131407043, 
	// 			152.8740565703522, 
	// 			76.43702828517608, 
	// 			38.21851414258804, 
	// 			19.10925707129402, 
	// 			9.554628535647009,
	// 			4.777314267823505,
	// 			2.388657133911752,
	// 			1.194328566955876,
	// 			0.5971642834779381],

				
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

	CLASS_NAME : "GeoBeans.Source.Tile.WMTS",

	/**
	 * new GeoBeans.Source.Tile.WMTS({
	 * 		"url" : '/WMTS/maprequest?services=world_image'
	 * })
	 */
	initialize : function(options){
		GeoBeans.Source.Tile.prototype.initialize.apply(this, arguments);
		
		this._url = options.url;
		this._imageSet = options.imageSet;
		this._matrixSet= options.matrixSet;
		this._srs = options.srs;
		this._style = isValid(options.style) ? options.style : "";
		if(isValid(options.srs)){
			this._srs = options.srs;
			this.FULL_EXTENT = this._srs.EXTENT;
		}
	},

	destroy : function(){
		GeoBeans.Source.Tile.prototype.destroy.apply(this, arguments);
	},
});

GeoBeans.Source.Tile.WMTS.prototype.getResolution = function(zoom){
	if( zoom < this.MIN_ZOOM_LEVEL){
		return this.RESOLUTIONS[0];
	}
	else if(zoom > this.MAX_ZOOM_LEVEL){
		return this.RESOLUTIONS[this.RESOLUTIONS.length-1];
	}
	else{
		return this.RESOLUTIONS[zoom]; 	
	}
}

/**
 * 根据resolution，计算最接近的zoom
 * @param  {float} resolution  分辨率
 * @return {integer}            zoom
 * @public
 */
GeoBeans.Source.Tile.WMTS.prototype.getFitZoom = function(resolution){
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
GeoBeans.Source.Tile.WMTS.prototype.computeTileBound = function(extent, tile_size){
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
GeoBeans.Source.Tile.WMTS.prototype.makeTileID = function(row, col, zoom){
	return this._TID.replace("{col}"	,col)
					.replace("{row}"	,row)
					.replace("{zoom}"	,zoom)
					.replace("{format}"	,this._format)
					.replace("{imageSet}"	,this._imageSet)
					.replace("{matrixSet}"	,this._matrixSet)
					.replace("{matrixSet}"	,this._matrixSet)
					.replace("{style}"		,this._style);
}

/**
 * 生成tile的URL
 * @param  {string} url  
 * @param  {string} tid
 * @return {string} tile url
 * @protected
 * @override
 */
GeoBeans.Source.Tile.WMTS.prototype.makeTileURL = function(url,tid){

	var turl = "";
	var length = url.length;
	if(url[length-1] == "?"){
		turl = url + tid;
	}
	else{
		turl = url + "?" + tid;
	}
	return turl;
}

GeoBeans.Source.Tile.WMTS.prototype.getTilePosisiton = function(row, col, tile_size){
	
	var x = this.FULL_EXTENT.xmin + col * tile_size;
	var y = this.FULL_EXTENT.ymax - row * tile_size;

	var pos = null;
	pos = {
		"x" : x,
		"y" : y,
		"width" : tile_size,
		"height": tile_size,
 	}

	return pos;
}

GeoBeans.Source.Tile.WMTS.prototype.getRows = function(zoom){
	if(this._isWGS84){
		return Math.pow(2,(zoom-1));	
	}
	else{
		return Math.pow(2,(zoom));
	}
	
}

GeoBeans.Source.Tile.WMTS.prototype.getCols = function(zoom){
	return Math.pow(2,(zoom));
}

GeoBeans.Source.Tile.WMTS.prototype.isWGS84 = function(){
	return this._isWGS84;
}