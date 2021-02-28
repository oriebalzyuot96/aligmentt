
  
/* eslint-disable no-undef */
'use strict';
console.log('Hi');

// Grid layer
var graticule = new ol.layer.Graticule({ 
  // the style to use for the lines, optional.
  strokeStyle: new ol.style.Stroke({
    color: 'rgba(207, 0, 15, 1)',
    width: 2,
    lineDash: [0.5, 4],
  }),
  showLabels: true,
  visible: false,
  wrapX: false,
});
////////////////////////////////////////////////////////////////////////////////


///////////////////////////////Define the map for///////////////////////////////

var map = new ol.Map({
  interactions: ol.interaction.defaults().extend([new ol.interaction.DragRotateAndZoom()]),
  layers: [
    new ol.layer.Tile({
      source: new ol.source.OSM(),
    }),
    graticule,
  ],
  target: 'map',
  view: new ol.View({
    projection: 'EPSG:4326',
    // center: [-5639523.95, -3501274.52],
    center: [35.866095274609506, 31.97610993111981],
    zoom: 20,
    // minZoom: 2,
    // maxZoom: 26,
  }),
});

// Change from mercator to lon/lat
var meters2degress = function(x,y) {
  var lon = x *  180 / 20037508.34 ;
  // thanks magichim @ github for the correction
  var lat = Math.atan(Math.exp(y * Math.PI / 20037508.34)) * 360 / Math.PI - 90; 
  return [lon, lat];
};

map.on('click',function(e){
  console.log('Coordinate in LON|LAT: ',e.coordinate);
  // console.log('Coordinate in LON|LAT',meters2degress(e.coordinate[0],e.coordinate[1]));
  map.forEachFeatureAtPixel(e.pixel,function(feature,layer){
    console.log('Feature: just take the number for ID',feature.getProperties());
    if(feature.values_.name){
      if(feature.values_.name.split(' ')[0] != 'poi'){
        $('#from').val(feature.values_.name.split(' ')[1]); 
      }else{
        $('#to').val(feature.values_.name.split(' ')[1]); 
      }}
  });});
////////////////////////////////////////////////////////////////////////////////


///////////////////////////////Change map terrain///////////////////////////////

const openStreetMapStandard = new ol.layer.Tile({
  source: new ol.source.OSM(),
  visible:true,
  title: 'openStreetMapStandard',
});

const openStreetMapHumanitarian = new ol.layer.Tile({
  source: new ol.source.OSM({
    url:'https://{a-c}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
  }),
  visible:false,
  title: 'openStreetMapHumanitarian',
});

const stamenTerrain = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url:'http://tile.stamen.com/terrain/{z}/{x}/{y}.jpg',
    attributions: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
  }),
  visible:false,
  title: 'stamenTerrain',
});

const sateliteTerrain = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    maxZoom: 26,
  }),
  visible:false,
  title: 'sateliteTerrain',
});

const bingSateliteTerrain = new ol.layer.Tile({
  source: new ol.source.BingMaps({
    key: 'AvULmzfOTcs6LuAIaoZhatEkngR7N1X1wwaxoOHqN-QEIbDkY6HWGd23_04Abynr',
    imagerySet: 'AerialWithLabelsOnDemand',
    // use maxZoom 19 to see stretched tiles instead of the BingMaps
    // "no photos at this zoom level" tiles
    // maxZoom: 19
  }),
  visible:false,
  title: 'bingSateliteTerrain',
});

// layer group 
const baseLayerGroup = new ol.layer.Group({
  layers:[
    openStreetMapStandard,openStreetMapHumanitarian,stamenTerrain,sateliteTerrain,bingSateliteTerrain,
  ],
});
map.addLayer(baseLayerGroup);//layer activation

