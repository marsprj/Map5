/*!
 * gulp 
 *
 * Warning : 请先安装nodejs、npm、gulp及插件
 * window下本文件的位置为Map5和MapCloud的所在目录，如D:\nginx-1.6.2\html
 * linux下本文件的位置为auge的所在目录，如/opt
 * 在本文件的目录下运行gulp,linux运行需要以管理员身份运行
 *
 * Date: 2015-12-30
 */

var gulp = require("gulp"),
	rename = require("gulp-rename"),
	concat = require("gulp-concat"),
	jshint = require("gulp-jshint"),
	minifycss = require('gulp-minify-css'),
	uglify = require("gulp-uglify");

// 判断运行环境
var os = require("os");
var platform = os.platform();
var linuxPath = "auge/htdocs/";
if(platform == "win32"){
	console.log("platform is win32");
}else if(platform == "linux"){
	console.log("platform is linux");
}else{
	console.log("platform is " + platform);
	return;
}


	// 转换到linux的对应环境
	function changeToLinuxList(path,list){
		if(path == null || list == null){
			return [];
		}
		var l = null;
		var a = [],b = null;
		for(var i = 0; i < list.length; ++i){
			l = list[i];
			b = path + l;
			a.push(b);
		}
		return a;
	}
/***************************************************************************/
/*		 Map5                                                     			*/
/***************************************************************************/

	// 统一压缩Map5
	gulp.task('map5-task',['map5','map5-css'],function(){

	});

	// 压缩Map5
	var map5List = ["Map5/lib/GeoBeans.js",
			"Map5/lib/requestNextAnimationFrame.js", 
			'Map5/lib/GeoBeans/BaseTypes/*.js',
			'Map5/lib/GeoBeans/*.js',
			'Map5/lib/GeoBeans/AQI/*.js',
			'Map5/lib/GeoBeans/Control/*.js',
			'Map5/lib/GeoBeans/Control/*/*.js',
			'Map5/lib/GeoBeans/Filter/*.js',
			'Map5/lib/GeoBeans/Filter/*/*.js',
			'Map5/lib/GeoBeans/Geometry/*.js',
			'Map5/lib/GeoBeans/Geometry/*/*.js',
			'Map5/lib/GeoBeans/Label/*.js',
			'Map5/lib/GeoBeans/Animation/*.js',
			'Map5/lib/GeoBeans/Layer/DBLayer.js',
			'Map5/lib/GeoBeans/Layer/FeatureDBLayer.js',
			'Map5/lib/GeoBeans/Layer/RasterDBLayer.js',
			'Map5/lib/GeoBeans/Layer/GroupLayer.js',
			'Map5/lib/GeoBeans/Layer/FeatureLayer.js',
			'Map5/lib/GeoBeans/Layer/ChartLayer.js',
			'Map5/lib/GeoBeans/Layer/MapLayer.js',
			'Map5/lib/GeoBeans/Layer/OverlayLayer.js',
			'Map5/lib/GeoBeans/Layer/PanoramaLayer.js',
			'Map5/lib/GeoBeans/Layer/QueryLayer.js',
			'Map5/lib/GeoBeans/Layer/Tile.js',
			'Map5/lib/GeoBeans/Layer/TileCache.js',
			'Map5/lib/GeoBeans/Layer/TileLayer.js',
			'Map5/lib/GeoBeans/Layer/WFSLayer.js',
			'Map5/lib/GeoBeans/Layer/WMSLayer.js',
			'Map5/lib/GeoBeans/Layer/ImageLayer.js',
			'Map5/lib/GeoBeans/Layer/GeoLineLayer.js',
			'Map5/lib/GeoBeans/Layer/RippleLayer.js',
			'Map5/lib/GeoBeans/Layer/AirlineLayer.js',
			'Map5/lib/GeoBeans/Layer/AnimationLayer.js',
			'Map5/lib/GeoBeans/Layer/*/*.js',
			'Map5/lib/GeoBeans/Overlay/*.js',
			'Map5/lib/GeoBeans/Style/*.js',
			'Map5/lib/GeoBeans/WFS/*.js',
			'Map5/lib/GeoBeans/WMS/*.js',
			'Map5/lib/GeoBeans/WMTS/*.js',
			'Map5/lib/GeoBeans/Manager/*.js',
			'Map5/lib/GeoBeans/Manager/*/*.js',
			];
	var map5Dest = 'Map5/lib/';	
	if(platform == "linux"){
		map5List = changeToLinuxList(linuxPath,map5List);
		map5Dest = linuxPath + map5Dest;
	}
	gulp.task('map5',function(){
		return gulp.src(map5List)
			.pipe(uglify())
			.pipe(concat('Map5.min.js'))
			.pipe(gulp.dest(map5Dest));		
	});



	// 压缩Map5 css
	var map5cssList = ['Map5/css/Map5.css'];
	var map5cssDest = 'Map5/css';
	if(platform == "linux"){
		map5cssList = changeToLinuxList(linuxPath,map5cssList);
		map5cssDest = linuxPath + map5cssDest;
	}
	gulp.task('map5-css',function(){
		return gulp.src(map5cssList)
			.pipe(minifycss())
			.pipe(rename('Map5.min.css'))
			.pipe(gulp.dest(map5cssDest));
	});


