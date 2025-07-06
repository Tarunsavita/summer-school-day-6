const apiKey = "b7383aa521644a918e0173856250507";

async function fetchWeatherData(query) {
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${query}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Weather fetch failed");
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
}

function formatWeatherHTML(data, isCelsius) {
    const city = data.location.name;
    const tempC = data.current.temp_c;
    const tempF = data.current.temp_f;
    const condition = data.current.condition.text;
    const iconUrl = `https:${data.current.condition.icon}`;
    const temp = isCelsius ? `${tempC}°C` : `${tempF}°F`;

    return `
    <strong>${city}</strong><br/>
    <img src="${iconUrl}" alt="${condition}" /><br/>
    🌡️ ${temp}<br/>
    ☁️ ${condition}
  `;
}

const weatherDiv = document.getElementById("weatherResult");
const loader = document.getElementById("loader");
const getWeatherBtn = document.getElementById("getWeatherBtn");

let isCelsius = true;

window.onload = () => {
    const lastWeather = localStorage.getItem("lastWeather");
    if (lastWeather) {
        weatherDiv.innerHTML = lastWeather;
    }
};

document.querySelectorAll('input[name="unit"]').forEach((radio) => {
    radio.addEventListener("change", () => {
        isCelsius = document.getElementById("celsius").checked;
        getWeather();
    });
});

getWeatherBtn.addEventListener("click", getWeather);

function getWeather() {
    weatherDiv.innerHTML = "";
    loader.classList.remove("hidden");

    if (!navigator.geolocation) {
        loader.classList.add("hidden");
        weatherDiv.textContent = "Geolocation not supported.";
        return;
    }

    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const query = `${position.coords.latitude},${position.coords.longitude}`;
            try {
                const data = await fetchWeatherData(query);
                const html = formatWeatherHTML(data, isCelsius);
                weatherDiv.innerHTML = html;
                localStorage.setItem("lastWeather", html);
            } catch (err) {
                weatherDiv.textContent = "Failed to fetch weather data.";
            } finally {
                loader.classList.add("hidden");
            }
        },
        () => {
            loader.classList.add("hidden");
            weatherDiv.textContent = "Location access denied.";
        }
    );
}