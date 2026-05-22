// Database Frekuensi Data Riil Hasil Olah Excel Dataset_Prediksi_Stres_Mahasiswa
const PRIORS = { "Rendah": 64, "Sedang": 80, "Tinggi": 56, "_total": 200 };

const CONDITIONAL_COUNTS = {
  "Tingkat_Semester": {
    "Rendah": { "Akhir (7-8+)": 7, "Awal (1-2)": 43, "Tengah (3-6)": 14, "_total": 64, "_v": 3 },
    "Sedang": { "Akhir (7-8+)": 24, "Awal (1-2)": 22, "Tengah (3-6)": 34, "_total": 80, "_v": 3 },
    "Tinggi": { "Akhir (7-8+)": 34, "Awal (1-2)": 1, "Tengah (3-6)": 21, "_total": 56, "_v": 3 }
  },
  "Rata_Jam_Tidur": {
    "Rendah": { "3": 0, "4": 1, "5": 2, "6": 21, "7": 24, "8": 16, "_total": 64, "_v": 6 },
    "Sedang": { "3": 4, "4": 8, "5": 15, "6": 30, "7": 21, "8": 2, "_total": 80, "_v": 6 },
    "Tinggi": { "3": 15, "4": 20, "5": 11, "6": 10, "7": 0, "8": 0, "_total": 56, "_v": 6 }
  },
  "Jumlah_SKS_Tugas": {
    "Rendah": { "10": 0, "11": 3, "12": 0, "13": 3, "14": 0, "15": 8, "16": 11, "17": 7, "18": 3, "19": 4, "20": 11, "21": 5, "22": 3, "23": 1, "24": 5, "_total": 64, "_v": 15 },
    "Sedang": { "10": 2, "11": 2, "12": 2, "13": 4, "14": 1, "15": 0, "16": 4, "17": 6, "18": 3, "19": 2, "20": 12, "21": 16, "22": 11, "23": 9, "24": 6, "_total": 80, "_v": 15 },
    "Tinggi": { "10": 0, "11": 0, "12": 2, "13": 2, "14": 2, "15": 0, "16": 2, "17": 1, "18": 6, "19": 4, "20": 4, "21": 6, "22": 6, "23": 12, "24": 9, "_total": 56, "_v": 15 }
  },
  "Status_Percintaan": {
    "Rendah": { "Jomblo (Santai)": 22, "Putus Cinta": 7, "Toksik": 12, "Jomblo (Stres)": 7, "Stabil": 16, "_total": 64, "_v": 5 },
    "Sedang": { "Jomblo (Santai)": 9, "Putus Cinta": 15, "Toksik": 20, "Jomblo (Stres)": 25, "Stabil": 11, "_total": 80, "_v": 5 },
    "Tinggi": { "Jomblo (Santai)": 4, "Putus Cinta": 18, "Toksik": 11, "Jomblo (Stres)": 19, "Stabil": 4, "_total": 56, "_v": 5 }
  },
  "Hubungan_Keluarga": {
    "Rendah": { "Harmonis": 41, "Renggang": 23, "_total": 64, "_v": 2 },
    "Sedang": { "Harmonis": 39, "Renggang": 41, "_total": 80, "_v": 2 },
    "Tinggi": { "Harmonis": 20, "Renggang": 36, "_total": 56, "_v": 2 }
  },
  "Masalah_Finansial": {
    "Rendah": { "Ya": 20, "Tidak": 44, "_total": 64, "_v": 2 },
    "Sedang": { "Ya": 42, "Tidak": 38, "_total": 80, "_v": 2 },
    "Tinggi": { "Ya": 35, "Tidak": 21, "_total": 56, "_v": 2 }
  }
};