/***************************************************************************/
/*		 Earth                                                     			*/
/***************************************************************************/
	// 统一压缩Earth
	gulp.task('earth-task',['earth-js','earth-css'],function(){

	});

	// 压缩Earth
	var earthList = ["MapCloud/Earth/js/RadiEarth1.js",
			"MapCloud/Earth/js/view_init.js",
			'MapCloud/Earth/js/SearchPanel.js',
			'MapCloud/Earth/js/CurrentCityPanel.js',
			'MapCloud/Earth/js/CityPanel.js',
			'MapCloud/Earth/js/AQIChartDialog.js',
			'MapCloud/Earth/js/PositionControl.js',
			'MapCloud/Earth/js/PositionPanel.js',
			'MapCloud/Earth/js/CityPosition.js',
			'MapCloud/Earth/js/RangeChart.js',
			'MapCloud/Earth/js/TopicPanel.js',
			'MapCloud/Earth/js/ProjectPanel.js',
			'MapCloud/Earth/js/AQIChart.js',
			'MapCloud/Earth/js/AQIChart.js',
			'MapCloud/Earth/js/AQITimeLineBar.js',
			'MapCloud/Earth/js/AQITimeLineChart.js',
			'MapCloud/Earth/js/AQITimeList.js',
			'MapCloud/Earth/js/AQITimeLinePanel.js',
			'MapCloud/Earth/js/AQI24TimeLinePanel.js',
			'MapCloud/Earth/js/ChartPanel.js',
			'MapCloud/Earth/js/AddressService.js',
			];
	var earthDest = 'MapCloud/Earth/js/';
	if(platform == "linux"){
		earthList = changeToLinuxList(linuxPath, earthList);
		earthDest = linuxPath + earthDest;
	}
	gulp.task('earth-js',function(){
		return gulp.src(earthList)
			.pipe(uglify())
			.pipe(concat('earth.min.js'))
			.pipe(gulp.dest(earthDest));
	});

	
	// 压缩Earth css
	var earthCssList = ["MapCloud/Earth/css/radi_earth.css"];
	var earthCssDest = "MapCloud/Earth/css";
	if(platform == "linux"){
		earthCssList = changeToLinuxList(linuxPath,earthCssList);
		earthCssDest = linuxPath + earthCssDest;
	}
	gulp.task('earth-css',function(){
		return gulp.src(earthCssList)
			.pipe(minifycss())
			.pipe(rename('radi_earth.min.css'))
			.pipe(gulp.dest(earthCssDest));
	});

