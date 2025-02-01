/**
 * A class representing the display of the chart.
 * @class
 */
class Display {
  /**
   * Creates a new instance of the Display class.
   * @constructor
   */
  constructor() {
    this.infoDiv = constants.infoDiv;

    this.x = {};
    this.x.id = 'x';
    this.x.textBase = 'x-value: ';

    this.y = {};
    this.y.id = 'y';
    this.y.textBase = 'y-value: ';

    this.boxplotGridPlaceholders = [
      resources.GetString('lower_outlier'),
      resources.GetString('min'),
      resources.GetString('25'),
      resources.GetString('50'),
      resources.GetString('75'),
      resources.GetString('max'),
      resources.GetString('upper_outlier'),
    ];
  }

  /**
   * Toggles the text mode between 'off', 'terse', and 'verbose'.
   * Updates the constants.textMode property and announces the new mode.
   */
  toggleTextMode() {
    if (constants.textMode == 'off') {
      constants.textMode = 'terse';
    } else if (constants.textMode == 'terse') {
      constants.textMode = 'verbose';
    } else if (constants.textMode == 'verbose') {
      constants.textMode = 'off';
    }

    this.announceText(
      '<span aria-hidden="true">Text mode:</span> ' + constants.textMode
    );
  }

  /**
   * Toggles braille mode on or off.
   * @param {string} [onoff] - Optional parameter to explicitly set braille mode on or off. If not supplied, defaults to toggling the current braille mode.
   * @returns {void}
   */
  toggleBrailleMode(onoff) {
    // exception: if we just initilized, position might not be in range
    if (position.x < 0) position.x = 0;
    if (position.y < 0) position.y = 0;

    if (constants.chartType == 'point') {
      this.announceText('Braille is not supported in point layer.');
      return;
    }
    if (typeof onoff === 'undefined') {
      if (typeof constants.brailleMode === 'undefined') {
        constants.brailleMode = 'off';
        onoff = constants.brailleMode == 'on';
      } else {
        // switch on/off
        if (constants.brailleMode == 'on') {
          onoff = 'off';
        } else {
          onoff = 'on';
        }
        constants.brailleMode = onoff;
      }
    }
    if (onoff == 'on') {
      if (constants.chartType == 'box') {
        // braille mode is on before any plot is selected
        if (
          constants.plotOrientation != 'vert' &&
          position.x == -1 &&
          position.y == plot.plotData.length
        ) {
          position.x += 1;
          position.y -= 1;
        } else if (
          constants.plotOrientation == 'vert' &&
          position.x == 0 &&
          position.y == plot.plotData[0].length - 1
        ) {
          // do nothing; don't think there's any problem
        }
      }

      constants.brailleMode = 'on';
      document
        .getElementById(constants.braille_container_id)
        .classList.remove('hidden');
      constants.brailleInput.focus();
      constants.brailleInput.setSelectionRange(position.x, position.x);

      this.SetBraille();

      if (constants.chartType == 'heat') {
        let pos = position.y * (plot.num_cols + 1) + position.x;
        constants.brailleInput.setSelectionRange(pos, pos);
      }

      // braille mode is on before navigation of chart
      // very important to make sure braille works properly
      if (position.x == -1 && position.y == -1) {
        constants.brailleInput.setSelectionRange(0, 0);
      }
    } else {
      constants.brailleMode = 'off';
      document
        .getElementById(constants.braille_container_id)
        .classList.add('hidden');

      if (constants.review_container) {
        if (!constants.review_container.classList.contains('hidden')) {
          constants.review.focus();
        } else {
          constants.chart.focus();
        }
      } else {
        constants.chart.focus();
      }
    }

    this.announceText('Braille ' + constants.brailleMode);
  }

  /**
   * Toggles the sonification mode based on the current chart type and sonification mode.
   * If the chart type is point, stacked_bar, stacked_normalized_bar, or dodged_bar, the sonification mode can be toggled between 'off', 'on', and 'same'.
   * If the chart type is not one of the above, the sonification mode can only be toggled between 'off' and 'on'.
   */
  toggleSonificationMode() {
    if (
      constants.chartType == 'point' ||
      constants.chartType == 'stacked_bar' ||
      constants.chartType == 'stacked_normalized_bar' ||
      constants.chartType == 'dodged_bar'
    ) {
      if (constants.sonifMode == 'off') {
        constants.sonifMode = 'on';
        this.announceText(resources.GetString('son_sep'));
      } else if (constants.sonifMode == 'on') {
        constants.sonifMode = 'same';
        this.announceText(resources.GetString('son_same'));
      } else if (constants.sonifMode == 'same') {
        constants.sonifMode = 'off';
        this.announceText(resources.GetString('son_off'));
      }
    } else {
      if (constants.sonifMode == 'off') {
        constants.sonifMode = 'on';
        this.announceText(resources.GetString('son_on'));
      } else {
        constants.sonifMode = 'off';
        this.announceText(resources.GetString('son_off'));
      }
    }
  }

