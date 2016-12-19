GeoBeans.User = GeoBeans.Class({
	
	name  			: null,
	
	server 			: null,

	// 地图管理器
	mapManager 		: null,

	// 样式管理器
	styleManager 	: null,

	// 地理库管理器
	dbsManager 		: null,

	// 瓦片库管理器
	tileDBManager 	: null,

	// 文件管理器
	fileManager 	: null,

	// 影像库管理器
	rasterDBManager	: null,

	// 
	gpsManager 		: null,

	// 瓦片库
	tileDBManager 	: null,

	// poi管理器
	poiManager 		: null,

	// 订阅管理器
	subManager 		: null,

	// 服务管理器
	serviceManager 	: null,

	// 日志记录
	jobManager 		: null,

	initialize : function(name){
		this.name = name;

		this.server = "/ows/" + this.name + "/mgr";
		var server = "/ows/" + this.name;

		this.mapManager = new GeoBeans.MapManager(server);
		this.styleManager = new GeoBeans.StyleManager(server);
		this.dbsManager = new GeoBeans.DBSManager(server);
		// this.fileManager = new GeoBeans.FileManager(server);

		// this.tileDBManager = new GeoBeans.TileDBManager(server);

		// this.rasterDBManager = new GeoBeans.RasterDBManager(server);
		// this.gpsManager = new GeoBeans.GPSManager(server);

		// this.poiManager = new GeoBeans.PoiManager(this.name);

		// this.subManager = new GeoBeans.SubManager(server);

		// this.serviceManager = new GeoBeans.ServiceManager(server);

		// this.jobManager = new GeoBeans.JobManager(server);

	},

	logout : function(){
		this.mapManager = null;
		this.styleManager = null;
		this.dbsManager = null;
		this.fileManager = null;
		this.tileDBManager = null;
		this.rasterDBManager = null;
		this.gpsManager = null;
	},


	getMapManager : function(){
		return this.mapManager;
	},

	getStyleManager : function(){
		return this.styleManager;
	},

	getDBSManager : function(){
		return this.dbsManager;
	},


	getFileManager : function(){
		return this.fileManager;
	},

	getTileDBManager : function(name){
		if(name == null){
			return null;
		}
		this.tileDBManager.setName(name);
		return this.tileDBManager;
	},

	getRasterDBManager : function(){
		return this.rasterDBManager;
	},


	getGPSManager : function(){
		return this.gpsManager;
	},

	getPoiManager : function(){
		return this.poiManager;
	},

	getSubManager : function(){
		return this.subManager;
	},


	getServiceManager : function(){
		return this.serviceManager;
	},

	getJobManager : function(){
		return this.jobManager;
	},

	getServer : function(){
		return this.server;
	}

});