// Layer Switcher
const baseLayerElements=document.querySelectorAll('.sidebar > input[type=radio]'); // select all children "type radio" for sidbar div
for(let baseLayerElement of baseLayerElements){
  baseLayerElement.addEventListener('change',function(e){
    e.preventDefault();
    // console.log('here1');
    var allCheckbox = document.getElementById('all-checkbox');
    let baseLayerElementValue = this.value; 
    if('Sec-Layer' == baseLayerElementValue){
      allCheckbox.style.display = 'block';
    }
    else
    {
      allCheckbox.style.display = 'none';
    }
    baseLayerGroup.getLayers().forEach(function(ele,i,arr)
    {let baseLayerTitle = ele.get('title');
      ele.setVisible(baseLayerTitle === baseLayerElementValue);
    });
  });
}
////////////////////////////////////////////////////////////////////////////////


/////////////////////TO make GeoImage "Geo Refferance layer/////////////////////

/**
 * TO make GeoImage "Geo Refferance layer"
 */

$('.option,#floor').on('change', resetSource);


function resetSource () {
  map.getLayers().forEach(layer => {
    if (layer && layer.get('name') === 'Georef') {
      map.removeLayer(layer);
      
    }
  });
  // console.log('here2');
  var x1 = Number($('#x1').val());
  var y1 = Number($('#y1').val());
  var sx1 = Number($('#w1').val());
  var sy1 = Number($('#h1').val());
  var x2 = Number($('#x2').val());
  var y2 = Number($('#y2').val());
  var sx2 = Number($('#w2').val());
  var sy2 = Number($('#h2').val());
  var xmin = Number($('#xmin').val());
  var ymin = Number($('#ymin').val());
  var xmax = Number($('#xmax').val());
  var ymax = Number($('#ymax').val());
  // var angleRotate = Number($('#rotate').val());
  // let angle = -270 + angleRotate;
  var sx,sy,x,y;
  var selectedFloor='';
  selectedFloor =$('#floor').val();
  // $('#type').on('change', ()=>{selectedFloor =$('#type').val();
  var url='';
  if(selectedFloor=='floor1'){
    url='./data/response.png';
    sx=sx1;
    sy=sy1;
    x=x1;
    y=y1;
  }else if(selectedFloor=='floor2'){
    url='./data/response.png';
    sx=sx2;
    sy=sy2;
    x=x2;
    y=y2;
  }
  console.log('selectedFloor',selectedFloor);
  var geoimg = new ol.layer.GeoImage({
    name: 'Georef',
    opacity: .7,
    minZoom:0,
    maxZoom:26,
    source: new ol.source.GeoImage({
      url: url,
      imageCenter: [x,y],
      imageScale: [sx,sy],
      imageCrop: [xmin,ymin,xmax,ymax],
      //imageMask: [[273137.343,6242443.14],[273137.343,6245428.14],[276392.157,6245428.14],[276392.157,6242443.14],[273137.343,6242443.14]],
      imageRotate: Number($('#rotate').val()*Math.PI/180),
      projection: 'EPSG:4326',
      attributions: [ '<a href=\'http://www.geoportail.gouv.fr/actualite/181/telechargez-les-cartes-et-photographies-aeriennes-historiques\'>Photo historique &copy; IGN</a>' ],
    }),
  });



  geoimg.getSource().setCenter([x,y]);
  geoimg.getSource().setRotation($('#rotate').val()*Math.PI/180);
  geoimg.getSource().setScale([sx,sy]);
  geoimg.getSource().setCrop([xmin,ymin,xmax,ymax]);

  // pointer2.setGeometry(new ol.geom.Point(([3992566.263943126+.004*(Number(ele.Y1)*Math.cos(angle*Math.PI/180)+ Number(ele.X1)*Math.sin(angle*Math.PI/180) )  , 3760166.192932204+.004*(Number(ele.X1)*Math.cos(angle*Math.PI/180)- Number(ele.Y1)*Math.sin(angle*Math.PI/180) )])));
  // var crop = geoimg.getSource().getCrop();
  // $('#xmin').val(crop[0]);
  // $('#ymin').val(crop[1]);
  // $('#xmax').val(crop[2]);
  // $('#ymax').val(crop[3]); 

  map.getLayers().forEach(layer => {
    if (layer && layer.get('name') === 'Georef') {
      map.removeLayer(layer);
      
    }
  });


  selectedFloor='';
  selectedFloor =$('#floor').val();
  // $('#type').on('change', ()=>{selectedFloor =$('#type').val();
  url='./data/response.png';
  if(selectedFloor=='floor1'){
    url='./data/response.png';
    sx=0.00000441176470588235;
    sy=0.00000441176470588235;
    x=35.86795800838752;
    y=31.975318153321954;
  }else if(selectedFloor=='floor2'){
    url='./data/response.png';
    sx=0.00000155172413793103;
    sy=0.00000155172413793103;
    x=35.86795800838752;
    y=31.975318153321954;
  }
  console.log('selectedFloor',selectedFloor);
  // var geoimg1 = new ol.layer.GeoImage({
  //   name: 'Georef',
  //   opacity: .7,
  //   minZoom:0,
  //   source: new ol.source.GeoImage({
  //     url: url,
  //     imageCenter: [x,y],
  //     imageScale: [sx,sy],
  //     imageCrop: [xmin,ymin,xmax,ymax],
  //     //imageMask: [[273137.343,6242443.14],[273137.343,6245428.14],[276392.157,6245428.14],[276392.157,6242443.14],[273137.343,6242443.14]],
  //     imageRotate: Number($('#rotate').val()*Math.PI/180),
  //     projection: 'EPSG:4326',
  //     attributions: [ '<a href=\'http://www.geoportail.gouv.fr/actualite/181/telechargez-les-cartes-et-photographies-aeriennes-historiques\'>Photo historique &copy; IGN</a>' ],
  //   }),
  // });
  // map.addLayer(geoimg1);
  map.addLayer(geoimg);

}
resetSource () ;