  /**
   * Changes the chart layer up or down and updates the position relative to where we were on the previous layer.
   * This only applies to charts that have multiple layers, such as point and smooth in a standard scatterplot.
   * @param {string} [updown='down'] - The direction to change the chart layer. Can be 'up' or 'down'. Defaults to 'down'.
   */
  changeChartLayer(updown = 'down') {
    // get possible chart types, where we are, and move between them
    let chartTypes = maidr.type;
    if (Array.isArray(chartTypes)) {
      let currentIndex = chartTypes.indexOf(constants.chartType);
      if (updown == 'down') {
        if (currentIndex == 0) {
          //constants.chartType = chartTypes[chartTypes.length - 1];
        } else {
          constants.chartType = chartTypes[currentIndex - 1];
          this.announceText('Switched to ' + constants.chartType); // todo: connect this to a resource file so it can be localized
        }
      } else {
        if (currentIndex == chartTypes.length - 1) {
          //constants.chartType = chartTypes[0];
        } else {
          constants.chartType = chartTypes[currentIndex + 1];
          this.announceText('Switched to ' + constants.chartType); // todo: connect this to a resource file so it can be localized
        }
      }
    }

    // update position relative to where we were on the previous layer
    // newX = oldX * newLen / oldLen
    if (constants.chartType == 'point') {
      position.x = Math.round(
        ((plot.x.length - 1) * positionL1.x) / (plot.curvePoints.length - 1)
      );
    } else if (constants.chartType == 'smooth') {
      // reverse math of the above
      positionL1.x = Math.round(
        ((plot.curvePoints.length - 1) * position.x) / (plot.x.length - 1)
      );
    }
  }

  /**
   * Sets the text of the announce container element.
   * @param {string} txt - The text to be displayed in the announce container.
   */
  announceText(txt) {
    this.displayInfo('announce', txt, constants.announceContainer);
  }

  /**
   * Updates the position of the cursor in the braille display based on the current chart type and position.
   */
  UpdateBraillePos() {
    if (
      constants.chartType == 'bar' ||
      constants.chartType == 'hist' ||
      constants.chartType == 'line'
    ) {
      constants.brailleInput.setSelectionRange(position.x, position.x);
    } else if (
      constants.chartType == 'stacked_bar' ||
      constants.chartType == 'stacked_normalized_bar' ||
      constants.chartType == 'dodged_bar'
    ) {
      // if we're not on the top y position
      let pos = null;
      if (position.y < plot.plotData[0].length - 1) {
        pos = position.x;
      } else {
        pos = position.x * (plot.fill.length + 1) + position.y;
      }
      constants.brailleInput.setSelectionRange(pos, pos);
    } else if (constants.chartType == 'heat') {
      let pos = position.y * (plot.num_cols + 1) + position.x;
      constants.brailleInput.setSelectionRange(pos, pos);
    } else if (constants.chartType == 'box') {
      // on box we extend characters a lot and have blanks, so we go to our type
      let sectionPos =
        constants.plotOrientation == 'vert' ? position.y : position.x;
      let targetLabel = this.boxplotGridPlaceholders[sectionPos];
      let haveTargetLabel = false;
      let adjustedPos = 0;
      if (constants.brailleData) {
        for (let i = 0; i < constants.brailleData.length; i++) {
          if (constants.brailleData[i].type != 'blank') {
            if (
              resources.GetString(constants.brailleData[i].type) == targetLabel
            ) {
              haveTargetLabel = true;
              break;
            }
          }
          adjustedPos += constants.brailleData[i].numChars;
        }
      } else {
        throw 'Braille data not set up, cannot move cursor in braille, sorry.';
      }
      // but sometimes we don't have our targetLabel, go to the start
      // future todo: look for nearby label and go to the nearby side of that
      if (!haveTargetLabel) {
        adjustedPos = 0;
      }

      constants.brailleInput.setSelectionRange(adjustedPos, adjustedPos);
    } else if (
      singleMaidr.type == 'smooth' ||
      singleMaidr.type.includes('smooth')
    ) {
      constants.brailleInput.setSelectionRange(positionL1.x, positionL1.x);
    }
  }