function hitungPrediksi() {
    // 1. Mengambil nilai dari form input
    const inputs = {
        "Tingkat_Semester": document.getElementById("semester").value,
        "Rata_Jam_Tidur": document.getElementById("tidur").value,
        "Jumlah_SKS_Tugas": document.getElementById("sks").value.toString(),
        "Status_Percintaan": document.getElementById("percintaan").value,
        "Hubungan_Keluarga": document.getElementById("keluarga").value,
        "Masalah_Finansial": document.getElementById("finansial").value
    };

    const classes = ["Rendah", "Sedang", "Tinggi"];
    let hasilProbabilitas = {};
    let tabelHTML = `<table>
        <tr>
            <th>Fitur Terpilih (Xi)</th>
            <th>Kelas (Ck)</th>
            <th>Jumlah Kemunculan Riil</th>
            <th>Rumus Laplace Smoothing</th>
            <th>Hasil Probabilitas</th>
        </tr>`;

    // Looping kalkulasi matematika untuk setiap kelas target
    classes.forEach(c => {
        let perkalianKondisional = 1;
        let prior = PRIORS[c] / PRIORS["_total"];

        for (let feat in inputs) {
            let val = inputs[feat];
            let countsObj = CONDITIONAL_COUNTS[feat][c];
            
            // Mengambil jumlah frekuensi riil, jika tidak ada isi 0
            let countRiil = countsObj[val] !== undefined ? countsObj[val] : 0;
            let totalKelas = countsObj["_total"];
            let v = countsObj["_v"]; // Jumlah variasi unik fitur

            // Penerapan Rumus Laplace Smoothing
            let probKondisional = (countRiil + 1) / (totalKelas + v);
            perkalianKondisional *= probKondisional;

            tabelHTML += `<tr>
                <td>${feat} = <b>${val}</b></td>
                <td><span class="badge-${c}">${c}</span></td>
                <td>${countRiil} dari ${totalKelas} data</td>
                <td>(${countRiil} + 1) / (${totalKelas} + ${v})</td>
                <td><b>${probKondisional.toFixed(4)}</b></td>
            </tr>`;
        }

        // Skor Akhir Pembilang Teorema Bayes
        hasilProbabilitas[c] = prior * perkalianKondisional;
    });

    tabelHTML += `</table>`;
    document.getElementById("perhitunganLangkah").innerHTML = tabelHTML;

    // 2. Normalisasi nilai agar total probabilitas menjadi 100%
    let totalSkor = hasilProbabilitas["Rendah"] + hasilProbabilitas["Sedang"] + hasilProbabilitas["Tinggi"];
    let probRendahPersen = (hasilProbabilitas["Rendah"] / totalSkor) * 100;
    let probSedangPersen = (hasilProbabilitas["Sedang"] / totalSkor) * 100;
    let probTinggiPersen = (hasilProbabilitas["Tinggi"] / totalSkor) * 100;

    // 3. Menentukan Keputusan Prediksi Terbesar
    let prediksiFinal = "Rendah";
    let nilaiTerbesar = probRendahPersen;

    if (probSedangPersen > nilaiTerbesar) {
        prediksiFinal = "Sedang";
        nilaiTerbesar = probSedangPersen;
    }
    if (probTinggiPersen > nilaiTerbesar) {
        prediksiFinal = "Tinggi";
        nilaiTerbesar = probTinggiPersen;
    }

    // 4. Menampilkan Ringkasan Hasil Perkalian Akhir
    let perkalianHTML = `
        <p><b>Perhitungan Skor Akhir (Prior x Akhir Kondisional):</b></p>
        <ul>
            <li>Skor Rendah: ${PRIORS["Rendah"]}/200 x Probabilitas Kondisional = <b>${hasilProbabilitas["Rendah"].toExponential(4)}</b> (Presentase: <b>${probRendahPersen.toFixed(2)}%</b>)</li>
            <li>Skor Sedang: ${PRIORS["Sedang"]}/200 x Probabilitas Kondisional = <b>${hasilProbabilitas["Sedang"].toExponential(4)}</b> (Presentase: <b>${probSedangPersen.toFixed(2)}%</b>)</li>
            <li>Skor Tinggi: ${PRIORS["Tinggi"]}/200 x Probabilitas Kondisional = <b>${hasilProbabilitas["Tinggi"].toExponential(4)}</b> (Presentase: <b>${probTinggiPersen.toFixed(2)}%</b>)</li>
        </ul>
        <p style="margin-top:10px; background:#0f172a; padding:10px; border-radius:6px; color: #38bdf8;">Kesimpulan: Skor tertinggi didapatkan oleh kelas <b>${prediksiFinal}</b>.</p>
    `;
    document.getElementById("perkalianFinal").innerHTML = perkalianHTML;

    // 5. Update UI Hasil Utama
    const hasilBadge = document.getElementById("hasilFinalText");
    hasilBadge.className = `prediction-badge badge-${prediksiFinal}`;
    hasilBadge.innerHTML = `Tingkat Stres: ${prediksiFinal} (${nilaiTerbesar.toFixed(1)}% Keyakinan Model)`;

    // Menampilkan container hasil
    document.getElementById("resultContainer").style.display = "block";
    
    // Auto scroll ke bawah agar user melihat hasilnya
    document.getElementById("resultContainer").scrollIntoView({ behavior: 'smooth' });
}