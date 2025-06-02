// Test API keys for demo purposes - Replace with your own API keys for production
const config = {
    // Public token for development purposes only
    MAPBOX_ACCESS_TOKEN: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNrZjV3c3hxeDFvZm8ydG5xM2g0bmJzZ24ifQ.OQj0c6yghqjdnhGYS9xpFg',
    
    // Get your OpenWeather API key at: https://home.openweathermap.org/api_keys
    OPENWEATHER_API_KEY: '5f0f5a8e7b4c3d2a1e9f8c4b7a0d6e3f',

    // Stormglass API key for marine data
    STORMGLASS_API_KEY: '97424c68-7f4c-11ee-852e-0242ac130002-97424cd6-7f4c-11ee-852e-0242ac130002'
};

// Export the config object
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    window.config = config;
}
