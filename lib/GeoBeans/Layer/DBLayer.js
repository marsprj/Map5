GeoBeans.Layer.DBLayer = GeoBeans.Class(GeoBeans.Layer,{

	id 				: null,

	// 数据库
	dbName 			: null,

	// 数据库图层名称
	typeName 		: null,


	queryable 		: null,

	// 种类
	type 			: null,

	format 			: "image/png",
	transparent 	: "true",

	image 			: null,

	updateFlag 		: false,
	// queryable 	: null,
	// style 		: null,
	// dbName 		: null,
	// typeName 	: null,
	// styleName 	: null,
	// geomType 	: null,

	// type 		: null,

	// featureType : null,
	// heatMapLayer: null,

	// id 			: null,

	// // 影像名称
	// rasterName 	: null,

	// // 影像路径
	// rasterPath 	: null,

	initialize : function(name,id,dbName,typeName,queryable,visible){
		GeoBeans.Layer.prototype.initialize.apply(this, arguments);
		this.id = id;
		this.dbName = dbName;
		this.typeName = typeName;
		this.queryable = queryable;
		this.visible = visible;

		this.image = new Image();
	},

	// initialize : function(name,dbName,typeName,styleName){
	// 	GeoBeans.Layer.prototype.initialize.apply(this, arguments);
	// 	this.dbName = dbName;
	// 	this.typeName = typeName;
	// 	if(styleName != undefined){
	// 		this.styleName = styleName;
	// 	}
	// },

	cleanup : function(){

	},

	setMap : function(){
		GeoBeans.Layer.prototype.setMap.apply(this, arguments);

	},


	load : function(){
		var w = this.map.canvas.width;
		var h = this.map.canvas.height;
		
		var extent = this.map.viewer;

		var bbox = extent.xmin.toFixed(6) + "," + extent.ymin.toFixed(6) + ","
						+ extent.xmax.toFixed(6) + "," + extent.ymax.toFixed(6);

		var url = "";
		var styleUrl = "";
		var name = this.name;
		if(this.styleName != null){
			styleUrl = this.styleName;
		}
		if(name != null && this.visible){
			var version = this.map.mapWorkspace.version;
			url = this.map.server +
		 	  "?service=WMS" +
			  "&version=" + version +
			  "&request=GetMap" +
			  "&layers=" + name +
			  "&styles=" + styleUrl +
			  "&bbox=" + bbox + 
			  "&width=" + w + 
			  "&height=" + h + 
			  "&srs=" + this.srid + 
			  "&format=" + this.format +
			  "&transparent=" + this.transparent +
			  "&mapName=" + this.map.name;
		}

		this.renderer.clearRect(0,0,w,h);
		if(!this.updateFlag && this.flag == GeoBeans.Layer.Flag.ERROR){
			this.flag == GeoBeans.Layer.Flag.LOADED;
			return;
		}
		if(this.updateFlag){
			var d = new Date();
			this.image.src = url + "&t=" + d.getTime();
			this.updateFlag = false;
		}else{
			this.image.src = url;
		}

		var heatMapLayer = this.heatMapLayer;
		if(heatMapLayer != null){
			heatMapLayer.load();
			
		}


		if(this.image.complete){
			this.updateFlag = false;
			this.flag = GeoBeans.Layer.Flag.LOADED;
			this.renderer.drawImage(this.image, 0, 0, w, h);	
			var index = this.image.src.lastIndexOf("&t=");
			if(index != -1){
				this.image.src = this.image.src.slice(0,index);
			}
		}else{
			var that = this;
			that.flag = GeoBeans.Layer.Flag.READY;
			this.image.onload = function(){
				if(that.flag != GeoBeans.Layer.Flag.LOADED){
					that.flag = GeoBeans.Layer.Flag.LOADED;
					that.renderer.drawImage(that.image, 0, 0, w, h);
					that.map.drawLayersAll();	
				}
			};
			this.image.onerror = function(){
				that.flag = GeoBeans.Layer.Flag.ERROR;
				that.map.drawLayersAll();	
			};
		}
	},

	update : function(){
		this.updateFlag = true;
	},

});

GeoBeans.Layer.DBLayer.Type = {
	Raster  : "raster",
	Feature : "feature"
}