// Show extent in the layerswitcher
map.addControl(new ol.control.LayerSwitcher({ extent:true }));
// map.on('click',function(e){  geoimg.getSource().setCenter([e.coordinate[0],e.coordinate[1]]);});
////////////////////////////////////////////////////////////////////////////////


/////////////////////////This is t handle search process////////////////////////

var queryInput = document.getElementById('epsg-query'); //for search
var searchButton = document.getElementById('epsg-search');//for search
var resultSpan = document.getElementById('epsg-result');//for search
var renderEdgesCheckbox = document.getElementById('render-edges');// for grid
var showGraticuleCheckbox = document.getElementById('show-graticule');// for grid

/**
 * This is t handle search process
 * @param {fuction} query 
 */
function search(query) {
  resultSpan.innerHTML = 'Searching ...';
  // console.log(query);
  fetch(`https://eu1.locationiq.com/v1/search.php?key=d4328e89827d71&q=${query}&format=json`)
    .then(function (response) {
      // console.log('sadsadasdsadasd',response);
      return response.json();
    })
    .then(function (json) {
      var results = json[0];
      // console.log(results);
      var pointer = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([results.lon, results.lat])),
      });
      // console.log(pointer,'@@@@@@@');
      pointer.setStyle(
        new ol.style.Style({
          image: new ol.style.Icon({
            color: '#BADA55',
            crossOrigin: null,
            // For Internet Explorer 11
            imgSize: [20, 20],
            src: 'data/dot.svg',
          }),
        }),
      );
      var vectorSource = new ol.source.Vector({
        features: [pointer],
      });
      var vectorLayer = new ol.layer.Vector({
        source: vectorSource,
      });
      
      map.addLayer(vectorLayer);//layer activation
      // map.setView(new ol.View({
      //   center: ol.proj.fromLonLat([results.lon,results.lat]),
      //   zoom: 17,
      // }));
      map.getView().setCenter([results.lon,results.lat])

      resultSpan.innerHTML =results.display_name ;          
    });
}
////////////////////////////////////////////////////////////////////////////////


///////////////////////////////Handle click event///////////////////////////////

/** 
 * Handle click event.
 * @param {Event} event The event.
 */
searchButton.onclick = function (event) {
  search(queryInput.value);
  event.preventDefault();
};
////////////////////////////////////////////////////////////////////////////////


//////////////////////////Handle checkbox change event//////////////////////////

