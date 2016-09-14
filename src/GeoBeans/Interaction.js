/**
 * Map5的交互类
 * @class
 * @description 实现Map5与用户的交互功能
 */
GeoBeans.Interaction = GeoBeans.Class({
	_type : null,
	_map : null,
	_enabled : true,
	
	initialize : function(options){
		GeoBeans.Class.prototype.initialize.apply(this, arguments);
	},
	
	destory : function(){
		GeoBeans.Class.prototype.destory.apply(this, arguments);
	},
	
	attach : function(_map){
		this._map = _map;
	},
	
	detach : function(){
		this._map = _map;
	},
	
	enable : function(f){
		this._enabled = f;
	},

	CLASS_NAME : "GeoBeans.Interaction"
});

/**
 * Interaction类型
 * @type {Object}
 */
GeoBeans.Interaction.Type = {
	DRAW	: "Draw",
	SELECT	: "Select",
	ROTATE	: "Rotate"
};