/***************************************************************************/
/*		 Common                                                     		*/
/***************************************************************************/
	// 统一压缩公有的
	gulp.task('common-task',['common-js','common-css'],function(){

	});

	// 压缩公有 css
	var commonCssList = ['MapCloud/css/common.css'];
	var commonCssDest = 'MapCloud/css';
	if(platform == "linux"){
		commonCssList = changeToLinuxList(linuxPath,commonCssList);
		commonCssDest = linuxPath + commonCssDest;
	}
	gulp.task('common-css',function(){
		return gulp.src(commonCssList)
			.pipe(minifycss())
			.pipe(rename('common.min.css'))
			.pipe(gulp.dest(commonCssDest));
	});

	// 压缩公有的js
	var commonJsList = ["MapCloud/js/MapCloud.js",
			"MapCloud/js/Class/Class.js",
			"MapCloud/js/Cookie.js",
			'MapCloud/js/CityPosition.js',
			'MapCloud/js/Control/*.js',
			'MapCloud/js/Control/*/*.js'
			];
	var commonJsDest = 'MapCloud/js';
	if(platform == "linux"){
		commonJsList = changeToLinuxList(linuxPath,commonJsList);
		commonJsDest = linuxPath + commonJsDest;
	}
	gulp.task('common-js',function(){
		return gulp.src(commonJsList)
			.pipe(uglify())
			.pipe(concat('common.min.js'))
			.pipe(gulp.dest(commonJsDest));
	});

/***************************************************************************/
/*		 Editor                                                     		*/
/***************************************************************************/
	// 统一压缩Editor
	gulp.task('editor-task',['editor-js','editor-css'],function(){

	});

	// 压缩Editor的js
	var editorJsList = ["MapCloud/Editor/js/global.js",
			"MapCloud/Editor/js/init.js",
			"MapCloud/Editor/js/Control/**/*js"
			];
	var editorJsDest = 'MapCloud/Editor/js';
	if(platform == "linux"){
		editorJsList = changeToLinuxList(linuxPath,editorJsList);
		editorJsDest = linuxPath + editorJsDest;
	}
	gulp.task('editor-js',function(){
		return gulp.src(editorJsList)
			.pipe(uglify())
			.pipe(concat('Editor.min.js'))
			.pipe(gulp.dest(editorJsDest));
	});	

	// 压缩MapEditor css
	var editorCssList = ['MapCloud/css/mc-new.css'];
	var editorCssDest = 'MapCloud/css';
	if(platform == "linux"){
		editorCssList = changeToLinuxList(linuxPath,editorCssList);
		editorCssDest = linuxPath + editorCssDest;
	}
	gulp.task('editor-css',function(){
		return gulp.src(editorCssList)
			.pipe(minifycss())
			.pipe(rename('mc-new.min.css'))
			.pipe(gulp.dest(editorCssDest));
	});

