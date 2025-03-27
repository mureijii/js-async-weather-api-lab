const API_KEY = "YOUR_API_KEY";

document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector("#weather-form");
    form.addEventListener("submit", handleFormSubmit);
});

function handleFormSubmit(event) {
    event.preventDefault();
    const cityInput = document.querySelector("#city-input").value.trim();
    if (!cityInput) return;
    
    displayLoadingMessage();
    fetchCurrentWeather(cityInput);
    fetchFiveDayForecast(cityInput);
}

function displayLoadingMessage() {
    const currentWeatherDiv = document.querySelector("#current-weather");
    const forecastDiv = document.querySelector("#forecast");
    currentWeatherDiv.innerHTML = "<p>Loading current weather...</p>";
    forecastDiv.innerHTML = "<p>Loading forecast data...</p>";
}

async function fetchCurrentWeather(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found");
        const json = await response.json();
        displayCurrentWeather(json);
    } catch (error) {
        displayErrorMessage("current-weather", error.message);
        console.error("Error fetching current weather:", error);
    }
}

function displayCurrentWeather(json) {
    const currentWeatherDiv = document.querySelector("#current-weather");
    currentWeatherDiv.innerHTML = `
        <h2>Current Weather in ${json.name}</h2>
        <p>Temperature: ${json.main.temp}°C</p>
        <p>Humidity: ${json.main.humidity}%</p>
        <p>Condition: ${json.weather[0].description}</p>
    `;
}

async function fetchFiveDayForecast(city) {
    try {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("City not found");
        const json = await response.json();
        displayFiveDayForecast(json);
        createChart(json);
    } catch (error) {
        displayErrorMessage("forecast", error.message);
        console.error("Error fetching five-day forecast:", error);
    }
}

function displayFiveDayForecast(json) {
    const forecastDiv = document.querySelector("#forecast");
    forecastDiv.innerHTML = "<h2>5-Day Forecast</h2>";
    forecastDiv.innerHTML += json.list.map(forecast => `
        <div class="forecast-item">
            <p>${forecast.dt_txt}</p>
            <p>Temp: ${forecast.main.temp}°C</p>
            <p>Humidity: ${forecast.main.humidity}%</p>
        </div>
    `).join('');
}

function createChart(json) {
    const ctx = document.getElementById("weatherChart").getContext("2d");
    const labels = json.list.map(item => item.dt_txt);
    const temperatures = json.list.map(item => item.main.temp);
    
    if (window.weatherChart) window.weatherChart.destroy();
    
    window.weatherChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperature (°C)",
                data: temperatures,
                borderColor: "blue",
                fill: false,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { display: true },
                y: { display: true }
            }
        }
    });
}

function displayErrorMessage(elementId, message) {
    const element = document.querySelector(`#${elementId}`);
    element.innerHTML = `<p style="color: red;">Error: ${message}</p>`;
}
