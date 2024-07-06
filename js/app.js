


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
    const container = document.getElementById('temp-gauge');
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
    const container = document.getElementById('humidity-gauge');
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

    // Kirim data ke PHP
    sendDataToPHP(temp, humidity); // Pastikan fungsi sendDataToPHP tersedia dan sesuai dengan kebutuhan Anda
}



// Memantau perubahan pada data suhu
suhuRef.on('value', (snapshot) => {
    const temp = snapshot.val();
    updateTemperature(temp);
    updateTableAndCharts(temp, humidityData[humidityData.length - 1] || 0);

    // Menambahkan nilai ke dalam data suhu
    temperatureData.push(temp); // Pastikan nilai temp dari Firebase dimasukkan ke dalam temperatureData
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




// Function to update hidden data table every second
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
// document.addEventListener('DOMContentLoaded', function() {
//     document.getElementById('download-btn').addEventListener('click', function() {
//         // Ambil data dari tabel HTML
//         var table = document.getElementById('data-table');
//         var sheet = XLSX.utils.table_to_sheet(table);

//         // Buat workbook dan simpan sebagai file Excel
//         var wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, sheet, 'Data');

//         // Simpan file Excel
//         XLSX.writeFile(wb, 'data.xlsx');
//     });
// });


// document.addEventListener('DOMContentLoaded', () => {
//     const about = document.querySelector('.about');
//     const containers = document.querySelector('.containers');

//     // Fungsi untuk menampilkan atau menyembunyikan kontainer
//     function toggleContainers() {
//         if (containers.style.display === 'flex') {
//             containers.style.display = 'none';
//         } else {
//             containers.style.display = 'flex';
//         }
//     }

//     // Event listener untuk klik
//     about.addEventListener('click', toggleContainers);
// });

// script.js

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



