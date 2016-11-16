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
		//GeoBeans.Class.prototype.initialize.apply(this, arguments);
	},
	
	destory : function(){
		//GeoBeans.Class.prototype.destory.apply(this, arguments);
		this.cleanup();
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
 * 获取Interaction是否处于活动状态
 * @public
 * @return {Boolean} 活动状态
 */
GeoBeans.Interaction.prototype.isEnabled = function(){
	return this._enabled;
}

/**
 * Interaction类型
 * @type {string}
 */
GeoBeans.Interaction.Type = {
	/** 绘制 */
	DRAW	: "Draw",
	/** 选择 */
	SELECT	: "Select",
	/** 旋转 */
	ROTATE	: "Rotate"
};


GeoBeans.Interaction.Interactions = GeoBeans.Class({
	map : null,
	_interactions : [],
	
	initialize : function(map){
		this.map = map;
	},

	destory : function(){
		this.cleanup();
		this._interactions = null;
	},
	
	add : function(c){
		if(!isValid(c)){
			return;
		}
		c.attach(this.map);
		this._interactions.push(c);
	},
	
	remove : function(c){
		if(!isValid(c)){
			return;
		}
		var i = this.find(c._type);
		if(i > 0){
			this._interactions[i].destory();
			this._interactions[i] = null;
			this._interactions.splice(i,1);
		}
	},

	get : function(i){
		return this._interactions[i];
	},

	count : function(){
		return this._interactions.length;
	},

	cleanup : function(){
		var len = this._interactions.length;
		for(var i=0; i<len; i++){
			this._interactions[i].destory();
			this._interactions[i] = null;
		}
		this._interactions = [];
	},

	find : function(type){
		var len = this._interactions.length;
		for(var i=0; i<len; i++){
			if(this._interactions[i]._type == type){
				return i;
			}
		}
		return -1;
	}
});