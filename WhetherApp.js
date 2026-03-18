    // Open-Meteo API — free, no API key needed
    // Step 1: Geocode city name to coordinates
    // Step 2: Fetch weather for those coordinates

    const WEATHER_CODES = {
      0:'☀️', 1:'🌤️', 2:'⛅', 3:'☁️',
      45:'🌫️', 48:'🌫️', 51:'🌧️', 53:'🌧️', 55:'🌧️',
      61:'🌧️', 63:'🌧️', 65:'🌧️', 71:'❄️', 73:'❄️', 75:'❄️',
      80:'🌦️', 81:'🌦️', 82:'⛈️', 95:'⛈️', 96:'⛈️', 99:'⛈️',
    };
    const WEATHER_DESC = {
      0:'Clear sky', 1:'Mainly clear', 2:'Partly cloudy', 3:'Overcast',
      45:'Foggy', 51:'Light drizzle', 61:'Light rain', 65:'Heavy rain',
      71:'Light snow', 80:'Rain showers', 95:'Thunderstorm',
    };

async function geocodeCity (city) {
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
        const res = await fetch(url);
        if(!res.ok) throw Error ("Geocoding failed");
        const data = await res.json();
        if(!data.results?.length) throw new Error(`City '${city}' not found`);
        return data.results[0];
}
async function fetchWeather (lat, lon) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode&timezone=auto`;
        const res = await fetch(url);
        if(!res.ok) throw new Error("Wether fetch failed");
        return res.json();
}
function showSkelton () {
  document.querySelector("#weatherContainer").innerHTML = `
  <div class="card">
  <div class="skelton" style="height: 64px; width:64px; border-radius: 50%; margin: 0 auto 16px;"></div> 
  <div class="skelton" style="height: 48px; width:120px;  margin: 0 auto 8px;"></div> 
  <div class="skelton" style="height: 20px; width:160px;  margin: 0 auto;"></div> 
  </div>
  `
}
function renderWeather(location, weather) {
  const c = weather.current;
  const icon = WEATHER_CODES[c.weathercode] || '🌡️';
  const desc = WEATHER_DESC[c.weathercode] || 'Unknown';

  document.querySelector("#weatherContainer").innerHTML = `
    <div class="card">
      <div style="font-size: 48px;">${icon}</div>
      <div class="temp">${c.temperature_2m} °C</div>
      <div class="city">${location.name}, ${location.country}</div>
      <div class="city" style="font-size: 0.9rem">${desc}</div>

      <div class="details">
        <div class="detail">
          <div class="detail-label">Humidity</div>
          <div class="detail-value">${c.relative_humidity_2m}%</div>
        </div>

        <div class="detail">
          <div class="detail-label">Wind</div>
          <div class="detail-value">${c.wind_speed_10m} km/h</div>
        </div>
      </div>
    </div>
  `;
}
function renderError (message) {
  document.querySelector("#weatherContainer").innerHTML = `
  <div class="error">Error ${message}</div>;
  `
}
async function loadWeather (city) {
  showSkelton();
  try {
    const location = await geocodeCity(city);
    const weather = await fetchWeather(location.latitude, location.longitude);
    renderWeather(location, weather);
  } catch (error) {
    renderError(error.message)
  }
}

document.querySelector("#searchBtn").addEventListener("click", () => {
  const city = document.querySelector("#cityInput").value.trim();
  if(city) loadWeather(city);
});
document.querySelector("#cityInput").addEventListener("keydown", e => {
  if(e.key === "Enter") document.querySelector("#searchBtn").click();
})
loadWeather("New Delhi")