  /**
   * Builds an html text string to output to both visual users and aria live based on what chart we're on, our position, and the mode.
   * Typical output is something like "x is 5, y is 10".
   * @function
   * @memberof module:display
   * @returns {void}
   */
  displayValues() {
    // we build an html text string to output to both visual users and aria live based on what chart we're on, our position, and the mode
    // note: we do this all as one string rather than changing individual element IDs so that aria-live receives a single update

    let output = '';
    let verboseText = '';
    let reviewText = '';
    if (constants.chartType == 'bar') {
      // {legend x} is {colname x}, {legend y} is {value y}
      if (plot.columnLabels[position.x]) {
        if (plot.plotLegend.x.length > 0) {
          verboseText += plot.plotLegend.x + ' is ';
        }
        verboseText += plot.columnLabels[position.x] + ', ';
      }
      if (plot.plotData[position.x]) {
        if (plot.plotLegend) {
          verboseText += plot.plotLegend.y + ' is ';
        }
        verboseText += plot.plotData[position.x];
      }
      if (constants.textMode == 'off') {
        // do nothing :D
      } else if (constants.textMode == 'terse') {
        // {colname} {value}
        output +=
          '<p>' +
          plot.columnLabels[position.x] +
          ' ' +
          plot.plotData[position.x] +
          '</p>\n';
      } else if (constants.textMode == 'verbose') {
        output += '<p>' + verboseText + '</p>\n';
      }
    } else if (constants.chartType == 'heat') {
      // col name and value
      if (constants.navigation == 1) {
        verboseText +=
          plot.x_group_label +
          ' ' +
          plot.x_labels[position.x] +
          ', ' +
          plot.y_group_label +
          ' ' +
          plot.y_labels[position.y] +
          ', ' +
          plot.fill +
          ' is ';
        // if (constants.hasRect) {
        verboseText += plot.data[position.y][position.x];
        // }
      } else {
        verboseText +=
          plot.y_group_label +
          ' ' +
          plot.y_labels[position.y] +
          ', ' +
          plot.x_group_label +
          ' ' +
          plot.x_labels[position.x] +
          ', ' +
          plot.fill +
          ' is ';
        // if (constants.hasRect) {
        verboseText += plot.data[position.y][position.x];
        // }
      }
      // terse and verbose alternate between columns and rows
      if (constants.textMode == 'off') {
        // do nothing :D
      } else if (constants.textMode == 'terse') {
        // value only
        if (constants.navigation == 1) {
          // column navigation
          output +=
            '<p>' +
            plot.x_labels[position.x] +
            ', ' +
            plot.data[position.y][position.x] +
            '</p>\n';
        } else {
          // row navigation
          output +=
            '<p>' +
            plot.y_labels[position.y] +
            ', ' +
            plot.data[position.y][position.x] +
            '</p>\n';
        }
      } else if (constants.textMode == 'verbose') {
        output += '<p>' + verboseText + '</p>\n';
      }
    } else if (constants.chartType == 'box') {
      // setup
      let val = 0;
      let numPoints = 1;
      let isOutlier = false;
      let plotPos =
        constants.plotOrientation == 'vert' ? position.x : position.y;
      let sectionKey = plot.GetSectionKey(
        constants.plotOrientation == 'vert' ? position.y : position.x
      );
      let textTerse = '';
      let textVerbose = '';

      if (sectionKey == 'lower_outlier' || sectionKey == 'upper_outlier') {
        isOutlier = true;
      }
      if (plot.plotData[plotPos][sectionKey] == null) {
        val = '';
        if (isOutlier) numPoints = 0;
      } else if (isOutlier) {
        val = plot.plotData[plotPos][sectionKey].join(', ');
        numPoints = plot.plotData[plotPos][sectionKey].length;
      } else {
        val = plot.plotData[plotPos][sectionKey];
      }

      // set output

      // group label for verbose
      if (constants.navigation) {
        if (plot.x_group_label) textVerbose += plot.x_group_label;
      } else if (!constants.navigation) {
        if (plot.y_group_label) textVerbose += plot.y_group_label;
      }
      // and axes label
      if (constants.navigation) {
        if (plot.x_labels[plotPos]) {
          textVerbose += ' is ';
          textTerse += plot.x_labels[plotPos] + ', ';
          textVerbose += plot.x_labels[plotPos] + ', ';
        } else {
          textVerbose += ', ';
        }
      } else if (!constants.navigation) {
        if (plot.y_labels[plotPos]) {
          textVerbose += ' is ';
          textTerse += plot.y_labels[plotPos] + ', ';
          textVerbose += plot.y_labels[plotPos] + ', ';
        } else {
          textVerbose += ', ';
        }
      }
      // outliers
      if (isOutlier) {
        textTerse += numPoints + ' ';
        textVerbose += numPoints + ' ';
      }
      // label
      textVerbose += resources.GetString(sectionKey);
      if (numPoints == 1) textVerbose += ' is ';
      else {
        textVerbose += 's ';
        if (numPoints > 1) textVerbose += ' are ';
      }
      if (
        isOutlier ||
        (constants.navigation && constants.plotOrientation == 'horz') ||
        (!constants.navigation && constants.plotOrientation == 'vert')
      ) {
        textTerse += resources.GetString(sectionKey);

        // grammar
        if (numPoints != 1) {
          textTerse += 's';
        }
        textTerse += ' ';
      }
      // val
      if (plot.plotData[plotPos][sectionKey] != null && !isOutlier) {
        textTerse += 'empty';
        textVerbose += 'empty';
      } else {
        textTerse += val;
        textVerbose += val;
      }

      verboseText = textVerbose; // yeah it's an extra var, who cares
      if (constants.textMode == 'verbose')
        output = '<p>' + textVerbose + '</p>\n';
      else if (constants.textMode == 'terse')
        output = '<p>' + textTerse + '</p>\n';
    } else if (
      [].concat(singleMaidr.type).includes('point') ||
      [].concat(singleMaidr.type).includes('smooth')
    ) {
      if (constants.chartType == 'point') {
        // point layer
        verboseText +=
          plot.x_group_label +
          ' ' +
          plot.x[position.x] +
          ', ' +
          plot.y_group_label +
          ' [' +
          plot.y[position.x].join(', ') +
          ']';

        if (constants.textMode == 'off') {
          // do nothing
        } else if (constants.textMode == 'terse') {
          output +=
            '<p>' +
            plot.x[position.x] +
            ', ' +
            '[' +
            plot.y[position.x].join(', ') +
            ']' +
            '</p>\n';
        } else if (constants.textMode == 'verbose') {
          // set from verboseText
        }
      } else if (constants.chartType == 'smooth') {
        // best fit smooth layer
        verboseText +=
          plot.x_group_label +
          ' ' +
          plot.curveX[positionL1.x] +
          ', ' +
          plot.y_group_label +
          ' ' +
          plot.curvePoints[positionL1.x]; // verbose mode: x and y values

        if (constants.textMode == 'off') {
          // do nothing
        } else if (constants.textMode == 'terse') {
          // terse mode: gradient trend
          // output += '<p>' + plot.gradient[positionL1.x] + '<p>\n';

          // display absolute gradient of the graph
          output += '<p>' + plot.curvePoints[positionL1.x] + '<p>\n';
        } else if (constants.textMode == 'verbose') {
          // set from verboseText
        }
      }
      if (constants.textMode == 'verbose')
        output = '<p>' + verboseText + '</p>\n';
    } else if (constants.chartType == 'hist') {
      if (constants.textMode == 'terse') {
        // terse: {x}, {y}
        output =
          '<p>' +
          plot.plotData[position.x].x +
          ', ' +
          plot.plotData[position.x].y +
          '</p>\n';
      } else if (constants.textMode == 'verbose') {
        // verbose: {xlabel} is xmin through xmax, {ylabel} is y
        output = '<p>';
        if (plot.legendX) {
          output = plot.legendX + ' is ';
        }
        output += plot.plotData[position.x].xmin;
        output += ' through ' + plot.plotData[position.x].xmax + ', ';
        if (plot.legendY) {
          output += plot.legendY + ' is ';
        }
        output += plot.plotData[position.x].y;
      }
    } else if (constants.chartType == 'line') {
      // line layer
      if (plot.plotLegend) {
        verboseText += plot.plotLegend.x + ' is ';
      }
      verboseText += plot.pointValuesX[position.x] + ', ';
      if (plot.plotLegend) {
        plot.plotLegend.y + ' is ';
      }
      verboseText += plot.pointValuesY[position.x];

      if (constants.textMode == 'off') {
        // do nothing
      } else if (constants.textMode == 'terse') {
        output +=
          '<p>' +
          plot.pointValuesX[position.x] +
          ', ' +
          plot.pointValuesY[position.x] +
          '</p>\n';
      } else if (constants.textMode == 'verbose') {
        // set from verboseText
        output += '<p>' + verboseText + '</p>\n';
      }
    } else if (
      constants.chartType == 'stacked_bar' ||
      constants.chartType == 'stacked_normalized_bar' ||
      constants.chartType == 'dodged_bar'
    ) {
      // {legend x} is {colname x}, {legend y} is {colname y}, value is {plotData[x][y]}
      if (plot.plotLegend) {
        verboseText += plot.plotLegend.x + ' is ';
      }
      verboseText += plot.level[position.x] + ', ';
      if (plot.plotLegend) {
        verboseText += plot.plotLegend.y + ' is ';
      }
      verboseText += plot.fill[position.y] + ', ';
      verboseText += 'value is ' + plot.plotData[position.x][position.y];

      if (constants.textMode == 'off') {
        // do nothing
      } else if (constants.textMode == 'terse') {
        // navigation == 1 ? {colname x} : {colname y} is {plotData[x][y]}
        if (constants.navigation == 1) {
          output +=
            '<p>' +
            plot.level[position.x] +
            ' is ' +
            plot.plotData[position.x][position.y] +
            '</p>\n';
        } else {
          output +=
            '<p>' +
            plot.fill[position.y] +
            ' is ' +
            plot.plotData[position.x][position.y] +
            '</p>\n';
        }
      } else {
        output += '<p>' + verboseText + '</p>\n';
      }
    }

    if (constants.infoDiv) constants.infoDiv.innerHTML = output;
    if (constants.review) {
      if (output.length > 0) {
        constants.review.value = output.replace(/<[^>]*>?/gm, '');
      } else {
        constants.review.value = verboseText;
      }
    }
  }

