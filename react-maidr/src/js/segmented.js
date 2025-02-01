/**
 * Represents a segmented chart.
 * @class
 */
class Segmented {
  /**
   * Creates a new Segmented object.
   * @constructor
   */
  constructor() {
    // initialize variables level, data, and elements
    let fill = null;
    let data = null;
    let elements = null;
    if ('axes' in singleMaidr) {
      //axes.x.level
      if ('x' in singleMaidr.axes) {
        if ('level' in singleMaidr.axes.x) {
          this.level = singleMaidr.axes.x.level;
        }
      } else if ('y' in singleMaidr.axes) {
        if ('level' in singleMaidr.axes.y) {
          this.level = singleMaidr.axes.y.level;
        }
      }
      // axes.fill
      if ('fill' in singleMaidr.axes) {
        if ('level' in singleMaidr.axes.fill) {
          this.fill = singleMaidr.axes.fill.level;
        }
      }
    }
    if ('data' in singleMaidr) {
      data = singleMaidr.data;
    }
    if ('selector' in singleMaidr) {
      elements = document.querySelectorAll(singleMaidr.selector);
    } else if ('elements' in singleMaidr) {
      elements = singleMaidr.elements;
    }

    // gracefull failure: must have level + fill + data, elements optional
    if (elements == null) {
      logError.LogAbsentElement('elements');
      constants.hasRect = 0;
    }
    if (data) {
      if (this.fill) {
        this.fill = this.fill.reverse(); // typically fill is in reverse order
      }
      let dataAndELements = this.ParseData(data, elements);
      this.plotData = dataAndELements[0];
      this.elements = dataAndELements[1];
    } else {
      console.log(
        'Segmented chart missing level, fill, or data. Unable to create chart.'
      );
      return;
    }

    // column labels, both legend and tick
    let legendX = '';
    let legendY = '';
    if ('axes' in singleMaidr) {
      // legend labels
      if (singleMaidr.axes.x) {
        if (singleMaidr.axes.x.label) {
          legendX = singleMaidr.axes.x.label;
        }
      }
      if (singleMaidr.axes.y) {
        if (singleMaidr.axes.y.label) {
          legendY = singleMaidr.axes.y.label;
        }
      }
    }
    // labels override axes
    if ('labels' in singleMaidr) {
      if ('x' in singleMaidr.labels) {
        legendX = singleMaidr.labels.x;
      }
      if ('y' in singleMaidr.labels) {
        legendY = singleMaidr.labels.y;
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

    // set the max and min values for the plot
    this.SetMaxMin();

    // create summary and all levels
    this.CreateSummaryLevel();
    this.CreateAllLevel();

    this.autoplay = null;
  }

  /**
   * Parses data and elements to create a full 2D array of data using level and fill.
   * @param {Array} data - The data to parse.
   * @param {Array} [elements=null] - The elements to parse.
   * @returns {Array} An array containing the parsed plot data and plot elements.
   */
  ParseData(data, elements = null) {
    let plotData = [];
    let plotElements = [];

    // override and kill elements if not same length as data
    if (elements) {
      if (elements.length != data.length) {
        plotElements = null;
      }
    } else {
      plotElements = null;
    }

    // create a full 2d array of data using level and fill
    for (let i = 0; i < this.level.length; i++) {
      for (let j = 0; j < this.fill.length; j++) {
        // loop through data, find matching level and fill, assign value
        // if no match, assign null
        for (let k = 0; k < data.length; k++) {
          // init
          if (!plotData[i]) {
            plotData[i] = [];
            if (plotElements != null) {
              if (!plotElements[i]) {
                plotElements[i] = [];
              }
            }
          }
          if (!plotData[i][j]) {
            plotData[i][j] = 0;
            if (plotElements != null) {
              if (!plotElements[i][j]) {
                plotElements[i][j] = null;
              }
            }
          }
          // set actual values
          if (data[k].x == this.level[i] && data[k].fill == this.fill[j]) {
            plotData[i][j] = data[k].y;
            if (elements) {
              plotElements[i][j] = elements[k];
            }
            break;
          }
        }
      }
    }

    return [plotData, plotElements];
  }

  /**
   * Creates another y level that is the sum of all the other levels.
   */
  CreateSummaryLevel() {
    for (let i = 0; i < this.plotData.length; i++) {
      let sum = 0;
      for (let j = 0; j < this.plotData[i].length; j++) {
        sum += this.plotData[i][j];
      }
      this.plotData[i].push(sum);
    }

    this.fill.push('Sum');
  }

  /**
   * Creates another y level that plays all the other levels separately.
   */
  CreateAllLevel() {
    for (let i = 0; i < this.plotData.length; i++) {
      let all = [];
      for (let j = 0; j < this.fill.length; j++) {
        if (this.fill[j] != 'Sum') {
          all.push(this.plotData[i][j]);
        }
      }
      this.plotData[i].push(all);
    }

    this.fill.push('All');
  }

  /**
   * Plays tones based on the plot data at the current position.
   * If sonifMode is 'on', it plays a run of tones. If sonifMode is 'same', it plays all tones at once.
   */
  PlayTones() {
    if (Array.isArray(this.plotData[position.x][position.y])) {
      if (constants.sonifMode == 'on') {
        // we play a run of tones
        position.z = 0;
        constants.KillSepPlay();
        constants.sepPlayId = setInterval(
          function () {
            // play this tone
            audio.playTone();

            // and then set up for the next one
            position.z += 1;

            // and kill if we're done
            if (!Array.isArray(plot.plotData[position.x][position.y])) {
              constants.KillSepPlay();
              position.z = -1;
            } else if (
              position.z + 1 >
              plot.plotData[position.x][position.y].length
            ) {
              constants.KillSepPlay();
              position.z = -1;
            }
          },
          constants.sonifMode == 'on' ? constants.autoPlayPointsRate : 0
        );
      } else {
        // sonifMode == 'same', so we play all at once

        // adjust these volumes by amplitude, min 50% max 125%
        let volMin = Math.min(...this.plotData[position.x][position.y]);
        let volMax = Math.max(...this.plotData[position.x][position.y]);
        for (let i = 0; i < this.plotData[position.x][position.y].length; i++) {
          position.z = i;
          let vol = audio.SlideBetween(
            this.plotData[position.x][position.y][i],
            volMin,
            volMax,
            constants.combinedVolMin,
            constants.combinedVolMax
          );
          audio.playTone({ volScale: vol });
        }
      }
    } else {
      audio.playTone();
    }
  }

  /**
   * Sets the maximum and minimum values for the y-axis based on the data in `singleMaidr.data`.
   * Also sets the maximum x value, auto play rate, default speed, and minimum speed.
   */
  SetMaxMin() {
    for (let i = 0; i < singleMaidr.data.length; i++) {
      if (i == 0) {
        constants.maxY = singleMaidr.data[i].y;
        constants.minY = singleMaidr.data[i].y;
      } else {
        if (singleMaidr.data[i].y > constants.maxY) {
          constants.maxY = singleMaidr.data[i].y;
        }
        if (singleMaidr.data[i].y < constants.minY) {
          constants.minY = singleMaidr.data[i].y;
        }
      }
    }
    constants.maxX = this.level.length;
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
   * Selects an element and changes its color to a better one.
   */
  Select() {
    this.UnSelectPrevious();
    if (this.elements) {
      this.activeElement = this.elements[position.x][position.y];
      if (this.activeElement) {
        this.activeElementColor = this.activeElement.style.fill;
        let newColor = constants.GetBetterColor(this.activeElementColor);
        this.activeElement.style.fill = newColor;
      }
    }
  }

  /**
   * Unselects the previously selected element by resetting its fill color to the active element color.
   * Also sets the active element to null.
   */
  UnSelectPrevious() {
    if (this.activeElement) {
      this.activeElement.style.fill = this.activeElementColor;
      this.activeElement = null;
    }
  }
}
