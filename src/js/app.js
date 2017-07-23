// 定义全局变量
var map, markers = [];

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
  self.filter = ko.observable('');
  self.siderVisible = ko.observable(true);
  self.city = ko.observable('');
  self.date = ko.observable('');
  self.weather = ko.observable('');   // 天气API
  var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)});

  /**
   * 动态绑定地址列表
   */
  self.filteredLots = ko.computed(function () {
    var res = localtionList.filter(function (lot) {
      return lot.title.toLowerCase().indexOf(self.filter().toLowerCase()) > -1;
    });

    markers.forEach(function (data) {
      data.setMap(null);
    });

    infoWindow.close();

    for (var i = 0, marker; i < res.length; i++) {
      // console.log(res);
      marker = new AMap.Marker({
        map: map,
        icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
        position: [res[i].position[0], res[i].position[1]],
      });
      marker.content = res[i].title + '<br/>' + res[i].address;
      marker.on('click', markerClick);
      markers.push(marker);
    }

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

    if (!self.filter()) {
      for (var i = 0, marker; i < localtionList.length; i++) {
        if (lot.title === localtionList[i].title) {
          marker = new AMap.Marker({
            map: map,
            icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
            position: [localtionList[i].position[0], localtionList[i].position[1]],
          });
        } else {
          marker = new AMap.Marker({
            map: map,
            icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
            position: [localtionList[i].position[0], localtionList[i].position[1]],
          });
        }

        marker.content = localtionList[i].title + '<br/>' + localtionList[i].address;
        marker.on('click', markerClick);
        markers.push(marker);

        if (lot.title === localtionList[i].title) {
          infoWindow.setContent(marker.content);
          infoWindow.open(map, marker.getPosition());
        }
      }
    } else {
      var _data = self.filteredLots();
      for (var i = 0, marker; i < _data.length; i++) {
        marker = new AMap.Marker({
          map: map,
          icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
          position: [_data[i].position[0], _data[i].position[1]],
        });

        marker.content = _data[i].title + '<br/>' + _data[i].address;
        marker.on('click', markerClick);
        markers.push(marker);

        infoWindow.setContent(marker.content);
        infoWindow.open(map, marker.getPosition());
      }
    }



  }

  // 点击事件方法主体
  function markerClick(e) {
    infoWindow.setContent(e.target.content);
    infoWindow.open(map, e.target.getPosition());
  }

  // 记载第三方天气API
  self.getLocalWeather = (function() {
    $.getScript('http://php.weather.sina.com.cn/iframe/index/w_cl.php?code=js&day=0&city=成都&dfc=1&charset=utf-8')
    .done(function () {
      var s="", r="", q="";
      for(s in window.SWther.w){
        q = SWther.w[s][0];
        r = {
          city: s,
          date: window.SWther.add.now.split(" ")[0] || "",
          day_weather: q.s1,
          night_weather: q.s2,
          day_temp: q.t1,
          night_temp: q.t2,
          day_wind: q.p1,
          night_wind: q.p2
        }
      }

      self.city(r.city);
      self.date(r.date);
      self.weather(r.day_weather);
    })
    .fail(function () {
      alert('新浪天气API接口调用失败，请稍后再试！');
    });
  }());
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
    resizeEnable: true,
    center: [104.072106, 30.663473],
    zoom: 13
  });

  map.plugin(["AMap.ToolBar"], function() {
    // 添加 工具条
    map.addControl(new AMap.ToolBar());
  });

  var infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)});

  for (var i = 0, marker; i < localtionList.length; i++) {
    marker = new AMap.Marker({
      map: map,
      icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
      position: [localtionList[i].position[0], localtionList[i].position[1]],
    });
    marker.content = localtionList[i].title + '<br/>' + localtionList[i].address;
    marker.on('click', markerClick);
    markers.push(marker);
  }

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

// 更新地图
function updateMarkers (localtionList) {
  for (var i = 0, marker; i < localtionList.length; i++) {
    marker = new AMap.Marker({
      map: map,
      icon: 'http://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
      position: [localtionList[i].position[0], localtionList[i].position[1]],
    });
    marker.content = localtionList[i].title + '<br/>' + localtionList[i].address;
    marker.on('click', markerClick);
    markers.push(marker);
  }
}

// 加载地图失败处理
function mapError () {
  alert('高德地图未能加载成功，请刷新或稍后再试!');
}
