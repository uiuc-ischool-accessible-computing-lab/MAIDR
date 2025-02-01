/**
 * Represents a line plot.
 * @class
 */
class LinePlot {
  /**
   * Creates a new instance of LinePlot.
   * @constructor
   */
  constructor() {
    this.SetLineLayer();
    this.SetAxes();
    this.UpdateConstants();
  }

  /**
   * Sets the line layer for the chart.
   */
  SetLineLayer() {
    let elements;
    if ('selector' in singleMaidr) {
      elements = document.querySelectorAll(singleMaidr.selector);
    } else if ('elements' in singleMaidr) {
      elements = singleMaidr.elements;
    }

    if (elements) {
      this.plotLine = elements[elements.length - 1];

      let pointCoords = this.GetPointCoords();
      let pointValues = this.GetPoints();

      this.chartLineX = pointCoords[0]; // x coordinates of curve
      this.chartLineY = pointCoords[1]; // y coordinates of curve

      this.pointValuesX = pointValues[0]; // actual values of x
      this.pointValuesY = pointValues[1]; // actual values of y

      this.curveMinY = Math.min(...this.pointValuesY);
      this.curveMaxY = Math.max(...this.pointValuesY);
    }
  }

  /**
   * Updates the constants for the line plot.
   * This includes the minimum and maximum x and y values, the autoplay rate, and the default speed.
   */
  UpdateConstants() {
    constants.minX = 0;
    constants.maxX = singleMaidr.data.length - 1;
    constants.minY = singleMaidr.data.reduce(
      (min, item) => (item.y < min ? item.y : min),
      singleMaidr.data[0].y
    );
    constants.maxY = singleMaidr.data.reduce(
      (max, item) => (item.y > max ? item.y : max),
      singleMaidr.data[0].y
    );

    constants.autoPlayRate = Math.min(
      Math.ceil(constants.AUTOPLAY_DURATION / (constants.maxX + 1)),
      constants.MAX_SPEED
    );
    constants.DEFAULT_SPEED = constants.autoPlayRate;
    if (constants.autoPlayRate < constants.MIN_SPEED) {
      constants.MIN_SPEED = constants.autoPlayRate;
    }
  }

  /**
   * Returns an array of x and y coordinates of each point in the plot line.
   * @returns {Array<Array<string>>} An array of x and y coordinates of each point in the plot line.
   */
  GetPointCoords() {
    let svgLineCoords = [[], []];
    // lineplot SVG containing path element instead of polyline
    if (this.plotLine instanceof SVGPathElement) {
      // Assuming the path data is in the format "M x y L x y L x y L x y"
      const pathD = this.plotLine.getAttribute('d');
      const regex = /[ML]\s*(-?\d+(\.\d+)?)\s+(-?\d+(\.\d+)?)/g;

      let match;
      while ((match = regex.exec(pathD)) !== null) {
        svgLineCoords[0].push(match[1]); // x coordinate
        svgLineCoords[1].push(match[3]); // y coordinate
      }
    } else {
      let points = this.plotLine.getAttribute('points').split(' ');
      for (let i = 0; i < points.length; i++) {
        if (points[i] !== '') {
          let point = points[i].split(',');
          svgLineCoords[0].push(point[0]);
          svgLineCoords[1].push(point[1]);
        }
      }
    }
    return svgLineCoords;
  }

  /**
   * Returns an array of x and y points from the data object in singleMaidr.
   * @returns {Array<Array<number>>|undefined} An array containing two arrays of numbers representing x and y points respectively, or undefined if data is not defined.
   */
  GetPoints() {
    let x_points = [];
    let y_points = [];

    let data;
    if ('data' in singleMaidr) {
      data = singleMaidr.data;
    }
    if (typeof data !== 'undefined') {
      for (let i = 0; i < data.length; i++) {
        x_points.push(data[i].x);
        y_points.push(data[i].y);
      }
      return [x_points, y_points];
    } else {
      return;
    }
  }

  /**
   * Sets the x and y group labels and title for the line plot based on the axes and title properties of the singleMaidr object.
   */
  SetAxes() {
    let legendX = '';
    let legendY = '';
    if ('axes' in singleMaidr) {
      // legend labels
      if (singleMaidr.axes.x) {
        if (singleMaidr.axes.x.label) {
          if (legendX == '') {
            legendX = singleMaidr.axes.x.label;
          }
        }
      }
      if (singleMaidr.axes.y) {
        if (singleMaidr.axes.y.label) {
          if (legendY == '') {
            legendY = singleMaidr.axes.y.label;
          }
        }
      }
    }

    this.plotLegend = {
      x: legendX,
      y: legendY,
    };

    // title
    this.title = '';
    if ('labels' in singleMaidr) {
      if ('title' in singleMaidr.labels) {
        this.title = singleMaidr.labels.title;
      }
    }
    if (this.title == '') {
      if ('title' in singleMaidr) {
        this.title = singleMaidr.title;
      }
    }

    // subtitle
    if ('labels' in singleMaidr) {
      if ('subtitle' in singleMaidr.labels) {
        this.subtitle = singleMaidr.labels.subtitle;
      }
    }
    // caption
    if ('labels' in singleMaidr) {
      if ('caption' in singleMaidr.labels) {
        this.caption = singleMaidr.labels.caption;
      }
    }
  }

  /**
   * Plays a tone using the audio object.
   */
  PlayTones() {
    audio.playTone();
  }
}

/**
 * Represents a point on a chart.
 * @class
 */
class Point {
  /**
   * Creates a new instance of Point.
   * @constructor
   */
  constructor() {
    this.x = plot.chartLineX[0];
    this.y = plot.chartLineY[0];
  }

  /**
   * Clears the existing points and updates the x and y coordinates for the chart line.
   * @async
   * @returns {Promise<void>}
   */
  async UpdatePoints() {
    await this.ClearPoints();
    this.x = plot.chartLineX[position.x];
    this.y = plot.chartLineY[position.x];
  }

  /**
   * Clears existing points, updates the points, and prints a new point on the chart.
   * @async
   * @returns {Promise<void>}
   */
  async PrintPoints() {
    await this.ClearPoints();
    await this.UpdatePoints();
    const svgns = 'http://www.w3.org/2000/svg';
    var point = document.createElementNS(svgns, 'circle');
    point.setAttribute('id', 'highlight_point');
    point.setAttribute('cx', this.x);
    point.setAttribute('cy', this.y);
    point.setAttribute('r', 1.75);
    point.setAttribute(
      'style',
      'fill:' + constants.colorSelected + ';stroke:' + constants.colorSelected
    );
    constants.chart.appendChild(point);
  }

  /**
   * Removes all highlighted points from the line plot.
   * @async
   */
  async ClearPoints() {
    let points = document.getElementsByClassName('highlight_point');
    for (let i = 0; i < points.length; i++) {
      document.getElementsByClassName('highlight_point')[i].remove();
    }
    if (document.getElementById('highlight_point'))
      document.getElementById('highlight_point').remove();
  }

  /**
   * Clears the points, updates them, and prints them to the display.
   */
  UpdatePointDisplay() {
    this.ClearPoints();
    this.UpdatePoints();
    this.PrintPoints();
  }
}
