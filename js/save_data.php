<?php
// Koneksi ke database
$servername = "localhost"; // Ganti dengan nama server Anda
$username = "root"; // Ganti dengan username MySQL Anda
$password = ""; // Ganti dengan password MySQL Anda
$dbname = "roomtrack"; // Ganti dengan nama database Anda

// Membuat koneksi
$conn = new mysqli($servername, $username, $password, $dbname);

// Cek koneksi
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Ambil data suhu dan kelembaban dari POST request
if(isset($_POST['temperature']) && isset($_POST['humidity'])) {
    $temp = $_POST['temperature'];
    $humidity = $_POST['humidity'];

    // Buat query untuk menyimpan data ke tabel suhu_kelembaban
    $sql = "INSERT INTO suhu_kelembaban (suhu, kelembaban, waktu) VALUES ('$temp', '$humidity', NOW())";

    if ($conn->query($sql) === TRUE) {
        echo "Data berhasil disimpan";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
} else {
    echo "Data tidak lengkap";
}

// Tutup koneksi
$conn->close();
?>
