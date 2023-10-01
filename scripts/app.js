//importing Chart from chart.js
const Chart = window.Chart;
console.log("hello")
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

//retrieving weather data from weather api
const submitButton = $('#submit-btn'),
      inputField = $('#input-field');

document.getElementById("input-field").addEventListener("keyup", function(event) {
    if (event.keyCode == 13) {
        event.preventDefault();
        activate();
    }
});

submitButton.click(() =>{
    activate();
});

function activate() {
    updateHourlyPage();
    updateDailyPage();
    pastWeatherPage();
    airQualityPage();
}

async function getFromApi(type, additions) {
    const result = await $.ajax({
        method : "GET",
        url : `http://api.weatherapi.com/v1/${type}?key=e2139a4606d04c27ae0142813232009&q=${inputField.val()}${additions}`,
    });
    return result;
}

async function updateHourlyPage() {            
    let response = await getFromApi("current.json", "");
    let current = response.current;

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

async function updateDailyPage(){
    const   mainDates = [$('.day1-daily'), $('.day2-daily'), $('.day3-daily')],
            temps = [$('#day-1-temp'), $('#day-2-temp'), $('#day-3-temp')],
            conditions = [$('.day-1-condition'), $('.day-2-condition'), $('.day-3-condition')],
            speedFutureCanvas = document.getElementById('wind-speed-next-04-days'),
            speedUnit = "km/h",
            chanceTags = [$('#day1-chance'), $('#day2-chance'), $('#day3-chance')];

    let     futureThreeDays = [],
            futureSpeeds =  [],
            chanceOfRain = [];

    let response = await getFromApi("forecast.json", "&days=3");

    let forecastDayArray = response.forecast.forecastday;
    for (let i = 0; i < forecastDayArray.length; i++) {  
        mainDates[i].text(forecastDayArray[i].date);
        temps[i].text(forecastDayArray[i].day.avgtemp_c);
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

async function pastWeatherPage() {
    let     currentDate = new Date(),
            dates = [];
            temps = [];
            speeds = [];

    const   tempPastCanvas = document.getElementById('temp-last-07-days'),
            speedPastCanvas = document.getElementById('speed-last-07-days');

    for (let i = 1; i < 8; i++) {
        let before7Daysdate=new Date(currentDate.setDate(currentDate.getDate() - 1));
        let dt = before7Daysdate.getFullYear()+"-"+before7Daysdate.getMonth()+"-"+before7Daysdate.getDate();
        dates.push(dt);
        let response = await getFromApi("history.json", `&dt=${dt}`);
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


async function airQualityPage() {
    let response = await getFromApi("current.json", "&aqi=yes");
    let current = response.current.air_quality;

    updateMeter($('#air-quality-meter'), $('#air-quality-value'), "", 0, Math.round(current.pm10));
    updateMeter($('#no2-meter'), $('#no2-value'), "µgm-3", 0, Math.round(current.no2));
    updateMeter($('#ozone-meter'), $('#ozone-value'), "µgm-3", 0, Math.round(current.o3));
    updateMeter( $('#co-meter'), $('#co-value'), "µgm-3", 0, Math.round(current.co));
    updateMeter($('#so2-meter'), $('#so2-value'), "µgm-3", 0, Math.round(current.so2));    
}

//setting date and time
const date = $('#date');
const time = $('#time');

let todaysDate = new Date()
date.text(todaysDate.toLocaleDateString());

setInterval(() => {
    let todaysDate = new Date();
    time.text(todaysDate.toLocaleTimeString());
}, 1000)