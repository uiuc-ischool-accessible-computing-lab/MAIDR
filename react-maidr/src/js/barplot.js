/**
 * Represents a bar chart.
 * @class
 */
class BarChart {
  /**
   * Creates a new instance of Barplot.
   * @constructor
   */
  constructor() {
    // initialize variables xlevel, data, and elements
    let xlevel = null;
    if ('axes' in singleMaidr) {
      if (singleMaidr.axes.x) {
        if (singleMaidr.axes.x.level) {
          xlevel = singleMaidr.axes.x.level;
        }
      }
      // todo: handle y for vertical bar charts
    }
    let data = null;
    if ('data' in singleMaidr) {
      data = singleMaidr.data;
    }
    let elements = null;
    if ('selector' in singleMaidr) {
      elements = document.querySelectorAll(singleMaidr.selector);
    } else if ('elements' in singleMaidr) {
      elements = singleMaidr.elements;
    }

    if (xlevel && data && elements) {
      if (elements.length != data.length) {
        // I didn't throw an error but give a warning
        constants.hasRect = 0;
        logError.LogDifferentLengths('elements', 'data');
      } else if (xlevel.length != elements.length) {
        constants.hasRect = 0;
        logError.LogDifferentLengths('x level', 'elements');
      } else if (data.length != xlevel.length) {
        constants.hasRect = 0;
        logError.LogDifferentLengths('x level', 'data');
      } else {
        this.bars = elements;
        constants.hasRect = 1;
      }
    } else if (data && elements) {
      if (data.length != elements.length) {
        constants.hasRect = 0;
        logError.LogDifferentLengths('data', 'elements');
      } else {
        this.bars = elements;
        constants.hasRect = 1;
      }
    } else if (xlevel && data) {
      if (xlevel.length != data.length) {
        constants.hasRect = 0;
        logError.LogDifferentLengths('x level', 'data');
      }
      logError.LogAbsentElement('elements');
    } else if (data) {
      logError.LogAbsentElement('x level');
      logError.LogAbsentElement('elements');
    }

    // column labels, both legend and tick
    this.columnLabels = [];
    let legendX = '';
    let legendY = '';
    if ('labels' in singleMaidr) {
      if ('x' in singleMaidr.labels) {
        legendX = singleMaidr.labels.x;
      }
      if ('y' in singleMaidr.labels) {
        legendY = singleMaidr.labels.y;
      }
    }
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

      // tick labels
      if (singleMaidr.axes.x) {
        if (singleMaidr.axes.x.level) {
          this.columnLabels = singleMaidr.axes.x.level;
        }
      }
      if (singleMaidr.axes.y) {
        if (singleMaidr.axes.y.level) {
          this.columnLabels = singleMaidr.axes.y.level;
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

    if (Array.isArray(singleMaidr)) {
      this.plotData = singleMaidr;
    } else if ('data' in singleMaidr) {
      this.plotData = singleMaidr.data;
    }

    // set the max and min values for the plot
    this.SetMaxMin();

    this.autoplay = null;
  }

  /**
   * Sets the maximum and minimum values for the plot data and calculates other constants.
   */
  SetMaxMin() {
    for (let i = 0; i < this.plotData.length; i++) {
      if (i == 0) {
        constants.maxY = this.plotData[i];
        constants.minY = this.plotData[i];
      } else {
        if (this.plotData[i] > constants.maxY) {
          constants.maxY = this.plotData[i];
        }
        if (this.plotData[i] < constants.minY) {
          constants.minY = this.plotData[i];
        }
      }
    }
    constants.maxX = this.columnLabels.length;
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
   * Plays a tone using the audio player.
   */
  PlayTones() {
    audio.playTone();
  }

  /**
   * Returns the legend object for the barplot based on manual data.
   * @returns {Object} The legend object with x and y coordinates.
   */
  GetLegendFromManualData() {
    let legend = {};

    legend.x = barplotLegend.x;
    legend.y = barplotLegend.y;

    return legend;
  }

  /**
   * Returns an array of heights for each bar in the plot.
   * @returns {Array} An array of heights for each bar in the plot.
   */
  GetData() {
    // set height for each bar

    let plotData = [];

    if (this.bars) {
      for (let i = 0; i < this.bars.length; i++) {
        plotData.push(this.bars[i].getAttribute('height'));
      }
    }

    return plotData;
  }

  /**
   * Returns an array of column names from the chart.
   * @returns {Array<string>} An array of column names.
   */
  GetColumns() {
    // get column names
    // the pattern seems to be a <tspan> with dy="10", but check this for future output (todo)

    let columnLabels = [];
    let els = constants.chart.querySelectorAll('tspan[dy="10"]'); // todo, generalize this selector
    for (var i = 0; i < els.length; i++) {
      columnLabels.push(els[i].innerHTML);
    }

    return columnLabels;
  }

  /**
   * Returns an object containing the x and y coordinates of the legend.
   * @returns {{x: string, y: string}} An object with x and y properties representing the coordinates of the legend.
   */
  GetLegend() {
    let legend = {};
    let els = constants.chart.querySelectorAll('tspan[dy="12"]'); // todo, generalize this selector
    legend.x = els[1].innerHTML;
    legend.y = els[0].innerHTML;

    return legend;
  }

  /**
   * Parses the innerHTML of elements.
   * @param {Array} els - The array of elements to parse.
   * @returns {Array} - The parsed innerHTML of the elements.
   */
  ParseInnerHTML(els) {
    // parse innerHTML of elements
    let parsed = [];
    for (var i = 0; i < els.length; i++) {
      parsed.push(els[i].innerHTML);
    }
    return parsed;
  }

  /**
   * Selects the active element and changes its color.
   */
  Select() {
    this.UnSelectPrevious();
    if (this.bars) {
      this.activeElement = this.bars[position.x];
      if (this.activeElement) {
        // Case where fill is a direct attribute
        if (this.activeElement.hasAttribute('fill')) {
          this.activeElementColor = this.activeElement.getAttribute('fill');
          // Get new color to highlight and replace fill value
          this.activeElement.setAttribute(
            'fill',
            constants.GetBetterColor(this.activeElementColor)
          );
          // Case where fill is within the style attribute
        } else if (
          this.activeElement.hasAttribute('style') &&
          this.activeElement.getAttribute('style').indexOf('fill') !== -1
        ) {
          let styleString = this.activeElement.getAttribute('style');
          // Extract all style attributes and values
          let styleArray = constants.GetStyleArrayFromString(styleString);
          this.activeElementColor = styleArray[styleArray.indexOf('fill') + 1];
          // Get new color to highlight and replace fill value in style array
          styleArray[styleArray.indexOf('fill') + 1] = constants.GetBetterColor(
            this.activeElementColor
          );
          // Recreate style string and set style attribute
          styleString = constants.GetStyleStringFromArray(styleArray);
          this.activeElement.setAttribute('style', styleString);
        }
      }
    }
  }

  /**
   * Unselects the previously selected element by setting its fill attribute to the original color.
   */
  UnSelectPrevious() {
    if (this.activeElement) {
      // set fill attribute to the original color
      if (this.activeElement.hasAttribute('fill')) {
        this.activeElement.setAttribute('fill', this.activeElementColor);
        this.activeElement = null;
      } else if (
        this.activeElement.hasAttribute('style') &&
        this.activeElement.getAttribute('style').indexOf('fill') !== -1
      ) {
        let styleString = this.activeElement.getAttribute('style');
        let styleArray = constants.GetStyleArrayFromString(styleString);
        styleArray[styleArray.indexOf('fill') + 1] = this.activeElementColor;
        // Recreate style string and set style attribute
        styleString = constants.GetStyleStringFromArray(styleArray);
        this.activeElement.setAttribute('style', styleString);
        this.activeElement = null;
      }
    }
  }
}
