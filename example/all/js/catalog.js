var g_catalog = [
	{
		"name": "地图",
		"items":[
			{
				"name" : "初始化地图",
				"link" : "map/map_init.html"
			}/*,{
				"name" : "(*)关闭地图",
				"link" : "map/map_close.html"
			},{
				"name" : "(*)拖拽地图",
				"link" : "map/map_drag.html"
			},{
				"name" : "(*)滚轮缩放",
				"link" : "map/map_scroll.html"
			}*/,{
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
			}/*,{
				"name" : "(*)鹰眼（待实现）",
				"link" : "control/control_hawk.html"
			},{
				"name" : "(*)比例尺（待实现）",
				"link" : "control/control_scalebar.html"
			},{
				"name" : "(*)图例（待补充）",
				"link" : "control/control_legend.html"
			}*/,{
				"name" : "版权",
				"link" : "control/control_copyright.html"
			},{
				"name" : "图层面板",
				"link" : "control/control_layerpanel.html"	
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
				"name" : "TMS图层",
				"link" : "layer/layer_add_tms.html"
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
				"name" : "高德图层",
				"link" : "layer/layer_add_amap.html"
			}/*,{
				"name" : "(*)百度图层",
				"link" : "layer/layer_add_baidu.html"
			}*/,{
				"name" : "天地图层",
				"link" : "layer/layer_add_mapworld.html"
			},{
				"name" : "OSM图层",
				"link" : "layer/layer_add_osm.html"
			},{
				"name" : "ArcGIS Online图层",
				"link" : "layer/layer_add_arcgisonline.html"
			}/*,{
				"name" : "(*)Bing图层(待实现)",
				"link" : "layer/layer_add_bing.html"
			}*/,{
				"name" : "GeoJSON图层",
				"link" : "layer/layer_add_geojson.html"
			},{
				"name" : "KML图层",
				"link" : "layer/layer_add_kml.html"
			}
		]
	},{
		"name" : "图层控制",
		"items":[
			{
				"name" : "删除图层",
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
		"name" : "数据源",
		"items":[
			{
				"name" : "GeoJSON",
				"link" : "source/geojson.html"
			},
			{
				"name" : "WFS",
				"link" : "source/source_wfs.html"
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
				"name" : "查询(线)",
				"link" : "interaction/interaction_select_by_line.html"
			},{
				"name" : "查询(多边形)",
				"link" : "interaction/interaction_select_by_polygon.html"
			},{
				"name" : "绘制图元",
				"link" : "interaction/interaction_draw.html"
			},{
				"name" : "地图旋转",
				"link" : "interaction/interaction_rotate.html"
			},{
				"name" : "拾取",
				"link" : "interaction/interaction_hit.html"
			}
		]
	},{
		"name" : "要素图层",
		"items":[
			{
				"name" : "点要素",
				"link" : "feature/feature_point.html"
			},{
				"name" : "线要素",
				"link" : "feature/feature_line.html"
			},{
				"name" : "面要素",
				"link" : "feature/feature_polygon.html"
			}/*,{
				"name" : "(*)加载GeoJSON数据",
				"link" : "feature/feature_geojson.html"
			},{
				"name" : "(*)加载KML数据",
				"link" : "feature/feature_kml.html"
			}*/
		]
	},{
		"name" : "条件查询",
		"items":[
			{
				"name" : "(*)ID查询",
				"link" : "query/filter_id.html"
			},{
				"name" : "二元比较查询",
				"link" : "query/filter_binary_comparision.html"
			},{
				"name" : "Between查询",
				"link" : "query/filter_between.html"
			},{
				"name" : "Like查询",
				"link" : "query/filter_like.html"
			},{
				"name" : "IsNull查询",
				"link" : "query/filter_isnull.html"
			},{
				"name" : "逻辑查询",
				"link" : "query/filter_logic.html"
			},{
				"name" : "矩形查询",
				"link" : "query/query_spatial_bbox.html"
			},{
				"name" : "相交查询",
				"link" : "query/query_spatial_intersects.html"
			},{
				"name" : "相离查询",
				"link" : "query/query_spatial_disjoint.html"
			},{
				"name" : "包含查询",
				"link" : "query/query_spatial_contain.html"
			},{
				"name" : "包含于查询",
				"link" : "query/query_spatial_within.html"
			},{
				"name" : "周边查询",
				"link" : "query/query_spatial_dwithin.html"
			},{
				"name" : "设置返回的字段",
				"link" : "query/query_set_fields.html"
			},{
				"name" : "设置最大的返回的features个数",
				"link" : "query/query_set_maxfeatures.html"
			},{
				"name" : "(*)设置返回结果的偏移量",
				"link" : "query_set_offset.html"
			},{
				"name" : "(*)设置返回结果排序",
				"link" : "query/query_set_orderby.html"
			}
		]
	},{

		"name" : "交互式查询",

		"items":[

			{

				"name" : "点击查询",

				"link" : "interaction/interaction_select_by_click.html"

			},{

				"name" : "缓冲区查询",

				"link" : "interaction/interaction_select_by_circle.html"

			},{
				"name" : "拉框查询",
				"link" : "interaction/interaction_select_by_rect.html"
			}
		]
	},{
		"name" : "图层样式",
		"items":[
			{
				"name" : "点样式(简单)",
				"link" : "style/style_simple_point.html"
			},{
				"name" : "点样式(图片)",
				"link" : "style/style_pic_point.html"
			},{
				"name" : "线样式(简单)",
				"link" : "style/style_simple_line.html"
			},{
				"name" : "面样式(简单)",
				"link" : "style/style_simple_polygon.html"
			},{
				"name" : "(*)面样式(填充)",
				"link" : "style/style_fill_polygon.html"
			},{
				"name" : "文字样式(点)",
				"link" : "style/style_text_point.html"
			}/*,{
				"name" : "(*)文字样式(线)",
				"link" : "style/style_text_line.html"
			},{
				"name" : "(*)文字样式(面)",
				"link" : "style/style_text_polygon.html"
			}*/
		]
	}/*,{
		"name" : "图层样式(服务端)",
		"items":[
			{
				"name" : "(*)点样式(简单)",
				"link" : "style/style_simple_point.html"
			},{
				"name" : "(*)点样式(图片)",
				"link" : "style/style_pic_point.html"
			},{
				"name" : "(*)线样式(简单)",
				"link" : "style/style_simple_line.html"
			},{
				"name" : "(*)面样式(简单)",
				"link" : "style/style_simple_polygon.html"
			},{
				"name" : "(*)面样式(填充)",
				"link" : "style/style_fill_polygon.html"
			},{
				"name" : "(*)文字样式(点)",
				"link" : "style/style_text_point.html"
			},{
				"name" : "(*)文字样式(线)",
				"link" : "style/style_text_line.html"
			},{
				"name" : "(*)文字样式(面)",
				"link" : "style/style_text_polygon.html"
			}
		]
	}*/,{
		"name" : "专题图",
		"items":[
			{
				"name" : "(*)唯一值图",
				"link" : "theme/theme_unique.html"
			},{
				"name" : "分级图(前端)",
				"link" : "theme/theme_class_c.html"
			},{
				"name" : "(*)分级图(后端)",
				"link" : "theme/theme_class_s.html"
			},{
				"name" : "热力图",
				"link" : "theme/theme_heatmap.html"
			},{
				"name" : "点聚合图",

				"link" : "theme/theme_cluster_1.html"

			}/*,{
				"name" : "点聚合图-示例1",
				"link" : "theme/theme_cluster_1.html"
			},{
				"name" : "(*)点聚合图-示例2",
				"link" : "theme/theme_cluster_2.html"
			},{
				"name" : "(*)点聚合图-示例3",
				"link" : "theme/theme_cluster_2.html"
			}*/,{
				"name" : "柱状图",
				"link" : "theme/chart_bar.html"
			},{
				"name" : "饼状图",
				"link" : "theme/chart_pie.html"
			},{
				"name" : "等级符号图",
				"link" : "theme/chart_symbol.html"
			}
		]
	},/*{
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
				"name" : "(*)点标注",
				"link" : "label/label_marker.html"
			},{
				"name" : "(*)线标注",
				"link" : "label/label_line.html"
			},{
				"name" : "(*)面标注",
				"link" : "label/label_polygon.html"
			},{
				"name" : "(*)文字标注(点)",
				"link" : "label/label_text_point.html"
			},{
				"name" : "(*)文字标注(线)",
				"link" : "label/label_text_line.html"
			},{
				"name" : "(*)文字标注(面)",
				"link" : "label/label_text_polygon.html"
			},{
				"name" : "(*)碰撞检测",
				"link" : "label/label_collision.html"
			},{
				"name" : "(*)标注信息窗",
				"link" : "label/label_infoWindow.html"
			},{
				"name" : "(*??)标注操作",
				"link" : "overlay.html"
			},{
				"name" : "(*)事件(点击)",
				"link" : "label/event_click.html"
			},{
				"name" : "(*)事件(hover)",
				"link" : "label/event_hover.html"
			}
		]
	},*/{
		"name" : "添加要素",
		"items":[
			{
				"name" : "点",
				"link" : "feature/add_point.html"
			},{
				"name" : "线",
				"link" : "feature/add_line.html"
			},{
				"name" : "面",
				"link" : "feature/add_polygon.html"
			},{
				"name" : "Marker",
				"link" : "feature/add_marker.html"
			},{
				"name" : "(*)标绘&标注点击事件",
				"link" : "overlayClick.html"
			}
		]
	},{
		"name" : "标绘",
		"items":[
			{
				"name" : "点",
				"link" : "feature/add_point.html"
			},{
				"name" : "Marker",
				"link" : "feature/add_marker.html"
			},{
				"name" : "动态标绘",
				"link" : "interaction/interaction_draw.html"
			},{
				"name" : "(*)标绘&标注点击事件",
				"link" : "overlayClick.html"
			}
		]
	},{
		"name" : "地图事件",
		"items":[
			{
				"name" : "单击事件",
				"link" : "event/map_click.html"
			},{
				"name" : "双击事件",
				"link" : "event/map_dbclick.html"
			},{
				"name" : "鼠标按下事件",
				"link" : "event/map_mouse_down.html"
			},{
				"name" : "鼠标抬起事件",
				"link" : "event/map_mouse_up.html"
			},{
				"name" : "鼠标移动事件",
				"link" : "event/map_mouse_move.html"
			},{
				"name" : "鼠标滚动事件",
				"link" : "event/map_mouse_wheel.html"
			},{
				"name" : "地图拖拽事件",
				"link" : "event/map_drag.html"
			}
		]
	}/*,{
		"name" : "数据源事件",
		"items":[
			{
				"name" : "(*)Image加载开始事件",
				"link" : "event/image_load_start.html"
			},{
				"name" : "(*)Image加载成功事件",
				 "link" : "event/image_load_end.html"
			},{
				"name" : "(*)Image加载错误事件",
				"link" : "event/image_load_error.html"
			},{
				"name" : "(*)Image加载开始事件",
				"link" : "event/image_load_start.html"
			},{
				"name" : "(*)Image加载成功事件",
				 "link" : "event/image_load_end.html"
			},{
				"name" : "(*)Image加载错误事件",
				"link" : "event/image_load_error.html"
			},
		]
	}/*,{
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
	}*/,{
		"name" : "格式转换",
		"items":[
			{
				"name" : "(*)WKT<-->Geometry",
				"link" : "format/wkt.html"
			},{
				"name" : "(*)GML<-->Geometry",
				"link" : "format_gmal.html"
			},{
				"name" : "(*)KML<-->Geometry",
				"link" : "format/kml.html"
			},{
				"name" : "(*)GeoJSON<-->Geometry",
				"link" : "format/geojson.html"
			}
		]
	},{
		"name" : "投影变换",
		"items":[
			{
				"name" : "坐标转换",
				"link" : "proj/coordinate.html"
			}
		]
	},{
		"name" : "动画",
		"items":[
			{
				"name" : "动画轨迹",
				"link" : "animation/animation_layer.html"
			},{
				"name" : "动态迁徙图",
				"link" : "animation/animation_geoline_layer.html"
			},{
				"name" : "波纹图",
				"link" : "animation/animation_ripple_layer.html"
			},{
				"name" : "轨迹线",
				"link" : "animation/animation_path_layer.html"
			}
		]
	}
];
