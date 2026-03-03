import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

// Define the name of the file
const fileName = 'SOP_Heart_Management_Dummy.pdf';
const filePath = path.join(process.cwd(), fileName);

// Create a new PDF document with standard margins
const doc = new PDFDocument({ margin: 50 });

// Pipe the generated PDF into a file stream
doc.pipe(fs.createWriteStream(filePath));

// -------------------------------------------------------------------------
// DOCUMENT HEADER
// -------------------------------------------------------------------------
doc.fontSize(24).font('Helvetica-Bold').fillColor('#4F46E5') // Indigo-600
    .text('HEART MANAGEMENT SYSTEM', { align: 'center' })
    .moveDown(0.5);

doc.fontSize(16).font('Helvetica-Bold').fillColor('#1E293B') // Slate-800
    .text('SOP - Tata Tertib Karyawan & Pengelolaan Kasir', { align: 'center' })
    .moveDown(1);

doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#E2E8F0').stroke();
doc.moveDown(1);

// -------------------------------------------------------------------------
// METADATA
// -------------------------------------------------------------------------
doc.fontSize(10).font('Helvetica').fillColor('#64748B'); // Slate-500
doc.text(`Doc Ref  : HRT-SOP-2026-001`);
doc.text(`Version  : 1.0 (Draft)`);
doc.text(`Date     : ${new Date().toLocaleDateString()}`);
doc.text(`Author   : System Admin`);
doc.moveDown(1.5);

// -------------------------------------------------------------------------
// SECTION 1: KETENTUAN UMUM
// -------------------------------------------------------------------------
doc.fontSize(14).font('Helvetica-Bold').fillColor('#0F172A') // Slate-900
    .text('1. Ketentuan Umum & Kedisiplinan')
    .moveDown(0.5);

doc.fontSize(11).font('Helvetica').fillColor('#334155'); // Slate-700
doc.text('•  Jam Kerja Operasional: Shift Pagi (07:00 - 15:00) dan Shift Malam (15:00 - 23:00).');
doc.text('•  Karyawan wajib datang 15 menit sebelum shift dimulai untuk operan shift.');
doc.text('•  Keterlambatan lebih dari 15 menit tanpa pemberitahuan akan dikenakan denda pemotongan poin kinerja.');
doc.text('•  Pakaian kerja harus sesuai dengan seragam yang ditentukan, rapi, dan menggunakan ID Card.');
doc.moveDown(1);

// -------------------------------------------------------------------------
// SECTION 2: SOP TRANSAKSI POS (KASIR)
// -------------------------------------------------------------------------
doc.fontSize(14).font('Helvetica-Bold').fillColor('#0F172A')
    .text('2. SOP Transaksi Point of Sale (POS)')
    .moveDown(0.5);

doc.fontSize(11).font('Helvetica').fillColor('#334155');
doc.text('•  Pastikan saldo laci kasir (Float) awal shift bernilai benar (default Rp 500.000).');
doc.text('•  Saat melayani pelanggan di sistem kasir, pastikan scan barcode produk dilakukan dengan benar.');
doc.text('•  Jika ada pembatalan transaksi (Void), wajib lapor atau minta PIN otorisasi dari Supervisor/Owner.');
doc.text('•  Setelah shift selesai, lakukan Rekap Shift (End of Day). Selisih kas minus akan dibebankan kepada kasir.');
doc.moveDown(1);

// -------------------------------------------------------------------------
// SECTION 3: PENANGANAN EXPERED BARANG (EXPIRED)
// -------------------------------------------------------------------------
doc.fontSize(14).font('Helvetica-Bold').fillColor('#0F172A')
    .text('3. Standar Penanganan Barang Mendekati Expired')
    .moveDown(0.5);

doc.fontSize(11).font('Helvetica').fillColor('#334155');
doc.text('•  Cek notifikasi di aplikasi Heart Management setiap awal shift untuk barang yang akan kedaluwarsa dalam 30 hari.');
doc.text('•  Pisahkan produk yang mendekati expired ke Rak Khusus Diskon (Promo).');
doc.text('•  Barang yang sudah melewati tanggal expired harus difoto, dimasukkan ke menu "Audit Inventori", lalu dibuang sesuai regulasi.');
doc.moveDown(1);

// -------------------------------------------------------------------------
// SECTION 4: TATA TERTIB PENGGUNAAN AI ASSISTANT
// -------------------------------------------------------------------------
doc.fontSize(14).font('Helvetica-Bold').fillColor('#0F172A')
    .text('4. Penggunaan Heart-MGMT AI Assistant')
    .moveDown(0.5);

doc.fontSize(11).font('Helvetica').fillColor('#334155');
doc.text('•  Gunakan asisten AI hanya untuk keperluan terkait perusahaan (cek stok, prosedur, shift, dll).');
doc.text('•  Dilarang membagikan jawaban AI internal (SOP/Stok) kepada pihak eksternal, pelanggan, atau supplier kecuali ada instruksi manajemen.');
doc.moveDown(1);

// -------------------------------------------------------------------------
// FOOTER
// -------------------------------------------------------------------------
doc.moveTo(50, 700).lineTo(550, 700).strokeColor('#E2E8F0').stroke();
doc.fontSize(9).font('Helvetica-Oblique').fillColor('#94A3B8')
    .text('Heart Management System - Internal Use Only', 50, 715, { align: 'center' });

// Finalize the PDF and close the stream
doc.end();

console.log('✅ Success! Dummy SOP PDF has been generated at:');
console.log('👉 ' + filePath);
console.log('\nYou can safely upload this file using the SOPManagement UI.');
