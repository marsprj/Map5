/**
 * @classdesc
 * Feature样式。
 * @class
 * @extends {GeoBeans.Style}
 */
GeoBeans.Style.FeatureStyle = GeoBeans.Class(GeoBeans.Style,{
	rules  		: null,
	// 自定义样式类型
	styleClass 	: null,

	// 点密度样式对应的字段
	field 		: null,

	initialize : function(){
		this.type = GeoBeans.Style.Type.FeatureType;
		this.rules = [];
	}
});

/**
 * 增加渲染规则
 * @public
 * @param {GeoBeans.Style.Rule} rule  规则
 */
GeoBeans.Style.FeatureStyle.prototype.addRule = function(rule){
	this.rules.push(rule);
}

/**
 * 移除渲染规则
 * @public
 * @param {integer} index  序号
 */
GeoBeans.Style.FeatureStyle.prototype.removeRule = function(index){
	this.rules.splice(index,1);
}

/**
 * 复制Style对象
 * @private
 */
GeoBeans.Style.FeatureStyle.prototype.clone = function(){
	var clone = new GeoBeans.Style.FeatureStyle();
	for(var i = 0; i < this.rules.length;++i){
		var rule = this.rules[i].clone();
		clone.addRule(rule);
	}
	clone.styleClass = this.styleClass;
	return clone;
}

GeoBeans.Style.FeatureStyle.StyleClass ={
	SINGLE 		: "single",
	UNIQUE  	: "unique",
	QUANTITIES 	: "quantities",
	CUSTOM 		: "custom",
	DOTDENSITY 	: "DotDensity",
};
