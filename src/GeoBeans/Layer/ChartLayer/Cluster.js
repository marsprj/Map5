/**
 * @classdesc
 * 聚合图层的聚类算法
 * @class
 * @private
 */
GeoBeans.Cluster = GeoBeans.Class({

	clusters : null,

	// 按照像素来划分
	distance : 90,


	initialize : function(features,map){
		this.map = map;
		this.features = features;
	}
});


/**
 * 获取聚类
 * @return {[type]} [description]
 */
GeoBeans.Cluster.prototype.getClusters = function(){
	if(!isValid(this.features) || !isValid(this.map)){
		return null;
	}

	var viewer = this.map.getViewer();
	var extent = viewer.getExtent();
	var clustered = false,clusters = [],cluster = null;
	for(var i = 0; i < this.features.length;++i){
		var feature = this.features[i];
		if(!isValid(feature)){
			continue;
		}
		var geometry = feature.geometry;
		if(geometry == null){
			continue;
		}
		if(!extent.contain(geometry.x,geometry.y)){
			continue;
		}
		clustered = false;
		for(var j = 0; j < clusters.length;++j){
			cluster = clusters[j];
			if(this.shouldCluster(cluster,geometry)){
				this.addToCluster(cluster,feature);
				clustered = true;
				break;
			}
		}
		if(!clustered){
			clusters.push(this.createCluster(feature));
		}
	}
	return clusters;
};

/**
 * 是否聚合到cluster中
 * @private
 * @param  {Object} cluster  聚类对象
 * @param  {GeoBeans.Geometry.Point} geometry 要素geometry
 * @return {boolean}          结果
 */
GeoBeans.Cluster.prototype.shouldCluster = function(cluster,geometry){
	if(!isValid(cluster) || !isValid(geometry)){
		return false;
	}
	var cg = cluster.geometry;
	var viewer = this.map.getViewer();
	var cg_s = viewer.toScreenPoint(cg.x,cg.y);

	var geometry_s = viewer.toScreenPoint(geometry.x,geometry.y);
	var distance = GeoBeans.Utility.getDistance(cg_s.x,cg_s.y,geometry_s.x,geometry_s.y);

	return (distance < this.distance);
};

/**
 * 添加到聚类
 * @private
 * @param {[type]} cluster [description]
 * @param {[type]} feature [description]
 */
GeoBeans.Cluster.prototype.addToCluster = function(cluster,feature){
	cluster.features.push(feature);
};


/**
 * 创建一个聚类
 * @private
 * @param  {GeoBeans.Feature} feature 要素
 * @return {Object}         
 */
GeoBeans.Cluster.prototype.createCluster = function(feature){
	var cluster = {
		features : []
	};

	cluster.features.push(feature);
	var geometry = feature.geometry;
	cluster.geometry = geometry;
	return cluster;
};

/**
 * 获取聚类的中心点
 * @private
 * @param  {Object} cluster  聚类
 * @return {GeoBeans.Geometry.Point}         中心点
 */
GeoBeans.Cluster.prototype.getClusterCenter = function(cluster){
	if(!isValid(cluster)){
		return null;
	}
	var features = cluster.features;
	var feature = null,geometry = null;
	var sum_x = 0,sum_y = 0;

	for(var i = 0; i < features.length;++i){
		feature = features[i];
		if(feature == null){
			continue;
		}
		geometry = feature.geometry;
		if(geometry == null){
			continue;
		}
		sum_x += geometry.x;
		sum_y += geometry.y;
	}

	return new GeoBeans.Geometry.Point(sum_x/features.length,sum_y/features.length);	
};