/***************************************************************************/
/*		 User                                                     		*/
/***************************************************************************/
	// 统一压缩User
	gulp.task('user-task',['user-css','user-index','user-info','user-subscribe','user-map',
		'user-file','user-vector','user-raster','user-tile','user-service'],function(){

	});
	
	// 压缩User css
	var userCssList = ['MapCloud/User/css/mc-user.css'];
	var userCssDest = 'MapCloud/User/css';
	if(platform == "linux"){
		userCssList = changeToLinuxList(linuxPath, userCssList);
		userCssDest = linuxPath + userCssDest;
	}
	gulp.task('user-css',function(){
		return gulp.src(userCssList)
			.pipe(minifycss())
			.pipe(rename('mc-user.min.css'))
			.pipe(gulp.dest(userCssDest));		
	});

	// 压缩User index
	var userIndexList = ['MapCloud/User/js/mc-user-catalog.js',
			'MapCloud/User/js/mc-account-panel.js',
			'MapCloud/User/js/mc-user.js'];
	var userIndexDest = 'MapCloud/User/js';
	if(platform == "linux"){
		userIndexList = changeToLinuxList(linuxPath, userIndexList);
		userIndexDest = linuxPath + userIndexDest;
	}
	gulp.task('user-index',function(){
		return gulp.src(userIndexList)
			.pipe(uglify())
			.pipe(concat('mc-user.min.js'))
			.pipe(gulp.dest(userIndexDest));
	});

	// 压缩User info
	var userInfoList = ["MapCloud/User/js/mc-user-info.js",
			"MapCloud/User/js/mc-user-panel.js"
			];
	var userInfoDest = 'MapCloud/User/js';
	if(platform == "linux"){
		userInfoList = changeToLinuxList(linuxPath,userInfoList);
		userInfoDest = linuxPath + userInfoDest;
	}
	gulp.task('user-info',function(){
		return gulp.src(userInfoList)
			.pipe(uglify())
			.pipe(concat('mc-user-info.min.js'))
			.pipe(gulp.dest(userInfoDest));
	});	

	// 压缩User subscribe 
	var userSubList = ['MapCloud/User/js/mc-user-subscribe.js',
			'MapCloud/User/js/mc-sub-panel.js'];
	var userSubDest = 'MapCloud/User/js';
	if(platform == "linux"){
		userSubList = changeToLinuxList(linuxPath,userSubList);
		userSubDest = linuxPath + userSubDest;
	}
	gulp.task('user-subscribe',function(){
		return gulp.src(userSubList)
			.pipe(uglify())
			.pipe(concat('mc-user-subscribe.min.js'))
			.pipe(gulp.dest(userSubDest));
	});

	// 压缩User map
	var  userMapList = ['MapCloud/User/js/mc-user-map.js'];
	var userMapDest = 'MapCloud/User/js';
	if(platform == "linux"){
		userMapList = changeToLinuxList(linuxPath,userMapList);
		userMapDest = linuxPath + userMapDest;
	}
	gulp.task('user-map',function(){
		return gulp.src(userMapList)
			.pipe(uglify())
			.pipe(rename('mc-user-map.min.js'))
			.pipe(gulp.dest(userMapDest));
	});

	// 压缩User file
	var userFileList =  ['MapCloud/User/js/mc-user-file.js',
			'MapCloud/User/js/mc-file-panel.js'];
	var userFileDest = 'MapCloud/User/js';
	if(platform == "linux"){
		userFileList = changeToLinuxList(linuxPath, userFileList);
		userFileDest = linuxPath + userFileDest;
	}
	gulp.task('user-file',function(){
		return gulp.src(userFileList)
			.pipe(uglify())
			.pipe(concat('mc-user-file.min.js'))
			.pipe(gulp.dest(userFileDest));
	});

	// 压缩User vector 
	var userVectorList = ['MapCloud/User/js/mc-user-vector.js',
			'MapCloud/User/js/mc-vector-panel.js'];
	var userVecotrDest = 'MapCloud/User/js';
	if(platform == "linux"){
		userVectorList = changeToLinuxList(linuxPath,userVectorList);
		userVecotrDest = linuxPath + userVecotrDest;
	}
	gulp.task('user-vector',function(){
		return gulp.src(userVectorList)
			.pipe(uglify())
			.pipe(concat('mc-user-vector.min.js'))
			.pipe(gulp.dest(userVecotrDest));
	});

	// 压缩User raster 
	var userRasterList = ['MapCloud/User/js/mc-user-raster.js',
			'MapCloud/User/js/mc-raster-panel.js'];
	var userRasterDest = 'MapCloud/User/js';
	if(platform == "linux"){
		userRasterList = changeToLinuxList(linuxPath,userRasterList);
		userRasterDest = linuxPath + userRasterDest;
	}
	gulp.task('user-raster',function(){
		return gulp.src(userRasterList)
			.pipe(uglify())
			.pipe(concat('mc-user-raster.min.js'))
			.pipe(gulp.dest(userRasterDest));
	});

	// 压缩User tile 
	var userTileList = ['MapCloud/User/js/mc-user-tile.js',
			'MapCloud/User/js/mc-tile-panel.js'];
	var userTileDest = 'MapCloud/User/js';
	if(platform == "linux"){
		userTileList = changeToLinuxList(linuxPath,userTileList);
		userTileDest = linuxPath + userTileDest;
	}
	gulp.task('user-tile',function(){
		return gulp.src(userTileList)
			.pipe(uglify())
			.pipe(concat('mc-user-tile.min.js'))
			.pipe(gulp.dest(userTileDest));
	});

	// 压缩User service 
	var userServiceList = ['MapCloud/User/js/mc-user-service.js',
			'MapCloud/User/js/mc-service-panel.js'];
	var userServiceDest = 'MapCloud/User/js';
	if(platform == "linux"){
		userServiceList = changeToLinuxList(linuxPath,userServiceList);
		userServiceDest = linuxPath + userServiceDest;
	}
	gulp.task('user-service',function(){
		return gulp.src(userServiceList)
			.pipe(uglify())
			.pipe(concat('mc-user-service.min.js'))
			.pipe(gulp.dest(userServiceDest));
	});

