/**
 * @classdesc
 * 版权控件
 * @class
 * @extends {GeoBeans.Widget}
 */
GeoBeans.Widget.CopyRightWidget = GeoBeans.Class(GeoBeans.Widget,{
	
	initialize : function(map){
		this.type = GeoBeans.Widget.Type.COPYRIGHT;
		this.attach(map);
		this.createContainer();
	},

	setContent : null,

});


/**
 * 初始化容器
 */
GeoBeans.Widget.CopyRightWidget.prototype.createContainer = function(){
	
	var mapContainer = this._map.getContainer();
	
	$(mapContainer).find(".map5-copyright").remove();

	var copyRightHtml = "<div class='map5-copyright'>GeoBeans © </div>";
	$(mapContainer).append(copyRightHtml);

	this._container = $(mapContainer).find(".map5-copyright")[0];

};

/**
 * 设置是否显示
 * @param  {boolean} v 是否显示
 */
GeoBeans.Widget.CopyRightWidget.prototype.show = function(v){
	this._visible = v;
	if(this._visible){
		$(this._container).show();
	}else{
		$(this._container).hide();
	}
};

/**
 * 设置显示的内容
 * @param {string} content 显示内容
 */
GeoBeans.Widget.CopyRightWidget.prototype.setContent = function(content){
	$(this._container).html(content);
};
