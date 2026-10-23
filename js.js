function updateWeatherImage(isRaining) {
    const weatherImage = document.getElementById("weather-icon");
    const status = document.getElementById("weather-status");

    if (isRaining === "RAIN") {
        weatherImage.style.display = "block";
        weatherImage.src = "raining.webp";
        status.innerText = "Raining!";
    } else if (isRaining === "DRY") {
        weatherImage.style.display = "block";
        weatherImage.src = "cloud.webp";
        status.innerText = "Cloudy!";
    } 
}


let currentWeatherFromArduino = "RAIN";
updateWeatherImage(currentWeatherFromArduino);


// arduino -> web
const status1 = document.getElementById("openStatus");
const toggle = document.getElementById("status-toggle");

function updateOpenStatus(status) {

    if (status === "ON") {
        status1.innerText = "Opened";
        toggle.checked = true;
    } else if (status === "OFF") {
        status1.innerText = "Closed";
        toggle.checked = false;

    } else {
        status1.innerText = "Loading...";
        toggle.checked = false;
    }
}

let currentOpenStatus = "ON";
updateOpenStatus(currentOpenStatus);

// web -> arduino
// กรณีเปิดออโต้ ท้อกเกิลต้องเขียวอัตโนมัติด้วย
const client = mqtt.connect("wss://broker.hivemq.com:8884/mqtt");

const TOPIC = "projectPhyCom4Kon";
const connectText = document.getElementById("connecting_text")

// ************************************
function setConnectionStatus(text, color) {
    connectText.textContent = text;
    connectText.style.color = color;
}

client.on("connect", () => {
    console.log("MQTT connected!");
    setConnectionStatus("Connected", "#02e715");
    client.subscribe(TOPIC, (err) => {
        if (err) console.error("Subscribe ไม่สำเร็จ:", err);
    });
});

client.on("error", (err) => {
    console.error("MQTT error! :", err);
    setConnectionStatus("Disconnected", "#e70202");
});

client.on("close", () => setConnectionStatus("Disconnected", "#e70202"));
client.on("offline", () => setConnectionStatus("Disconnected", "#e70202"));

client.on("reconnect", () => setConnectionStatus("Reconnecting...", "#f59e0b"));
// ************************************

toggle.addEventListener("change", () => {
    let msg;
    if (toggle.checked) {
        msg = "90";

    } else {
        msg = "0";
    }
    
    const options = {
        qos: 1,
        retain: true
    }

    client.publish(TOPIC, msg);

});

client.on("message", (topic, payload) => {
    if (topic === TOPIC) {
        if (payload.toString() === "ON" || payload.toString() === "OFF") {
            updateOpenStatus(payload.toString());
        } else {
            updateWeatherImage(payload.toString());
        }
    }
});