/**
 * Handle checkbox change event.
 */
renderEdgesCheckbox.onchange = function () {
  // console.log('here3');
  map.getLayers().forEach(function (layer) {
    if (layer instanceof ol.layer.Tile) {
      var source = layer.getSource();
      if (source instanceof ol.source.TileImage) {
        source.setRenderReprojectionEdges(renderEdgesCheckbox.checked);
      }
    }
  });
};
////////////////////////////////////////////////////////////////////////////////



//////////////////////////Handle checkbox change event//////////////////////////

/**
 * Handle checkbox change event.
 */
showGraticuleCheckbox.onchange = function () {
  // console.log('here4');
  graticule.setVisible(showGraticuleCheckbox.checked);
};
////////////////////////////////////////////////////////////////////////////////



///////////////////////////////Draw corners points//////////////////////////////


var  bottomLeftCorner= new ol.Feature({
  geometry: new ol.geom.Point([35.866045045032116,31.976182509469936]),
  name: 'bottomLeftCorner'
});

var bottomRightCorner = new ol.Feature({
  geometry: new ol.geom.Point([35.866040888101345, 31.976040413161023]),
  name: 'bottomRightCorner'
});

var topLeftCorner = new ol.Feature({
  geometry: new ol.geom.Point([35.866149661075696, 31.976179448998806]),
  name: 'topLeftCorner'
});

var topRightCorner = new ol.Feature({
  geometry: new ol.geom.Point([35.86614550414492, 31.976037352689893]),
  name: 'topRightCorner'
});

var center = new ol.Feature({
  geometry: new ol.geom.Point([35.866095274609506, 31.97610993111981]),
  name: 'center'
});
bottomLeftCorner = new ol.layer.Vector({
  zIndex: 3,
  source: new ol.source.Vector({
      features: [bottomLeftCorner],
  }),
  style: new ol.style.Style({
      image: new ol.style.Icon({
          color: 'red',
          crossOrigin: null,
          // For Internet Explorer 11
          imgSize: [27.437, 27.437],
          src:'./data/crossProto.svg',
      }),
      stroke: new ol.style.Stroke({
          width: 3,
          color: '#000000',
      }),
      fill: new ol.style.Fill({
          color: '#000000',
      }),
  }),
});

bottomRightCorner = new ol.layer.Vector({
  zIndex: 3,
  source: new ol.source.Vector({
      features: [bottomRightCorner],
  }),
  style: new ol.style.Style({
      image: new ol.style.Icon({
          color: 'orange',
          crossOrigin: null,
          // For Internet Explorer 11
          imgSize: [27.437, 27.437],
          src: './data/crossProto.svg',
      }),
      stroke: new ol.style.Stroke({
          width: 3,
          color: '#000000',
      }),
      fill: new ol.style.Fill({
          color: '#000000',
      }),
  }),
});

var topLeftCorner = new ol.layer.Vector({
  zIndex: 3,
  source: new ol.source.Vector({
      features: [topLeftCorner],
  }),
  style: new ol.style.Style({
      image: new ol.style.Icon({
          color: 'green',
          crossOrigin: null,
          // For Internet Explorer 11
          imgSize: [27.437, 27.437],
          src: './data/crossProto.svg',
      }),
      stroke: new ol.style.Stroke({
          width: 3,
          color: '#000000',
      }),
      fill: new ol.style.Fill({
          color: '#000000',
      }),
  }),
});

var topRightCorner = new ol.layer.Vector({
  zIndex: 3,
  source: new ol.source.Vector({
      features: [topRightCorner],
  }),
  style: new ol.style.Style({
      image: new ol.style.Icon({
          color: 'blue',
          crossOrigin: null,
          // For Internet Explorer 11
          imgSize: [27.437, 27.437],
          src: './data/crossProto.svg',
      }),
      stroke: new ol.style.Stroke({
          width: 3,
          color: '#000000',
      }),
      fill: new ol.style.Fill({
          color: '#000000',
      }),
  }),
});