/***************************************************************************/
/*		 Admin                                                     		*/
/***************************************************************************/
	// 统一Admin压缩
	gulp.task('admin-task',['admin-index','admin-css','admin-users','admin-data',
		'admin-ha','admin-use','admin-job'],function(){

	});

	// 压缩Amidn index
	var adminIndexList = ['MapCloud/Admin/js/mc-admin-catalog.js',
			'MapCloud/Admin/js/mc-admin.js',
			'MapCloud/Admin/js/mc-account-panel.js'];
	var adminIndexDest = 'MapCloud/Admin/js';
	if(platform == "linux"){
		adminIndexList = changeToLinuxList(linuxPath,adminIndexList);
		adminIndexDest = linuxPath + adminIndexDest;
	}
	gulp.task('admin-index',function(){
		return gulp.src(adminIndexList)
			.pipe(uglify())
			.pipe(concat('mc-admin.min.js'))
			.pipe(gulp.dest(adminIndexDest));
	});

	// 压缩Amidn css
	var amdinCssList = ['MapCloud/Admin/css/mc-admin.css'];
	var adminCssDest = 'MapCloud/Admin/css';
	if(platform == "linux"){
		amdinCssList = changeToLinuxList(linuxPath,amdinCssList);
		adminCssDest = linuxPath + adminCssDest;
	}
	gulp.task('admin-css',function(){
		return gulp.src(amdinCssList)
			.pipe(minifycss())
			.pipe(rename('mc-admin.min.css'))
			.pipe(gulp.dest(adminCssDest));		
	});

	// 压缩Amidn users 
	var adminUsersList = ['MapCloud/Admin/js/mc-admin-user.js',
			'MapCloud/Admin/js/mc-user-panel.js'];
	var adminUsersDest = 'MapCloud/Admin/js';
	if(platform == "linux"){
		adminUsersList = changeToLinuxList(linuxPath,adminUsersList);
		adminUsersDest = linuxPath + adminUsersDest;
	}
	gulp.task('admin-users',function(){
		return gulp.src(adminUsersList)
			.pipe(uglify())
			.pipe(concat('mc-admin-user.min.js'))
			.pipe(gulp.dest(adminUsersDest));
	});	

	// 压缩Amidn data
	var adminDataList = ['MapCloud/Admin/js/mc-admin-data.js',
			'MapCloud/Admin/js/mc-data-panel.js'];
	var adminDataDest = 'MapCloud/Admin/js';
	if(platform == "linux"){
		adminDataList = changeToLinuxList(linuxPath,adminDataList);
		adminDataDest = linuxPath + adminDataDest;
	}
	gulp.task('admin-data',function(){
		return gulp.src(adminDataList)
			.pipe(uglify())
			.pipe(concat('mc-admin-data.min.js'))
			.pipe(gulp.dest(adminDataDest));
	});	

	// 压缩Admin ha
	var adminFaList = ['MapCloud/Admin/js/mc-admin-ha.js',
			'MapCloud/Admin/js/mc-ha-panel.js'];
	var adminFaDest = 'MapCloud/Admin/js';
	if(platform == "linux"){
		adminFaList = changeToLinuxList(linuxPath,adminFaList);
		adminFaDest = linuxPath + adminFaDest;
	}
	gulp.task('admin-ha',function(){
		return gulp.src(adminFaList)
			.pipe(uglify())
			.pipe(concat('mc-admin-ha.min.js'))
			.pipe(gulp.dest(adminFaDest));
	});	

	// 压缩Admin use
	var adminUseList = ['MapCloud/Admin/js/mc-admin-use.js',
			'MapCloud/Admin/js/mc-use-panel.js'];
	var adminUseDest = 'MapCloud/Admin/js';
	if(platform == "linux"){
		adminUseList = changeToLinuxList(linuxPath,adminUseList);
		adminUseDest = linuxPath + adminUseDest;
	}
	gulp.task('admin-use',function(){
		return gulp.src(adminUseList)
			.pipe(uglify())
			.pipe(concat('mc-admin-use.min.js'))
			.pipe(gulp.dest(adminUseDest));
	});		

	// 压缩Admin job
	var adminJobList = ['MapCloud/Admin/js/mc-admin-job.js',
			'MapCloud/Admin/js/mc-job-panel.js'];
	var adminJobDest = 'MapCloud/Admin/js';
	if(platform == "linux"){
		adminJobList = changeToLinuxList(linuxPath,adminJobList);
		adminJobDest = linuxPath + adminJobDest;
	}
	gulp.task('admin-job',function(){
		return gulp.src(adminJobList)
			.pipe(uglify())
			.pipe(concat('mc-admin-job.min.js'))
			.pipe(gulp.dest(adminJobDest));
	});		

