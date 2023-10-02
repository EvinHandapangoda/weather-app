//importing Chart from chart.js
const Chart = window.Chart;
//function to create and return a new chart
function createChart(canvasId, rowLabels, data, units) {
    let chart = new Chart(canvasId,
        {
            type: 'line',
            data: {
                labels: rowLabels,
                datasets: [{
                    data: data,
                    borderWidth: 2,
                    backgroundColor: 'rgba(255, 0, 0, 0.299)',
                    borderColor: 'red',
                    fill: true,
                    tension: 0.6
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                },

                maintainAspectRatio: false,
                responsive: true,

                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value, index, ticks) {
                                return value + " " + units;
                            },
                            color: 'white',
                        },
                        grid: {
                            display: false,
                        }    
                    },
                    
                    x: {
                        ticks: {
                            color: 'white',
                        },
                        grid: {
                            display: true,
                        }
                    }
                }
            }
        }
    );

     return chart;
}

//updating the values of the meters
const updateMeter = (meterId, valueId, unit, startValue, endValue) =>{
    const progress = setInterval(() => {
        if(endValue == 0){
            startValue--;
            clearInterval(progress);
        } 
        startValue++;
        valueId.text(`${startValue + " " + unit}`);
        meterId.css("background", `conic-gradient(rgb(83, 183, 255) ${startValue*3.6}deg, rgb(73, 73, 73) 0deg)`);
        if(startValue == endValue){
            clearInterval(progress);
        }
    }, 15);
}

//updating the values of text meters
function updateTextMeters(valueId, unit, startValue, endValue, speed){
    const progress = setInterval(() => {
        startValue++;
        valueId.text(`${startValue + " " + unit}`);  
        if(startValue == endValue){
            clearInterval(progress);
        }
    }, speed);
}

//getting-user-location
//function getUserLocation() {
//    navigator.geolocation.getCurrentPosition(successCallBack, errorCallBack);
//}
//const successCallBack = (position) => {
//    const lat = position.coords.latitude;
//    const long = position.coords.longitude;
//    activate(lat+","+long)
//}

//const errorCallBack = (error) => {
//    console.log(error);
//}
//getUserLocation();

//retrieving weather data from weather api
const submitButton = $('#submit-btn'),
      inputField = $('#input-field');


document.getElementById("input-field").addEventListener("keyup", function(event) {
    if (event.keyCode == 13) {
        let q = inputField.val();
        event.preventDefault();
        activate(q);
    }
});

submitButton.click(() =>{
    let q = inputField.val();
    activate(q);
});

async function activate(q){
    try {
        await updateDailyPage(q);
        await updateHourlyPage(q);
        await airQualityPage(q);
        pastWeatherPage(q);
    } catch (error) {
        console.log(error);
    }
}

async function getFromApi(q, type, additions) {
    let result;
    result = await $.ajax({
        method : "GET",
        url : `http://api.weatherapi.com/v1/${type}?key=e2139a4606d04c27ae0142813232009&q=${q}${additions}`,
        error : () => {
            alertMessage("Please enter a valid location!")
            return null;
        }
    });
    return result;
}

async function updateHourlyPage(q) {            
    let response = await getFromApi(q, "current.json", "");
    let current = response.current;
    bgImgSetter(current.condition.code);
    $('#main-temp').text(current.temp_c + "º C");
    $('#main-condition').text(current.condition.text);
    $("#main-location").text(response.location.name + ", " + response.location.country);
    $('#cloud-icon').prop('src', current.condition.icon);
    updateMeter($('#wind-speed-meter'), $('#wind-meter-value'), "km/h", 0, Math.round(current.wind_kph));
    updateMeter($('#humidity-meter'), $('#humidity-meter-value'), "",0 , Math.round(current.humidity));
    updateTextMeters($('#uv-meter'), "", 0, Math.round(current.uv), 100);
    updateTextMeters($('#pressure-meter'), "kPa", 0, Math.round(current.pressure_in), 60);
    updateMeter($('#cloud-coverage-meter'), $('#cloud-coverage-value'), "%", 0, Math.round(current.cloud));
    updateTextMeters($('#visibility-meter'), "km", 0, Math.round(current.vis_km), 70);


    response = null;
}

async function updateDailyPage(q){
    let response = await getFromApi(q, "forecast.json", "&days=3");
    const   mainDates = [$('.day1-daily'), $('.day2-daily'), $('.day3-daily')],
            temps = [$('#day-1-temp'), $('#day-2-temp'), $('#day-3-temp')],
            conditions = [$('.day-1-condition'), $('.day-2-condition'), $('.day-3-condition')],
            speedFutureCanvas = document.getElementById('wind-speed-next-04-days'),
            speedUnit = "km/h",
            chanceTags = [$('#day1-chance'), $('#day2-chance'), $('#day3-chance')];

    let     futureThreeDays = [],
            futureSpeeds =  [],
            chanceOfRain = [];

    let forecastDayArray = response.forecast.forecastday;
    for (let i = 0; i < forecastDayArray.length; i++) {  
        mainDates[i].text(forecastDayArray[i].date);
        temps[i].text(forecastDayArray[i].day.avgtemp_c + "º C");
        conditions[i].text(forecastDayArray[i].day.condition.text);
        
        futureThreeDays.push(forecastDayArray[i].date);
        futureSpeeds.push(forecastDayArray[i].day.maxwind_kph);

        chanceOfRain.push(forecastDayArray[i].day.daily_chance_of_rain);
    }       
    futureWindSpeedChart = createChart(speedFutureCanvas, futureThreeDays, futureSpeeds, speedUnit );
    submitButton.click(() =>{
        futureWindSpeedChart.destroy();
    });   
    for (let i = 0; i < chanceOfRain.length; i++) {
        $(":root").css( `--day-${i+1}-chance`, chanceOfRain[i] + "%");
        chanceTags[i].text(chanceOfRain[i] + "%");                
        }
    
    response = null;
}

