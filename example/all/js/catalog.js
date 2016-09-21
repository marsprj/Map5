var g_catalog = [
	{
		"name": "地图",
		"items":[
			{
				"name" : "初始化地图",
				"link" : "map/map_init.html"
			},{
				"name" : "(*)关闭地图",
				"link" : "map/map_close.html"
			},{
				"name" : "拖拽地图",
				"link" : "map/map_drag.html"
			},{
				"name" : "滚轮缩放",
				"link" : "map/map_scroll.html"
			},{
				"name" : "拉框缩放",
				"link" : "map/map_zoom.html"
			}
		]
	},{
		"name": "地图控件",
		"items":[
			{
				"name" : "导航条",
				"link" : "control/control_nav.html"
			},{
				"name" : "(*)鹰眼（待实现）",
				"link" : "control/control_hawk.html"
			},{
				"name" : "(*)比例尺（待实现）",
				"link" : "control/control_scalebar.html"
			},{
				"name" : "(*)图例（待补充）",
				"link" : "control/control_legend.html"
			},{
				"name" : "版权（待补充）",
				"link" : "control/control_copyright.html"
			}
		]
	},{
		"name" : "地图视图",
		"items":[
			{
				"name" : "缩放级别",
				"link" : "map/map_view_zoom.html"
			},{
				"name" : "设置中心点",
				"link" : "map/map_view_center.html"
			},{
				"name" : "设置显示范围",
				"link" : "map/map_view_extent.html"
			},{
				"name" : "地图旋转",
				"link" : "map/map_view_rotate.html"
			}
		]
	},{
		"name" : "图层加载",
		"items":[
			/*{
				"name" : "添加图层",
				"link" : "layer/layer_add.html"
			},*/{
				"name" : "WFS图层",
				"link" : "layer/layer_add_wfs.html"
			},{
				"name" : "WMS图层",
				"link" : "layer/layer_add_wms.html"
			},{
				"name" : "(*)WMTS图层",
				"link" : "layer/layer_add_wmts.html"
			},{
				"name" : "QuadServer图层",
				"link" : "layer/layer_add_quadserver.html"
			},{
				"name" : "多个QuadServer图层",
				"link" : "layer/layer_add_multi_quadserver.html"
			},{
				"name" : "(*)PGIS图层",
				"link" : "layer/layer_add_pgis.html"
			},{
				"name" : "(*)高德图层",
				"link" : "layer/layer_add_amap.html"
			},{
				"name" : "(*)百度图层",
				"link" : "layer/layer_add_baidu.html"
			},{
				"name" : "(*)天地图层",
				"link" : "layer/layer_add_tianditu.html"
			},{
				"name" : "(*)OSM图层(待实现)",
				"link" : "layer/layer_add_osm.html"
			},{
				"name" : "(*)Bing图层(待实现)",
				"link" : "layer/layer_add_bing.html"
			}
		]
	},{
		"name" : "图层控制",
		"items":[
			{
				"name" : "(*)删除图层",
				"link" : "layer/layer_remove.html"
			},{
				"name" : "图层显示",
				"link" : "layer/layer_visible.html"
			},{
				"name" : "透明度",
				"link" : "layer/layer_tranparency.html"
			},{
				"name" : "最大最小显示级别",
				"link" : "layer/layer_minmaxzoom.html"
			}
		]
	},{
		"name" : "地图交互",
		"items":[
			{
				"name" : "查询(点击)",
				"link" : "interaction/interaction_select_by_click.html"
			},{
				"name" : "查询(矩形)",
				"link" : "interaction/interaction_select_by_rect.html"
			},{
				"name" : "查询(圆)",
				"link" : "interaction/interaction_select_by_circle.html"
			},{
				"name" : "(*)查询(线)",
				"link" : "interaction/interaction_select_by_line.html"
			},{
				"name" : "(*)查询(多边形)",
				"link" : "interaction/interaction_select_by_polygon.html"
			},{
				"name" : "(*)绘制图元",
				"link" : "interaction/interaction_draw.html"
			},{
				"name" : "地图旋转",
				"link" : "interaction/interaction_rotate.html"
			}
		]
	},{
		"name" : "要素图层",
		"items":[
			{
				"name" : "点要素",
				"link" : "feature/feature_point.html"
			},{
				"name" : "(*)线要素",
				"link" : "feature/feature_line.html"
			},{
				"name" : "(*)面要素",
				"link" : "feature/feature_polygon.html"
			},{
				"name" : "(*)加载GeoJSON数据",
				"link" : "feature/feature_geojson.html"
			},{
				"name" : "(*)加载KML数据",
				"link" : "feature/feature_kml.html"
			}
		]
	},{
		"name" : "条件查询",
		"items":[
			{
				"name" : "(*)ID查询",
				"link" : "query/filter_id.html"
			},{
				"name" : "(*)比较查询",
				"link" : "query/filter_binary_comparision.html"
			},{
				"name" : "(*)Between查询",
				"link" : "query/filter_between.html"
			},{
				"name" : "(*)Like查询",
				"link" : "query/filter_like.html"
			},{
				"name" : "(*)IsNull查询",
				"link" : "query/filter_isnull.html"
			},{
				"name" : "(*)逻辑查询",
				"link" : "query/filter_logic.html"
			},{
				"name" : "(*)矩形查询",
				"link" : "query_spatial_bbox.html"
			},{
				"name" : "(*)相交查询",
				"link" : "query_spatial_intersects.html"
			},{
				"name" : "(*)相离查询",
				"link" : "query_spatial_disjoint.html"
			},{
				"name" : "(*)包含查询",
				"link" : "query_spatial_contain.html"
			},{
				"name" : "(*)包含于查询",
				"link" : "query_spatial_within.html"
			},{
				"name" : "(*)周边查询",
				"link" : "query_spatial_dwithin.html"
			},{
				"name" : "(*)设置返回的字段",
				"link" : "query_set_fields.html"
			},{
				"name" : "(*)设置最大的返回的features个数",
				"link" : "query_set_maxfeatures.html"
			},{
				"name" : "(*)设置返回结果的偏移量",
				"link" : "query_set_offset.html"
			},{
				"name" : "(*)设置返回结果排序",
				"link" : "query_set_orderbt.html"
			}
		]
	},{
		"name" : "图层样式",
		"items":[
			{
				"name" : "(*)点样式",
				"link" : "style_point.html"
			},{
				"name" : "(*)线样式",
				"link" : "style_line.html"
			},{
				"name" : "(*)面样式",
				"link" : "style_polygon.html"
			},{
				"name" : "(*)文字样式(点)",
				"link" : "style_text_point.html"
			},{
				"name" : "(*)文字样式(线)",
				"link" : "style_text_line.html"
			},{
				"name" : "(*)文字样式(面)",
				"link" : "style_text_polygon.html"
			}
		]
	},{
		"name" : "专题图",
		"items":[
			{
				"name" : "(*)唯一值图",
				"link" : "theme_unique.html"
			},{
				"name" : "(*)分级样图",
				"link" : "theme_class.html"
			},{
				"name" : "(*)热力图",
				"link" : "theme_heatmap.html"
			},{
				"name" : "(*)点聚合图-示例1",
				"link" : "theme_cluster_1.html"
			},{
				"name" : "(*)点聚合图-示例2",
				"link" : "theme_cluster_2.html"
			},{
				"name" : "(*)点聚合图-示例3",
				"link" : "theme_cluster_2.html"
			},{
				"name" : "(*)分级图",
				"link" : "rangeChart.html"
			},{
				"name" : "(*)柱状图",
				"link" : "chart_bar.html"
			},{
				"name" : "(*)饼状图",
				"link" : "chart_pie.html"
			},{
				"name" : "(*)等级符号图",
				"link" : "chart_symbol.html"
			}
		]
	},{
		"name" : "WFS查询",
		"items":[
			{
				"name" : "(*)点击查询",
				"link" : "layerClickEvent.html"
			},{
				"name" : "(*)缓冲区查询",
				"link" : "wfsBuffer.html"
			},{
				"name" : "(*)拉框查询",
				"link" : "wfsQueryRect.html"
			},{
				"name" : "(*)属性查询",
				"link" : "ComparisionFilterQuery.html"
			},{
				"name" : "(*)空间查询",
				"link" : "spatialFilterQuery.html"
			},{
				"name" : "(*)逻辑查询",
				"link" : "logicFilterQuery.html"
			}
		]
	},{
		"name" : "要素图层查询",
		"items":[
			{
				"name" : "(*)点击查询",
				"link" : "featureLayerClickEvent.html"
			},{
				"name" : "(*)拉框查询",
				"link" : "featureLayerQueryRect.html"
			},{
				"name" : "(*)属性查询",
				"link" : "featureLayerComparisionFilterQuery.html"
			}
		]		
	},{
		"name" : "标注",
		"items":[
			{
				"name" : "(*)marker标注",
				"link" : "marker.html"
			},{
				"name" : "(*)线标注",
				"link" : "polyline.html"
			},{
				"name" : "(*)面标注",
				"link" : "polygon.html"
			},{
				"name" : "(*)文字标注",
				"link" : "label.html"
			},{
				"name" : "(*)infoWindow标注",
				"link" : "infoWindow.html"
			},{
				"name" : "(*)标注操作",
				"link" : "overlay.html"
			}
		]
	},{
		"name" : "标绘",
		"items":[
			{
				"name" : "(*)点线面标绘",
				"link" : "drawOverlay.html"
			},{
				"name" : "(*)标绘&标注点击事件",
				"link" : "overlayClick.html"
			}
		]
	},{
		"name" : "事件",
		"items":[
			{
				"name" : "(*)鼠标移动事件",
				"link" : "event.html"
			},{
				"name" : "(*)拖拽事件",
				"link" : "dragEvent.html"
			},{
				"name" : "(*)鼠标滚动事件",
				"link" : "wheelEvent.html"
			}
		]
	},{
		"name" : "加载KML文件",
		"items":[
			{
				"name" : "(*)点",
				"link" : "kml_point.html"
			},{
				"name" : "(*)线",
				"link" : "kml_line.html"
			},{
				"name" : "(*)面",
				"link" : "kml_polygon.html"
			},{
				"name" : "(*)例子1",
				"link" : "kml_example_1.html"
			},{
				"name" : "(*)例子2",
				"link" : "kml_example_2.html"
			},{
				"name" : "(*)例子3",
				"link" : "kml_example_3.html"
			}
		]
	},{
		"name" : "加载GeoJson文件",
		"items":[
			{
				"name" : "(*)点",
				"link" : "geojson_point.html"
			},{
				"name" : "(*)线",
				"link" : "geojson_line.html"
			},{
				"name" : "(*)面",
				"link" : "geojson_polygon.html"
			},{
				"name" : "(*)例子1",
				"link" : "geojson_example_1.html"
			},{
				"name" : "(*)例子2",
				"link" : "geojson_example_2.html"
			},{
				"name" : "(*)例子3",
				"link" : "geojson_example_3.html"
			}
		]		
	},{
		"name" : "动画",
		"items":[
			{
				"name" : "(*)动画轨迹（未全部实现）",
				"link" : "animation.html"
			},{
				"name" : "(*)动态迁徙图",
				"link" : "geoLineLayer.html"
			}
		]
	}
];
