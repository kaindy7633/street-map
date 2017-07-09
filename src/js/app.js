// 定义全局变量
var map, markers;

// 硬编码地点数据
var localtionList = [
  {title: '天府广场', address:'成都市青羊区人民南路一段86号', position: [104.065767,30.657411]},
  {title: '文殊院', address: '成都市青羊区文殊院街66号', position: [104.072992,30.675133]},
  {title: '宽窄巷子', address: '成都市青羊区金河路口宽窄巷子', position: [104.054205,30.663269]},
  {title: '大熊猫基地', address: '成都市成华区熊猫大道1375号', position: [104.145033,30.737076]},
  {title: '武侯祠', address: '成都市武侯区武侯祠大街231号', position: [104.048123,30.645983]}
];

// 定义ViewModel
var ViewModel = function () {
  var self = this;
  self.name = 'savo';
  self.filter = ko.observable('');
  self.siderVisible = ko.observable(true);

  /**
   * 动态绑定地址列表
   */
  self.filteredLots = ko.computed(function () {
    var res = localtionList.filter(function (lot) {
      return lot.title.toLowerCase().indexOf(self.filter().toLowerCase()) > -1;
    });
    // 更新地图信息
    // updateMarkers(res);
    return res;
  });

  /**
   * 切换侧边栏
   */
  self.toggleSider = function () {
    self.siderVisible(!self.siderVisible());
  }

  /**
   * 点击地点高亮地图上的标记
   */
  self.markLot = function (lot) {

    var _marker = markers[localtionList.indexOf(lot)];
    var newMarker;

    markers.forEach(function(marker) {
      if (marker.title === _marker.title) {
        newMarker = new AMap.Marker({
          map: map,
          icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_r.png",
          position: [marker.position[0], marker.position[1]],
          title: marker.title
          // offset: new AMap.Pixel(-12,-36)
        });
        newMarker.content = marker.title + '<br/>' + marker.address;
          // 为标记绑定 点击事件
        // newMarker.on('click', markerClick);
      } else {
        newMarker = new AMap.Marker({
          map: map,
          icon: "http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png",
          position: [marker.position[0], marker.position[1]],
          title: marker.title
          // offset: new AMap.Pixel(-12,-36)
        });
        newMarker.content = marker.title + '<br/>' + marker.address;
      }
    });

  }
}

// 地图数据初始化
function init(){
  initMap(this.localtionList);
  ko.applyBindings(new ViewModel());
}

// 初始化地图
function initMap (localtionList) {
  // 创建地图对象
  map = new AMap.Map('map', {
    center: [104.072106, 30.663473],
    zoom: 11
  });

  map.plugin(["AMap.ToolBar"], function() {
    // 添加 工具条
    map.addControl(new AMap.ToolBar());
  });

  // 创建标记集合
  markers = localtionList;

  // 创建 默认信息窗体
  var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)});

  // 构建标记
  markers.forEach(function(marker) {
    var newMarker = new AMap.Marker({
      map: map,
      position: [marker.position[0], marker.position[1]],
      title: marker.title
      // offset: new AMap.Pixel(-12,-36)
    });
    newMarker.content = marker.title + '<br/>' + marker.address;
      // 为标记绑定 点击事件
    newMarker.on('click', markerClick);
  });

  // 点击事件方法主体
  function markerClick(e) {
    infoWindow.setContent(e.target.content);
    infoWindow.open(map, e.target.getPosition());
  }

  // 根据地图上添加的覆盖物分布情况，自动缩放地图到合适的视野级别
  map.setFitView();

  //输入提示
  var autoOptions = {
      input: "tipinput"
  };
  var auto = new AMap.Autocomplete(autoOptions);
  var placeSearch = new AMap.PlaceSearch({
      map: map
  });  //构造地点查询类
  AMap.event.addListener(auto, "select", select);//注册监听，当选中某条记录时会触发
  function select(e) {
      placeSearch.setCity(e.poi.adcode);
      placeSearch.search(e.poi.name);  //关键字查询查询
  }
}

// 加载地图失败处理
function mapError () {
  alert('高德地图未能加载成功，请刷新或稍后再试!');
}
