// Test API keys for demo purposes - Replace with your own API keys for production
const config = {
    // Get your OpenWeather API key at: https://home.openweathermap.org/api_keys
    OPENWEATHER_API_KEY: '1234e0e541dda2d2aa122924e1550f52',
    
    // Data.gov.sg does not require an API key for weather data
    DATA_GOV_SG_URL: 'https://api.data.gov.sg/v1/environment'
};

// Export the config object
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} else {
    window.config = config;
}
