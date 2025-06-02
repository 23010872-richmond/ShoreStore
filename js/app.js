// Main App JavaScript

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Main initialization function
function initializeApp() {
    setupNavigation();
    initializeWeatherWidget();
    setupImpactStats();
    initializeScrollAnimations();
    enhanceImpactStats();
    initializeMobileMenu();
}

// Navigation functionality
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Weather widget initialization
async function initializeWeatherWidget() {
    const weatherWidget = document.querySelector('.weather-widget');
    
    try {
        weatherWidget.innerHTML = '<div class="loading">Loading weather data...</div>';
        
        // Get 4-day forecast
        const forecast = await fetchNEAForecast();

        // Create HTML for the weather widget
        weatherWidget.innerHTML = `
            <h2>Beach Weather</h2>
            <div class="forecast-grid">
                ${forecast.map(day => `
                    <div class="forecast-card">
                        <h3>${day.date}</h3>
                        <p>${day.forecast}</p>
                        <div class="temp-range">
                            <p>High: ${day.temperature.high}°C</p>
                            <p>Low: ${day.temperature.low}°C</p>
                        </div>
                        <div class="conditions">
                            <p>Humidity: ${day.humidity || '55% - 95%'}</p>
                            <p>Wind: ${day.wind.speed.low}-${day.wind.speed.high} km/h (${day.wind.direction})</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        weatherWidget.innerHTML = `
            <div class="weather-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Weather data temporarily unavailable</p>
                <p class="error-details">${error.message}</p>
                <button onclick="initializeWeatherWidget()" class="retry-button">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Fetch weather data
async function fetchWeatherData(lat, lon) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${config.OPENWEATHER_API_KEY}`
    );
    if (!response.ok) throw new Error('Weather data fetch failed');
    return response.json();
}

// Fetch NEA forecast data
async function fetchNEAForecast() {
    // Simulated 4-day forecast data
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 4; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        dates.push(date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    }

    const forecasts = [
        {
            date: dates[0],
            forecast: "Partly Cloudy",
            temperature: { high: 32, low: 26 },
            humidity: "55% - 95%",
            wind: { speed: { low: 10, high: 20 }, direction: "SSW" }
        },
        {
            date: dates[1],
            forecast: "Afternoon Thunderstorms",
            temperature: { high: 31, low: 25 },
            humidity: "60% - 95%",
            wind: { speed: { low: 15, high: 25 }, direction: "S" }
        },
        {
            date: dates[2],
            forecast: "Mostly Sunny",
            temperature: { high: 33, low: 26 },
            humidity: "50% - 90%",
            wind: { speed: { low: 8, high: 18 }, direction: "SSW" }
        },
        {
            date: dates[3],
            forecast: "Light Rain",
            temperature: { high: 30, low: 24 },
            humidity: "65% - 95%",
            wind: { speed: { low: 12, high: 22 }, direction: "S" }
        }
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate occasional errors (1 in 10 chance)
    if (Math.random() < 0.1) {
        throw new Error("Unable to fetch weather data. Please try again.");
    }
    
    return forecasts;
}

// Fetch beach conditions
async function fetchBeachConditions(lat, lon) {
    try {
        const params = 'waveHeight,waterTemperature,currentSpeed';
        const response = await fetch(
            `https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lon}&params=${params}`,
            {
                headers: {
                    'Authorization': config.STORMGLASS_API_KEY
                }
            }
        );

        if (!response.ok) throw new Error('Beach data fetch failed');
        
        const data = await response.json();
        const currentHour = data.hours[0];

        return {
            waveHeight: currentHour.waveHeight?.noaa?.toFixed(1) || 'N/A',
            waterTemp: currentHour.waterTemperature?.noaa?.toFixed(1) || 'N/A',
            tideStatus: getTideStatus(currentHour.currentSpeed?.noaa || 0)
        };
    } catch (error) {
        console.error('Error fetching beach conditions:', error);
        return {
            waveHeight: 'N/A',
            waterTemp: 'N/A',
            tideStatus: 'Tide data unavailable'
        };
    }
}

// Helper function to determine tide status
function getTideStatus(currentSpeed) {
    if (currentSpeed > 0.5) return 'Rising Tide';
    if (currentSpeed < -0.5) return 'Falling Tide';
    return 'Slack Tide';
}

// Helper function to get current position
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });
    });
}

