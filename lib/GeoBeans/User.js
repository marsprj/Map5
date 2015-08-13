GeoBeans.User = GeoBeans.Class({
	name  : name,
	server : null,

	// 瓦片库
	tileDBManager : null,

	initialize : function(name){
		this.name = name;

		this.server = "/ows/" + this.name + "/mgr";
		var server = "/ows/" + this.name;
		// this.mapManager = new GeoBeans.MapManager(this.server);
		// this.styleManager = new GeoBeans.StyleManager(this.server);
		// this.dbsManager = new GeoBeans.DBSManager(this.server);

		this.mapManager = new GeoBeans.MapManager(server);
		this.styleManager = new GeoBeans.StyleManager(server);
		this.dbsManager = new GeoBeans.DBSManager(server);

		this.tileDBManager = new GeoBeans.TileDBManager(server);
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

	getTileDBManager : function(name){
		if(name == null){
			return null;
		}
		this.tileDBManager.setName(name);
		return this.tileDBManager;
	},

});