async function pastWeatherPage(q) {
    let     currentDate = new Date(),
            dates = [];
            temps = [];
            speeds = [];

    const   tempPastCanvas = document.getElementById('temp-last-07-days'),
            speedPastCanvas = document.getElementById('speed-last-07-days');

    for (let i = 1; i < 8; i++) {
        let before7Daysdate=new Date(currentDate.setDate(currentDate.getDate() - 1));
        let dt = before7Daysdate.getFullYear()+"-"+before7Daysdate.getMonth()+"-"+before7Daysdate.getDate();
        let response = await getFromApi(q, "history.json", `&dt=${dt}`);
        dates.push(dt);
        let day = response.forecast.forecastday[0].day;
        temps.push(day.avgtemp_c);
        speeds.push(day.maxwind_kph);        

    }

    let pastTempsChart = createChart(tempPastCanvas, dates, temps, "º");
    let pastSpeedsChart = createChart(speedPastCanvas, dates, speeds, "kmh");

    submitButton.click(() =>{
        pastTempsChart.destroy();
        pastSpeedsChart.destroy();
    });  

    response = null;
}

async function airQualityPage(q) {
    let response = await getFromApi(q, "current.json", "&aqi=yes");
    console.log("air-quality");
    let current = response.current.air_quality;
    updateMeter($('#air-quality-meter'), $('#air-quality-value'), "", 0, Math.round(current.pm10));
    updateMeter($('#no2-meter'), $('#no2-value'), "µgm-3", 0, Math.round(current.no2));
    updateMeter($('#ozone-meter'), $('#ozone-value'), "µgm-3", 0, Math.round(current.o3));
    updateMeter( $('#co-meter'), $('#co-value'), "µgm-3", 0, Math.round(current.pm2_5));
    updateMeter($('#so2-meter'), $('#so2-value'), "µgm-3", 0, Math.round(current.so2)); 
    $('.air-quality-condition').text(getAqiCondition(current.pm10));
}

//setting date and time
const date = $('#date');
const time = $('#time');

let todaysDate = new Date()
date.text(todaysDate.toLocaleDateString());

setInterval(() => {
    let todaysDate = new Date();
    time.text(todaysDate.toLocaleTimeString());
}, 1000);

//changing the theme
const themeButton = document.getElementById("theme-changer");
themeButton.addEventListener('click' ,() => {
    const themeIcon = document.getElementById("theme-icon");
    document.body.classList.toggle("dark-mode");
    if(document.body.classList.contains("dark-mode")){
        themeIcon.src = "assets/light-mode.png";
    }else{
        themeIcon.src = "assets/dark-mode.png";
    }
});

//alert-box
function alertMessage(message){
    let alertBox = document.getElementById('alert-box');
    alertBox.innerHTML = message;
    alertBox.style.visibility = "visible";
    setTimeout(() => {
        alertBox.style.visibility = 'hidden';
        }, 2000);
}

function bgImgSetter(code) {
    const mainImg = document.querySelector('.main-display-container');
    let image;
    if(code == 1000) {
        image = 'sunny.jpg';
    } else if(code >= 1003 && code <= 1009) {
        image = 'cloudy.jpg';
    } else if(code == 1030) {
         image = 'fog.jpg';
    } else if(code >= 1063 && code <= 1072) {
        image = 'patchy_rain.jpg';
    } else if(code == 1087) {
         image = 'thundering.jpg';
    } else if(code >= 1114 && code <= 1117) {
         image = 'snow.jpg';
    }else if (code >= 1135 && code <= 1147) {
        image = 'fog.jpg';
    } else if(code >= 1150 && code <= 1171) {
         image = 'light_drizzle.jpg';
    } else if(code >= 1180 && code <= 1189) {
        image = 'moderate_rain.jpg';
    } else if(code >= 1192 && code <= 1204) {
         image = 'heavy_rain.jpg';
    } else if(code >= 1207 && code <= 1219) {
         image = 'light_snow.jpg';
    } else if(code >= 1222 && code <= 1237) {
         image = 'heavy_snow.jpg';
    } else if(code == 1240) {
        image = 'moderate_rain.jpg';
    } else if(code >= 1243 && code <= 1252) {
        image = 'heavy_rain.jpg';
    } else if(code >= 1255 && code <= 1264) {
        image = 'heavy_snow.jpg';
    } else if(code >= 1273 && code <= 1282) {
        image = 'thundering.jpg';
    }
    mainImg.style.backgroundImage = `url('./assets/bg-images/${image}')`;
}

function getAqiCondition(value) {
    if(value <=40) {
        return "Good";
    } else if(value <=80) {
        return "Fair";
    }else if(value <= 100) {
        return "Poor"
    }
    return "Very Poor";
}