/***************************************************************************/
/*		 Guoan                                                     		*/
/***************************************************************************/
	// 统一压缩guoan
	gulp.task('guoan-task',['guoan-css','guoan-js'],function(){

	});

	// 压缩Guoan css
	var guoanCssList = ['MapCloud/Guoan/css/guoan.css'];
	var guoanCssDest = 'MapCloud/Guoan/css';
	if(platform == "linux"){
		guoanCssList = changeToLinuxList(linuxPath,guoanCssList);
		guoanCssDest = linuxPath + guoanCssDest;
	}
	gulp.task('guoan-css',function(){
		return gulp.src(guoanCssList)
			.pipe(minifycss())
			.pipe(rename('guoan.min.css'))
			.pipe(gulp.dest(guoanCssDest));		
	});

	// 压缩Guoan index
	var guoanJsList = ['MapCloud/Guoan/js/init.js',
			'MapCloud/Guoan/js/SearchPanel.js',
			'MapCloud/Guoan/js/BaseLayerPanel.js',
			'MapCloud/Guoan/js/MapBar.js',
			'MapCloud/Guoan/js/QueryResultPanel.js',
			'MapCloud/Guoan/js/MapLayersPanel.js',
			'MapCloud/Guoan/js/CurrentCityPanel.js',
			'MapCloud/Guoan/js/CityPanel.js',
			'MapCloud/Guoan/js/PositionControl.js'];
	var guoanJsDest = 'MapCloud/Guoan/js';
	if(platform == "linux"){
		guoanJsList = changeToLinuxList(linuxPath,guoanJsList);
		guoanJsDest = linuxPath + guoanJsDest;
	}
	gulp.task('guoan-js',function(){
		return gulp.src(guoanJsList)
			.pipe(uglify())
			.pipe(concat('guoan.min.js'))
			.pipe(gulp.dest(guoanJsDest));
	});		

	// 所有
	gulp.task('all-task',['map5-task','earth-task','common-task','editor-task',
		'user-task','admin-task'],function(){

	});
	gulp.task('default',['map5-task'],function(){

	});