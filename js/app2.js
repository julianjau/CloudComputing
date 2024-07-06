// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCLxiKo8KYmWtB9hX7mWVWmjuEPXAPligw",
    authDomain: "cloudcomputing-fb488.firebaseapp.com",
    databaseURL: "https://cloudcomputing-fb488-default-rtdb.firebaseio.com",
    projectId: "cloudcomputing-fb488",
    storageBucket: "cloudcomputing-fb488.appspot.com",
    messagingSenderId: "166426047605",
    appId: "1:166426047605:web:384059f7d21189d752743c",
    measurementId: "G-5GD6B2CGVX"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const db = firebase.firestore(); // Ensure Firestore is initialized

// Referensi ke database Realtime
const suhuRef = database.ref('DHT/suhu');
const kelembabanRef = database.ref('DHT/kelembaban');

// Data arrays for charts
let temperatureData = [];
let humidityData = [];
let timestamps = [];

// Fungsi untuk memperbarui gauge suhu
function updateTemperature(temp) {
    const maxTemp = 100;
    const fill = document.getElementById('temp-fill');
    const value = document.getElementById('temp-value');
    const angle = (temp / maxTemp) * 180;
    fill.style.transform = `rotate(${angle}deg)`;
    value.innerText = `${temp.toFixed(1)}°C`;
    categorizeTemperature(temp);
}

// Fungsi untuk memperbarui gauge kelembaban
function updateHumidity(humidity) {
    const maxHumidity = 250;
    const fill = document.getElementById('humidity-fill');
    const value = document.getElementById('humidity-value');
    const angle = (humidity / maxHumidity) * 180;
    fill.style.transform = `rotate(${angle}deg)`;
    value.innerText = `${humidity}%`;
    categorizeHumidity(humidity);
}

// Fungsi untuk mengkategorikan suhu
function categorizeTemperature(temp) {
    const status = document.getElementById('temp-status');
    if (temp < 20) {
        status.innerText = "Suhu: Dingin";
    } else if (temp >= 20 && temp <= 30) {
        status.innerText = "Suhu: Normal";
    } else if (temp > 30 && temp <= 35) {
        status.innerText = "Suhu: Panas";
    } else {
        status.innerText = "Suhu: Sangat Panas";
    }
}

// Fungsi untuk mengkategorikan kelembaban
function categorizeHumidity(humidity) {
    const status = document.getElementById('humidity-status');
    if (humidity < 40) {
        status.innerText = "Kelembaban: Rendah";
    } else if (humidity >= 40 && humidity <= 70) {
        status.innerText = "Kelembaban: Normal";
    } else if (humidity > 70 && humidity <= 90) {
        status.innerText = "Kelembaban: Tinggi";
    } else {
        status.innerText = "Kelembaban: Sangat Tinggi";
    }
}

