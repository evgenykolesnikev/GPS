export class GPSConfig {
    constructor(formElement, callback) {
        this.formElement = formElement;
        this.callback = callback;
        this.configs = new Map();
        this.formElement.addEventListener("submit", this.handleSubmit.bind(this));
    }

    handleSubmit(event) {
        event.preventDefault();
        const formData = this.createConfigObject();
   
        if (formData) {
            this.callback(formData);
        }
    }

    createConfigObject() {
        const inputContainers = this.formElement.querySelectorAll(".inputContainer");
        let hasError = false;

        inputContainers.forEach((container) => {
            const input = container.querySelector("input");
            const configKey = container.getAttribute("data-config");

            if (input) {
                const value = input.value.trim();

                if (!this.configs.has(configKey)) {
                    this.configs.set(configKey, {});
                }
                this.addNestedConfig(this.configs.get(configKey), input.name, value);
            }
        });

        return hasError ? null : this.getConfigObject();
    }

    addNestedConfig(config, name, value) {
        const keys = name.split(".");
        let current = config;

        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                current[key] = value;
            } else {
                if (!current[key]) {
                    current[key] = {};
                }
                current = current[key];
            }
        });
    }

    getConfigObject() {
        const result = {};
        this.configs.forEach((value, key) => {
            result[key] = value;
        });
        return result;
    }

    setConfig(config) {
        const inputContainers = this.formElement.querySelectorAll(".inputContainer");

        inputContainers.forEach((container) => {
            const input = container.querySelector("input");
            const configKey = container.getAttribute("data-config");

            if (input && config[configKey]) {
                const nestedKeys = input.name.split(".");
                this.setNestedConfigValue(config[configKey], nestedKeys, input);
            }
        });
    }

    setNestedConfigValue(config, keys, input) {
        let current = config;

        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                input.value = current[key] || "";
            } else {
                current = current[key];
            }
        });
    }
}