  /**
   * Displays information on the webpage and an aria live region based on the textType and textValue provided.
   * @param {string} textType - The type of text to be displayed.
   * @param {string} textValue - The value of the text to be displayed.
   */
  displayInfo(textType, textValue, elem = constants.infoDiv) {
    let textToAdd = '';
    if (textType == 'announce') {
      if (textValue) {
        textToAdd = textValue;
      }
    } else if (textType) {
      if (textValue) {
        if (constants.textMode == 'terse') {
          textToAdd = textValue;
        } else if (constants.textMode == 'verbose') {
          let capsTextType =
            textType.charAt(0).toUpperCase() + textType.slice(1);
          textToAdd = capsTextType + ' is ' + textValue;
        }
      } else {
        let aOrAn = ['a', 'e', 'i', 'o', 'u'].includes(textType.charAt(0))
          ? 'an'
          : 'a';

        textToAdd = 'Plot does not have ' + aOrAn + ' ' + textType;
      }
    }
    if (textToAdd.length > 0) {
      elem.innerHTML = null;
      let p = document.createElement('p');
      p.innerHTML = textToAdd;
      elem.appendChild(p);
    }
  }

  /**
   * Sets the braille representation of the chart based on the current chart type and plot data.
   */
  SetBraille() {
    let brailleArray = [];

    if (constants.chartType == 'heat') {
      let range = (constants.maxY - constants.minY) / 3;
      let low = constants.minY + range;
      let medium = low + range;
      let high = medium + range;
      for (let i = 0; i < plot.data.length; i++) {
        for (let j = 0; j < plot.data[i].length; j++) {
          if (plot.data[i][j] == 0) {
            brailleArray.push('⠀');
          } else if (plot.data[i][j] <= low) {
            brailleArray.push('⠤');
          } else if (plot.data[i][j] <= medium) {
            brailleArray.push('⠒');
          } else {
            brailleArray.push('⠉');
          }
        }
        brailleArray.push('⠳');
      }
    } else if (
      constants.chartType == 'stacked_bar' ||
      constants.chartType == 'stacked_normalized_bar' ||
      constants.chartType == 'dodged_bar'
    ) {
      // if we're not on the top y position, display just this level, using local min max
      if (position.y < plot.plotData[0].length - 1) {
        let localMin = null;
        let localMax = null;
        for (let i = 0; i < plot.plotData.length; i++) {
          if (i == 0) {
            localMin = plot.plotData[i][position.y];
            localMax = plot.plotData[i][position.y];
          } else {
            if (plot.plotData[i][position.y] < localMin) {
              localMin = plot.plotData[i][position.y];
            }
            if (plot.plotData[i][position.y] > localMax) {
              localMax = plot.plotData[i][position.y];
            }
          }
        }
        let range = (localMax - localMin) / 4;
        let low = localMin + range;
        let medium = low + range;
        let medium_high = medium + range;
        for (let i = 0; i < plot.plotData.length; i++) {
          if (plot.plotData[i][position.y] == 0) {
            brailleArray.push('⠀');
          } else if (plot.plotData[i][position.y] <= low) {
            brailleArray.push('⣀');
          } else if (plot.plotData[i][position.y] <= medium) {
            brailleArray.push('⠤');
          } else if (plot.plotData[i][position.y] <= medium_high) {
            brailleArray.push('⠒');
          } else {
            brailleArray.push('⠉');
          }
        }
      } else {
        // all mode, do braille similar to heatmap, with all data and seperator
        for (let i = 0; i < plot.plotData.length; i++) {
          let range = (constants.maxY - constants.minY) / 4;
          let low = constants.minY + range;
          let medium = low + range;
          let medium_high = medium + range;
          for (let j = 0; j < plot.plotData[i].length; j++) {
            if (plot.plotData[i][j] == 0) {
              brailleArray.push('⠀');
            } else if (plot.plotData[i][j] <= low) {
              brailleArray.push('⣀');
            } else if (plot.plotData[i][j] <= medium) {
              brailleArray.push('⠤');
            } else if (plot.plotData[i][j] <= medium_high) {
              brailleArray.push('⠒');
            } else {
              brailleArray.push('⠉');
            }
          }
          brailleArray.push('⠳');
        }
      }
    } else if (constants.chartType == 'bar') {
      let range = (constants.maxY - constants.minY) / 4;
      let low = constants.minY + range;
      let medium = low + range;
      let medium_high = medium + range;
      for (let i = 0; i < plot.plotData.length; i++) {
        if (plot.plotData[i] <= low) {
          brailleArray.push('⣀');
        } else if (plot.plotData[i] <= medium) {
          brailleArray.push('⠤');
        } else if (plot.plotData[i] <= medium_high) {
          brailleArray.push('⠒');
        } else {
          brailleArray.push('⠉');
        }
      }
    } else if (constants.chartType == 'smooth') {
      let range = (plot.curveMaxY - plot.curveMinY) / 4;
      let low = plot.curveMinY + range;
      let medium = low + range;
      let medium_high = medium + range;
      let high = medium_high + range;
      for (let i = 0; i < plot.curvePoints.length; i++) {
        if (plot.curvePoints[i] <= low) {
          brailleArray.push('⣀');
        } else if (plot.curvePoints[i] <= medium) {
          brailleArray.push('⠤');
        } else if (plot.curvePoints[i] <= medium_high) {
          brailleArray.push('⠒');
        } else if (plot.curvePoints[i] <= high) {
          brailleArray.push('⠉');
        }
      }
    } else if (constants.chartType == 'hist') {
      let range = (constants.maxY - constants.minY) / 4;
      let low = constants.minY + range;
      let medium = low + range;
      let medium_high = medium + range;
      for (let i = 0; i < plot.plotData.length; i++) {
        if (plot.plotData[i].y <= low) {
          brailleArray.push('⣀');
        } else if (plot.plotData[i].y <= medium) {
          brailleArray.push('⠤');
        } else if (plot.plotData[i].y <= medium_high) {
          brailleArray.push('⠒');
        } else {
          brailleArray.push('⠉');
        }
      }
    } else if (constants.chartType == 'box' && position.y > -1) {
      // Idea here is to use different braille characters to physically represent the box
      // if sections are longer or shorter we'll add more characters
      // example: outlier, small space, long min, med 25/50/75, short max: ⠂ ⠒⠒⠒⠒⠒⠒⠿⠸⠿⠒
      //
      // So, we get weighted lengths of each section (or gaps between outliers, etc),
      // and then create the appropriate number of characters
      // Full explanation on readme
      //
      // This is messy and long (250 lines). If anyone wants to improve, be my guest

      // Some init stuff
      let plotPos;
      let globalMin;
      let globalMax;
      let numSections = plot.sections.length;
      if (constants.plotOrientation == 'vert') {
        plotPos = position.x;
        globalMin = constants.minY;
        globalMax = constants.maxY;
      } else {
        plotPos = position.y;
        globalMin = constants.minX;
        globalMax = constants.maxX;
      }

      // We convert main plot data to array of values and types, including min and max, and seperating outliers and removing nulls
      let valData = [];
      valData.push({ type: 'global_min', value: globalMin });
      for (let i = 0; i < numSections; i++) {
        let sectionKey = plot.sections[i];
        let point = plot.plotData[plotPos][sectionKey];
        let charData = {};

        if (point != null) {
          if (sectionKey == 'lower_outlier' || sectionKey == 'upper_outlier') {
            for (let j = 0; j < point.length; j++) {
              charData = {
                type: sectionKey,
                value: point[j],
              };
              valData.push(charData);
            }
          } else {
            charData = {
              type: sectionKey,
              value: point,
            };
            valData.push(charData);
          }
        }
      }
      valData.push({ type: 'global_max', value: globalMax });

      // Then we convert to lengths and types
      // We assign lengths based on the difference between each point, and assign blanks if this comes before or after an outlier
      let lenData = [];
      let isBeforeMid = true;
      for (let i = 0; i < valData.length; i++) {
        let diff;
        // we compare inwardly, and midpoint is len 0
        if (isBeforeMid) {
          diff = Math.abs(valData[i + 1].value - valData[i].value);
        } else {
          diff = Math.abs(valData[i].value - valData[i - 1].value);
        }

        if (
          valData[i].type == 'global_min' ||
          valData[i].type == 'global_max'
        ) {
          lenData.push({ type: 'blank', length: diff });
        } else if (valData[i].type == 'lower_outlier') {
          // add diff as space, as well as a 0 len outlier point
          // add blank last, as the earlier point is covered by global_min
          lenData.push({ type: valData[i].type, length: 0 });
          lenData.push({ type: 'blank', length: diff });
        } else if (valData[i].type == 'upper_outlier') {
          // add diff as space, as well as a 0 len outlier point, but reverse order from lower_outlier obvs
          lenData.push({ type: 'blank', length: diff });
          lenData.push({ type: valData[i].type, length: 0 });
        } else if (valData[i].type == 'q2') {
          // change calc method after midpoint, as we want spacing to go outward from center (and so center has no length)
          isBeforeMid = false;
          lenData.push({ type: valData[i].type, length: 0 });
        } else {
          // normal points
          lenData.push({ type: valData[i].type, length: diff });
        }
      }

      // We create a set of braille characters based on the lengths

      // Method:
      // We normalize the lengths of each characters needed length
      // by the total number of characters we have availble
      // (including offset from characters requiring 1 character).
      // Then apply the appropriate number of characters to each

      // A few exceptions:
      // exception: each must have min 1 character (not blanks or length 0)
      // exception: for 25/75 and min/max, if they aren't exactly equal, assign different num characters
      // exception: center is always 456 123

      // Step 1, sorta init.
      // We prepopulate each non null section with a single character, and log for character offset
      let locMin = -1;
      let locQ1 = -1;
      let locQ3 = -1;
      let locMax = -1;
      let numAllocatedChars = 0; // counter for number of characters we've already assigned
      for (let i = 0; i < lenData.length; i++) {
        if (
          lenData[i].type != 'blank' &&
          (lenData[i].length > 0 ||
            lenData[i].type == 'lower_outlier' ||
            lenData[i].type == 'upper_outlier')
        ) {
          lenData[i].numChars = 1;
          numAllocatedChars++;
        } else {
          lenData[i].numChars = 0;
        }

        // store 25/75 min/max locations so we can check them later more easily
        if (lenData[i].type == 'min' && lenData[i].length > 0) locMin = i;
        if (lenData[i].type == 'max' && lenData[i].length > 0) locMax = i;
        if (lenData[i].type == 'q1') locQ1 = i;
        if (lenData[i].type == 'q3') locQ3 = i;

        // 50 gets 2 characters by default
        if (lenData[i].type == 'q2') {
          lenData[i].numChars = 2;
          numAllocatedChars++; // we just ++ here as we already ++'d above
        }
      }

      // make sure rules are set for pairs (q1 / q3, min / max)
      // if they're equal length, we don't need to do anything as they already each have 1 character
      // if they're not equal length, we need to add 1 character to the longer one
      if (locMin > -1 && locMax > -1) {
        // we do it this way as we don't always have both min and max

        if (lenData[locMin].length != lenData[locMax].length) {
          if (lenData[locMin].length > lenData[locMax].length) {
            lenData[locMin].numChars++;
            numAllocatedChars++;
          } else {
            lenData[locMax].numChars++;
            numAllocatedChars++;
          }
        }
      }
      // same for q1/q3
      if (lenData[locQ1].length != lenData[locQ3].length) {
        if (lenData[locQ1].length > lenData[locQ3].length) {
          lenData[locQ1].numChars++;
          numAllocatedChars++;
        } else {
          lenData[locQ3].numChars++;
          numAllocatedChars++;
        }
      }

      // Step 2: normalize and allocate remaining characters and add to our main braille array
      let charsAvailable = constants.brailleDisplayLength - numAllocatedChars;
      let allocateCharacters = this.AllocateCharacters(lenData, charsAvailable);
      // apply allocation
      let brailleData = lenData;
      for (let i = 0; i < allocateCharacters.length; i++) {
        if (allocateCharacters[i]) {
          brailleData[i].numChars += allocateCharacters[i];
        }
      }

      constants.brailleData = brailleData;
      if (constants.debugLevel > 5) {
        console.log('plotData[i]', plot.plotData[plotPos]);
        console.log('valData', valData);
        console.log('lenData', lenData);
        console.log('brailleData', brailleData);
      }

      // convert to braille characters
      for (let i = 0; i < brailleData.length; i++) {
        for (let j = 0; j < brailleData[i].numChars; j++) {
          let brailleChar = '⠀'; // blank
          if (brailleData[i].type == 'min' || brailleData[i].type == 'max') {
            brailleChar = '⠒';
          } else if (
            brailleData[i].type == 'q1' ||
            brailleData[i].type == 'q3'
          ) {
            brailleChar = '⠿';
          } else if (brailleData[i].type == 'q2') {
            if (j == 0) {
              brailleChar = '⠸';
            } else {
              brailleChar = '⠇';
            }
          } else if (
            brailleData[i].type == 'lower_outlier' ||
            brailleData[i].type == 'upper_outlier'
          ) {
            brailleChar = '⠂';
          }
          brailleArray.push(brailleChar);
        }
      }
    } else if (constants.chartType == 'line') {
      // TODO
      // ⠑
      let range = (constants.maxY - constants.minY) / 4;
      let low = constants.minY + range;
      let medium = low + range;
      let medium_high = medium + range;
      let high = medium_high + range;

      for (let i = 0; i < plot.pointValuesY.length; i++) {
        if (
          plot.pointValuesY[i] <= low &&
          i - 1 >= 0 &&
          plot.pointValuesY[i - 1] > low
        ) {
          // move from higher ranges to low
          if (plot.pointValuesY[i - 1] <= medium) {
            // move away from medium range
            brailleArray.push('⢄');
          } else if (plot.pointValuesY[i - 1] <= medium_high) {
            // move away from medium high range
            brailleArray.push('⢆');
          } else if (plot.pointValuesY[i - 1] > medium_high) {
            // move away from high range
            brailleArray.push('⢇');
          }
        } else if (plot.pointValuesY[i] <= low) {
          // in the low range
          brailleArray.push('⣀');
        } else if (i - 1 >= 0 && plot.pointValuesY[i - 1] <= low) {
          // move from low to higher ranges
          if (plot.pointValuesY[i] <= medium) {
            // move to medium range
            brailleArray.push('⡠');
          } else if (plot.pointValuesY[i] <= medium_high) {
            // move to medium high range
            brailleArray.push('⡰');
          } else if (plot.pointValuesY[i] > medium_high) {
            // move to high range
            brailleArray.push('⡸');
          }
        } else if (
          plot.pointValuesY[i] <= medium &&
          i - 1 >= 0 &&
          plot.pointValuesY[i - 1] > medium
        ) {
          if (plot.pointValuesY[i - 1] <= medium_high) {
            // move away from medium high range to medium
            brailleArray.push('⠢');
          } else if (plot.pointValuesY[i - 1] > medium_high) {
            // move away from high range
            brailleArray.push('⠣');
          }
        } else if (plot.pointValuesY[i] <= medium) {
          brailleArray.push('⠤');
        } else if (i - 1 >= 0 && plot.pointValuesY[i - 1] <= medium) {
          // move from medium to higher ranges
          if (plot.pointValuesY[i] <= medium_high) {
            // move to medium high range
            brailleArray.push('⠔');
          } else if (plot.pointValuesY[i] > medium_high) {
            // move to high range
            brailleArray.push('⠜');
          }
        } else if (
          plot.pointValuesY[i] <= medium_high &&
          i - 1 >= 0 &&
          plot.pointValuesY[i - 1] > medium_high
        ) {
          // move away from high range to medium high
          brailleArray.push('⠑');
        } else if (plot.pointValuesY[i] <= medium_high) {
          brailleArray.push('⠒');
        } else if (i - 1 >= 0 && plot.pointValuesY[i - 1] <= medium_high) {
          // move from medium high to high range
          brailleArray.push('⠊');
        } else if (plot.pointValuesY[i] <= high) {
          brailleArray.push('⠉');
        }
      }
    }

    constants.brailleInput.value = brailleArray.join('');

    constants.brailleInput.value = brailleArray.join('');
    if (constants.debugLevel > 5) {
      console.log('braille:', constants.brailleInput.value);
    }

    this.UpdateBraillePos();
  }

