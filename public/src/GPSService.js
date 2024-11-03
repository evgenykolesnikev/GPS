export class GPSService {

  constructor(props) {
    this.config = null;
    this.websocket = null;
    this.props = props;
  }

  async fetchConfiguration() {
    try {
      const response = await fetch(this.props.configUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      this.config = await response.json();
      return this.config;

    } catch (error) {
      console.error("Failed to fetch configuration:", error);
    }
  }

  async updateConfiguration(newConfig) {
    try {
      const response = await fetch(this.props.configUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newConfig),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      this.config = newConfig;
      return this.config;

    } catch (error) {
      console.error("Failed to update configuration:", error);
    }
  }

  connectWebSocket() {
    this.websocket = new WebSocket(this.props.socketUrl);

    this.websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        const customEvent = new CustomEvent(this.props.eventName, {
          detail: data,
        });

        window.dispatchEvent(customEvent);

      } catch (error) {
        console.error("Failed to parse data:", error);
      }
    };

    this.websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    this.websocket.onopen = () => {
      console.log("WebSocket connected");
    };

    this.websocket.onclose = () => {
      console.log("WebSocket disconnected");
    };
  }
}
