GeoBeans.User = GeoBeans.Class({
	name  : name,
	server : null,

	initialize : function(name){
		this.name = name;

		this.server = "/ows/" + this.name + "/mgr";
		this.mapManager = new GeoBeans.MapManager(this.server);
		this.styleManager = new GeoBeans.StyleManager(this.server);
		this.dbsManager = new GeoBeans.DBSManager(this.server);
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


});