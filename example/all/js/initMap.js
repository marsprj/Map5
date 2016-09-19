function loadMap(){
		
	// 1、设置地图的范围
	var extent = new GeoBeans.Envelope(-180,-90,180,90);
	
	// 2、初始化地图变量，参数分别为:
	// 地图的容器为"mapDiv",地图名称"map"，地图范围，地图的空间参考，4326为经纬度
	mapObj = new GeoBeans.Map("mapDiv","map",extent,4326);
	if(mapObj == null){
		return;
	}
	
	// 3、添加一个底图
	// 定义一个QuadServer图层，作为底图，第一个参数为图层名称，第二个参数为QuadServer地址
	var baselayer = new GeoBeans.Layer.QSLayer("base","/QuadServer/maprequest?services=world_vector");
	mapObj.addLayer(baselayer);
	var server = "/geoserver/radi/ows?";
	// 2、定义WFS图层
	wfsLayer = new GeoBeans.Layer.WFSLayer("country", 		//在地图中的名称
												server, 		//服务器
												"radi:country_2", //图层在geoserver的名称
												"GML2"); 		// 格式
	mapObj.addLayer(wfsLayer);



	// 5、设置中心点和显示级别
	var zoom = 3;
	var center = new GeoBeans.Geometry.Point(0,0);
	var viewer = mapObj.getViewer();	
	viewer.setZoomCenter(zoom,center);
}