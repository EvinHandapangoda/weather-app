//importing Chart from chart.js
const Chart = window.Chart;


//updating the values of the meters
const updateMeter = (meterId, valueId, unit, startValue, endValue) =>{
    const progress = setInterval(() => {
        if(endValue == 0){
            startValue--;
            clearInterval(progress);
        } 
        startValue++;
        valueId.textContent = `${startValue + " " + unit}`;
        meterId.style.background = `conic-gradient(rgb(83, 183, 255) ${startValue*3.6}deg, rgb(73, 73, 73) 0deg)`;
        if(startValue == endValue){
            clearInterval(progress);
        }
    }, 15);
}

//updating the values of text meter values
function updateTextMeters(valueId, unit, startValue, endValue, speed){
    const progress = setInterval(() => {
        startValue++;
        valueId.textContent = `${startValue + " " + unit}`;  
        if(startValue == endValue){
            clearInterval(progress);
        }
    }, speed);
}

//retrieving weather data from weather api
const   submitButton = $('#submit-btn'),
        inputField = $('#input-field'),
        cloudIcon = $('#cloud-icon'),
        mainTemp = $('#main-temp'),
        mainCondition = $('#main-condition'),
        mainLocation = $("#main-location"),
        windSpeed = document.getElementById("wind-meter-value"),
        windSpeedMeter = document.getElementById('wind-speed-meter'),
        humidityMeter = document.getElementById('humidity-meter'),
        humidity = document.getElementById('humidity-meter-value'),
        uvMeter = document.getElementById('uv-meter'),
        pressureMeter = document.getElementById('pressure-meter'),
        visibilityMeter = document.getElementById('visibility-meter'),
        cloudCoverageMeter = document.getElementById('cloud-coverage-meter'),
        cloudCoverage = document.getElementById('cloud-coverage-value');


submitButton.click(() => {
    $.ajax({
        method : "GET",
        url : `http://api.weatherapi.com/v1/current.json?key=e2139a4606d04c27ae0142813232009&q=${inputField.val()}`,
        success : (response) => {
            let current = response.current;
            console.log(response);
            mainTemp.text(current.temp_c + "º C");
            mainCondition.text(current.condition.text);
            mainLocation.text(response.location.name + ", " + response.location.country);
            cloudIcon.prop('src', current.condition.icon);
            updateMeter(windSpeedMeter, windSpeed, "km/h", 0, Math.round(current.wind_kph));
            updateMeter(humidityMeter, humidity, "",0 , Math.round(current.humidity));
            updateTextMeters(uvMeter, "", 0, Math.round(current.uv), 100);
            updateTextMeters(pressureMeter, "kPa", 0, Math.round(current.pressure_in), 60);
            updateMeter(cloudCoverageMeter, cloudCoverage, "%", 0, Math.round(current.cloud));
            updateTextMeters(visibilityMeter, "km", 0, Math.round(current.vis_km), 70);
        }
    })    
});




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

const speedFutureCanvas = document.getElementById('wind-speed-next-04-days');
const futureFourDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];
const futureSpeeds = [26, 28, 29, 26, 50];
const speedUnit = "km/h";

createChart(speedFutureCanvas, futureFourDays, futureSpeeds, speedUnit );


const tempPastCanvas = document.getElementById('temp-last-07-days');
const pastSevenDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const pastTemps = [26, 28, 23, 26, 24, 28, 22, 50];
const tempUnit = "º";

createChart(tempPastCanvas, pastSevenDays, pastTemps, tempUnit);

const speedPastCanvas = document.getElementById('speed-last-07-days');
const pastSpeeds = [22, 43, 19, 56, 32, 44, 31];

createChart(speedPastCanvas, pastSevenDays, pastSpeeds, speedUnit)



const loadMeters = () => {
    let airQualityMeter = document.getElementById('air-quality-meter');
    let airQualityValue = document.getElementById('air-quality-value');

    updateMeter(airQualityMeter, airQualityValue, "", 0, 50)

    let no2Meter = document.getElementById('no2-meter');
    let no2Value = document.getElementById('no2-value');

    updateMeter(no2Meter, no2Value, "ppm", 0, 20);

    let ozoneMeter = document.getElementById('ozone-meter');
    let ozoneValue = document.getElementById('ozone-value');

    updateMeter(ozoneMeter, ozoneValue, "ppm", 0, 40);

    let coMeter = document.getElementById('co-meter');
    let coValue = document.getElementById('co-value');

    updateMeter(coMeter, coValue, "ppm", 0, 60);

    let so2Meter = document.getElementById('so2-meter');
    let so2Value = document.getElementById('so2-value');

    updateMeter(so2Meter, so2Value, "ppm", 0, 80);
}

const airQuality = document.getElementById('air-quality');

const airQualityMeters = new IntersectionObserver(
    () => {
        loadMeters();
    }
)

airQualityMeters.observe(airQuality);
