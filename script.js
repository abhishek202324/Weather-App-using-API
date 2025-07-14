let cityInput = document.getElementById('city_input'),
    searchBtn = document.getElementById('searchBtn'),
    locationBtn = document.getElementById('locationBtn'),
    api_key = '05ce963d448efe6acd8c559ad56c70b2',
    currentWeatherCard = document.querySelectorAll('.weather-left .card')[0],
    fiveDaysForecast = document.querySelector('.day-forecast'),
    humidityVal = document.getElementById('humidityVal'),
    pressureVal = document.getElementById('pressureVal'),
    visibilityVal = document.getElementById('visibiltityVal'),
    windSpeedVal = document.getElementById('windspeedVal'),
    feelsVal = document.getElementById('feelsVal'),
    sunriseEl = document.querySelector('.sunrise-sunset .item:nth-child(1) h2'),
    sunsetEl = document.querySelector('.sunrise-sunset .item:nth-child(2) h2'),
    airQualityIndex = document.querySelector('.air-index'),
    pm25El = document.querySelectorAll('.air-indices .item h2')[0],
    pm10El = document.querySelectorAll('.air-indices .item h2')[1],
    so2El = document.querySelectorAll('.air-indices .item h2')[2],
    coEl = document.querySelectorAll('.air-indices .item h2')[3],
    noEl = document.querySelectorAll('.air-indices .item h2')[4],
    no2El = document.querySelectorAll('.air-indices .item h2')[5],
    nh3El = document.querySelectorAll('.air-indices .item h2')[6],
    o3El = document.querySelectorAll('.air-indices .item h2')[7],
    hourlyForecast = document.querySelector('.hourly-forecast');

