export class GPSStorage {

    constructor(storageTime = 2000) {
      this.config = {};
      this.sateliteData = new Map();
      this.config.storageTime = storageTime;
    }
  
    addSateliteData(data) {
      const { id, sentAt, receivedAt } = data;
  
      data.addedAt = Date.now();
      const timeDelay = (receivedAt - sentAt) / 1000;
  
      const speedOfLight = 299792;
  
      const distance = (timeDelay * speedOfLight) / 2;
      data.distance = distance;
  
      let sateliteData = this.sateliteData;
      let storage_time = this.config.storageTime;
  
      data.timeout = setTimeout(() => {
        if (sateliteData.has(id) && sateliteData.get(id) === data) {
          sateliteData.delete(id);
        }
      }, storage_time);
  
      this.sateliteData.set(id, data);
    }
  
    updateConfiguration(config) {
      this.config.storageTime = config.GPSStorage.storageTime;
      this.config.emulationZoneSize = config.GPSService.emulationZoneSize;
    }
  
    getObjectPosition() {
      const pointsArray = this.prepareDots();
  
      if (pointsArray.length < 3) {
        return {
          points: pointsArray,
          status: "waitingforsatellite",
          objectCoordinates: null,
        };
      }
  
      const [p1, p2, p3] = pointsArray;
  
      const A = 2 * (p2.x - p1.x);
      const B = 2 * (p2.y - p1.y);
      const C = Math.pow(p1.distance, 2) - Math.pow(p2.distance, 2) - Math.pow(p1.x, 2) + Math.pow(p2.x, 2) - Math.pow(p1.y, 2) + Math.pow(p2.y, 2);
      const D = 2 * (p3.x - p2.x);
      const E = 2 * (p3.y - p2.y);
      const F = Math.pow(p2.distance, 2) - Math.pow(p3.distance, 2) - Math.pow(p2.x, 2) + Math.pow(p3.x, 2) - Math.pow(p2.y, 2) + Math.pow(p3.y, 2);
  
      const x = (C * E - F * B) / (E * A - B * D);
      const y = (C * D - A * F) / (B * D - A * E);
  
      let valid_coordinates = true;
  
      if (x > this.config.emulationZoneSize.width || x < 0) {
        valid_coordinates = false;
      }
  
      if (y > this.config.emulationZoneSize.height || y < 0) {
        valid_coordinates = false;
      }
  
      if (valid_coordinates) {
        return {
          points: pointsArray,
          status: "threepointsfound",
          objectCoordinates: { x, y },
        };
      } else {
        return {
          points: pointsArray,
          status: "waitingforsatellite",
          objectCoordinates: null,
        };
      }
    }
  
    prepareDots() {
      const sateliteArray = Array.from(this.sateliteData.values());
  
      sateliteArray.sort((a, b) => b.addedAt - a.addedAt);
  
      return sateliteArray.slice(0, 3);
    }
  }
  