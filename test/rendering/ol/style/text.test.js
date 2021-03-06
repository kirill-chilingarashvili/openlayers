goog.require('ol.Feature');
goog.require('ol.geom.LineString');
goog.require('ol.geom.MultiLineString');
goog.require('ol.geom.MultiPolygon');
goog.require('ol.geom.Point');
goog.require('ol.geom.Polygon');
goog.require('ol.Map');
goog.require('ol.View');
goog.require('ol.layer.Vector');
goog.require('ol.source.Vector');
goog.require('ol.style.Text');
goog.require('ol.style.Fill');
goog.require('ol.style.Style');
goog.require('ol.style.Stroke');

describe('ol.rendering.style.Text', function() {

  var map, vectorSource;

  function createMap(renderer, opt_pixelRatio) {
    vectorSource = new ol.source.Vector();
    var vectorLayer = new ol.layer.Vector({
      source: vectorSource
    });

    map = new ol.Map({
      pixelRatio: opt_pixelRatio || 1,
      target: createMapDiv(200, 200),
      renderer: renderer,
      layers: [vectorLayer],
      view: new ol.View({
        projection: 'EPSG:4326',
        center: [0, 0],
        resolution: 1
      })
    });
  }

  afterEach(function() {
    if (map) {
      disposeMap(map);
      map = null;
    }
  });

  describe('#render', function() {

    function createFeatures() {
      var feature;
      feature = new ol.Feature({
        geometry: new ol.geom.Point([-20, 18])
      });
      feature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: 'hello',
          font: '10px'
        })
      }));
      vectorSource.addFeature(feature);

      feature = new ol.Feature({
        geometry: new ol.geom.Point([-10, 0])
      });
      feature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: 'hello',
          fill: new ol.style.Fill({
            color: 'red',
            font: '12px'
          }),
          stroke: new ol.style.Stroke({
            color: '#000',
            width: 3
          })
        })
      }));
      vectorSource.addFeature(feature);

      feature = new ol.Feature({
        geometry: new ol.geom.Point([20, 10])
      });
      feature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          rotateWithView: true,
          text: 'hello',
          font: '10px',
          stroke: new ol.style.Stroke({
            color: [10, 10, 10, 0.5]
          })
        })
      }));
      vectorSource.addFeature(feature);
    }

    var nicePath = [
      20, 33, 40, 31, 60, 30, 80, 31, 100, 33, 120, 37, 140, 39, 160, 40,
      180, 39, 200, 37, 220, 33, 240, 31, 260, 30, 280, 31, 300, 33
    ];
    var uglyPath = [163, 22, 159, 30, 150, 30, 143, 24, 151, 17];
    var polygon = [151, 17, 163, 22, 159, 30, 150, 30, 143, 24, 151, 17];

    function createLineString(coords, textAlign, maxAngle, strokeColor, strokeWidth) {
      var geom = new ol.geom.LineString();
      geom.setFlatCoordinates('XY', coords);
      var style = new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: 'red'
        }),
        text: new ol.style.Text({
          text: 'Hello world',
          font: 'bold 14px sans-serif',
          textAlign: textAlign,
          maxAngle: maxAngle,
          placement: 'line',
          stroke: new ol.style.Stroke({
            color: strokeColor || 'white',
            width: strokeWidth
          })
        })
      });
      var feature = new ol.Feature(geom);
      feature.setStyle(style);
      vectorSource.addFeature(feature);

      geom = geom.clone();
      geom.translate(0, 5);
      feature = new ol.Feature(geom);
      style = style.clone();
      style.getText().setTextBaseline('top');
      feature.setStyle(style);
      vectorSource.addFeature(feature);

      geom = geom.clone();
      geom.translate(0, -10);
      feature = new ol.Feature(geom);
      style = style.clone();
      style.getText().setTextBaseline('bottom');
      feature.setStyle(style);
      vectorSource.addFeature(feature);

      map.getView().fit(vectorSource.getExtent());
    }

    it('tests the canvas renderer without rotation', function(done) {
      createMap('canvas');
      createFeatures();
      expectResemble(map, 'rendering/ol/style/expected/text-canvas.png', IMAGE_TOLERANCE, done);
    });

    it('tests the canvas renderer with rotation', function(done) {
      createMap('canvas');
      createFeatures();
      map.getView().setRotation(Math.PI / 7);
      expectResemble(map, 'rendering/ol/style/expected/text-rotated-canvas.png', IMAGE_TOLERANCE, done);
    });

    it('renders correct stroke with pixelRatio != 1', function(done) {
      createMap('canvas', 2);
      createFeatures();
      expectResemble(map, 'rendering/ol/style/expected/text-canvas-hidpi.png', IMAGE_TOLERANCE, done);
    });

    it('renders multiline text with alignment options', function(done) {
      createMap('canvas');
      var feature;
      feature = new ol.Feature(new ol.geom.Point([25, 0]));
      feature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: 'Hello world\nleft',
          font: 'bold 14px sans-serif',
          textAlign: 'left'
        })
      }));
      vectorSource.addFeature(feature);
      feature = new ol.Feature(new ol.geom.Point([-25, 0]));
      feature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: 'Hello world\nright',
          font: 'bold 14px sans-serif',
          textAlign: 'right'
        })
      }));
      vectorSource.addFeature(feature);
      feature = new ol.Feature(new ol.geom.Point([0, 25]));
      feature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: 'Hello world\nbottom',
          font: 'bold 14px sans-serif',
          textBaseline: 'bottom'
        })
      }));
      vectorSource.addFeature(feature);
      feature = new ol.Feature(new ol.geom.Point([0, -25]));
      feature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: 'top\nHello world',
          font: 'bold 14px sans-serif',
          textBaseline: 'top'
        })
      }));
      vectorSource.addFeature(feature);
      expectResemble(map, 'rendering/ol/style/expected/text-align-offset-canvas.png', 6, done);
    });

    it('renders multiline text with positioning options', function(done) {
      createMap('canvas');
      var feature;
      feature = new ol.Feature(new ol.geom.Point([0, 0]));
      feature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: 'Hello world\nleft',
          font: 'bold 14px sans-serif',
          textAlign: 'left',
          offsetX: 25
        })
      }));
      vectorSource.addFeature(feature);
      feature = new ol.Feature(new ol.geom.Point([0, 0]));
      feature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: 'Hello world\nright',
          font: 'bold 14px sans-serif',
          textAlign: 'right',
          offsetX: -25
        })
      }));
      vectorSource.addFeature(feature);
      feature = new ol.Feature(new ol.geom.Point([0, 0]));
      feature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: 'Hello world\nbottom',
          font: 'bold 14px sans-serif',
          textBaseline: 'bottom',
          offsetY: -25
        })
      }));
      vectorSource.addFeature(feature);
      feature = new ol.Feature(new ol.geom.Point([0, 0]));
      feature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: 'top\nHello world',
          font: 'bold 14px sans-serif',
          textBaseline: 'top',
          offsetY: 25
        })
      }));
      vectorSource.addFeature(feature);
      expectResemble(map, 'rendering/ol/style/expected/text-align-offset-canvas.png', 6, done);
    });

    describe('Text along an ugly upside down path, keep text upright', function() {

      it('renders text along a linestring with auto-align', function(done) {
        createMap('canvas');
        createLineString(uglyPath);
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-auto.png', 3.6, done);
      });

      it('renders text along a linestring with `textAlign: \'center\'`', function(done) {
        createMap('canvas');
        createLineString(uglyPath, 'center');
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-center.png', 3.6, done);
      });

      it('omits text along a linestring with `textAlign: \'left\'` when > maxAngle', function(done) {
        createMap('canvas');
        createLineString(uglyPath, 'left');
        vectorSource.getFeatures()[0].getStyle().getText().setTextAlign('left');
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-omit.png', IMAGE_TOLERANCE, done);
      });

      it('omits text along a linestring with `textAlign: \'right\'` when > maxAngle', function(done) {
        createMap('canvas');
        createLineString(uglyPath, 'right');
        vectorSource.getFeatures()[0].getStyle().getText().setTextAlign('left');
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-omit.png', IMAGE_TOLERANCE, done);
      });

      it('renders text along a linestring with `textAlign: \'left\'` and no angle limit', function(done) {
        createMap('canvas');
        createLineString(uglyPath, 'left', Infinity);
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-left.png', 3.5, done);
      });

    });

    describe('Text along a nice path', function() {

      it('renders text along a linestring', function(done) {
        createMap('canvas');
        createLineString(nicePath);
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-nice.png', 2.8, done);
      });

      it('aligns text along a linestring correctly with `textBaseline` option', function(done) {
        createMap('canvas');
        createLineString(nicePath, undefined, undefined, 'cyan', 3);
        map.getView().setResolution(0.25);
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-nice-baseline.png', 6.2, done);
      });

      it('renders text along a linestring with `textAlign: \'left\'`', function(done) {
        createMap('canvas');
        createLineString(nicePath, 'left');
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-left-nice.png', 2.8, done);
      });

      it('renders text along a rotated linestring', function(done) {
        createMap('canvas');
        map.getView().setRotation(Math.PI);
        createLineString(nicePath);
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-nice-rotated.png', 4.5, done);
      });

      it('renders text along a rotated linestring with `textAlign: \'left\'`', function(done) {
        createMap('canvas');
        map.getView().setRotation(Math.PI);
        createLineString(nicePath, 'left');
        expectResemble(map, 'rendering/ol/style/expected/text-linestring-left-nice-rotated.png', 4.5, done);
      });
    });

    it('renders text along a MultiLineString', function(done) {
      createMap('canvas');
      var line = new ol.geom.LineString();
      line.setFlatCoordinates('XY', nicePath);
      var geom = new ol.geom.MultiLineString(null);
      geom.appendLineString(line);
      line.translate(0, 50);
      geom.appendLineString(line);
      line.translate(0, -100);
      geom.appendLineString(line);
      var feature = new ol.Feature(geom);
      feature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: 'Hello world',
          placement: 'line',
          font: 'bold 30px sans-serif'
        })
      }));
      vectorSource.addFeature(feature);
      map.getView().fit(vectorSource.getExtent());
      expectResemble(map, 'rendering/ol/style/expected/text-multilinestring.png', 6.9, done);
    });

    it('renders text along a Polygon', function(done) {
      createMap('canvas');
      var geom = new ol.geom.Polygon(null);
      geom.setFlatCoordinates('XY', polygon, [polygon.length]);
      var feature = new ol.Feature(geom);
      feature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: 'Hello world',
          font: 'bold 24px sans-serif',
          placement: 'line',
          exceedLength: true
        })
      }));
      vectorSource.addFeature(feature);
      map.getView().fit(vectorSource.getExtent());
      expectResemble(map, 'rendering/ol/style/expected/text-polygon.png', IMAGE_TOLERANCE, done);
    });

    it('renders text along a MultiPolygon', function(done) {
      createMap('canvas');
      var geom = new ol.geom.Polygon(null);
      geom.setFlatCoordinates('XY', polygon, [polygon.length]);
      var multiPolygon = new ol.geom.MultiPolygon(null);
      multiPolygon.appendPolygon(geom);
      geom.translate(0, 30);
      multiPolygon.appendPolygon(geom);
      geom.translate(0, -60);
      multiPolygon.appendPolygon(geom);
      var feature = new ol.Feature(multiPolygon);
      feature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: 'Hello world',
          font: 'bold 24px sans-serif',
          placement: 'line',
          exceedLength: true
        })
      }));
      vectorSource.addFeature(feature);
      map.getView().fit(vectorSource.getExtent());
      expectResemble(map, 'rendering/ol/style/expected/text-multipolygon.png', 4.4, done);
    });

    where('WebGL').it('tests the webgl renderer without rotation', function(done) {
      createMap('webgl');
      createFeatures();
      expectResemble(map, 'rendering/ol/style/expected/text-webgl.png', 1.8, done);
    });

    where('WebGL').it('tests the webgl renderer with rotation', function(done) {
      createMap('webgl');
      createFeatures();
      map.getView().setRotation(Math.PI / 7);
      expectResemble(map, 'rendering/ol/style/expected/text-rotated-webgl.png', 1.8, done);
    });

  });
});