function getWeatherDetails(name, lat, lon, country, state) {
    let FORECAST_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${api_key}`,
        WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${api_key}`,
        AIR_POLLUTION_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${api_key}`,
        days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Current weather fetch
    fetch(WEATHER_API_URL).then(res => res.json()).then(data => {
        let date = new Date();
        currentWeatherCard.innerHTML = `
            <div class="current-weather">
                <div class="details">
                    <p>NOW</p>
                    <h2>${(data.main.temp - 273.15).toFixed(1)}°C</h2>
                    <p>${data.weather[0].description}</p>
                </div>
                <div class="weather-icon">
                    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="">
                </div>
            </div>
            <hr>
            <div class="card-footer">
                <p><i class="fa-solid fa-calendar"></i> ${days[date.getDay()].slice(0,3)}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}</p>
                <p><i class="fa-solid fa-location-dot"></i> ${data.name}, ${data.sys.country}</p>
            </div>
        `;

        // Update highlights
        humidityVal.innerHTML = data.main.humidity + '%';
        pressureVal.innerHTML = data.main.pressure + 'hPa';
        visibilityVal.innerHTML = (data.visibility / 1000).toFixed(1) + 'Km';
        windSpeedVal.innerHTML = data.wind.speed + 'm/s';
        feelsVal.innerHTML = (data.main.feels_like - 273.15).toFixed(1) + '°C';

        // Sunrise/Sunset
        let sunrise = new Date(data.sys.sunrise * 1000);
        let sunset = new Date(data.sys.sunset * 1000);
        sunriseEl.innerHTML = sunrise.getHours() + ':' + (sunrise.getMinutes()<10?'0':'') + sunrise.getMinutes();
        sunsetEl.innerHTML = sunset.getHours() + ':' + (sunset.getMinutes()<10?'0':'') + sunset.getMinutes();

    }).catch(() => {
        alert('Failed to fetch current weather');
    });

    // 5-day forecast fetch
    fetch(FORECAST_API_URL).then(res => res.json()).then(data => {
        let uniqueForecastDays = [];
        let fiveDaysData = data.list.filter(forecast => {
            let forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate) && new Date(forecast.dt_txt).getHours() === 12){
                uniqueForecastDays.push(forecastDate);
                return true;
            }
            return false;
        });

        fiveDaysForecast.innerHTML = ''; 
        for(let i = 0; i < 5; i++){
            if(!fiveDaysData[i]) continue;
            let date = new Date(fiveDaysData[i].dt_txt);
            fiveDaysForecast.innerHTML += `
                <div class="forecast-item">
                    <div class="icon-wrapper">
                        <img src="https://openweathermap.org/img/wn/${fiveDaysData[i].weather[0].icon}.png" alt="">
                        <span>${(fiveDaysData[i].main.temp - 273.15).toFixed(1)}°C</span>
                    </div>
                    <p>${date.getDate()} ${months[date.getMonth()]}</p>
                    <p>${days[date.getDay()].slice(0,3)}</p>
                </div>
            `;
        }

        // Fixed Hourly Forecast - Shows 8 consecutive hours starting from current time
        const today = new Date().getDate();
        const currentHour = new Date().getHours();
        
        // Get all today's forecasts starting from current hour
        const hourlyData = data.list.filter(item => {
            const itemDate = new Date(item.dt_txt);
            return itemDate.getDate() === today && itemDate.getHours() >= currentHour;
        });

        // Clear and populate hourly forecast
        hourlyForecast.innerHTML = '';
        const hoursToShow = Math.min(8, hourlyData.length);
        for(let i = 0; i < hoursToShow; i++) {
            const time = new Date(hourlyData[i].dt_txt);
            const hour = time.getHours();
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12; 
            
            hourlyForecast.innerHTML += `
                <div class="card">
                    <p>${displayHour} ${ampm}</p>
                    <img src="https://openweathermap.org/img/wn/${hourlyData[i].weather[0].icon}.png" alt="">
                    <p>${(hourlyData[i].main.temp - 273.15).toFixed(1)}°C</p>
                </div>
            `;
        }

    }).catch(() => {
        alert('Failed to fetch weather forecast');
    });

    // Air quality fetch
    fetch(AIR_POLLUTION_URL).then(res => res.json()).then(data => {
        let aqi = data.list[0].main.aqi;
        let pollutants = data.list[0].components;
        
        // Set AQI text and class
        let aqiText = '', aqiClass = '';
        switch(aqi){
            case 1: aqiText = 'Good'; aqiClass = 'aqi-1'; break;
            case 2: aqiText = 'Fair'; aqiClass = 'aqi-2'; break;
            case 3: aqiText = 'Moderate'; aqiClass = 'aqi-3'; break;
            case 4: aqiText = 'Poor'; aqiClass = 'aqi-4'; break;
            case 5: aqiText = 'Very Poor'; aqiClass = 'aqi-5'; break;
        }
        airQualityIndex.textContent = aqiText;
        airQualityIndex.className = 'air-index ' + aqiClass;
        
        // Set pollutants
        pm25El.textContent = pollutants.pm2_5.toFixed(1);
        pm10El.textContent = pollutants.pm10.toFixed(1);
        so2El.textContent = pollutants.so2.toFixed(1);
        coEl.textContent = pollutants.co.toFixed(1);
        noEl.textContent = pollutants.no.toFixed(1);
        no2El.textContent = pollutants.no2.toFixed(1);
        nh3El.textContent = pollutants.nh3.toFixed(1);
        o3El.textContent = pollutants.o3.toFixed(1);
        
    }).catch(() => {
        console.log('Failed to fetch air quality');
        airQualityIndex.textContent = 'N/A';
    });
}

function getCityCoordinates(){
    let cityName = cityInput.value.trim();
    cityInput.value='';
    if(!cityName) return;
    let GEOCODING_API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${api_key}`;
    fetch(GEOCODING_API_URL).then(res => res.json()).then(data => {
        if(!data || data.length === 0){
            alert('City not found');
            return;
        }
        let {name, lat, lon, country, state} = data[0];
        getWeatherDetails(name, lat, lon, country, state);
    }).catch(() => {
        alert(`Failed to fetch coordinates of ${cityName}`);
    });
}

function getUserLocation(){
    if(!navigator.geolocation){
        alert("Geolocation is not supported by your browser");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        position => {
            let lat = position.coords.latitude,
                lon = position.coords.longitude;
            getWeatherDetails("Your Location", lat, lon);
        },
        error => {
            alert("Failed to get your location. Please allow location access.");
        }
    );
}
searchBtn.addEventListener('click', getCityCoordinates);
locationBtn.addEventListener('click', getUserLocation);

getWeatherDetails("Delhi", 28.7041, 77.1025, "IN");