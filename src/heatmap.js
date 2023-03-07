document.addEventListener('DOMContentLoaded', function (e) { // we wrap in DOMContentLoaded to make sure everything has loaded before we run anything

    // variable initialization
    constants.plotId = 'geom_rect.rect.2.1';
    window.position = new Position(-1,-1);
    window.plot = new HeatMap();
    constants.chartType = "heatmap";
    let rect = new HeatMapRect();
    let audio = new Audio();
    let display = new Display();
    let lastPlayed = '';
    let lastx = 0;

    // control eventlisteners
    constants.svg_container.addEventListener("keydown", function (e) {
        let updateInfoThisRound = false;
        let isAtEnd = false;

        // right arrow 39
        if (e.which === 39) {
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
                if (e.shiftKey) {
                    // lastx = position.x;
                    position.x -= 1;
                    Autoplay('right', position.x, plot.num_cols);
                } else {
                    position.x = plot.num_cols - 1;
                    updateInfoThisRound = true;
                }
            } else if (e.altKey && e.shiftKey && position.x != plot.num_cols - 1) {
                lastx = position.x;
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
        if (e.which === 37) {
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
                if (e.shiftKey) {
                    // lastx = position.x;
                    position.x += 1;
                    Autoplay('left', position.x, -1);
                } else {
                    position.x = 0;
                    updateInfoThisRound = true;
                }
            } else if (e.altKey && e.shiftKey && position.x != 0) {
                lastx = position.x;
                Autoplay('reverse-left', -1, position.x);
            } else {
                position.x -= 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
            }
            constants.navigation = 1;
        }

        // up arrow 38
        if (e.which === 38) {
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
                if (e.shiftKey) {
                    // lastx = position.y;
                    position.y += 1;
                    Autoplay('up', position.y, -1);
                } else {
                    position.y = 0;
                    updateInfoThisRound = true;
                }
            } else if (e.altKey && e.shiftKey && position.y != 0) {
                lastx = position.x;
                Autoplay('reverse-up', -1, position.y);
            } else {
                position.y -= 1;
                updateInfoThisRound = true;
                isAtEnd = lockPosition();
            }
            constants.navigation = 0;
        }

        // down arrow 40
        if (e.which === 40) {
            if (constants.isMac ? e.metaKey : e.ctrlKey) {
                if (e.shiftKey) {
                    // lastx = position.y;
                    position.y -= 1;
                    Autoplay('down', position.y, plot.num_rows);
                } else {
                    position.y = plot.num_rows - 1;
                    updateInfoThisRound = true;
                }
            } else if (e.altKey && e.shiftKey && position.y != plot.num_rows - 1) {
                lastx = position.x;
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
        if (updateInfoThisRound && ! isAtEnd) {
            UpdateAll();
        }
        if ( isAtEnd ) {
            audio.playEnd();
        }
    });


    constants.brailleInput.addEventListener("keydown", function (e) {
        let updateInfoThisRound = false;
        let isAtEnd = false;

        if (e.which == 9) { // let user tab
        } else if (e.which == 39) { // right arrow
            if (e.target.selectionStart > e.target.value.length - 3 || e.target.value.substring(e.target.selectionStart + 1, e.target.selectionStart + 2) == '⠳') {
                // already at the end, do nothing
                e.preventDefault();
            } else {
                if (constants.isMac ? e.metaKey : e.ctrlKey) {
                    if (e.shiftKey) {
                        // lastx = position.x;
                        position.x -= 1;
                        Autoplay('right', position.x, plot.num_cols);
                    } else {
                        position.x = plot.num_cols - 1;
                        updateInfoThisRound = true;
                    }
                } else if (e.altKey && e.shiftKey && position.x != plot.num_cols - 1) {
                    lastx = position.x;
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
                let pos = (position.y * (plot.num_cols + 1)) + position.x;
                e.target.setSelectionRange(pos, pos);
                e.preventDefault();

                constants.navigation = 1;
            }
        } else if (e.which == 37) { // left
            if (e.target.selectionStart == 0 || e.target.value.substring(e.target.selectionStart - 1, e.target.selectionStart) == '⠳') {
                e.preventDefault();
            } else {
                if (constants.isMac ? e.metaKey : e.ctrlKey) {
                    if (e.shiftKey) {
                        // lastx = position.x;
                        position.x += 1;
                        Autoplay('left', position.x, -1);
                    } else {
                        position.x = 0;
                        updateInfoThisRound = true;
                    }
                } else if (e.altKey && e.shiftKey && position.x != 0) {
                    lastx = position.x;
                    Autoplay('reverse-left', -1, position.x);
                } else {
                    position.x += -1;
                    updateInfoThisRound = true;
                    isAtEnd = lockPosition();
                }

                let pos = (position.y * (plot.num_cols + 1)) + position.x;
                e.target.setSelectionRange(pos, pos);
                e.preventDefault();

                constants.navigation = 1;
            }
        } else if (e.which == 40) { // down
            if (position.y + 1 == plot.num_rows) {
                e.preventDefault();
            } else {
                if (constants.isMac ? e.metaKey : e.ctrlKey) {
                    if (e.shiftKey) {
                        // lastx = position.y;
                        position.y -= 1;
                        Autoplay('down', position.y, plot.num_rows);
                    } else {
                        position.y = plot.num_rows - 1;
                        updateInfoThisRound = true;
                    }
                } else if (e.altKey && e.shiftKey && position.y != plot.num_rows - 1) {
                    lastx = position.x;
                    Autoplay('reverse-down', plot.num_rows, position.y);
                } else {
                    if (position.x == -1 && position.y == -1) {
                        position.x += 1;
                    }
                    position.y += 1;
                    updateInfoThisRound = true;
                    isAtEnd = lockPosition();
                }

                let pos = (position.y * (plot.num_cols + 1)) + position.x;
                e.target.setSelectionRange(pos, pos);
                e.preventDefault();

                constants.navigation = 0;
            }
        } else if (e.which == 38) { // up
            if (e.target.selectionStart - plot.num_cols - 1 < 0) {
                e.preventDefault();
            } else {
                if (constants.isMac ? e.metaKey : e.ctrlKey) {
                    if (e.shiftKey) {
                        // lastx = position.y;
                        position.y += 1;
                        Autoplay('up', position.y, -1);
                    } else {
                        position.y = 0;
                        updateInfoThisRound = true;
                    }
                } else if (e.altKey && e.shiftKey && position.y != 0) {
                    lastx = position.x;
                    Autoplay('reverse-up', -1, position.y);
                } else {
                    position.y += -1;
                    updateInfoThisRound = true;
                    isAtEnd = lockPosition();
                }

                let pos = (position.y * (plot.num_cols + 1)) + position.x;
                e.target.setSelectionRange(pos, pos);
                e.preventDefault();

                constants.navigation = 0;
            }
        } else {
            e.preventDefault();
        }

        // commented this so that menu can be enabled when toggle in brailleInput
        // auto turn off braille mode if we leave the braille box
        // constants.brailleInput.addEventListener('focusout', function(e) {
        //     display.toggleBrailleMode('off');
        // });

        if (updateInfoThisRound && ! isAtEnd) {
            UpdateAllBraille();
        }
        if ( isAtEnd ) {
            audio.playEnd();
        }
    });

    let controlElements = [constants.svg_container, constants.brailleInput];
    for ( let i = 0 ; i < controlElements.length ; i++ ) {
        controlElements[i].addEventListener("keydown", function (e) {

            // B: braille mode
            if (e.which == 66) {
                display.toggleBrailleMode();
                e.preventDefault();
            }
            // T: aria live text output mode
            if (e.which == 84) {
                display.toggleTextMode();
            }
            // S: sonification mode
            if (e.which == 83) {
                display.toggleSonificationMode();
            }

            // space: replay info but no other changes
            if (e.which === 32) {
                UpdateAll();
            }

        });
    }

    document.addEventListener("keydown", function (e) {

        if (constants.isMac ? e.metaKey : e.ctrlKey) {

            // (ctrl/cmd)+(home/fn+left arrow): first element
            if (e.which == 36) {
                position.x = 0;
                position.y = 0;
                UpdateAllBraille();
            }

            // (ctrl/cmd)+(end/fn+right arrow): last element
            else if (e.which == 35) {
                position.x = plot.num_cols - 1;
                position.y = plot.num_rows - 1;
                UpdateAllBraille();
            }
        }

        // period: speed up
        if (e.which == 190) {
            constants.SpeedUp();
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

        // comma: speed down
        if (e.which == 188) {
            constants.SpeedDown();
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
    });

    // helper functions
    function lockPosition() {
        // lock to min / max postions
        let isLockNeeded = false;
        
        if (position.x < 0) {
            position.x = 0;
            isLockNeeded = true;
        }
        if (position.x > plot.num_cols - 1) {
            position.x = plot.num_cols - 1;
            isLockNeeded = true;
        }
        if (position.y < 0) {
            position.y = 0;
            isLockNeeded = true;
        }
        if (position.y > plot.num_rows - 1) {
            position.y = plot.num_rows - 1;
            isLockNeeded = true;
        }

        return isLockNeeded;
    }

    function UpdateAll() {
        if (constants.showDisplay) {
            display.displayValues(plot);
        }
        if (constants.showRect) {
            rect.UpdateRectDisplay();
        }
        if (constants.audioPlay) {
            audio.playTone();
        }
    }
    function UpdateAllAutoplay() {
        if (constants.showDisplayInAutoplay) {
            display.displayValues(plot);
        }
        if (constants.showRect) {
            rect.UpdateRectDisplay();
        }
        if (constants.audioPlay) {
            audio.playTone();
        }
        if (constants.brailleMode != "off") {
            display.UpdateBraillePos(plot);
        }
    }
    function UpdateAllBraille() {
        if (constants.showDisplayInBraille) {
            display.displayValues(plot);
        }
        if (constants.showRect) {
            rect.UpdateRectDisplay();
        }
        if (constants.audioPlay) {
            audio.playTone();
        }
        display.UpdateBraillePos(plot);
    }

    function Autoplay(dir, start, end) {
        lastPlayed = dir;
        let step = 1; // default right, down, reverse-left, and reverse-up
        if (dir == "left" || dir == "up" || dir == "reverse-right" || dir == "reverse-down") {
            step = -1;
        }

        // clear old autoplay if exists
        if (constants.autoplayId != null) {
            constants.KillAutoplay();
        }

        if (dir == "reverse-left" || dir == "reverse-right") {
            position.x = start;
        } else if (dir == "reverse-up" || dir == "reverse-down") {
            position.y = start;
        }

        constants.autoplayId = setInterval(function () {
            if (dir == "left" || dir == "right" || dir == "reverse-left" || dir == "reverse-right") {
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
            } else { // up or down
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

});


class HeatMap {

    constructor() {

        if ( constants.manualData ) {
            this.plots = heatmapPlots;
        } else {
            this.plots = document.querySelectorAll('#' + constants.plotId.replaceAll('\.', '\\.') + ' > rect');
        }
        this.plotData = this.getHeatMapData();
        this.updateConstants();

        this.group_labels = this.getGroupLabels();

        this.x_coord = this.plotData[0];
        this.y_coord = this.plotData[1];
        this.values = this.plotData[2];
        this.num_rows = this.plotData[3];
        this.num_cols = this.plotData[4];

        this.x_group_label = this.group_labels[0];
        this.y_group_label = this.group_labels[1];

        this.x_labels = this.getXLabels();
        this.y_labels = this.getYLabels();
    }

    getHeatMapData() {

        // get the x_coord and y_coord to check if a square exists at the coordinates
        let x_coord_check = [];
        let y_coord_check = [];

        for (let i = 0; i < this.plots.length; i++) {
            x_coord_check.push(parseFloat(this.plots[i].getAttribute('x')));
            y_coord_check.push(parseFloat(this.plots[i].getAttribute('y')));
        }

        // sort the squares to access from left to right, up to down
        x_coord_check.sort(function(a,b) { return a - b }); // ascending
        y_coord_check.sort(function(a,b) { return a - b }).reverse(); // descending

        // get unique elements from x_coord and y_coord
        let unique_x_coord = [...new Set(x_coord_check)];
        let unique_y_coord = [...new Set(y_coord_check)];

        // get num of rows, num of cols, and total numbers of squares
        let num_rows = unique_y_coord.length;
        let num_cols = unique_x_coord.length;

        let norms;
        if ( constants.manualData ) {
            norms = [...heatmapData];
        } else {
            norms = Array(num_rows).fill().map(() => Array(num_cols).fill(0));
            let min_norm = 3 * (Math.pow(255, 2));
            let max_norm = 0;

            for (var i = 0; i < this.plots.length; i++) {
                var x_index = unique_x_coord.indexOf(x_coord_check[i]);
                var y_index = unique_y_coord.indexOf(y_coord_check[i]);
                let norm = this.getRGBNorm(i);
                norms[y_index][x_index] = norm;

                if (norm < min_norm) min_norm = norm;
                if (norm > max_norm) max_norm = norm;
            }
        }

        

        let plotData = [unique_x_coord, unique_y_coord, norms, num_rows, num_cols];

        return plotData;
    }

    updateConstants() {

        constants.minX = 0;
        constants.maxX = this.plotData[4]
        constants.minY = this.plotData[2][0][0]; // initial val
        constants.maxY = this.plotData[2][0][0]; // initial val
        for ( let i = 0 ; i < this.plotData[2].length ; i++ ) {
            for ( let j = 0 ; j < this.plotData[2][i].length ; j++ ) {
                if ( this.plotData[2][i][j] < constants.minY ) constants.minY = this.plotData[2][i][j];
                if ( this.plotData[2][i][j] > constants.maxY ) constants.maxY = this.plotData[2][i][j];
            }
        }
    }

    getRGBNorm(i) {
        let rgb_string = this.plots[i].getAttribute('fill');
        let rgb_array = rgb_string.slice(4, -1).split(',');
        // just get the sum of squared value of rgb, similar without sqrt, save computation 
        return rgb_array.map(function (x) {
            return Math.pow(x, 2);
        }).reduce(function (a, b) {
            return a + b;
        });
    }

    getGroupLabels() {
        let labels_nodelist;
        if ( constants.manualData ) {
            labels_nodelist = heatmapLabelsNodelist;
            if (typeof(labels_nodelist[0]) == "string") {
                return labels_nodelist;
            }
        } else {
            labels_nodelist = document.querySelectorAll('tspan[dy="12"]');
        }
        // console.log(labels_nodelist);

        let labels = [];
        labels.push(labels_nodelist[0].innerHTML, labels_nodelist[1].innerHTML);

        return labels;
    }

    getXLabels() {
        let x_labels_nodelist;
        if ( constants.manualData ) {
            x_labels_nodelist = heatmapXNodelist;
            if (typeof(x_labels_nodelist[0]) == "string") {
                return x_labels_nodelist;
            }
        } else {
            x_labels_nodelist = document.querySelectorAll('tspan[dy="10"]');
        }
        // console.log(x_labels_nodelist);

        let labels = [];
        for (let i = 0; i < x_labels_nodelist.length; i++) {
            labels.push(x_labels_nodelist[i].innerHTML);
        }

        return labels;
    }

    getYLabels() {
        // tried 'tspan[dy="5"]' but other elements are sharing the same attributes
        let y_labels_nodelist;
        let labels = [];
        if ( constants.manualData ) {
            y_labels_nodelist = heatmapYNodelist;
            if (typeof(y_labels_nodelist[0]) == "string") {
                return y_labels_nodelist;
            }
        } else {
            y_labels_nodelist = document.querySelectorAll('tspan[id^="GRID.text.19.1"]');
        }

        for (let i = 0; i < y_labels_nodelist.length; i++) {
            labels.push(y_labels_nodelist[i].innerHTML);
        }

        return labels.reverse();
    }
}


class HeatMapRect {

    constructor() {
        this.x = plot.x_coord[0];
        this.y = plot.y_coord[0];
        this.rectStrokeWidth = 4; // px
        this.height = Math.abs(plot.y_coord[1] - plot.y_coord[0]);
    }

    UpdateRect() {
        this.x = plot.x_coord[position.x];
        this.y = plot.y_coord[position.y];
    }

    UpdateRectDisplay() {
        this.UpdateRect();
        if (document.getElementById('highlight_rect')) document.getElementById('highlight_rect').remove(); // destroy and recreate
        const svgns = "http://www.w3.org/2000/svg";
        var rect = document.createElementNS(svgns, 'rect');
        rect.setAttribute('id', 'highlight_rect');
        rect.setAttribute('x', this.x);
        rect.setAttribute('y', constants.svg.getBoundingClientRect().height - this.height - this.y); // y coord is inverse from plot data
        rect.setAttribute('width', this.height);
        rect.setAttribute('height', this.height);
        rect.setAttribute('stroke', constants.colorSelected);
        rect.setAttribute('stroke-width', this.rectStrokeWidth);
        rect.setAttribute('fill', 'none');
        constants.svg.appendChild(rect);
    }
}
