/**
 * Represents a control object.
 * @class
 */
class Control {
  /**
   * Creates a new instance of the Controls class.
   * @constructor
   */
  constructor() {
    this.SetControls();
  }

  /**
   * Sets up event listeners for the global controls and prefix events.
   * @function
   * @memberof Maidr
   * @instance
   * @name SetControls
   * @returns {void}
   */
  SetControls() {
    // global controls

    // variable initialization
    let controlElements = [
      constants.chart,
      constants.brailleInput,
      constants.review_container,
    ];
    let pressedL = false;
    let pressedTimeout = null;

    // main BTS controls
    for (let i = 0; i < controlElements.length; i++) {
      constants.events.push([
        controlElements[i],
        'keydown',
        function (e) {
          // init
          let lastPlayed = '';

          // if we're awaiting an L + X prefix, we don't want to do anything else
          if (pressedL) {
            return;
          }

          // B: braille mode
          if (e.key == 'b') {
            constants.tabMovement = 0;
            e.preventDefault();
            display.toggleBrailleMode();
          }

          // T: aria live text output mode
          if (e.key == 't') {
            display.toggleTextMode();
          }

          // S: sonification mode
          if (e.key == 's') {
            display.toggleSonificationMode();
          }

          // R: review mode
          if (e.key == 'r' && !e.ctrlKey && !e.shiftKey) {
            // r, but let Ctrl and Shift R go through cause I use that to refresh
            constants.tabMovement = 0;
            e.preventDefault();
            if (constants.review_container.classList.contains('hidden')) {
              review.ToggleReviewMode(true);
            } else {
              review.ToggleReviewMode(false);
            }
          }

          if (e.key == ' ') {
            // space 32, replay info but no other changes

            // exception: if we just initilized, position might not be in range
            if (position.x < 0) position.x = 0;
            if (position.y < 0) position.y = 0;

            if (constants.showDisplay) {
              display.displayValues();
            }
            if (constants.sonifMode != 'off') {
              plot.PlayTones();
            }
          }

          // switch layer controls
          if (
            Array.isArray(singleMaidr.type) &&
            [].concat(singleMaidr.type).includes('point') &&
            [].concat(singleMaidr.type).includes('smooth')
          ) {
            // page down /(fn+down arrow): change chart type (layer)
            if (e.key == 'PageDown' && constants.brailleMode == 'off') {
              display.changeChartLayer('down');
            }

            // page up / (fn+up arrow): change chart type (layer)
            if (e.key == 'PageUp' && constants.brailleMode == 'off') {
              display.changeChartLayer('up');
            }
          }

          // Debugging.
          // Because we destroy on blur, it's hard to debug, so here's throwaway code to put a breakpoint on
          // todo: on publish, remove this
          if (e.key == '-') {
            let nothing = null;
          }
        },
      ]);
    }

    // We want to tab or shift tab past the chart,
    // but we delay adding this eventlistener for a moment so the chart loads first
    for (let i = 0; i < controlElements.length; i++) {
      constants.events.push([
        controlElements[i],
        'keydown',
        function (e) {
          if (e.key == 'Tab') {
            // save key to be used on blur event later
            if (e.shiftKey) {
              constants.tabDirection = -1;
            } else {
              constants.tabDirection = 1;
            }
          }
        },
      ]);
    }

    // prefix events
    constants.events.push([
      document,
      'keydown',
      function (e) {
        // init
        let lastPlayed = '';

        // enable / disable prefix mode
        if (e.key == 'l') {
          pressedL = true;
          if (pressedTimeout != null) {
            clearTimeout(pressedTimeout);
            pressedTimeout = null;
          }
          pressedTimeout = setTimeout(function () {
            pressedL = false;
          }, constants.keypressInterval);
        }

        // ctrl/cmd: stop autoplay
        if (constants.isMac ? e.metaKey : e.ctrlKey) {
          // (ctrl/cmd)+(home/fn+left arrow): first element
          if (e.key == 'Home') {
            // chart types
            if (constants.chartType == 'bar' || constants.chartType == 'hist') {
              position.x = 0;
            } else if (constants.chartType == 'box') {
              position.x = 0;
              position.y = plot.sections.length - 1;
            } else if (constants.chartType == 'heat') {
              position.x = 0;
              position.y = 0;
            } else if (constants.chartType == 'point') {
              position.x = 0;
            } else if (constants.chartType == 'smooth') {
              positionL1.x = 0;
            }

            UpdateAllBraille();
          }

          // (ctrl/cmd)+(end/fn+right arrow): last element
          else if (e.key == 'End') {
            // chart types
            if (constants.chartType == 'bar' || constants.chartType == 'hist') {
              position.x = plot.bars.length - 1;
            } else if (constants.chartType == 'box') {
              position.x = plot.sections.length - 1;
              position.y = 0;
            } else if (constants.chartType == 'heat') {
              position.x = plot.num_cols - 1;
              position.y = plot.num_rows - 1;
            } else if (constants.chartType == 'point') {
              position.x = plot.y.length - 1;
            } else if (constants.chartType == 'smooth') {
              positionL1.x = plot.curvePoints.length - 1;
            }

            UpdateAllBraille();
          }
        }

        // Prefix mode stuff: L is enabled, look for these keys
        if (pressedL) {
          if (e.key == 'x') {
            // X: x label
            let xlabel = '';
            if (constants.chartType == 'bar') {
              xlabel = plot.plotLegend.x;
            } else if (
              constants.chartType == 'heat' ||
              constants.chartType == 'box' ||
              singleMaidr.type == 'point' ||
              singleMaidr.type == 'line' ||
              singleMaidr.type.includes('point')
            ) {
              xlabel = plot.x_group_label;
            }
            display.displayInfo('x label', xlabel);
            pressedL = false;
          } else if (e.key == 'y') {
            // Y: y label
            let ylabel = '';
            if (constants.chartType == 'bar') {
              ylabel = plot.plotLegend.y;
            } else if (
              constants.chartType == 'heat' ||
              constants.chartType == 'box' ||
              singleMaidr.type == 'point' ||
              singleMaidr.type == 'line' ||
              singleMaidr.type.includes('point')
            ) {
              ylabel = plot.y_group_label;
            }
            display.displayInfo('y label', ylabel);
            pressedL = false;
          } else if (e.key == 't') {
            // T: title
            display.displayInfo('title', plot.title);
            pressedL = false;
          } else if (e.key == 's') {
            // subtitle
            display.displayInfo('subtitle', plot.subtitle);
            pressedL = false;
          } else if (e.key == 'c') {
            // caption
            display.displayInfo('caption', plot.caption);
            pressedL = false;
          } else if (e.key != 'l') {
            pressedL = false;
          }
        }

        // // period: speed up
        // if (e.key == '.') {
        //   constants.SpeedUp();
        //   display.announceText('Speed up');
        // }

        // // comma: speed down
        // if (e.key == ',') {
        //   constants.SpeedDown();
        //   display.announceText('Speed down');
        // }
        // // /: reset speed
        // if (e.key == '/') {
        //   constants.SpeedReset();
        //   display.announceText('Speed reset');
        // }
      },
    ]);

    if ([].concat(singleMaidr.type).includes('bar')) {
      window.position = new Position(-1, -1);
      window.plot = new BarChart();

      // global variables
      constants.lastx = 0;
      let lastPlayed = '';

      // control eventlisteners
      constants.events.push([
        constants.chart,
        'keydown',
        function (e) {
          let updateInfoThisRound = false; // we only update info and play tones on certain keys
          let isAtEnd = false;

          if (e.key == 'ArrowRight') {
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                position.x -= 1;
                Autoplay('right', position.x, plot.plotData.length);
              } else {
                position.x = plot.plotData.length - 1; // go all the way
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else if (
              e.altKey &&
              e.shiftKey &&
              position.x != plot.bars.length - 1
            ) {
              constants.lastx = position.x;
              Autoplay('reverse-right', plot.bars.length, position.x);
            } else {
              position.x += 1;
              updateInfoThisRound = true;
              isAtEnd = lockPosition();
            }
          } else if (e.key == 'ArrowLeft') {
            // var prevLink = document.getElementById('prev');   // what is prev in the html?
            // if (prevLink) {
            // left arrow 37
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                position.x += 1;
                Autoplay('left', position.x, -1);
              } else {
                position.x = 0; // go all the way
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else if (e.altKey && e.shiftKey && position.x != 0) {
              constants.lastx = position.x;
              Autoplay('reverse-left', -1, position.x);
            } else {
              position.x += -1;
              updateInfoThisRound = true;
              isAtEnd = lockPosition();
            }
            // }
          }

          // update display / text / audio
          if (updateInfoThisRound && !isAtEnd) {
            UpdateAll();
          }
          if (isAtEnd) {
            audio.playEnd();
          }
        },
      ]);

      constants.events.push([
        constants.brailleInput,
        'keydown',
        function (e) {
          let updateInfoThisRound = false; // we only update info and play tones on certain keys
          let isAtEnd = false;

          if (e.key == 'ArrowRight') {
            // right arrow
            e.preventDefault();
            if (e.target.selectionStart > e.target.value.length - 2) {
            } else if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                position.x -= 1;
                Autoplay('right', position.x, plot.plotData.length);
              } else {
                position.x = plot.bars.length - 1; // go all the way
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else if (
              e.altKey &&
              e.shiftKey &&
              position.x != plot.bars.length - 1
            ) {
              constants.lastx = position.x;
              Autoplay('reverse-right', plot.bars.length, position.x);
            } else {
              position.x += 1;
              updateInfoThisRound = true;
              isAtEnd = lockPosition();
            }
          } else if (e.key == 'ArrowLeft') {
            // left arrow
            e.preventDefault();
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                position.x += 1;
                Autoplay('left', position.x, -1);
              } else {
                position.x = 0; // go all the way
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else if (e.altKey && e.shiftKey && position.x != 0) {
              constants.lastx = position.x;
              Autoplay('reverse-left', -1, position.x);
            } else {
              position.x += -1;
              updateInfoThisRound = true;
              isAtEnd = lockPosition();
            }
          } else if (e.key == 'Tab') {
            // do nothing, we handle this in global events
          } else {
            e.preventDefault();
          }

          // update display / text / audio
          if (updateInfoThisRound && !isAtEnd) {
            UpdateAllBraille();
          }
          if (isAtEnd) {
            audio.playEnd();
          }
        },
      ]);

      let controlElements = [constants.chart, constants.brailleInput];
      let lastx = 0;
      for (let i = 0; i < controlElements.length; i++) {
        constants.events.push([
          controlElements[i],
          'keydown',
          function (e) {
            // period: speed up
            if (e.key == '.') {
              constants.SpeedUp();
              PlayDuringSpeedChange();
              display.announceText('Speed up');
            }

            // comma: speed down
            if (e.key == ',') {
              constants.SpeedDown();
              PlayDuringSpeedChange();
              display.announceText('Speed down');
            }

            // /: reset speed
            if (e.key == '/') {
              constants.SpeedReset();
              PlayDuringSpeedChange();
              display.announceText('Speed reset');
            }
          },
        ]);
      }
      function PlayDuringSpeedChange() {
        if (constants.autoplayId != null) {
          constants.KillAutoplay();
          if (lastPlayed == 'reverse-left') {
            Autoplay('right', position.x, lastx);
          } else if (lastPlayed == 'reverse-right') {
            Autoplay('left', position.x, lastx);
          } else {
            Autoplay(lastPlayed, position.x, lastx);
          }
        }
      }
      function lockPosition() {
        // lock to min / max postions
        let didLockHappen = false;
        // if (!constants.hasRect) {
        //   return didLockHappen;
        // }

        if (position.x < 0) {
          position.x = 0;
          didLockHappen = true;
        }
        if (position.x > plot.plotData.length - 1) {
          position.x = plot.plotData.length - 1;
          didLockHappen = true;
        }

        return didLockHappen;
      }
      function UpdateAll() {
        if (constants.showDisplay) {
          display.displayValues();
        }
        if (constants.showRect && constants.hasRect) {
          plot.Select();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }
      }
      function UpdateAllAutoplay() {
        if (constants.showDisplayInAutoplay) {
          display.displayValues();
        }
        if (constants.showRect && constants.hasRect) {
          plot.Select();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }

        if (constants.brailleMode != 'off') {
          display.UpdateBraillePos();
        }
      }
      function UpdateAllBraille() {
        if (constants.showDisplayInBraille) {
          display.displayValues();
        }
        if (constants.showRect && constants.hasRect) {
          plot.Select();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }
        display.UpdateBraillePos();
      }
      function Autoplay(dir, start, end) {
        lastPlayed = dir;
        let step = 1; // default right and reverse-left
        if (dir == 'left' || dir == 'reverse-right') {
          step = -1;
        }

        // clear old autoplay if exists
        if (constants.autoplayId != null) {
          constants.KillAutoplay();
        }

        if (dir == 'reverse-right' || dir == 'reverse-left') {
          position.x = start;
        }

        constants.autoplayId = setInterval(function () {
          position.x += step;
          if (position.x < 0 || plot.plotData.length - 1 < position.x) {
            constants.KillAutoplay();
            lockPosition();
          } else if (position.x == end) {
            constants.KillAutoplay();
            UpdateAllAutoplay();
          } else {
            UpdateAllAutoplay();
          }
        }, constants.autoPlayRate);
      }
    } else if ([].concat(singleMaidr.type).includes('box')) {
      // variable initialization
      constants.plotId = 'geom_boxplot.gTree.78.1';
      window.plot = new BoxPlot();
      if (constants.plotOrientation == 'vert') {
        window.position = new Position(0, 6); // always 6
      } else {
        window.position = new Position(-1, plot.plotData.length);
      }
      let rect;
      if (constants.hasRect) {
        rect = new BoxplotRect();
      }
      let lastPlayed = '';

      // control eventlisteners
      constants.events.push([
        constants.chart,
        'keydown',
        function (e) {
          let updateInfoThisRound = false; // we only update info and play tones on certain keys
          let isAtEnd = false;

          // right arrow
          if (e.key == 'ArrowRight') {
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                if (constants.plotOrientation == 'vert') {
                  Autoplay('right', position.x, plot.plotData.length - 1);
                } else {
                  Autoplay('right', position.x, plot.sections.length - 1);
                }
              } else {
                isAtEnd = lockPosition();
                if (constants.plotOrientation == 'vert') {
                  position.x = plot.plotData.length - 1;
                } else {
                  position.x = plot.sections.length - 1;
                }
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else if (constants.plotOrientation == 'vert') {
              if (
                e.altKey &&
                e.shiftKey &&
                plot.sections.length - 1 != position.x
              ) {
                lastY = position.y;
                Autoplay('reverse-right', plot.plotData.length - 1, position.x);
              } else {
                if (position.x == -1 && position.y == plot.sections.length) {
                  position.y -= 1;
                }
                position.x += 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else {
              if (
                e.altKey &&
                e.shiftKey &&
                plot.sections.length - 1 != position.x
              ) {
                constants.lastx = position.x;
                Autoplay('reverse-right', plot.sections.length - 1, position.x);
              } else {
                if (position.x == -1 && position.y == plot.plotData.length) {
                  position.y -= 1;
                }
                position.x += 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            }
            constants.navigation = 1;
          }
          // left arrow
          if (e.key == 'ArrowLeft') {
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                Autoplay('left', position.x, -1);
              } else {
                position.x = 0;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else if (e.altKey && e.shiftKey && position.x > 0) {
              if (constants.plotOrientation == 'vert') {
                lastY = position.y;
              } else {
                constants.lastx = position.x;
              }
              Autoplay('reverse-left', 0, position.x);
            } else {
              position.x += -1;
              updateInfoThisRound = true;
              isAtEnd = lockPosition();
            }
            constants.navigation = 1;
          }
          // up arrow
          if (e.key == 'ArrowUp') {
            let oldY = position.y;
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                if (constants.plotOrientation == 'vert') {
                  Autoplay('up', position.y, plot.sections.length);
                } else {
                  Autoplay('up', position.y, plot.plotData.length);
                }
              } else {
                if (constants.plotOrientation == 'vert') {
                  position.y = plot.sections.length - 1;
                } else {
                  position.y = plot.plotData.length - 1;
                }
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else if (constants.plotOrientation == 'vert') {
              if (
                e.altKey &&
                e.shiftKey &&
                position.y != plot.sections.length - 1
              ) {
                lastY = position.y;
                Autoplay('reverse-up', plot.sections.length - 1, position.y);
              } else {
                position.y += 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else {
              if (
                e.altKey &&
                e.shiftKey &&
                position.y != plot.sections.length - 1
              ) {
                constants.lastx = position.x;
                Autoplay('reverse-up', plot.plotData.length - 1, position.y);
              } else {
                position.y += 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            }
            constants.navigation = 0;
          }
          // down arrow
          if (e.key == 'ArrowDown') {
            let oldY = position.y;
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                Autoplay('down', position.y, -1);
              } else {
                position.y = 0;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else if (e.altKey && e.shiftKey && position.y != 0) {
              if (constants.plotOrientation == 'vert') {
                lastY = position.y;
              } else {
                constants.lastx = position.x;
              }
              Autoplay('reverse-down', 0, position.y);
            } else {
              if (constants.plotOrientation == 'vert') {
                if (position.x == -1 && position.y == plot.sections.length) {
                  position.x += 1;
                }
              } else {
                if (position.x == -1 && position.y == plot.plotData.length) {
                  position.x += 1;
                }
              }
              position.y += -1;
              updateInfoThisRound = true;
              isAtEnd = lockPosition();
            }
            //position.x = GetRelativeBoxPosition(oldY, position.y);
            constants.navigation = 0;
          }

          // update display / text / audio
          if (updateInfoThisRound && !isAtEnd) {
            UpdateAll();
          }
          if (isAtEnd) {
            audio.playEnd();
          }
        },
      ]);

      constants.events.push([
        constants.brailleInput,
        'keydown',
        function (e) {
          let updateInfoThisRound = false; // we only update info and play tones on certain keys
          let setBrailleThisRound = false;
          let isAtEnd = false;

          if (e.key == 'ArrowRight') {
            // right arrow
            e.preventDefault();
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                if (constants.plotOrientation == 'vert') {
                  Autoplay('right', position.x, plot.plotData.length - 1);
                } else {
                  Autoplay('right', position.x, plot.sections.length);
                }
              } else {
                if (constants.plotOrientation == 'vert') {
                  position.x = plot.plotData.length - 1;
                } else {
                  position.x = plot.sections.length - 1;
                }
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else if (constants.plotOrientation == 'vert') {
              if (
                e.altKey &&
                e.shiftKey &&
                plot.plotData.length - 1 != position.x
              ) {
                lastY = position.y;
                Autoplay('reverse-right', plot.plotData.length - 1, position.x);
              } else {
                if (
                  position.x == -1 &&
                  position.y == plot.plotData[position.x].length
                ) {
                  position.y -= 1;
                }
                position.x += 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else {
              if (
                e.altKey &&
                e.shiftKey &&
                plot.sections.length - 1 != position.x
              ) {
                constants.lastx = position.x;
                Autoplay('reverse-right', plot.sections.length - 1, position.x);
              } else {
                if (position.x == -1 && position.y == plot.plotData.length) {
                  position.y -= 1;
                }
                position.x += 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            }
            setBrailleThisRound = true;
            constants.navigation = 1;
          } else if (e.key == 'ArrowLeft') {
            // left arrow
            e.preventDefault();
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                Autoplay('left', position.x, -1);
              } else {
                position.x = 0;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else if (e.altKey && e.shiftKey && position.x > 0) {
              if (constants.plotOrientation == 'vert') {
                lastY = position.y;
              } else {
                constants.lastx = position.x;
              }
              Autoplay('reverse-left', 0, position.x);
            } else {
              position.x += -1;
              updateInfoThisRound = true;
              isAtEnd = lockPosition();
            }
            setBrailleThisRound = true;
            constants.navigation = 1;
          } else if (e.key == 'ArrowUp') {
            // up arrow
            let oldY = position.y;
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                if (constants.plotOrientation == 'vert') {
                  if (position.x < 0) position.x = 0;
                  Autoplay('up', position.y, plot.sections.length);
                } else {
                  Autoplay('up', position.y, plot.plotData.length);
                }
              } else if (constants.plotOrientation == 'vert') {
                position.y = plot.sections.length - 1;
                updateInfoThisRound = true;
              } else {
                position.y = plot.plotData.length - 1;
                updateInfoThisRound = true;
              }
            } else if (constants.plotOrientation == 'vert') {
              if (
                e.altKey &&
                e.shiftKey &&
                position.y != plot.sections.length - 1
              ) {
                lasY = position.y;
                Autoplay('reverse-up', plot.sections.length - 1, position.y);
              } else {
                position.y += 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else {
              if (
                e.altKey &&
                e.shiftKey &&
                position.y != plot.plotData.length - 1
              ) {
                constants.lastx = position.x;
                Autoplay('reverse-up', plot.plotData.length - 1, position.y);
              } else {
                position.y += 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            }
            if (constants.plotOrientation == 'vert') {
            } else {
              setBrailleThisRound = true;
            }
            constants.navigation = 0;
          } else if (e.key == 'ArrowDown') {
            // down arrow
            let oldY = position.y;
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                Autoplay('down', position.y, -1);
              } else {
                position.y = 0;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else if (e.altKey && e.shiftKey && position.y != 0) {
              if (constants.plotOrientation == 'vert') {
                lastY = position.y;
              } else {
                constants.lastx = position.x;
              }
              Autoplay('reverse-down', 0, position.y);
            } else {
              if (constants.plotOrientation == 'vert') {
                if (position.x == -1 && position.y == plot.sections.length) {
                  position.x += 1;
                }
              } else {
                if (position.x == -1 && position.y == plot.plotData.length) {
                  position.x += 1;
                }
              }
              position.y += -1;
              updateInfoThisRound = true;
              isAtEnd = lockPosition();
            }
            constants.navigation = 0;
            if (constants.plotOrientation == 'vert') {
            } else {
              setBrailleThisRound = true;
            }
            constants.navigation = 0;
          } else if (e.key == 'Tab') {
            // do nothing, we handle this in global events
          } else {
            e.preventDefault();
            // todo: allow some controls through like page refresh
          }

          // update audio. todo: add a setting for this later
          if (updateInfoThisRound && !isAtEnd) {
            if (setBrailleThisRound) display.SetBraille(plot);
            setTimeout(UpdateAllBraille, 50); // we delay this by just a moment as otherwise the cursor position doesn't get set
          }
          if (isAtEnd) {
            audio.playEnd();
          }
        },
      ]);

      let controlElements = [constants.chart, constants.brailleInput];
      let lastx = 0;
      for (let i = 0; i < controlElements.length; i++) {
        constants.events.push([
          controlElements[i],
          'keydown',
          function (e) {
            // period: speed up
            if (e.key == '.') {
              constants.SpeedUp();
              PlayDuringSpeedChange();
              display.announceText('Speed up');
            }

            // comma: speed down
            if (e.key == ',') {
              constants.SpeedDown();
              PlayDuringSpeedChange();
              display.announceText('Speed down');
            }

            // /: reset speed
            if (e.key == '/') {
              constants.SpeedReset();
              PlayDuringSpeedChange();
              display.announceText('Speed reset');
            }
          },
        ]);
      }
      function PlayDuringSpeedChange() {
        if (constants.autoplayId != null) {
          constants.KillAutoplay();
          if (lastPlayed == 'reverse-left') {
            if (constants.plotOrientation == 'vert') {
              Autoplay('right', position.y, lastY);
            } else {
              Autoplay('right', position.x, lastx);
            }
          } else if (lastPlayed == 'reverse-right') {
            if (constants.plotOrientation == 'vert') {
              Autoplay('left', position.y, lastY);
            } else {
              Autoplay('left', position.x, lastx);
            }
          } else if (lastPlayed == 'reverse-up') {
            if (constants.plotOrientation == 'vert') {
              Autoplay('down', position.y, lastY);
            } else {
              Autoplay('down', position.x, lastx);
            }
          } else if (lastPlayed == 'reverse-down') {
            if (constants.plotOrientation == 'vert') {
              Autoplay('up', position.y, lastY);
            } else {
              Autoplay('up', position.x, lastx);
            }
          } else {
            if (constants.plotOrientation == 'vert') {
              Autoplay(lastPlayed, position.y, lastY);
            } else {
              Autoplay(lastPlayed, position.x, lastx);
            }
          }
        }
      }

      function UpdateAll() {
        if (constants.showDisplay) {
          display.displayValues();
        }
        if (constants.showRect && constants.hasRect) {
          rect.UpdateRect();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }
      }
      function UpdateAllAutoplay() {
        if (constants.showDisplayInAutoplay) {
          display.displayValues();
        }
        if (constants.showRect && constants.hasRect) {
          rect.UpdateRect();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }
        if (constants.brailleMode != 'off') {
          display.UpdateBraillePos();
        }
      }
      function UpdateAllBraille() {
        if (constants.showDisplayInBraille) {
          display.displayValues();
        }
        if (constants.showRect && constants.hasRect) {
          rect.UpdateRect();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }
        display.UpdateBraillePos();
      }
      function lockPosition() {
        // lock to min / max postions
        let didLockHappen = false;
        if (position.y < 0) {
          position.y = 0;
          didLockHappen = true;
        }
        if (position.x < 0) {
          position.x = 0;
          didLockHappen = true;
        }
        if (constants.plotOrientation == 'vert') {
          if (position.x > plot.plotData.length - 1) {
            position.x = plot.plotData.length - 1;
            didLockHappen = true;
          }
          if (position.y > plot.sections.length - 1) {
            position.y = plot.sections.length - 1;
            didLockHappen = true;
          }
        } else {
          if (position.y > plot.plotData.length - 1) {
            position.y = plot.plotData.length - 1;
            didLockHappen = true;
          }
          if (position.x > plot.sections.length - 1) {
            position.x = plot.sections.length - 1;
            didLockHappen = true;
          }
        }

        return didLockHappen;
      }

      function Autoplay(dir, start, end) {
        lastPlayed = dir;
        let step = 1; // default right / up / reverse-left / reverse-down
        if (
          dir == 'left' ||
          dir == 'down' ||
          dir == 'reverse-right' ||
          dir == 'reverse-up'
        ) {
          step = -1;
        }

        // clear old autoplay if exists
        if (constants.autoplayId != null) {
          constants.KillAutoplay();
        }

        if (dir == 'reverse-left' || dir == 'reverse-right') {
          position.x = start;
        } else if (dir == 'reverse-up' || dir == 'reverse-down') {
          position.y = start;
        }

        if (constants.debugLevel > 0) {
          console.log('starting autoplay', dir, start, end);
        }

        UpdateAllAutoplay(); // play current tone before we move
        constants.autoplayId = setInterval(function () {
          let doneNext = false;
          if (dir == 'left' || dir == 'right' || dir == 'up' || dir == 'down') {
            if (
              (position.x < 1 && dir == 'left') ||
              (constants.plotOrientation == 'vert' &&
                dir == 'up' &&
                position.y > plot.sections.length - 2) ||
              (constants.plotOrientation == 'horz' &&
                dir == 'up' &&
                position.y > plot.plotData.length - 2) ||
              (constants.plotOrientation == 'horz' &&
                dir == 'right' &&
                position.x > plot.sections.length - 2) ||
              (constants.plotOrientation == 'vert' &&
                dir == 'right' &&
                position.x > plot.plotData.length - 2) ||
              (constants.plotOrientation == 'horz' &&
                dir == 'down' &&
                position.y < 1) ||
              (constants.plotOrientation == 'vert' &&
                dir == 'down' &&
                position.y < 1)
            ) {
              doneNext = true;
            }
          } else {
            if (
              (dir == 'reverse-left' && position.x >= end) ||
              (dir == 'reverse-right' && position.x <= end) ||
              (dir == 'reverse-up' && position.y <= end) ||
              (dir == 'reverse-down' && position.y >= end)
            ) {
              doneNext = true;
            }
          }

          if (doneNext) {
            constants.KillAutoplay();
          } else {
            if (
              dir == 'left' ||
              dir == 'right' ||
              dir == 'reverse-left' ||
              dir == 'reverse-right'
            ) {
              position.x += step;
            } else {
              position.y += step;
            }
            UpdateAllAutoplay();
          }
          if (constants.debugLevel > 5) {
            console.log('autoplay pos', position);
          }
        }, constants.autoPlayRate);
      }
    } else if ([].concat(singleMaidr.type).includes('heat')) {
      // variable initialization
      constants.plotId = 'geom_rect.rect.2.1';
      window.position = new Position(-1, -1);
      window.plot = new HeatMap();
      let rect = new HeatMapRect();
      let lastPlayed = '';
      constants.lastx = 0;

      // control eventlisteners
      constants.events.push([
        constants.chart,
        'keydown',
        function (e) {
          let updateInfoThisRound = false;
          let isAtEnd = false;

          // right arrow 39
          if (e.key == 'ArrowRight') {
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                position.x -= 1;
                Autoplay('right', position.x, plot.num_cols);
              } else {
                position.x = plot.num_cols - 1;
                updateInfoThisRound = true;
              }
            } else if (
              e.altKey &&
              e.shiftKey &&
              position.x != plot.num_cols - 1
            ) {
              constants.lastx = position.x;
              Autoplay('reverse-right', plot.num_cols, position.x);
            } else {
              if (position.x == -1 && position.y == -1) {
                position.y += 1;
              }
              position.x += 1;
              updateInfoThisRound = true;
              isAtEnd = lockPosition();
            }
            constants.navigation = 1;
          }

          // left arrow 37
          if (e.key == 'ArrowLeft') {
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                position.x += 1;
                Autoplay('left', position.x, -1);
              } else {
                position.x = 0;
                updateInfoThisRound = true;
              }
            } else if (e.altKey && e.shiftKey && position.x != 0) {
              constants.lastx = position.x;
              Autoplay('reverse-left', -1, position.x);
            } else {
              position.x -= 1;
              updateInfoThisRound = true;
              isAtEnd = lockPosition();
            }
            constants.navigation = 1;
          }

          // up arrow 38
          if (e.key == 'ArrowUp') {
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                position.y += 1;
                Autoplay('up', position.y, -1);
              } else {
                position.y = 0;
                updateInfoThisRound = true;
              }
            } else if (e.altKey && e.shiftKey && position.y != 0) {
              constants.lastx = position.x;
              Autoplay('reverse-up', -1, position.y);
            } else {
              position.y -= 1;
              updateInfoThisRound = true;
              isAtEnd = lockPosition();
            }
            constants.navigation = 0;
          }

          // down arrow 40
          if (e.key == 'ArrowDown') {
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                position.y -= 1;
                Autoplay('down', position.y, plot.num_rows);
              } else {
                position.y = plot.num_rows - 1;
                updateInfoThisRound = true;
              }
            } else if (
              e.altKey &&
              e.shiftKey &&
              position.y != plot.num_rows - 1
            ) {
              constants.lastx = position.x;
              Autoplay('reverse-down', plot.num_rows, position.y);
            } else {
              if (position.x == -1 && position.y == -1) {
                position.x += 1;
              }
              position.y += 1;
              updateInfoThisRound = true;
              isAtEnd = lockPosition();
            }
            constants.navigation = 0;
          }

          // update text, display, and audio
          if (updateInfoThisRound && !isAtEnd) {
            UpdateAll();
          }
          if (isAtEnd) {
            audio.playEnd();
          }
        },
      ]);

      let controlElements = [constants.chart, constants.brailleInput];
      let lastx = 0;
      for (let i = 0; i < controlElements.length; i++) {
        constants.events.push([
          controlElements[i],
          'keydown',
          function (e) {
            // period: speed up
            if (e.key == '.') {
              constants.SpeedUp();
              PlayDuringSpeedChange();
              display.announceText('Speed up');
            }

            // comma: speed down
            if (e.key == ',') {
              constants.SpeedDown();
              PlayDuringSpeedChange();
              display.announceText('Speed down');
            }

            // /: reset speed
            if (e.key == '/') {
              constants.SpeedReset();
              PlayDuringSpeedChange();
              display.announceText('Speed reset');
            }
          },
        ]);
      }
      function PlayDuringSpeedChange() {
        if (constants.autoplayId != null) {
          constants.KillAutoplay();
          if (lastPlayed == 'reverse-left') {
            Autoplay('right', position.x, lastx);
          } else if (lastPlayed == 'reverse-right') {
            Autoplay('left', position.x, lastx);
          } else if (lastPlayed == 'reverse-up') {
            Autoplay('down', position.x, lastx);
          } else if (lastPlayed == 'reverse-down') {
            Autoplay('up', position.x, lastx);
          } else {
            Autoplay(lastPlayed, position.x, lastx);
          }
        }
      }

      constants.events.push([
        constants.brailleInput,
        'keydown',
        function (e) {
          let updateInfoThisRound = false;
          let isAtEnd = false;

          if (e.key == 'ArrowRight') {
            // right arrow
            if (
              e.target.selectionStart > e.target.value.length - 3 ||
              e.target.value.substring(
                e.target.selectionStart + 1,
                e.target.selectionStart + 2
              ) == '⠳'
            ) {
              // already at the end, do nothing
              e.preventDefault();
            } else {
              if (constants.isMac ? e.metaKey : e.ctrlKey) {
                if (position.x == -1 && position.y == -1) {
                  position.x += 1;
                  position.y += 1;
                }
                if (e.shiftKey) {
                  position.x -= 1;
                  Autoplay('right', position.x, plot.num_cols);
                } else {
                  position.x = plot.num_cols - 1;
                  updateInfoThisRound = true;
                }
              } else if (
                e.altKey &&
                e.shiftKey &&
                position.x != plot.num_cols - 1
              ) {
                constants.lastx = position.x;
                Autoplay('reverse-right', plot.num_cols, position.x);
              } else {
                if (position.x == -1 && position.y == -1) {
                  position.y += 1;
                }
                position.x += 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }

              // we need pos to be y*(num_cols+1), (and num_cols+1 because there's a spacer character)
              let pos = position.y * (plot.num_cols + 1) + position.x;
              e.target.setSelectionRange(pos, pos);
              e.preventDefault();

              constants.navigation = 1;
            }
          } else if (e.key == 'ArrowLeft') {
            // left
            if (
              e.target.selectionStart == 0 ||
              e.target.value.substring(
                e.target.selectionStart - 1,
                e.target.selectionStart
              ) == '⠳'
            ) {
              e.preventDefault();
            } else {
              if (constants.isMac ? e.metaKey : e.ctrlKey) {
                if (e.shiftKey) {
                  position.x += 1;
                  Autoplay('left', position.x, -1);
                } else {
                  position.x = 0;
                  updateInfoThisRound = true;
                }
              } else if (e.altKey && e.shiftKey && position.x != 0) {
                constants.lastx = position.x;
                Autoplay('reverse-left', -1, position.x);
              } else {
                position.x += -1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }

              let pos = position.y * (plot.num_cols + 1) + position.x;
              e.target.setSelectionRange(pos, pos);
              e.preventDefault();

              constants.navigation = 1;
            }
          } else if (e.key == 'ArrowDown') {
            // down
            if (position.y + 1 == plot.num_rows) {
              e.preventDefault();
            } else {
              if (constants.isMac ? e.metaKey : e.ctrlKey) {
                if (position.x == -1 && position.y == -1) {
                  position.x += 1;
                  position.y += 1;
                }
                if (e.shiftKey) {
                  position.y -= 1;
                  Autoplay('down', position.y, plot.num_rows);
                } else {
                  position.y = plot.num_rows - 1;
                  updateInfoThisRound = true;
                }
              } else if (
                e.altKey &&
                e.shiftKey &&
                position.y != plot.num_rows - 1
              ) {
                constants.lastx = position.x;
                Autoplay('reverse-down', plot.num_rows, position.y);
              } else {
                if (position.x == -1 && position.y == -1) {
                  position.x += 1;
                }
                position.y += 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }

              let pos = position.y * (plot.num_cols + 1) + position.x;
              e.target.setSelectionRange(pos, pos);
              e.preventDefault();

              constants.navigation = 0;
            }
          } else if (e.key == 'ArrowUp') {
            // up
            if (e.target.selectionStart - plot.num_cols - 1 < 0) {
              e.preventDefault();
            } else {
              if (constants.isMac ? e.metaKey : e.ctrlKey) {
                if (e.shiftKey) {
                  position.y += 1;
                  Autoplay('up', position.y, -1);
                } else {
                  position.y = 0;
                  updateInfoThisRound = true;
                }
              } else if (e.altKey && e.shiftKey && position.y != 0) {
                constants.lastx = position.x;
                Autoplay('reverse-up', -1, position.y);
              } else {
                position.y += -1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }

              let pos = position.y * (plot.num_cols + 1) + position.x;
              e.target.setSelectionRange(pos, pos);
              e.preventDefault();

              constants.navigation = 0;
            }
          } else if (e.key == 'Tab') {
            // do nothing, we handle this in global events
          } else {
            e.preventDefault();
          }

          if (updateInfoThisRound && !isAtEnd) {
            UpdateAllBraille();
          }
          if (isAtEnd) {
            audio.playEnd();
          }
        },
      ]);

      function sleep(time) {
        return new Promise((resolve) => setTimeout(resolve, time));
      }

      // heat helper functions
      function lockPosition() {
        // lock to min / max postions
        let didLockHappen = false;

        if (position.x < 0) {
          position.x = 0;
          didLockHappen = true;
        }
        if (position.x > plot.num_cols - 1) {
          position.x = plot.num_cols - 1;
          didLockHappen = true;
        }
        if (position.y < 0) {
          position.y = 0;
          didLockHappen = true;
        }
        if (position.y > plot.num_rows - 1) {
          position.y = plot.num_rows - 1;
          didLockHappen = true;
        }

        return didLockHappen;
      }

      function UpdateAll() {
        if (constants.showDisplay) {
          display.displayValues();
        }
        if (constants.showRect && constants.hasRect) {
          rect.UpdateRectDisplay();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }
      }
      function UpdateAllAutoplay() {
        if (constants.showDisplayInAutoplay) {
          display.displayValues();
        }
        if (constants.showRect && constants.hasRect) {
          rect.UpdateRectDisplay();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }
        if (constants.brailleMode != 'off') {
          display.UpdateBraillePos();
        }
      }
      function UpdateAllBraille() {
        if (constants.showDisplayInBraille) {
          display.displayValues();
        }
        if (constants.showRect && constants.hasRect) {
          rect.UpdateRectDisplay();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }
        display.UpdateBraillePos();
      }

      function Autoplay(dir, start, end) {
        lastPlayed = dir;
        let step = 1; // default right, down, reverse-left, and reverse-up
        if (
          dir == 'left' ||
          dir == 'up' ||
          dir == 'reverse-right' ||
          dir == 'reverse-down'
        ) {
          step = -1;
        }

        // clear old autoplay if exists
        if (constants.autoplayId != null) {
          constants.KillAutoplay();
        }

        if (dir == 'reverse-left' || dir == 'reverse-right') {
          position.x = start;
        } else if (dir == 'reverse-up' || dir == 'reverse-down') {
          position.y = start;
        }

        constants.autoplayId = setInterval(function () {
          if (
            dir == 'left' ||
            dir == 'right' ||
            dir == 'reverse-left' ||
            dir == 'reverse-right'
          ) {
            position.x += step;
            if (position.x < 0 || plot.num_cols - 1 < position.x) {
              constants.KillAutoplay();
              lockPosition();
            } else if (position.x == end) {
              constants.KillAutoplay();
              UpdateAllAutoplay();
            } else {
              UpdateAllAutoplay();
            }
          } else {
            // up or down
            position.y += step;
            if (position.y < 0 || plot.num_rows - 1 < position.y) {
              constants.KillAutoplay();
              lockPosition();
            } else if (position.y == end) {
              constants.KillAutoplay();
              UpdateAllAutoplay();
            } else {
              UpdateAllAutoplay();
            }
          }
        }, constants.autoPlayRate);
      }
    } else if (
      [].concat(singleMaidr.type).includes('point') ||
      [].concat(singleMaidr.type).includes('smooth')
    ) {
      // variable initialization
      constants.plotId = 'geom_point.points.12.1';
      window.position = new Position(-1, -1);
      window.plot = new ScatterPlot();
      let layer0Point = new Layer0Point();
      let layer1Point = new Layer1Point();

      let lastPlayed = ''; // for autoplay use
      constants.lastx = 0; // for scatter point layer autoplay use
      let lastx1 = 0; // for smooth layer autoplay use

      window.positionL1 = new Position(lastx1, lastx1);

      // control eventlisteners
      constants.events.push([
        [constants.chart, constants.brailleInput],
        'keydown',
        function (e) {
          let updateInfoThisRound = false;
          let isAtEnd = false;

          // left and right arrows are enabled only at point layer
          if (constants.chartType == 'point') {
            // right arrow 39
            if (e.key == 'ArrowRight') {
              if (constants.isMac ? e.metaKey : e.ctrlKey) {
                if (e.shiftKey) {
                  position.x -= 1;
                  Autoplay('right', position.x, plot.x.length);
                } else {
                  position.x = plot.x.length - 1;
                  updateInfoThisRound = true;
                  isAtEnd = lockPosition();
                }
              } else if (
                e.altKey &&
                e.shiftKey &&
                position.x != plot.x.length - 1
              ) {
                constants.lastx = position.x;
                Autoplay('reverse-right', plot.x.length, position.x);
              } else {
                position.x += 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            }

            // left arrow 37
            if (e.key == 'ArrowLeft') {
              if (constants.isMac ? e.metaKey : e.ctrlKey) {
                if (e.shiftKey) {
                  position.x += 1;
                  Autoplay('left', position.x, -1);
                } else {
                  position.x = 0;
                  updateInfoThisRound = true;
                  isAtEnd = lockPosition();
                }
              } else if (e.altKey && e.shiftKey && position.x != 0) {
                constants.lastx = position.x;
                Autoplay('reverse-left', -1, position.x);
              } else {
                position.x -= 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            }
          } else if (constants.chartType == 'smooth') {
            if (!positionL1.x) {
              positionL1.x = lastx1;
            }

            if (e.key == 'ArrowRight' && e.shiftKey) {
              if (
                (constants.isMac ? e.metaKey : e.ctrlKey) &&
                constants.sonifMode != 'off'
              ) {
                PlayLine('right');
              } else if (e.altKey && constants.sonifMode != 'off') {
                PlayLine('reverse-right');
              }
            }

            if (e.key == 'ArrowLeft' && e.shiftKey) {
              if (
                (constants.isMac ? e.metaKey : e.ctrlKey) &&
                constants.sonifMode != 'off'
              ) {
                PlayLine('left');
              } else if (e.altKey && constants.sonifMode != 'off') {
                PlayLine('reverse-left');
              }
            }
          }

          // update text, display, and audio
          if (
            updateInfoThisRound &&
            constants.chartType == 'point' &&
            !isAtEnd
          ) {
            UpdateAll();
          }
          if (isAtEnd) {
            audio.playEnd();
          }
        },
      ]);

      let controlElements = [constants.chart, constants.brailleInput];
      let lastx = 0;
      for (let i = 0; i < controlElements.length; i++) {
        constants.events.push([
          controlElements[i],
          'keydown',
          function (e) {
            // period: speed up
            if (e.key == '.') {
              constants.SpeedUp();
              PlayDuringSpeedChange();
              display.announceText('Speed up');
            }

            // comma: speed down
            if (e.key == ',') {
              constants.SpeedDown();
              PlayDuringSpeedChange();
              display.announceText('Speed down');
            }

            // /: reset speed
            if (e.key == '/') {
              constants.SpeedReset();
              PlayDuringSpeedChange();
              display.announceText('Speed reset');
            }
          },
        ]);
      }
      function PlayDuringSpeedChange() {
        if (constants.autoplayId != null) {
          constants.KillAutoplay();
          audio.KillSmooth();
          if (lastPlayed == 'reverse-left') {
            if (constants.chartType == 'point') {
              Autoplay('right', position.x, lastx);
            } else if (constants.chartType == 'smooth') {
              Autoplay('right', positionL1.x, lastx1);
            }
          } else if (lastPlayed == 'reverse-right') {
            if (constants.chartType == 'point') {
              Autoplay('left', position.x, lastx);
            } else if (constants.chartType == 'smooth') {
              Autoplay('left', positionL1.x, lastx1);
            }
          } else {
            if (constants.chartType == 'point') {
              Autoplay(lastPlayed, position.x, lastx);
            } else if (constants.chartType == 'smooth') {
              Autoplay(lastPlayed, positionL1.x, lastx1);
            }
          }
        }
      }

      constants.events.push([
        constants.brailleInput,
        'keydown',
        function (e) {
          let updateInfoThisRound = false;
          let isAtEnd = false;

          // @TODO
          // only smooth layer can access to braille display
          if (constants.chartType == 'smooth') {
            lockPosition();
            if (e.key == 'ArrowRight') {
              // right arrow
              e.preventDefault();
              constants.brailleInput.setSelectionRange(
                positionL1.x,
                positionL1.x
              );
              if (e.target.selectionStart > e.target.value.length - 2) {
                e.preventDefault();
              } else if (constants.isMac ? e.metaKey : e.ctrlKey) {
                if (e.shiftKey) {
                  positionL1.x -= 1;
                  Autoplay('right', positionL1.x, plot.curvePoints.length);
                } else {
                  positionL1.x = plot.curvePoints.length - 1;
                  updateInfoThisRound = true;
                  isAtEnd = lockPosition();
                }
              } else if (
                e.altKey &&
                e.shiftKey &&
                positionL1.x != plot.curvePoints.length - 1
              ) {
                lastx1 = positionL1.x;
                Autoplay(
                  'reverse-right',
                  plot.curvePoints.length,
                  positionL1.x
                );
              } else {
                positionL1.x += 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else if (e.key == 'ArrowLeft') {
              // left
              e.preventDefault();
              if (constants.isMac ? e.metaKey : e.ctrlKey) {
                if (e.shiftKey) {
                  positionL1.x += 1;
                  Autoplay('left', positionL1.x, -1);
                } else {
                  positionL1.x = 0; // go all the way
                  updateInfoThisRound = true;
                  isAtEnd = lockPosition();
                }
              } else if (e.altKey && e.shiftKey && positionL1.x != 0) {
                Autoplay('reverse-left', -1, positionL1.x);
              } else {
                positionL1.x -= 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else {
              e.preventDefault();
            }
          } else if (e.key == 'Tab') {
            // do nothing, we handle this in global events
          } else {
            e.preventDefault();
          }

          lastx1 = positionL1.x;

          if (updateInfoThisRound && !isAtEnd) {
            UpdateAllBraille();
          }
          if (isAtEnd) {
            audio.playEnd();
          }
        },
      ]);

      // helper functions
      function lockPosition() {
        // lock to min / max positions
        let didLockHappen = false;
        if (constants.chartType == 'point') {
          if (position.x < 0) {
            position.x = 0;
            didLockHappen = true;
          }
          if (position.x > plot.x.length - 1) {
            position.x = plot.x.length - 1;
            didLockHappen = true;
          }
        } else if (constants.chartType == 'smooth') {
          if (positionL1.x < 0) {
            positionL1.x = 0;
            didLockHappen = true;
          }
          if (positionL1.x > plot.curvePoints.length - 1) {
            positionL1.x = plot.curvePoints.length - 1;
            didLockHappen = true;
          }
        }

        return didLockHappen;
      }

      function UpdateAll() {
        if (constants.showDisplay) {
          display.displayValues();
        }
        if (layer0Point.hasRect) {
          layer0Point.UpdatePointDisplay();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }
      }

      function UpdateAllAutoplay() {
        if (constants.showDisplayInAutoplay) {
          display.displayValues();
        }
        if (constants.showRect) {
          if (constants.chartType == 'point' && layer0Point.hasRect) {
            layer0Point.UpdatePointDisplay();
          } else if (constants.chartType == 'smooth' && layer1Point.hasRect) {
            layer1Point.UpdatePointDisplay();
          }
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }
        if (constants.brailleMode != 'off') {
          display.UpdateBraillePos();
        }
      }
      function UpdateAllBraille() {
        if (constants.showDisplayInBraille) {
          display.displayValues();
        }
        if (layer1Point.hasRect) {
          layer1Point.UpdatePointDisplay();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }
        display.UpdateBraillePos();
      }

      function Autoplay(dir, start, end) {
        lastPlayed = dir;
        let step = 1; // default right and reverse left
        if (dir == 'left' || dir == 'reverse-right') {
          step = -1;
        }

        // clear old autoplay if exists
        if (constants.autoplayId) {
          constants.KillAutoplay();
        }
        if (constants.isSmoothAutoplay) {
          audio.KillSmooth();
        }

        if (dir == 'reverse-left' || dir == 'reverse-right') {
          position.x = start;
          position.L1x = start;
        }

        if (constants.chartType == 'point') {
          constants.autoplayId = setInterval(function () {
            position.x += step;
            // autoplay for two layers: point layer & smooth layer in braille
            // plot.numPoints is not available anymore
            if (position.x < 0 || position.x > plot.y.length - 1) {
              constants.KillAutoplay();
              lockPosition();
            } else if (position.x == end) {
              constants.KillAutoplay();
              UpdateAllAutoplay();
            } else {
              UpdateAllAutoplay();
            }
          }, constants.autoPlayRate);
        } else if (constants.chartType == 'smooth') {
          constants.autoplayId = setInterval(function () {
            positionL1.x += step;
            // autoplay for two layers: point layer & smooth layer in braille
            // plot.numPoints is not available anymore
            if (
              positionL1.x < 0 ||
              positionL1.x > plot.curvePoints.length - 1
            ) {
              constants.KillAutoplay();
              lockPosition();
            } else if (positionL1.x == end) {
              constants.KillAutoplay();
              UpdateAllAutoplay();
            } else {
              UpdateAllAutoplay();
            }
          }, constants.autoPlayRate);
        }
      }

      function PlayLine(dir) {
        lastPlayed = dir;

        let freqArr = [];
        let panningArr = [];
        let panPoint = audio.SlideBetween(
          positionL1.x,
          0,
          plot.curvePoints.length - 1,
          -1,
          1
        );
        let x = positionL1.x < 0 ? 0 : positionL1.x;
        let duration = 0;
        if (dir == 'right') {
          for (let i = x; i < plot.curvePoints.length; i++) {
            freqArr.push(
              audio.SlideBetween(
                plot.curvePoints[i],
                plot.curveMinY,
                plot.curveMaxY,
                constants.MIN_FREQUENCY,
                constants.MAX_FREQUENCY
              )
            );
          }
          panningArr = [panPoint, 1];
          duration =
            (Math.abs(plot.curvePoints.length - x) / plot.curvePoints.length) *
            3;
        } else if (dir == 'left') {
          for (let i = x; i >= 0; i--) {
            freqArr.push(
              audio.SlideBetween(
                plot.curvePoints[i],
                plot.curveMinY,
                plot.curveMaxY,
                constants.MIN_FREQUENCY,
                constants.MAX_FREQUENCY
              )
            );
          }
          panningArr = [panPoint, -1];
          duration = (Math.abs(x) / plot.curvePoints.length) * 3;
        } else if (dir == 'reverse-right') {
          for (let i = plot.curvePoints.length - 1; i >= x; i--) {
            freqArr.push(
              audio.SlideBetween(
                plot.curvePoints[i],
                plot.curveMinY,
                plot.curveMaxY,
                constants.MIN_FREQUENCY,
                constants.MAX_FREQUENCY
              )
            );
          }
          panningArr = [1, panPoint];
          duration =
            (Math.abs(plot.curvePoints.length - x) / plot.curvePoints.length) *
            3;
        } else if (dir == 'reverse-left') {
          for (let i = 0; i <= x; i++) {
            freqArr.push(
              audio.SlideBetween(
                plot.curvePoints[i],
                plot.curveMinY,
                plot.curveMaxY,
                constants.MIN_FREQUENCY,
                constants.MAX_FREQUENCY
              )
            );
          }
          panningArr = [-1, panPoint];
          duration = (Math.abs(x) / plot.curvePoints.length) * 3;
        }

        if (constants.isSmoothAutoplay) {
          audio.KillSmooth();
        }

        // audio.playSmooth(freqArr, 2, panningArr, constants.vol, 'sine');
        audio.playSmooth(freqArr, duration, panningArr, constants.vol, 'sine');
      }
    } else if ([].concat(singleMaidr.type).includes('hist')) {
      window.position = new Position(-1, -1);
      window.plot = new Histogram();

      // global variables
      let lastPlayed = '';
      constants.lastx = 0;

      // control eventlisteners
      constants.events.push([
        [constants.chart, constants.brailleInput],
        'keydown',
        function (e) {
          let updateInfoThisRound = false; // we only update info and play tones on certain keys
          let isAtEnd = false;

          // Right
          if (
            e.key == 'ArrowRight' &&
            !(constants.isMac ? e.metaKey : e.ctrlKey) &&
            !e.shiftKey
          ) {
            // just right arrow, move right
            e.preventDefault();
            position.x += 1;
            updateInfoThisRound = true;
            isAtEnd = lockPosition();
          } else if (
            e.key == 'ArrowRight' &&
            (constants.isMac ? e.metaKey : e.ctrlKey) &&
            e.shiftKey
          ) {
            // ctrl shift right arrow, autoplay right
            e.preventDefault();
            position.x -= 1;
            Autoplay('right', position.x, plot.plotData.length);
          } else if (
            e.key == 'ArrowRight' &&
            !(constants.isMac ? e.metaKey : e.ctrlKey) &&
            e.altKey &&
            e.shiftKey
          ) {
            // alt shift right, autoplay from right
            e.preventDefault();
            constants.lastx = position.x;
            Autoplay('reverse-right', plot.bars.length, position.x);
          } else if (
            e.key == 'ArrowRight' &&
            (constants.isMac ? e.metaKey : e.ctrlKey) &&
            !e.shiftKey
          ) {
            // ctrl right arrow, go to end
            e.preventDefault();
            position.x = plot.plotData.length - 1;
            updateInfoThisRound = true;
            isAtEnd = lockPosition();
          }

          // Left
          if (
            e.key == 'ArrowLeft' &&
            !(constants.isMac ? e.metaKey : e.ctrlKey) &&
            !e.shiftKey
          ) {
            // just left arrow, move left
            e.preventDefault();
            position.x += -1;
            updateInfoThisRound = true;
            isAtEnd = lockPosition();
          } else if (
            e.key == 'ArrowLeft' &&
            (constants.isMac ? e.metaKey : e.ctrlKey) &&
            e.shiftKey
          ) {
            // ctrl shift left arrow, autoplay left
            e.preventDefault();
            position.x += 1;
            Autoplay('left', position.x, -1);
          } else if (
            e.key == 'ArrowLeft' &&
            !(constants.isMac ? e.metaKey : e.ctrlKey) &&
            e.altKey &&
            e.shiftKey
          ) {
            // alt shift left, autoplay from left
            e.preventDefault();
            constants.lastx = position.x;
            Autoplay('reverse-left', -1, position.x);
          } else if (
            e.key == 'ArrowLeft' &&
            (constants.isMac ? e.metaKey : e.ctrlKey) &&
            !e.shiftKey
          ) {
            // ctrl left arrow, go to beginning
            e.preventDefault();
            position.x = 0;
            updateInfoThisRound = true;
            isAtEnd = lockPosition();
          }

          // update display / text / audio
          if (updateInfoThisRound && !isAtEnd) {
            if (constants.brailleMode == 'off') {
              UpdateAll();
            } else {
              UpdateAllBraille();
            }
          }
          if (isAtEnd) {
            audio.playEnd();
          }
        },
      ]);

      let controlElements = [constants.chart, constants.brailleInput];
      let lastx = 0;
      for (let i = 0; i < controlElements.length; i++) {
        constants.events.push([
          controlElements[i],
          'keydown',
          function (e) {
            // period: speed up
            if (e.key == '.') {
              e.preventDefault();
              constants.SpeedUp();
              PlayDuringSpeedChange();
              display.announceText('Speed up');
            }

            // comma: speed down
            if (e.key == ',') {
              e.preventDefault();
              constants.SpeedDown();
              PlayDuringSpeedChange();
              display.announceText('Speed down');
            }

            // /: reset speed
            if (e.key == '/') {
              e.preventDefault();
              constants.SpeedReset();
              PlayDuringSpeedChange();
              display.announceText('Speed reset');
            }
          },
        ]);
      }
      function PlayDuringSpeedChange() {
        if (constants.autoplayId != null) {
          constants.KillAutoplay();
          if (lastPlayed == 'reverse-left') {
            Autoplay('right', position.x, lastx);
          } else if (lastPlayed == 'reverse-right') {
            Autoplay('left', position.x, lastx);
          } else {
            Autoplay(lastPlayed, position.x, lastx);
          }
        }
      }

      // lock to min / max postions
      function lockPosition() {
        let didLockHappen = false;

        if (position.x < 0) {
          position.x = 0;
          didLockHappen = true;
        }
        if (position.x > plot.plotData.length - 1) {
          position.x = plot.plotData.length - 1;
          didLockHappen = true;
        }

        return didLockHappen;
      }
      function UpdateAll() {
        if (constants.showDisplay) {
          display.displayValues();
        }
        if (constants.showRect && constants.hasRect) {
          plot.Select();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }
      }
      function UpdateAllAutoplay() {
        if (constants.showDisplayInAutoplay) {
          display.displayValues();
        }
        if (constants.showRect && constants.hasRect) {
          plot.Select();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }

        if (constants.brailleMode != 'off') {
          display.UpdateBraillePos();
        }
      }
      function UpdateAllBraille() {
        if (constants.showDisplayInBraille) {
          display.displayValues();
        }
        if (constants.showRect && constants.hasRect) {
          plot.Select();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }
        display.UpdateBraillePos();
      }
      function Autoplay(dir, start, end) {
        lastPlayed = dir;
        let step = 1; // default right and reverse-left
        if (dir == 'left' || dir == 'reverse-right') {
          step = -1;
        }

        // clear old autoplay if exists
        if (constants.autoplayId != null) {
          constants.KillAutoplay();
        }

        if (dir == 'reverse-right' || dir == 'reverse-left') {
          position.x = start;
        }

        constants.autoplayId = setInterval(function () {
          position.x += step;
          if (position.x < 0 || plot.plotData.length - 1 < position.x) {
            constants.KillAutoplay();
            lockPosition();
          } else if (position.x == end) {
            constants.KillAutoplay();
            UpdateAllAutoplay();
          } else {
            UpdateAllAutoplay();
          }
        }, constants.autoPlayRate);
      }
    } else if (
      [].concat(singleMaidr.type).includes('stacked_bar') ||
      [].concat(singleMaidr.type).includes('stacked_normalized_bar') ||
      [].concat(singleMaidr.type).includes('dodged_bar')
    ) {
      window.position = new Position(-1, -1);
      window.plot = new Segmented();

      // global variables
      let lastPlayed = '';
      constants.lastx = 0;

      // control eventlisteners
      constants.events.push([
        [constants.chart, constants.brailleInput],
        'keydown',
        function (e) {
          let updateInfoThisRound = false; // we only update info and play tones on certain keys
          let isAtEnd = false;
          constants.navigation = 0; // 0 for up/down, 1 for left/right

          if (constants.brailleMode == 'on') {
            if (e.key == 'Tab') {
              // allow
            } else {
              e.preventDefault();
            }
          }

          // Right
          if (
            e.key == 'ArrowRight' &&
            !(constants.isMac ? e.metaKey : e.ctrlKey) &&
            !e.shiftKey
          ) {
            // just right arrow, move right
            position.x += 1;
            updateInfoThisRound = true;
            constants.navigation = 1;
            isAtEnd = lockPosition();
          } else if (
            e.key == 'ArrowRight' &&
            (constants.isMac ? e.metaKey : e.ctrlKey) &&
            e.shiftKey
          ) {
            // ctrl shift right arrow, autoplay right
            position.x -= 1;
            Autoplay('right', position.x, plot.plotData.length);
          } else if (
            e.key == 'ArrowRight' &&
            !(constants.isMac ? e.metaKey : e.ctrlKey) &&
            e.altKey &&
            e.shiftKey
          ) {
            // alt shift right, autoplay from right
            constants.lastx = position.x;
            Autoplay('reverse-right', plot.plotData.length, position.x);
          } else if (
            e.key == 'ArrowRight' &&
            (constants.isMac ? e.metaKey : e.ctrlKey) &&
            !e.shiftKey
          ) {
            // ctrl right arrow, go to end
            position.x = plot.plotData.length - 1;
            updateInfoThisRound = true;
            isAtEnd = lockPosition();
          }

          // Left
          if (
            e.key == 'ArrowLeft' &&
            !(constants.isMac ? e.metaKey : e.ctrlKey) &&
            !e.shiftKey
          ) {
            // just left arrow, move left
            position.x += -1;
            updateInfoThisRound = true;
            constants.navigation = 1;
            isAtEnd = lockPosition();
          } else if (
            e.key == 'ArrowLeft' &&
            (constants.isMac ? e.metaKey : e.ctrlKey) &&
            e.shiftKey
          ) {
            // ctrl shift left arrow, autoplay left
            position.x += 1;
            Autoplay('left', position.x, -1);
          } else if (
            e.key == 'ArrowLeft' &&
            !(constants.isMac ? e.metaKey : e.ctrlKey) &&
            e.altKey &&
            e.shiftKey
          ) {
            // alt shift left, autoplay from left
            constants.lastx = position.x;
            Autoplay('reverse-left', -1, position.x);
          } else if (
            e.key == 'ArrowLeft' &&
            (constants.isMac ? e.metaKey : e.ctrlKey) &&
            !e.shiftKey
          ) {
            // ctrl left arrow, go to beginning
            position.x = 0;
            updateInfoThisRound = true;
            isAtEnd = lockPosition();
          }

          // Up
          if (
            e.key == 'ArrowUp' &&
            !(constants.isMac ? e.metaKey : e.ctrlKey) &&
            !e.shiftKey
          ) {
            // just up arrow, move up
            position.y += 1;
            updateInfoThisRound = true;
            constants.navigation = 0;
            isAtEnd = lockPosition();
          } else if (
            e.key == 'ArrowUp' &&
            (constants.isMac ? e.metaKey : e.ctrlKey) &&
            e.shiftKey
          ) {
            // ctrl shift up arrow, autoplay up
            Autoplay('up', position.y, plot.plotData[0].length);
          } else if (
            e.key == 'ArrowUp' &&
            !(constants.isMac ? e.metaKey : e.ctrlKey) &&
            e.altKey &&
            e.shiftKey
          ) {
            // alt shift up, autoplay from up
            constants.lastx = position.x;
            Autoplay('reverse-up', -1, plot.plotData[0].length);
          } else if (
            e.key == 'ArrowUp' &&
            (constants.isMac ? e.metaKey : e.ctrlKey) &&
            !e.shiftKey
          ) {
            // ctrl up arrow, go to top
            position.y = plot.plotData[0].length - 1;
            updateInfoThisRound = true;
          }

          // Down
          if (
            e.key == 'ArrowDown' &&
            !(constants.isMac ? e.metaKey : e.ctrlKey) &&
            !e.shiftKey
          ) {
            // just down arrow, move down
            position.y += -1;
            updateInfoThisRound = true;
            constants.navigation = 0;
            isAtEnd = lockPosition();
          } else if (
            e.key == 'ArrowDown' &&
            (constants.isMac ? e.metaKey : e.ctrlKey) &&
            e.shiftKey
          ) {
            // ctrl shift down arrow, autoplay down
            Autoplay('down', position.y, -1);
          } else if (
            e.key == 'ArrowDown' &&
            !(constants.isMac ? e.metaKey : e.ctrlKey) &&
            e.altKey &&
            e.shiftKey
          ) {
            // alt shift down, autoplay from down
            constants.lastx = position.x;
            Autoplay('reverse-down', -1, position.y);
          } else if (
            e.key == 'ArrowDown' &&
            (constants.isMac ? e.metaKey : e.ctrlKey) &&
            !e.shiftKey
          ) {
            // ctrl down arrow, go to bottom
            position.y = 0;
            updateInfoThisRound = true;
          }

          // update display / text / audio
          if (updateInfoThisRound && !isAtEnd) {
            if (constants.brailleMode == 'off') {
              UpdateAll();
            } else {
              UpdateAllBraille();
            }
          }
          if (isAtEnd) {
            audio.playEnd();
          }
        },
      ]);

      let controlElements = [constants.chart, constants.brailleInput];
      let lastx = 0;
      for (let i = 0; i < controlElements.length; i++) {
        constants.events.push([
          controlElements[i],
          'keydown',
          function (e) {
            // period: speed up
            if (e.key == '.') {
              constants.SpeedUp();
              PlayDuringSpeedChange();
              display.announceText('Speed up');
            }

            // comma: speed down
            if (e.key == ',') {
              constants.SpeedDown();
              PlayDuringSpeedChange();
              display.announceText('Speed down');
            }

            // /: reset speed
            if (e.key == '/') {
              constants.SpeedReset();
              PlayDuringSpeedChange();
              display.announceText('Speed reset');
            }
          },
        ]);
      }
      function PlayDuringSpeedChange() {
        if (constants.autoplayId != null) {
          constants.KillAutoplay();
          if (lastPlayed == 'reverse-left') {
            Autoplay('right', position.x, lastx);
          } else if (lastPlayed == 'reverse-right') {
            Autoplay('left', position.x, lastx);
          } else if (lastPlayed == 'reverse-up') {
            Autoplay('down', position.x, lastx);
          } else if (lastPlayed == 'reverse-down') {
            Autoplay('up', position.x, lastx);
          } else {
            Autoplay(lastPlayed, position.x, lastx);
          }
        }
      }

      // lock to min / max postions
      function lockPosition() {
        let didLockHappen = false;

        if (position.x < 0) {
          position.x = 0;
          didLockHappen = true;
        }
        if (position.x > plot.level.length - 1) {
          position.x = plot.plotData.length - 1;
          didLockHappen = true;
        }
        if (position.y < 0) {
          position.y = 0;
          didLockHappen = true;
        }
        if (position.y > plot.fill.length - 1) {
          position.y = plot.fill.length - 1;
          didLockHappen = true;
        }

        return didLockHappen;
      }
      function UpdateAll() {
        if (constants.showDisplay) {
          display.displayValues();
        }
        if (constants.showRect && constants.hasRect) {
          plot.Select();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }
      }
      function UpdateAllAutoplay() {
        if (constants.showDisplayInAutoplay) {
          display.displayValues();
        }
        if (constants.showRect && constants.hasRect) {
          plot.Select();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }

        if (constants.brailleMode != 'off') {
          display.UpdateBraillePos();
        }
      }
      function UpdateAllBraille() {
        if (constants.showDisplayInBraille) {
          display.SetBraille();
          display.displayValues();
        }
        if (constants.showRect && constants.hasRect) {
          plot.Select();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }

        display.UpdateBraillePos();
      }
      function Autoplay(dir, start, end) {
        lastPlayed = dir;
        let step = 1; // default right, up, reverse-left, and reverse-down
        if (
          dir == 'left' ||
          dir == 'down' ||
          dir == 'reverse-right' ||
          dir == 'reverse-up'
        ) {
          step = -1;
        }

        // clear old autoplay if exists
        if (constants.autoplayId != null) {
          constants.KillAutoplay();
        }

        if (dir == 'reverse-left' || dir == 'reverse-right') {
          position.x = start;
        } else if (dir == 'reverse-up' || dir == 'reverse-down') {
          position.y = start;
        }

        constants.autoplayId = setInterval(function () {
          if (
            dir == 'left' ||
            dir == 'right' ||
            dir == 'reverse-left' ||
            dir == 'reverse-right'
          ) {
            position.x += step;
            if (position.x < 0 || plot.plotData.length - 1 < position.x) {
              constants.KillAutoplay();
              lockPosition();
            } else if (position.x == end) {
              constants.KillAutoplay();
              UpdateAllAutoplay();
            } else {
              UpdateAllAutoplay();
            }
          } else {
            // up or down
            position.y += step;
            if (position.y < 0 || plot.plotData[0].length - 1 < position.y) {
              constants.KillAutoplay();
              lockPosition();
            } else if (position.y == end) {
              constants.KillAutoplay();
              UpdateAllAutoplay();
            } else {
              UpdateAllAutoplay();
            }
          }
        }, constants.autoPlayRate);
      }
    } else if (singleMaidr.type == 'line') {
      window.position = new Position(-1, -1);
      window.plot = new LinePlot();
      let point = new Point();

      // global variables
      let lastPlayed = '';
      constants.lastx = 0;

      // control eventlisteners
      constants.events.push([
        constants.chart,
        'keydown',
        function (e) {
          let updateInfoThisRound = false; // we only update info and play tones on certain keys
          let isAtEnd = false;

          if (e.key == 'ArrowRight') {
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                position.x -= 1;
                Autoplay('right', position.x, plot.pointValuesY.length);
              } else {
                position.x = plot.pointValuesY.length - 1; // go all the way
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else if (
              e.altKey &&
              e.shiftKey &&
              position.x != plot.pointValuesY.length - 1
            ) {
              constants.lastx = position.x;
              Autoplay('reverse-right', plot.pointValuesY.length, position.x);
            } else {
              position.x += 1;
              updateInfoThisRound = true;
              isAtEnd = lockPosition();
            }
          } else if (e.key == 'ArrowLeft') {
            // var prevLink = document.getElementById('prev');   // what is prev in the html?
            // if (prevLink) {
            // left arrow 37
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                position.x += 1;
                Autoplay('left', position.x, -1);
              } else {
                position.x = 0; // go all the way
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else if (e.altKey && e.shiftKey && position.x != 0) {
              constants.lastx = position.x;
              Autoplay('reverse-left', -1, position.x);
            } else {
              position.x += -1;
              updateInfoThisRound = true;
              isAtEnd = lockPosition();
            }
            // }
          }

          // update display / text / audio
          if (updateInfoThisRound && !isAtEnd) {
            UpdateAll();
          }
          if (isAtEnd) {
            audio.playEnd();
          }
        },
      ]);

      constants.events.push([
        constants.brailleInput,
        'keydown',
        function (e) {
          let updateInfoThisRound = false; // we only update info and play tones on certain keys
          let isAtEnd = false;

          if (e.key == 'ArrowRight') {
            // right arrow
            e.preventDefault();
            if (e.target.selectionStart > e.target.value.length - 2) {
            } else if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                position.x -= 1;
                Autoplay('right', position.x, plot.pointValuesY.length);
              } else {
                position.x = plot.pointValuesY.length - 1; // go all the way
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else if (
              e.altKey &&
              e.shiftKey &&
              position.x != plot.pointValues.length - 1
            ) {
              constants.lastx = position.x;
              Autoplay('reverse-right', plot.pointValuesY.length, position.x);
            } else {
              position.x += 1;
              updateInfoThisRound = true;
              isAtEnd = lockPosition();
            }
          } else if (e.key == 'ArrowLeft') {
            // left arrow
            e.preventDefault();
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
              if (e.shiftKey) {
                position.x += 1;
                Autoplay('left', position.x, -1);
              } else {
                position.x = 0; // go all the way
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
              }
            } else if (e.altKey && e.shiftKey && position.x != 0) {
              constants.lastx = position.x;
              Autoplay('reverse-left', -1, position.x);
            } else {
              position.x += -1;
              updateInfoThisRound = true;
              isAtEnd = lockPosition();
            }
          } else if (e.key == 'Tab') {
            // do nothing, we handle this in global events
          } else {
            e.preventDefault();
          }

          // update display / text / audio
          if (updateInfoThisRound && !isAtEnd) {
            UpdateAllBraille();
          }
          if (isAtEnd) {
            audio.playEnd();
          }
        },
      ]);

      // control eventlisteners
      // constants.events.push([
      //   [constants.chart, constants.brailleInput],
      //   'keydown',
      //   function (e) {
      //     let updateInfoThisRound = false; // we only update info and play tones on certain keys
      //     let isAtEnd = false;

      //     if (e.key == 'ArrowRight') {
      //       // right arrow
      //       e.preventDefault();
      //       if (e.target.selectionStart > e.target.value.length - 2) {
      //       } else if (constants.isMac ? e.metaKey : e.ctrlKey) {
      //         if (e.shiftKey) {
      //           position.x -= 1;
      //           Autoplay('right', position.x, plot.pointValuesY.length);
      //         } else {
      //           position.x = plot.pointValuesY.length - 1; // go all the way
      //           updateInfoThisRound = true;
      //           isAtEnd = lockPosition();
      //         }
      //       } else if (
      //         e.altKey &&
      //         e.shiftKey &&
      //         position.x != plot.pointValuesY.length - 1
      //       ) {
      //         constants.lastx = position.x;
      //         Autoplay('reverse-right', plot.pointValuesY.length, position.x);
      //       } else {
      //         position.x += 1;
      //         updateInfoThisRound = true;
      //         isAtEnd = lockPosition();
      //       }
      //     } else if (e.key == 'ArrowLeft') {
      //       // left arrow
      //       e.preventDefault();
      //       if (constants.isMac ? e.metaKey : e.ctrlKey) {
      //         if (e.shiftKey) {
      //           position.x += 1;
      //           Autoplay('left', position.x, -1);
      //         } else {
      //           position.x = 0; // go all the way
      //           updateInfoThisRound = true;
      //           isAtEnd = lockPosition();
      //         }
      //       } else if (e.altKey && e.shiftKey && position.x != 0) {
      //         constants.lastx = position.x;
      //         Autoplay('reverse-left', -1, position.x);
      //       } else {
      //         position.x += -1;
      //         updateInfoThisRound = true;
      //         isAtEnd = lockPosition();
      //       }
      //     } else if (e.key == 'Tab') {
      //       // do nothing, we handle this in global events
      //     } else {
      //       e.preventDefault();
      //       // Right
      //       if (
      //         e.key == 'ArrowRight' &&
      //         !(constants.isMac ? e.metaKey : e.ctrlKey) &&
      //         !e.shiftKey
      //       ) {
      //         // just right arrow, move right
      //         position.x += 1;
      //         updateInfoThisRound = true;
      //         isAtEnd = lockPosition();
      //       } else if (
      //         e.key == 'ArrowRight' &&
      //         (constants.isMac ? e.metaKey : e.ctrlKey) &&
      //         e.shiftKey
      //       ) {
      //         // ctrl shift right arrow, autoplay right
      //         position.x += -1;
      //         Autoplay('outward_right', position.x, plot.pointValuesY.length);
      //       } else if (
      //         e.key == 'ArrowRight' &&
      //         !(constants.isMac ? e.metaKey : e.ctrlKey) &&
      //         e.altKey &&
      //         e.shiftKey &&
      //         position.x != plot.pointValuesY.length - 1
      //       ) {
      //         // alt shift right, autoplay from right
      //         constants.lastx = position.x;
      //         Autoplay('inward_right', plot.pointValues.length, position.x);
      //       } else if (
      //         e.key == 'ArrowRight' &&
      //         (constants.isMac ? e.metaKey : e.ctrlKey) &&
      //         !e.shiftKey
      //       ) {
      //         // ctrl right arrow, go to end
      //         position.x = plot.pointValuesY.length - 1; // go all the way
      //         updateInfoThisRound = true;
      //         isAtEnd = lockPosition();
      //       }

      //       // Left
      //       if (
      //         e.key == 'ArrowLeft' &&
      //         !(constants.isMac ? e.metaKey : e.ctrlKey) &&
      //         !e.shiftKey
      //       ) {
      //         // just left arrow, move left
      //         position.x += -1;
      //         updateInfoThisRound = true;
      //         isAtEnd = lockPosition();
      //       } else if (
      //         e.key == 'ArrowLeft' &&
      //         (constants.isMac ? e.metaKey : e.ctrlKey) &&
      //         e.shiftKey
      //       ) {
      //         // ctrl shift left arrow, autoplay left
      //         position.x += 1;
      //         Autoplay('outward_left', position.x, -1);
      //       } else if (
      //         e.key == 'ArrowLeft' &&
      //         !(constants.isMac ? e.metaKey : e.ctrlKey) &&
      //         e.altKey &&
      //         e.shiftKey
      //       ) {
      //         // alt shift left, autoplay from left
      //         constants.lastx = position.x;
      //         Autoplay('inward_left', -1, position.x);
      //       } else if (
      //         e.key == 'ArrowLeft' &&
      //         (constants.isMac ? e.metaKey : e.ctrlKey) &&
      //         !e.shiftKey
      //       ) {
      //         // ctrl left arrow, go to beginning
      //         position.x = 0; // go all the way
      //         updateInfoThisRound = true;
      //         isAtEnd = lockPosition();
      //       }

      //       // update display / text / audio
      //       if (updateInfoThisRound && !isAtEnd) {
      //         if (constants.brailleMode == 'off') {
      //           UpdateAll();
      //         } else {
      //           UpdateAllBraille();
      //         }
      //       }
      //       if (isAtEnd) {
      //         audio.playEnd();
      //       }
      //     }
      //   },
      // ]);

      let controlElements = [constants.chart, constants.brailleInput];
      let lastx = 0;
      for (let i = 0; i < controlElements.length; i++) {
        constants.events.push([
          controlElements[i],
          'keydown',
          function (e) {
            // period: speed up
            if (e.key == '.') {
              constants.SpeedUp();
              PlayDuringSpeedChange();
              display.announceText('Speed up');
            }

            // comma: speed down
            if (e.key == ',') {
              constants.SpeedDown();
              PlayDuringSpeedChange();
              display.announceText('Speed down');
            }

            // /: reset speed
            if (e.key == '/') {
              constants.SpeedReset();
              PlayDuringSpeedChange();
              display.announceText('Speed reset');
            }
          },
        ]);
      }
      function PlayDuringSpeedChange() {
        if (constants.autoplayId != null) {
          constants.KillAutoplay();
          if (lastPlayed == 'reverse-left') {
            Autoplay('right', position.x, lastx);
          } else if (lastPlayed == 'reverse-right') {
            Autoplay('left', position.x, lastx);
          } else {
            Autoplay(lastPlayed, position.x, lastx);
          }
        }
      }

      function lockPosition() {
        // lock to min / max postions
        let didLockHappen = false;
        // if (!constants.hasRect) {
        //   return didLockHappen;
        // }

        if (position.x < 0) {
          position.x = 0;
          didLockHappen = true;
        }
        if (position.x > plot.pointValuesY.length - 1) {
          position.x = plot.pointValuesY.length - 1;
          didLockHappen = true;
        }

        return didLockHappen;
      }
      function UpdateAll() {
        if (constants.showDisplay) {
          display.displayValues();
        }
        if (constants.showRect) {
          point.UpdatePointDisplay();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }
      }
      function UpdateAllAutoplay() {
        if (constants.showDisplayInAutoplay) {
          display.displayValues();
        }
        if (constants.showRect) {
          point.UpdatePointDisplay();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }

        if (constants.brailleMode != 'off') {
          display.UpdateBraillePos();
        }
      }
      function UpdateAllBraille() {
        if (constants.showDisplayInBraille) {
          display.displayValues();
        }
        if (constants.showRect) {
          point.UpdatePointDisplay();
        }
        if (constants.sonifMode != 'off') {
          plot.PlayTones();
        }
        display.UpdateBraillePos();
      }
      function Autoplay(dir, start, end) {
        lastPlayed = dir;
        let step = 1; // default right and reverse-left
        if (dir == 'left' || dir == 'reverse-right') {
          step = -1;
        }

        // clear old autoplay if exists
        if (constants.autoplayId != null) {
          constants.KillAutoplay();
        }

        if (dir == 'reverse-right' || dir == 'reverse-left') {
          position.x = start;
        }

        constants.autoplayId = setInterval(function () {
          position.x += step;
          if (position.x < 0 || plot.pointValuesY.length - 1 < position.x) {
            constants.KillAutoplay();
            lockPosition();
          } else if (position.x == end) {
            constants.KillAutoplay();
            UpdateAllAutoplay();
          } else {
            UpdateAllAutoplay();
          }
        }, constants.autoPlayRate);
      }
      function PlayLine(dir) {
        lastPlayed = dir;

        let freqArr = [];
        let panningArr = [];
        let panPoint = audio.SlideBetween(
          positionL1.x,
          0,
          plot.curvePoints.length - 1,
          -1,
          1
        );
        let x = positionL1.x < 0 ? 0 : positionL1.x;
        let duration = 0;
        if (dir == 'right') {
          for (let i = x; i < plot.curvePoints.length; i++) {
            freqArr.push(
              audio.SlideBetween(
                plot.curvePoints[i],
                plot.curveMinY,
                plot.curveMaxY,
                constants.MIN_FREQUENCY,
                constants.MAX_FREQUENCY
              )
            );
          }
          panningArr = [panPoint, 1];
          duration =
            (Math.abs(plot.curvePoints.length - x) / plot.curvePoints.length) *
            3;
        } else if (dir == 'left') {
          for (let i = x; i >= 0; i--) {
            freqArr.push(
              audio.SlideBetween(
                plot.curvePoints[i],
                plot.curveMinY,
                plot.curveMaxY,
                constants.MIN_FREQUENCY,
                constants.MAX_FREQUENCY
              )
            );
          }
          panningArr = [panPoint, -1];
          duration = (Math.abs(x) / plot.curvePoints.length) * 3;
        } else if (dir == 'reverse-right') {
          for (let i = plot.curvePoints.length - 1; i >= x; i--) {
            freqArr.push(
              audio.SlideBetween(
                plot.curvePoints[i],
                plot.curveMinY,
                plot.curveMaxY,
                constants.MIN_FREQUENCY,
                constants.MAX_FREQUENCY
              )
            );
          }
          panningArr = [1, panPoint];
          duration =
            (Math.abs(plot.curvePoints.length - x) / plot.curvePoints.length) *
            3;
        } else if (dir == 'reverse-left') {
          for (let i = 0; i <= x; i++) {
            freqArr.push(
              audio.SlideBetween(
                plot.curvePoints[i],
                plot.curveMinY,
                plot.curveMaxY,
                constants.MIN_FREQUENCY,
                constants.MAX_FREQUENCY
              )
            );
          }
          panningArr = [-1, panPoint];
          duration = (Math.abs(x) / plot.curvePoints.length) * 3;
        }

        if (constants.isSmoothAutoplay) {
          audio.KillSmooth();
        }

        // audio.playSmooth(freqArr, 2, panningArr, constants.vol, 'sine');
        audio.playSmooth(freqArr, duration, panningArr, constants.vol, 'sine');
      }
    }
  }

  /**
   * Gets the next or previous focusable element based on the current focus.
   * @param {string} nextprev - Determines whether to get the next or previous focusable element. Defaults to 'next'.
   * @returns {HTMLElement|null} - The next or previous focusable element, or null if it does not exist.
   */
  GetNextPrevFocusable(nextprev = 'next') {
    // store all focusable elements for future tabbing away from chart
    let focusableSelectors =
      'a[href], button:not([disabled]), textarea:not([disabled]), input[type="text"]:not([disabled]), input[type="radio"]:not([disabled]), input[type="checkbox"]:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    constants.focusables = Array.from(
      document.querySelectorAll(focusableSelectors)
    );

    // get index of chart in focusables
    let chartIndex = constants.focusables.indexOf(constants.chart);

    // remove all the stuff we add manually from focusables
    let maidrFocusables =
      constants.main_container.querySelectorAll(focusableSelectors);
    for (let i = 0; i < maidrFocusables.length; i++) {
      let index = constants.focusables.indexOf(maidrFocusables[i]);
      if (index > -1) {
        constants.focusables.splice(index, 1);
      }
      // and adjust chartIndex
      if (chartIndex > index) {
        chartIndex--;
      }
    }

    // now we get next / prev based on chartIndex. If DNE, return null
  }
}
