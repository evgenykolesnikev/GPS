export class GPSGraph {

  constructor(plotId) {
    this.started = false;
    this.trace_set = new Set();
    this.plotId = plotId;

    this.layout = {
      title: "GPS",
      xaxis: {
        title: "X Axis",
        showgrid: true,
        zeroline: true,
        gridcolor: "#444444",
        zerolinecolor: "#888888",
        tickmode: "linear",
        tick0: 0,
        dtick: 20,
        range: [0, 100],
      },
      yaxis: {
        title: "Y Axis",
        showgrid: true,
        zeroline: true,
        gridcolor: "#444444",
        zerolinecolor: "#888888",
        tickmode: "linear",
        tick0: 0,
        dtick: 10,
        range: [0, 100],
      },
      width: 680,
      height: 500,
      font: {
        size: 10,
      },
      margin: {
        r: 260,
      },
    };
  }

  updateConfiguration(config) {
    let width = config.GPSService.emulationZoneSize.width;
    this.layout.xaxis.range = [0, width];
    this.layout.xaxis.dtick = width / 10;

    let height = config.GPSService.emulationZoneSize.height;
    this.layout.yaxis.range = [0, height];
    this.layout.yaxis.dtick = height / 10;
  }

  init(GPSStorage_) {
    this.storage = GPSStorage_;

    setInterval(() => {
      this.render();
      let traces = [...this.trace_set];
      Plotly.newPlot(this.plotId, traces, this.layout);
    }, 20);

    this.started = true;
  }

  render() {
    this.trace_set = new Set();

    const positionData = this.storage.getObjectPosition();

    let satelite_color = 'red';

    if (positionData.status === "threepointsfound") {
      const { x, y } = positionData.objectCoordinates;

      const currentTime = new Date().toLocaleTimeString(); 
      const objectTrace = {
          x: [x],
          y: [y],
          mode: "markers",
          type: "scatter",
          marker: { size: 8, symbol: "square" },
          opacity: 1,
          name: `Object (${x.toFixed(3)}, ${y.toFixed(3)}) at ${currentTime}`, 
      };

      this.trace_set.add(objectTrace);

      satelite_color = 'green';
    }

    positionData.points.forEach((satellite, index) => {
      const satTrace = {
        x: [satellite.x],
        y: [satellite.y],
        mode: "markers",
        type: "scatter",
        marker: { size: 7, color: satelite_color, symbol: "circle" },
        opacity: 1,
        name: `Satellite ${index + 1} (x: ${satellite.x.toFixed(3)}, y: ${satellite.y.toFixed(3)})`,
      };

      this.trace_set.add(satTrace);
    });

    
  }

  getCurrentData() {
    const positionData = this.storage.getObjectPosition();
    let currentData = "";

    if (positionData.status === "threepointsfound") {
      const { x, y } = positionData.objectCoordinates;
      const currentTime = new Date().toLocaleTimeString();
      currentData += `Object (${x.toFixed(3)}, ${y.toFixed(3)}) at ${currentTime}\n`;
    }

    positionData.points.forEach((satellite, index) => {
      currentData += `Satellite ${index + 1} (x: ${satellite.x.toFixed(3)}, y: ${satellite.y.toFixed(3)})\n`;
    });

    return currentData;
  }
}