var center = new ol.layer.Vector({
  zIndex: 3,
  source: new ol.source.Vector({
      features: [center],
  }),
  style: new ol.style.Style({
      image: new ol.style.Icon({
          color: 'black',
          crossOrigin: null,
          // For Internet Explorer 11
          imgSize: [27.437, 27.437],
          src: './data/crossProto.svg',
      }),
      stroke: new ol.style.Stroke({
          width: 3,
          color: '#000000',
      }),
      fill: new ol.style.Fill({
          color: '#000000',
      }),
  }),
});

const featureGroup2 = new ol.layer.Group({
  layers: [
    bottomLeftCorner, bottomRightCorner,topLeftCorner,topRightCorner,center
  ],
  name: 'featureGroup2',
});
map.addLayer(featureGroup2);



////////////////////////////////////////////////////////////////////////////////
var srcUrl = './data/response.png';
       var img = new Image(); 
       var imageSize =[762,663]
       img.onload = function() {                   // getimagesize from URL
       imageSize[0]=(this.width) ; 
       imageSize[1]=(this.height);
       console.log("this.width,this.height",this.width,this.height)
       }
       img.src = srcUrl 
       var pointInLonLat    =  [35.8681833744049,31.9760325731056];
       var image_bot_Lift   =  [0,0];          
       var image_bot_right  =  [imageSize[0],0];
       var image_top_left   =  [0,imageSize[1]];
       var image_top_right  =  imageSize ;
       var bot_left_before  =  [0,0]                // bot_left_before_rotation  "default/static"
       var bot_left_after   =  [35.866045045032116,31.976182509469936]                // bot_left_after_rotation   "given"
       var bot_right_before =  [imageSize[0],0]     // aprox value bot_right_before_rotation "given"
       var bot_right_after  =  [35.866040888101345, 31.976040413161023]                // bot_right_before_rotation "given"
       var top_left_after   =  [35.866149661075696, 31.976179448998806] 
       var scaleX;
       var scaleY;
       var scale;
       var rotationAngle;

        // ########### Alignment Function ###########     
       function alignment()  { 
         
        // ########### Rotation angle ###########
       if(bot_left_after[0]!= 0 && bot_left_after[1]!= 0){ //  to make referance [0,0]
         bot_right_after[0]=Math.abs(bot_right_after[0] - bot_left_after[0])
         bot_right_after[1]=Math.abs(bot_right_after[1] - bot_left_after[1])   
         bot_left_after= [0,0]      
       }

        var s11 = [(bot_right_before[0] - bot_left_before[0]), (bot_right_before[1] - bot_left_before[1])];
        var s12 = [bot_right_after[0]  - bot_left_after[0], bot_right_after[1] - bot_left_after[1]];

        var dot = s11[0] * s12[0] + s11[1] * s12[1]
        var det = s11[0] * s12[1] - s11[1] * s12[0]

        rotationAngle = Math.atan2(det, dot) * (-180 / Math.PI)
        // if (rotationAngle>0){rotationAngle=rotationAngle-360} 
        console.log("rotationAngle", rotationAngle)   
        if (Math.sign(rotationAngle) == -1) {
          rotationAngle = 180 + rotationAngle
                      }
        console.log("rotationAngle", rotationAngle)   
        scaleX = scaleCalcWidth();
        scaleY = scaleCalcHeight();
        console.log('scales', scaleX,scaleY);
        }

        // ########### scale ###########
        function scaleCalcWidth(){
          var bot_right_after  =  [35.866040888101345, 31.976040413161023]                // bot_right_before_rotation "given"
          var bot_left_after   =  [35.866045045032116, 31.976182509469936]   

          var xDiff1 = image_bot_Lift[0] - image_bot_right[0];
          var yDiff1 = image_bot_Lift[1] - image_bot_right[1];
          var length1 = Math.sqrt(xDiff1 * xDiff1 + yDiff1 * yDiff1);
          console.log('bot_left_after[0]bot_left_after[0]bot_left_after[0]bot_left_after[0]', bot_left_after[0]);
          console.log('bot_right_after[0]bot_right_after[0]bot_right_after[0]bot_right_after[0]', bot_right_after[0]);
          var xDiff2 = bot_left_after[0] - bot_right_after[0];
          var yDiff2 = bot_left_after[1] - bot_right_after[1];
          var length2 = Math.sqrt(xDiff2 * xDiff2 + yDiff2 * yDiff2);
          var scaleX = length2 / length1;
          return scaleX;
        }
        function scaleCalcHeight(){

          bot_left_after   =  [35.866045045032116,31.976182509469936] 
          var xDiff1 = image_bot_Lift[0] - image_top_left[0];
          var yDiff1 = image_bot_Lift[1] - image_top_left[1];
          var length1 = Math.sqrt(xDiff1 * xDiff1 + yDiff1 * yDiff1);

          var xDiff2 = bot_left_after[0] - top_left_after[0];
          var yDiff2 = bot_left_after[1] - top_left_after[1];
          var length2 = Math.sqrt(xDiff2 * xDiff2 + yDiff2 * yDiff2);

          var scaleY = length2 / length1;
          return scaleY;
        }
        alignment()

        // ########### From pixel longLat to  ###########
        function findPixelPoint(scale, originLonglat, pointInPexel, rotationAngle) {
          console.log({pointInPexel})
          var pointInPexelToLongLat = [originLonglat[0]+(Number(pointInPexel[0])*scale[0]),originLonglat[1]+(Number(pointInPexel[1])*scale[1])]
          var newPoint = rotate(originLonglat[0], originLonglat[1], pointInPexelToLongLat[0], pointInPexelToLongLat[1], rotationAngle)
          console.log({newPoint})
          return [newPoint[0], newPoint[1]]
         }
     

          function rotate(originx, originy, pointXDif, pointYDif, rotationAngle) {
            var radians = (Math.PI / 180) * rotationAngle, // degree to radian
                cos = Math.cos(radians),
                sin = Math.sin(radians),
                nx = (cos * (pointXDif - originx)) + (sin * (pointYDif - originy)) + originx,
                ny = (cos * (pointYDif - originy)) - (sin * (pointXDif - originx)) + originy;
            return [nx, ny];
          }



        function drawPointsLongLat(coordinate,color) {
          if (color == "red"){
          console.log({coordinate})
          var red = new ol.Feature({
            geometry: new ol.geom.Point(coordinate),
            name: "red"
          });
          var red = new ol.layer.Vector({
            zIndex: 3,
            name: "red",
            source: new ol.source.Vector({
                features: [red],
            }),
            style: new ol.style.Style({
                image: new ol.style.Icon({
                    color: "red",
                    crossOrigin: null,
                    // For Internet Explorer 11
                    imgSize: [20,20],
                    src: './data/red.svg',
                }),
                stroke: new ol.style.Stroke({
                    width: 3,
                    color: '#000000',
                }),
                fill: new ol.style.Fill({
                    color: '#000000',
                }),
            }),
          });
          
          map.addLayer(red);
        }
        if (color == "green"){
          console.log({coordinate})
          var green = new ol.Feature({
            geometry: new ol.geom.Point(coordinate),
            name: "green"
          });
          var green = new ol.layer.Vector({
            zIndex: 3,
            name: "green",
            source: new ol.source.Vector({
                features: [green],
            }),
            style: new ol.style.Style({
                image: new ol.style.Icon({
                    color: "green",
                    crossOrigin: null,
                    // For Internet Explorer 11
                    imgSize: [20,20],
                    src: './data/green.svg',
                }),
                stroke: new ol.style.Stroke({
                    width: 3,
                    color: '#000000',
                }),
                fill: new ol.style.Fill({
                    color: '#000000',
                }),
            }),
          });
          
          map.addLayer(green);
        }
        if (color == "blue"){
          console.log({coordinate})
          var blue = new ol.Feature({
            geometry: new ol.geom.Point(coordinate),
            name: "blue"
          });
          var blue = new ol.layer.Vector({
            zIndex: 3,
            name: "blue",
            source: new ol.source.Vector({
                features: [blue],
            }),
            style: new ol.style.Style({
                image: new ol.style.Icon({
                    color: "blue",
                    crossOrigin: null,
                    // For Internet Explorer 11
                    imgSize: [20,20],
                    src: './data/blue.svg',
                }),
                stroke: new ol.style.Stroke({
                    width: 3,
                    color: '#000000',
                }),
                fill: new ol.style.Fill({
                    color: '#000000',
                }),
            }),
          });
          
          map.addLayer(excelPoints);
        }
        if (color == "orange"){
          console.log({coordinate})
          var orange = new ol.Feature({
            geometry: new ol.geom.Point(coordinate),
            name: "orange"
          });
          var orange = new ol.layer.Vector({
            zIndex: 3,
            name: "orange",
            source: new ol.source.Vector({
                features: [orange],
            }),
            style: new ol.style.Style({
                image: new ol.style.Icon({
                    color: "orange",
                    crossOrigin: null,
                    // For Internet Explorer 11
                    imgSize: [20,20],
                    src: './data/orange.svg',
                }),
                stroke: new ol.style.Stroke({
                    width: 3,
                    color: '#000000',
                }),
                fill: new ol.style.Fill({
                    color: '#000000',
                }),
            }),
          });
          
          map.addLayer(excelPoints);
        }

        }

        function drawPointsPexels(coordinate,color) {

        if (color == "blue"){
          console.log({coordinate})
          var blue = new ol.Feature({
            geometry: new ol.geom.Point(coordinate),
            name: "blue"
          });
          var blue = new ol.layer.Vector({
            zIndex: 3,
            name: "blue",
            source: new ol.source.Vector({
                features: [blue],
            }),
            style: new ol.style.Style({
                image: new ol.style.Icon({
                    color: "blue",
                    crossOrigin: null,
                    // For Internet Explorer 11
                    imgSize: [20,20],
                    src: './data/blue.svg',
                }),
                stroke: new ol.style.Stroke({
                    width: 3,
                    color: '#000000',
                }),
                fill: new ol.style.Fill({
                    color: '#000000',
                }),
            }),
          });
          
          map.addLayer(blue);
        }
        if (color == "orange"){
          console.log({coordinate})
          var orange = new ol.Feature({
            geometry: new ol.geom.Point(coordinate),
            name: "orange"
          });
          var orange = new ol.layer.Vector({
            zIndex: 3,
            name: "orange",
            source: new ol.source.Vector({
                features: [orange],
            }),
            style: new ol.style.Style({
                image: new ol.style.Icon({
                    color: "orange",
                    crossOrigin: null,
                    // For Internet Explorer 11
                    imgSize: [20,20],
                    src: './data/orange.svg',
                }),
                stroke: new ol.style.Stroke({
                    width: 3,
                    color: '#000000',
                }),
                fill: new ol.style.Fill({
                    color: '#000000',
                }),
            }),
          });
          
          map.addLayer(orange);
        }

        }





      //   $(document).ready(function() {
      //      $.ajax({
      //          type: "GET",
      //          url: "./data/Book1.csv",
      //          dataType: "text",
      //          success:  function(data) {
      //           processData(data);}
      //       });
      //  });
       
    //    $('input[type=file]').on('change',function() {
         
    //      var newFile= this.files[0]
    //     //  console.log({newFile},$(this).attr('name'))
    //     var name = $(this).attr('name')
    //          var filename = newFile.name;      
        
    //     $.ajax({
    //         type: "GET",
    //         url: "./data/"+filename,
    //         dataType: "text",
    //         success: function(data) {processData(data,name);}
    //      });
    // })

    //    async function processData(Book1,color) {
    //      console.log('Book1Book1Book1Book1',Book1,color)
    //        "use strict";
    //        var input = $.csv.toArrays(Book1);
    //       //  console.log({input})

    //       await map.getLayers().forEach(layer => {
    //         if (layer && layer.get('name') === color) {
    //             map.removeLayer(layer);
    //         }
    //     })
    //     if(color == "red" || color == "green"){
    //        input.forEach((ele)=>{
    //         drawPointsLongLat(ele,color)
    //        })
    //       //  $("#test").append(input);
    //     }
    //     if(color == "blue" || color == "orange"){
    //       input.forEach((ele)=>{
    //         bot_left_after   =  [35.866045045032116,31.976182509469936] 
    //         scale = [scaleX,scaleY]
    //         console.log({ele})
    //        drawPointsPexels(findPixelPoint(scale, bot_left_after, ele, rotationAngle),color)
    //       })
    //      //  $("#test").append(input);
    //    }
    //    }



       function uploadDealcsv () {}; 

  /*------ Method for read uploded csv file ------*/
  uploadDealcsv.prototype.getCsv = function(e) {
  
      $('input[type=file]').on('change', function() {
        var name = $(this).attr('name')
        if (this.files && this.files[0]) {

            var myFile = this.files[0];
            var reader = new FileReader();
            
            reader.addEventListener('load', function (e) {
                
                let csvdata = e.target.result; 
                parseCsv.getParsecsvdata(csvdata,name); // calling function for parse csv data 
            });
            
            reader.readAsBinaryString(myFile);
        }
      });
    }

    /*------- Method for parse csv data and display --------------*/
    uploadDealcsv.prototype.getParsecsvdata = function(data,name) {

        let parsedata = [];

        let newLinebrk = data.split("\n");
        for(let i = 0; i < newLinebrk.length; i++) {

            parsedata.push(newLinebrk[i].split(","))
        }

        console.log("parsedata",parsedata);
        processData(parsedata,name)
    }


  
  var parseCsv = new uploadDealcsv();
  parseCsv.getCsv();


  async function processData(data,color) {
    console.log('Book1Book1Book1Book1',data,color)
      "use strict";



     await map.getLayers().forEach(layer => {
       if (layer && layer.get('name') === color) {
           map.removeLayer(layer);
       }
   })
   if(color == "red" || color == "green"){
    data.forEach((ele)=>{
       drawPointsLongLat(ele,color)
      })
     //  $("#test").append(input);
   }
   if(color == "blue" || color == "orange"){
    data.forEach((ele)=>{
       bot_left_after   =  [35.866045045032116,31.976182509469936] 
       scale = [scaleX,scaleY]
       console.log({ele})
      drawPointsPexels(findPixelPoint(scale, bot_left_after, ele, rotationAngle),color)
     })
    //  $("#test").append(input);
  }
  }



