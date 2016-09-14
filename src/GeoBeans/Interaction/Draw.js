/**
 * Map5的绘制交互类
 * @class
 * @description 实现Map5与用户的交互功能
 */
GeoBeans.Interaction.Draw = GeoBeans.Class(GeoBeans.Interaction, {
	_features : null,
	
	initialize : function(options){
		GeoBeans.Interaction.prototype.initialize.apply(this, arguments);

		this._features = options.features;
	},
	
	destory : function(){
		GeoBeans.Interaction.prototype.destory.apply(this, arguments);
	},

	CLASS_NAME : "GeoBeans.Interaction.Draw"
});