// Fetch UV Index data
async function fetchUVIndex(lat, lon) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${config.OPENWEATHER_API_KEY}`
        );
        const data = await response.json();
        
        const uvElement = document.querySelector('.weather-details p:last-child');
        if (uvElement) {
            uvElement.innerHTML = `<i class="fas fa-sun"></i> UV Index: ${Math.round(data.value)}`;
        }
    } catch (error) {
        console.error('Error fetching UV data:', error);
    }
}

// Community impact statistics
function setupImpactStats() {
    const impactStats = document.querySelector('.impact-stats');
    
    // Placeholder stats (to be replaced with real data)
    const stats = [
        { label: 'Beach Cleanups', value: '150+' },
        { label: 'Volunteers', value: '1,200+' },
        { label: 'Trash Collected', value: '2.5 tons' }
    ];
    
    impactStats.innerHTML = stats.map(stat => `
        <div class="stat-card">
            <h3>${stat.value}</h3>
            <p>${stat.label}</p>
        </div>
    `).join('');
}

// Join cleanup event handler
function joinCleanup(cleanupTitle) {
    // TODO: Implement user authentication and cleanup registration
    alert(`Thanks for your interest in joining ${cleanupTitle}! Registration feature coming soon.`);
}

// Utility function for smooth animations
function animate(element, animation) {
    element.style.animation = animation;
    element.addEventListener('animationend', () => {
        element.style.animation = '';
    }, { once: true });
}

// Error handling utility
function handleError(error, fallbackMessage = 'Something went wrong') {
    console.error(error);
    // TODO: Implement user-friendly error notification system
    return fallbackMessage;
}

// Initialize scroll animations
function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.hero-content, #weather, #community, .impact-stats > div');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px'
    });

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        observer.observe(element);
    });
}

// Add interactive features to impact stats
function enhanceImpactStats() {
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach(card => {
        card.classList.add('hover-lift');
        
        // Add hover animation to numbers
        const number = card.querySelector('h3');
        if (number) {
            number.addEventListener('mouseenter', () => {
                number.classList.add('animate-pulse');
            });
            
            number.addEventListener('mouseleave', () => {
                number.classList.remove('animate-pulse');
            });
        }
    });
}

// Mobile menu toggle
function initializeMobileMenu() {
    const nav = document.querySelector('.main-nav');
    const navLinks = document.querySelector('.nav-links');
    
    // Create mobile menu button
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuBtn.setAttribute('aria-label', 'Toggle navigation menu');
    
    nav.insertBefore(mobileMenuBtn, navLinks);
    
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('show');
        mobileMenuBtn.innerHTML = navLinks.classList.contains('show') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });
}

// Generate forecast HTML
function generateForecastHTML(forecasts) {
    if (!Array.isArray(forecasts) || forecasts.length === 0) {
        console.error('Invalid forecasts data:', forecasts);
        return '<div class="forecast-error">No forecast data available</div>';
    }

    return forecasts.map(day => {
        try {
            const date = new Date(day.date);
            const formattedDate = date.toLocaleDateString('en-SG', { weekday: 'short', month: 'short', day: 'numeric' });
            const weatherIcon = getWeatherIcon(day.forecast.toLowerCase());
            
            return `
                <div class="forecast-day">
                    <h4>${formattedDate}</h4>
                    <i class="${weatherIcon}"></i>
                    <p class="forecast-desc">${day.forecast}</p>
                    <p class="temp-range">Temperature: ${day.temperature.low}°C - ${day.temperature.high}°C</p>
                    <p class="humidity">Wind Direction: ${day.wind.direction}</p>
                </div>
            `;
        } catch (error) {
            console.error('Error generating forecast HTML for day:', day, error);
            return '<div class="forecast-error">Error displaying forecast</div>';
        }
    }).join('');
}

// Helper function to get weather icons
function getWeatherIcon(forecast) {
    if (forecast.includes('thundery')) return 'fas fa-bolt';
    if (forecast.includes('rain')) return 'fas fa-cloud-rain';
    if (forecast.includes('showers')) return 'fas fa-cloud-rain';
    if (forecast.includes('cloudy')) return 'fas fa-cloud';
    if (forecast.includes('fair')) return 'fas fa-sun';
    if (forecast.includes('sunny')) return 'fas fa-sun';
    if (forecast.includes('windy')) return 'fas fa-wind';
    return 'fas fa-cloud'; // default icon
}