// From longLat to pixel
function findAnyPointInpixels(scale, bot_left_Pixel,bot_left_Longlat, point_Longlat, rotation_angle) {
  // Distanse between any tow point
console.log({scale}, {bot_left_Pixel},{bot_left_Longlat}, {point_Longlat}, {rotation_angle})
  var pointXDif;
  var pointYDif;

  pointXDif = bot_left_Pixel[0] + (point_Longlat[0] - bot_left_Longlat[0]) / scale[1];
  pointYDif = bot_left_Pixel[1] + (point_Longlat[1] - bot_left_Longlat[1]) / scale[0];
console.log({pointXDif},{pointYDif})
  var newPoint = rotate(bot_left_Pixel[0], bot_left_Pixel[1], pointXDif, pointYDif, rotation_angle)
  return [newPoint[0], newPoint[1]]
}

function rotate(cx, cy, x, y, angle) {
  var radians = (Math.PI / 180) * angle, // degree to radian
      cos = Math.cos(radians),
      sin = Math.sin(radians),
      nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
      ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
  return [nx, ny];
}

//  scale = [35.8660751,31.97610888]
bot_left_after   =  [35.866045045032116,31.976182509469936] 
scale = [scaleX,scaleY]
console.log(scale)
var PointInpixels = findAnyPointInpixels(scale, [0, 0],[35.866045045032116,31.976182509469936] ,[35.86607573	,31.97611005]


  , -rotationAngle)
console.log("PointInpixels",PointInpixels)

// 
// 
// 
// 
// 
// 35.8660753	31.97610919
// 35.86607573	31.97611005