// Fungsi untuk memperbarui tabel dan grafik
function updateTableAndCharts(temp, humidity) {
    const currentTime = new Date().toLocaleTimeString();
    
    // Update arrays
    if (timestamps.length >= 10) {
        // Limit the number of data points to 10
        timestamps.shift();
        temperatureData.shift();
        humidityData.shift();
    }
    timestamps.push(currentTime);
    temperatureData.push(temp);
    humidityData.push(humidity);

    // Update table
    const table = document.getElementById('data-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();
    newRow.insertCell(0).innerText = currentTime;
    newRow.insertCell(1).innerText = temp.toFixed(1) + '°C';
    newRow.insertCell(2).innerText = humidity + '%';

    // Update charts
    temperatureChart.update();
    humidityChart.update();

    // Save to Firestore
    saveToFirestore(currentTime, temp, humidity);
}

// Fungsi untuk menyimpan data ke Firestore dengan ID dokumen yang dapat dibaca
function saveToFirestore(time, temp, humidity) {
    const formattedTime = new Date().toISOString().replace(/[-:.]/g, '');

    // Simpan suhu ke path /RoomTrack/data/Suhu dengan ID dokumen yang disesuaikan
    db.collection('RoomTrack').doc('data').collection('Suhu').doc(formattedTime).set({
        waktu: time,
        suhu: temp
    }).then(() => {
        console.log('Suhu berhasil disimpan');
    }).catch((error) => {
        console.error('Error menyimpan suhu: ', error);
    });

    // Simpan kelembaban ke path /RoomTrack/data/Kelembaban dengan ID dokumen yang disesuaikan
    db.collection('RoomTrack').doc('data').collection('Kelembaban').doc(formattedTime).set({
        waktu: time,
        kelembaban: humidity
    }).then(() => {
        console.log('Kelembaban berhasil disimpan');
    }).catch((error) => {
        console.error('Error menyimpan kelembaban: ', error);
    });
}


// Memantau perubahan pada data suhu
suhuRef.on('value', (snapshot) => {
    const temp = snapshot.val();
    updateTemperature(temp);
    updateTableAndCharts(temp, humidityData[humidityData.length - 1] || 0);

    // Menambahkan nilai ke dalam data suhu
    temperatureData.push(temp);
});

// Memantau perubahan pada data kelembaban
kelembabanRef.on('value', (snapshot) => {
    const humidity = snapshot.val();
    updateHumidity(humidity);
    updateTableAndCharts(temperatureData[temperatureData.length - 1] || 0, humidity);
});

// Setup Chart.js
const tempCtx = document.getElementById('temperatureChart').getContext('2d');
const temperatureChart = new Chart(tempCtx, {
    type: 'line',
    data: {
        labels: timestamps,
        datasets: [{
            label: 'Suhu (°C)',
            data: temperatureData,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
            tension: 0.1
        }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Waktu'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Suhu (°C)'
                },
                beginAtZero: false  // Mulai dari nilai minimum yang ditentukan
            }
        }
    }
});

const humCtx = document.getElementById('humidityChart').getContext('2d');
const humidityChart = new Chart(humCtx, {
    type: 'line',
    data: {
        labels: timestamps,
        datasets: [{
            label: 'Kelembaban (%)',
            data: humidityData,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
            tension: 0.1
        }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Waktu'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Kelembaban (%)'
                },
                beginAtZero: true
            }
        }
    }
});

// Update charts every second
setInterval(function() {
    const currentTime = new Date().toLocaleTimeString();
    const temp = temperatureData[temperatureData.length - 1] || 0;
    const humidity = humidityData[humidityData.length - 1] || 0;

    // Insert new row into hidden data table
    const hiddenTable = document.getElementById('hidden-data-table').getElementsByTagName('tbody')[0];
    const newRow = hiddenTable.insertRow();
    newRow.insertCell(0).innerText = currentTime;
    newRow.insertCell(1).innerText = temp.toFixed(1) + '°C';
    newRow.insertCell(2).innerText = humidity + '%';
}, 1000); // Update every second

// Event listener for download button
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('download-btn').addEventListener('click', function() {
        // Extract data from hidden data table
        var hiddenTable = document.getElementById('hidden-data-table');
        var sheet = XLSX.utils.table_to_sheet(hiddenTable);

        // Create workbook and save as Excel file
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, sheet, 'Data');

        // Save Excel file
        XLSX.writeFile(wb, 'data.xlsx');
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const about = document.querySelector('.about');
    const containers = document.querySelector('.containers');

    // Fungsi untuk menampilkan kontainer dengan animasi
    function showContainers() {
        containers.classList.add('active');
    }

    // Fungsi untuk menyembunyikan kontainer dengan animasi
    function hideContainers() {
        containers.classList.remove('active');
    }

    // Event listener untuk klik
    about.addEventListener('click', () => {
        if (containers.classList.contains('active')) {
            hideContainers();
        } else {
            showContainers();
        }
    });
});
