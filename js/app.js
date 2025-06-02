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
    const API_KEY = config.OPENWEATHER_API_KEY;
    
    try {
        // Get user's location
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        // Fetch weather and beach data
        const [weatherData, beachData] = await Promise.all([
            fetchWeatherData(latitude, longitude, API_KEY),
            fetchBeachConditions(latitude, longitude)
        ]);
        
        // Update weather widget
        weatherWidget.innerHTML = `
            <div class="weather-content">
                <div class="weather-main">
                    <img src="https://openweathermap.org/img/w/${weatherData.weather[0].icon}.png" alt="Weather icon">
                    <h3>${Math.round(weatherData.main.temp)}°C</h3>
                    <p>${weatherData.weather[0].description}</p>
                </div>
                <div class="weather-details">
                    <p><i class="fas fa-wind"></i> Wind: ${Math.round(weatherData.wind.speed * 3.6)} km/h</p>
                    <p><i class="fas fa-water"></i> Humidity: ${weatherData.main.humidity}%</p>
                    <p><i class="fas fa-sun"></i> UV Index: Loading...</p>
                </div>
                <div class="beach-conditions">
                    <p><i class="fas fa-wave-square"></i> Wave Height: ${beachData.waveHeight} m</p>
                    <p><i class="fas fa-water"></i> Water Temp: ${beachData.waterTemp}°C</p>
                    <p><i class="fas fa-clock"></i> ${beachData.tideStatus}</p>
                </div>
            </div>
        `;
        
        // Fetch UV Index separately (requires separate API call)
        fetchUVIndex(latitude, longitude, API_KEY);
        
    } catch (error) {
        console.error('Error fetching data:', error);
        weatherWidget.innerHTML = `
            <div class="weather-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>Weather data temporarily unavailable</p>
                <button onclick="initializeWeatherWidget()" class="retry-button">
                    <i class="fas fa-redo"></i> Retry
                </button>
            </div>
        `;
    }
}

// Fetch weather data
async function fetchWeatherData(lat, lon, apiKey) {
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`
    );
    if (!response.ok) throw new Error('Weather data fetch failed');
    return response.json();
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
async function fetchUVIndex(lat, lon, apiKey) {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&appid=${apiKey}`
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
