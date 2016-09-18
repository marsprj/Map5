GeoBeans.Style.FeatureStyle = GeoBeans.Class(GeoBeans.Style,{
	rules  		: null,
	// 自定义样式类型
	styleClass 	: null,

	// 点密度样式对应的字段
	field 		: null,

	initialize : function(){
		this.type = GeoBeans.Style.Type.FeatureType;
		this.rules = [];
	},

	addRule : function(rule){
		this.rules.push(rule);
	},

	removeRule : function(index){
		this.rules.splice(index,1);
	},

	clone : function(){
		var clone = new GeoBeans.Style.FeatureStyle();
		for(var i = 0; i < this.rules.length;++i){
			var rule = this.rules[i].clone();
			clone.addRule(rule);
		}
		clone.styleClass = this.styleClass;
		return clone;
	}
});

GeoBeans.Style.FeatureStyle.StyleClass ={
	SINGLE 		: "single",
	UNIQUE  	: "unique",
	QUANTITIES 	: "quantities",
	CUSTOM 		: "custom",
	DOTDENSITY 	: "DotDensity",
};