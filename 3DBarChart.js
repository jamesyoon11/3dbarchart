/*  
 *
 *  File: 3DBarChart.js
 *  
 *  Description: - Generate 3D bar chart using SVG
 *  				
 *  Note: JQuery 1.9 or higher is required.
 *
 *
 *  Author: James Yoon
 * 
 *  Date:   08/14/2015
 */
function 3DBarChart(holder, width, height, data, title, settings){

  var _chartHolder = holder,
      _width = width,
      _height = height,
      _data = data,
      _title = title,
      _chartHolderSelector, // jquery selector
      _parallelogramId,      // id of parallelogram shape for reusing
      _range,
      _svg,
      _defs,
      _min,
      _max,
      _decimcalFixed,
      _step = 6,             // Axis steps
      _angle = 30,           // angle of 3d chart
      _depth = 20,           // depth level
      _paddingLeft = 10,
      _paddingRight = 20,
      _paddingTop = 10,
      _paddingBottom = 10,
      _xAxisLabelWidth = 70,    // pixel value for label width
      _yAxisLabelHeight = 20,   // pixel value for label height
      _barWidthSize = 0.3,   // percent value, 0.5 => 50%, 0.8 => 80%, etc
      _barSpacing,      // space between bars
      _titleHeight = 0,      // pixel value of the title height. dynamically calculated
      _xLen = 0, 
      _yLen = 0,
      _yLegends = [],
      _xLegends = [],
      _barData = [],
      _axisCoordinates = [],
      _xDepth,
      _yDepth,
      _axisWidth,
      _axisHeight,
      _xAxisHeight, // individual axis height
      _yAxisWidth, // individual axis width
      _xAxisOffset,
      _yAxisOffset,
      _xAxisPos = [],
      _yAxisPos = [],
      _barWidth,
      _px,
      _py,
      _rect;
      
  
  /**
   *  Draw chart 
   */
  this.draw = function(){

    processSettings();
    processData();
    initialize();
    calcRegionalValues();
    // all function above must be executed.
    
    
    // draw function(s) below can be skipped if not necessary.
    // However, do not change the order.
    
    //drawBackground();
    drawTitle();
    draw3DAxis();
    drawPlotArea();
    drawGrid();
    drawBars();
    drawAxis();
    drawAxisLabel();
    drawLegend();
    
    _chartHolderSelector.html(_chartHolderSelector.html());
  }  
  
  /**
   *  Process data.
   *  Calculates a grid based on min, max and step.
   *  min and max will be adjusted to fit step.
   */
  function processData(){
  
    var unit,
        powerFactor,
        pow10x;
    
    // reset values
    _min = 0;
    _max = 0;
    _barData =[];
    _xLegends = [];
    _yLegends = [];
    
    for(var i = 0; i < _data.length; i++){
      _min = Math.min(_min, _data[i]);
      _max = Math.max(_max, _data[i]);
      _barData.push(_data[i]);
      _xLegends.push(i);
    }
    unit = (_max - _min) / (_step);
    if (unit > 0) {
      powerFactor = Math.ceil((Math.log(unit) / Math.log(10)) - 1);
    } else {
      powerFactor = 0;
    }
    pow10x = Math.pow(10, powerFactor);
    
    if(pow10x < -1){
      _max = Math.ceil(_max);
      unit = (_max - _min) / (_step);
      _range = unit;
    } else {
      _range = Math.ceil(unit / pow10x) * pow10x;
    }
    
    if (_range == 0) _range == 0.01667;
    
    _max = _range * _step;
    
    for(var j = _step; j >= 0; j--){
      _yLegends.push(_range*j);
    }
    if(_max > 20)
      _decimcalFixed = 0;
    else if(_max > 2)
      _decimcalFixed = 1;
    else if(_max > 0.1)
      _decimcalFixed = 2;
    else if(_max > 0.01)
      _decimcalFixed = 3;  
    else if(_max > 0.001)
      _decimcalFixed = 4;  
    else
      _decimcalFixed = 5;  
    
  }
  
  /**
   *  Process settings option
   */
  function processSettings(){
  
    if(settings){
  
      if(settings.hasOwnPropery("paddingLeft")){
        _paddingLeft = settings.paddingLeft;
      }
      if(settings.hasOwnPropery("paddingRight")){
        _paddingRight = settings.paddingRight;
      }
      if(settings.hasOwnPropery("angle")){
        _angle = settings.angle;
      }
    }
  }
  
  /**
   *  Initialize SVG and Definitions (colours)
   */
  function initialize(){
  
    _chartHolderSelector = $(_chartHolder);
    
    _parallelogramId = _chartHolder.replace(/[#.]/gi,'') + 'Parallel';
    
    _chartHolderSelector.empty(); 
    
    _svg = $('<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg"\
              width="' + _width + '" height="' + _height + '" version="1.1">').appendTo(_chartHolderSelector);
    
    _defs = $('<defs></defs>').appendTo(_svg);
    
    _defs.append('\
      <linearGradient id="bluestroke">\
        <stop stop-color="#005086" stop-opacity="1"/>\
      </linearGradient>\
      <linearGradient id = "orangestroke">\
        <stop stop-color = "#B98200" stop-opacity="1"/>\
      </linearGradient>\
      <linearGradient id="blue">\
        <stop stop-color="#0067ac" stop-opacity="1"/>\
      </linearGradient>\
      <linearGradient id="orange">\
        <stop stop-color="#ec881d" stop-opacity="1"/>\
      </linearGradient>\
      <linearGradient id="darkblue">\
        <stop stop-color="#003B6A"  stop-opacity="1"/>\
      </linearGradient>\
      <linearGradient id="darkorange">\
        <stop stop-color="#A45200" stop-opacity="1"/>\
      </linearGradient>\
      <linearGradient id="wall">\
        <stop stop-color="#c9cacc" stop-opacity="1"/>\
      </linearGradient>\
      <linearGradient id="shadow">\
        <stop stop-color="#999999" stop-opacity="1"/>\
      </linearGradient>');
  }
  
  /** 
   *  Draw background (background-color, background-image, copyright, etc)
   */
  function drawBackground(){
    _rect = $('<rect width="100%" height="100%" fill="#eee" stroke-width="0px" />').appendTo(_svg);
  }
  
  /** 
   *  Draw a title if it is necessary
   */
  function drawTitle(){
  
    if(_title != null){
    
      var xPos,
          yPos,
          titleSvgHtml,
          words,
          fontSize = 16,
          fontFamily = '',
          fontWeight = '';
      
      xPos = _width / 2;
      yPos = _paddingTop;
      titleSvgHtml = '';
      words = _title.split("<BR>");
      
      for (var i = 0; i < words.length; i++) {
        if (i % 2 == 0) {
          fontWeight = 'bold';
          fontFamily = 'Arial Black';
          fontSize = 16;
        } else {
          fontWeight = 'normal';
          fontFamily = 'Arial';
          fontSize = 16;
        }
        
        titleSvgHtml += '<g font-size="' + fontSize + 'px" font-family="' + fontFamily + '" fill="#444">';
        titleSvgHtml += '<g text-anchor="middle">';
        titleSvgHtml += '<text x="' + xPos + '" y="' + yPos + '">';
        titleSvgHtml += '<tspan x="' + xPos + '" dy="1.2em" font-weight="' + fontWeight + '" >' + words[i] + '</tspan>';
        titleSvgHtml += '</text>';
        titleSvgHtml += '</g>';
        titleSvgHtml += '</g>';

        yPos += 25;
      }

      _svg.append(titleSvgHtml);
    }
  }
  
  /**
   *  Get the sides of a _parallelogram based on an angle
   *
   *           |------- z --------|
   *           +------------------+
   *          /                  /
   *         /                  /
   *        /                  /
   *       /                  /
   *      +------------------+
   */
  function getParallelSides(z)
  {
    var a = deg2rad(_angle);
    var xp = z * Math.cos(a);
    var yp = z * Math.sin(a);
    
    return {px: xp, py: -yp};
  }
  
  /**
   *  Converts the number in degrees to the radian equivalent
   */
  function deg2rad( d ) { 
    return d * Math.PI / 180 
  }
  
  /**
   *  Converts the number in radian to the degrees equivalent
   */
  function rad2deg( r ) { 
    return r / Math.PI * 180 
  }

  /**
   *  Calculate all values regarding offset, height, and width for chart components
   */
  function calcRegionalValues(){
    
    var z,
        a,
        barParalls,
        xPos,
        yPos;
        
    _titleHeight = _title.split("<BR>").length*30;
        
    z = 1 * _depth;
    
    a = deg2rad(_angle);
    _xDepth = z * Math.cos(a);
    _yDepth = z * Math.sin(a);
    
    _axisWidth = _width - (_xAxisLabelWidth + _paddingLeft + _paddingRight + _xDepth);
    _axisHeight = _height - (_yAxisLabelHeight + _paddingTop + _titleHeight + _paddingBottom + _yDepth);
    
    _xAxisOffset = _paddingBottom + _yDepth + _titleHeight;
    _xAxisHeight = _axisHeight / _yLegends.length;
    
    _yAxisOffset = _xAxisLabelWidth + _paddingLeft;
    _yAxisWidth = _axisWidth / _xLegends.length;
    
    _barWidth = _yAxisWidth*_barWidthSize;
    _barSpacing = _yAxisWidth - _barWidth;
    
    barParalls = getParallelSides(_barWidth);
    _px = barParalls.px;
    _py = barParalls.py;
    
    _yLen = (_height - (_yAxisLabelHeight + _paddingTop + _titleHeight + _paddingBottom));
    
    yPos = _xAxisOffset + _xAxisHeight*_step;
        
    for(var y = 0; y <= _xLegends.length; y++){
      xPos = (_yAxisOffset + (_yAxisWidth * y));
      _xAxisPos.push(xPos);
      _axisCoordinates[y] = {x:xPos, y:yPos };
    }
    
    // Add a parallelogram to use for the top of 3D bar 
    _defs.append('<symbol><path id="' + _parallelogramId + '" d="M0,0 l' + _barWidth + ',0 l' + 
                  _xDepth + ',' + -_yDepth + ' l-' + _barWidth + ',0 z" ></path></symbol>');
    
  }
  
  /**
   *  Draw 3D Axis area
   *
   *      +
   *     /|
   *    / |
   *   +  |
   *   |  |
   *   |  |
   *   |  |
   *   |  +--------------------------+
   *   | /                          /
   *   |/                          /
   *   +--------------------------+  
   *
   *
   */
  function draw3DAxis(){
    
    //console.log('_paddingTop = ' + _paddingTop + ' _titleHeight = ' + _titleHeight + ' _axisHeight = ' + _axisHeight + ' _xAxisHeight = ' + _xAxisHeight);
    
    _svg.append('<g fill="url(#shadow)" stroke="none">\
    <path d="M' + (_paddingLeft + _xAxisLabelWidth) + ' ' + _xAxisOffset + " l" + (_xDepth) + " -" + (_yDepth) +  
           ' l0 ' + (_axisHeight - _xAxisHeight) + ' l-'  + (_xDepth) + " " + (_yDepth) + ' z" />\
    <path d="M' + _yAxisOffset + ' ' + (_paddingTop + _titleHeight + (_axisHeight - _xAxisHeight) + _yDepth) + 
           ' l' + (_xDepth) + ' -' + (_yDepth) +  ' l' + (_axisWidth) + ' 0 l-'  + (_xDepth) + " " + (_yDepth) + ' z" />\
    </g>'); 
  }
  
  /** 
   *  Draw plot area
   */
  function drawPlotArea(){
     
    _svg.append('<g fill="url(#wall)" stroke="none">\
    <rect width="' + _axisWidth + '" x="' + (_paddingLeft + _xAxisLabelWidth + _xDepth) + 
    '" y="' + (_xAxisOffset - _yDepth) + '" height="' + (_axisHeight - _xAxisHeight) + '"></rect>\
    </g>'); 
  }
  
  
  /**
   *  Draw X Grid Lines
   */
  function drawXGridlines(){
  
    var xGridlines = "",
        yPos;
    
    for(var x = 0; x < _yLegends.length; x++){
      yPos = (_xAxisOffset + (_xAxisHeight * x));
      _yAxisPos.push(yPos);
      xGridlines += "M" + (_paddingLeft + _xAxisLabelWidth) + " " + yPos +
                   " l" + (_xDepth) + " -" + (_yDepth) + " l" + (_axisWidth) + " 0 ";
    }
    
    return xGridlines;
  }
  
  /**
   *  Draw Y Grid Lines
   */
  function drawYGridlines(){
  
    var yGridlines = "",
        xPos,
        yPos = _xAxisOffset + _xAxisHeight*_step;
        
    for(var y = 0; y <= _xLegends.length; y++){
      xPos = (_yAxisOffset + (_yAxisWidth * y));
    }
    
    return yGridlines;
  }
  
  /**
   *  Draw XY Grid Lines
   */
  function drawGrid(){
  
    var xGridlines = '',
        yGridlines = '';
        
    xGridlines = drawXGridlines();
    yGridlines = drawYGridlines();
        
    _svg.append('<path d="' + xGridlines + yGridlines + '" stroke="#888" fill="none" stroke-width="1.5px"></path>');    
  }
  
  
  /**
   *  Draw Bars
   */
  function drawBars(){
  
    var xyPos, 
        barHeight, 
        path, 
        x,
        y,
        barWidth = _barWidth,
        translate,
        color,
        yAxisHeight;
    
    translate = getParallelSides((_barWidth - _barSpacing)/2);
    
    for(var i = 0; i < _barData.length; i++){
      xyPos = _axisCoordinates[i];
      yAxisHeight = _axisHeight / _yLegends.length * (_yLegends.length - 1);
      barHeight = _max != 0 ? (_barData[i] / _max) * yAxisHeight : 0 ;
      x = xyPos.x + _barSpacing;
      y = xyPos.y - _barSpacing - barHeight;
      color = getColor(i);
      //decimcalFixed = (_barData[i] < 100 ? (_max < 1 ? 2: 1): 0)
      path = "M0" + ",0 l" + _xDepth + "," + -_yDepth + "l0," + barHeight + " l-" + _xDepth + "," + _yDepth+ " z";
      
      _svg.append('<g transform="translate(' + (-_barSpacing/2) + ',' + _barSpacing + ')" fill="url(#' + color +')" stroke="url(#' + color +'stroke)" stroke-width="1px" id="e4" stroke-linejoin="round">\
      <a>\
          <rect width="' + barWidth + '" x="' + x + '" y="' + y + '" height="' + barHeight + '"></rect>\
          <use xlink:href="#' + _parallelogramId + '" transform="translate(' + x + ',' + y + ')" fill="url(#dark' + color +')"></use>\
          <path d="' + path + '" transform="translate(' + (x + barWidth) + ',' + y + ')" fill="url(#dark' + color +')" ></path>\
          <title>' + formatNumber(_barData[i], _decimcalFixed) + '</title>\
      </a>\
      </g>');
    }
  }
  
  /** 
   *  Get colour based on index
   */
  function getColor(index){
  
    var color = 'blue';
    
    if(index % 2 != 0){
      color = 'orange';
    }
    
    return color;
  }
  
  /**
   *  Draw Axis
   */
  function drawAxis(){
   
    var yPos = _xAxisOffset + _xAxisHeight*_step;
    
    _svg.append('<g stroke="#bbb" stroke-width="2px">\
    <path d="M' + _yAxisOffset + ' ' + yPos + 'h' + _axisWidth + '" />\
    <path d="M' + _yAxisOffset + ' ' + yPos + 'v-' + (_xAxisHeight * (_yLegends.length - 1)) + '" />\
    </g>'); 
  }
  
  /**
   *  Draw Axis Label
   */
  function drawAxisLabel(){
  
    var labelText = '<g font-size="13px" font-family="Arial" font-weight="Bold" fill="#666">',
        drawYAxisLabel = true,
        drawXAxisLabel = false,
        yLabelText = '',
        xLabelText = '',
        yPos,
        xPos;
    
    if(drawYAxisLabel){
      yLabelText = '<g text-anchor="end">';
      
      xPos = _paddingLeft + _xAxisLabelWidth - 10;
      for(var y = 0; y < _yAxisPos.length; y++){
        yPos = _yAxisPos[y];
        yLabelText += '<text x="' + xPos + '" y="' + yPos + '">' + formatNumber(_yLegends[y], _decimcalFixed ) + ' </text>';
      }
      yLabelText += '</g>';
    }
    
    if(drawXAxisLabel){
      
      xLabelText = '<g text-anchor="end">';
      
      yPos = _yAxisPos[_yAxisPos.length - 1] + _yAxisLabelHeight;
      
      for(var x = 0; x < _xAxisPos.length - 1; x++){
        xPos = _xAxisPos[x] + (_yAxisWidth / 2 );
        xLabelText += '<text x="' + xPos + '" y="' + yPos + '" text-anchor="start" >' + _xLegends[x] + ' </text>';
      }
      xLabelText += '</g>';
    }
    
    labelText += yLabelText + xLabelText + '</g>';
    
    _svg.append(labelText);
  }
  
  /**
   *  Draw Legend
   */
  function drawLegend(){
    var legendHtml = '',
        xOffset = 0,
        yOffset = 0,
        rectSize = 15,
        fontSize = 12,
        legendWidth = 0,
        legendSpace = 40,  // space between legend
        margin = 5; // margin between a rectangle and a text
    
    legendWidth = _width / 2;
    xOffset = (_width) / 2 - legendWidth / 2;
    yOffset = (_paddingTop + _titleHeight + _axisHeight + _yDepth);
    
    legendHtml += '<g transform="translate(' + xOffset + ', ' + yOffset + ')" font-size="' + fontSize + 'px" font-family="Arial" font-weight="Bold" fill="#666">';
    
    legendHtml += '<g text-anchor="end">';
    
    legendHtml += '<rect width="' + rectSize + '" height="' + rectSize + '" x="0" y="0" fill="url(#blue)" stroke="url(#bluestroke)" stroke-width="1px"></rect>';
    legendHtml += '<text x="' + (rectSize + margin) + '" y="' + (rectSize - (rectSize - fontSize) ) + '" text-anchor="start" >Without V-locity</text>';
    legendHtml += '<rect width="' + rectSize + '" height="' + rectSize + '" x="' + (rectSize + margin + legendWidth/2 + legendSpace) + '" y="' + (0) + '" fill="url(#orange)" stroke="url(#orangestroke)" stroke-width="1px"></rect>';
    legendHtml += '<text x="' + (rectSize + margin*2 + legendWidth/2 + legendSpace + rectSize) + '" y="' + (rectSize - (rectSize - fontSize) ) + '" text-anchor="start" >With V-locity</text>';
        
    legendHtml += '</g></g>';
    
    _svg.append(legendHtml);    
  }
  
  /**
   *  Format a number
   */
  function formatNumber(value, fixed) {

    var str = '0',
        convertedValue,
        valueStr,
        parts,
        number,
        decimals;

    try {
      convertedValue = value.toFixed(fixed);
      valueStr = new String(convertedValue);
      parts = valueStr.split(".");
      number = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); // thousand format

      str = number;

      if (fixed !== undefined && fixed > 0) {
        decimals = convertedValue.split(".")[1];   // decimcal format
        str += "." + decimals;
      }
      
    } catch (error) {
      vmcLog('error on formatting ' + value + ' by fixed ' + fixed);

      if (fixed !== undefined && fixed > 0) {
        str = value.toFixed(fixed);
      } else {
        str = value.toFixed(0);
      }
    }

    return str;
  }
}