  /**
   * Calculates the impact of character length on the given character data.
   * Used by boxplots.
   * @param {Object} charData - The character data to calculate the impact for.
   * @param {number} charData.length - The total length of all characters.
   * @param {number} charData.numChars - The total number of characters.
   * @returns {number} The impact of character length on the given character data.
   */
  CharLenImpact(charData) {
    return charData.length / charData.numChars;
  }

  /**
   * This function allocates a total number of characters among an array of lengths,
   * proportionally to each length.
   *
   * @param {Array} arr - The array of objects containing lengths, type, and current numChars. Each length should be a positive number.
   * @param {number} charsToAllocate - The total number of characters to be allocated.
   *
   * The function first calculates the sum of all lengths in the array. Then, it
   * iterates over the array and calculates an initial allocation for each length,
   * rounded to the nearest integer, based on its proportion of the total length.
   *
   * If the sum of these initial allocations is not equal to the total number of
   * characters due to rounding errors, the function makes adjustments to the allocations.
   *
   * The adjustments are made in a loop that continues until the difference between
   * the total number of characters and the sum of the allocations is zero, or until
   * the loop has run a maximum number of iterations equal to the length of the array.
   *
   * In each iteration of the loop, the function calculates a rounding adjustment for
   * each length, again based on its proportion of the total length, and adds this
   * adjustment to the length's allocation.
   *
   * If there's still a difference after the maximum number of iterations, the function
   * falls back to a simpler method of distributing the difference: it sorts the lengths
   * by their allocations and adds or subtracts 1 from each length in this order until
   * the difference is zero.
   *
   * The function returns an array of the final allocations.
   *
   * @returns {Array} The array of allocations.
   */
  AllocateCharacters(arr, charsToAllocate) {
    // init
    let allocation = [];
    let sumLen = 0;
    for (let i = 0; i < arr.length; i++) {
      sumLen += arr[i].length;
    }
    let notAllowed = ['lower_outlier', 'upper_outlier', '50']; // these types only have the 1 char they were assigned above

    // main allocation
    for (let i = 0; i < arr.length; i++) {
      if (!notAllowed.includes(arr[i].type)) {
        allocation[i] = Math.round((arr[i].length / sumLen) * charsToAllocate);
      }
    }

    // main allocation is not perfect, so we need to adjust
    let allocatedSum = allocation.reduce((a, b) => a + b, 0);
    let difference = charsToAllocate - allocatedSum;

    // If there's a rounding error, add/subtract characters proportionally
    let maxIterations = arr.length; // inf loop handler :D
    while (difference !== 0 && maxIterations > 0) {
      // (same method as above)
      for (let i = 0; i < arr.length; i++) {
        if (!notAllowed.includes(arr[i].type)) {
          allocation[i] += Math.round((arr[i].length / sumLen) * difference);
        }
      }
      allocatedSum = allocation.reduce((a, b) => a + b, 0);
      difference = charsToAllocate - allocatedSum;

      maxIterations--;
    }

    // if there's still a rounding error after max iterations, fuck it, just distribute it evenly
    if (difference !== 0) {
      // create an array of indices sorted low to high based on current allocations
      let indices = [];
      for (let i = 0; i < arr.length; i++) {
        indices.push(i);
      }
      indices.sort((a, b) => allocation[a] - allocation[b]);

      // if we need to add or remove characters, do so from the beginning
      let plusminus = -1; // add or remove?
      if (difference > 0) {
        plusminus = 1;
      }
      let i = 0;
      let maxIterations = indices.length * 3; // run it for a while just in case
      while (difference > 0 && maxIterations > 0) {
        allocation[indices[i]] += plusminus;
        difference += -plusminus;

        i += 1;
        // loop back to start if we end
        if (i >= indices.length) {
          i = 0;
        }

        maxIterations += -1;
      }
    }

    return allocation;
  }
}
