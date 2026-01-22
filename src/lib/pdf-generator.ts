import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Appointment, Medicine, Patient, Doctor } from './types';

interface ConsultationData {
    patient: Patient;
    doctor: Doctor;
    appointment: Appointment;
    medicines: Medicine[];
    summary: string;
}

export const generateConsultationPDF = (data: ConsultationData): Blob => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.setFillColor(13, 148, 136); // Teal-600 #0d9488
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text("MedSense", 20, 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text("Medical Consultation Record", 20, 30);

    // Date
    const date = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    doc.text(date, pageWidth - 20, 25, { align: 'right' });

    // Doctor Details
    doc.setTextColor(51, 51, 51);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Dr. ${data.doctor.name}`, 20, 55);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(113, 113, 122); // Zinc-500
    doc.text(data.doctor.specialization || 'General Physician', 20, 60);
    doc.text(data.doctor.hospital || 'Medanta Hospital', 20, 65);
    if (data.doctor.email) doc.text(data.doctor.email, 20, 70);

    // Patient Details
    doc.setFontSize(14);
    doc.setTextColor(51, 51, 51);
    doc.setFont('helvetica', 'bold');
    doc.text("Patient Details", pageWidth / 2 + 10, 55);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(113, 113, 122);
    doc.text(`Name: ${data.patient.name}`, pageWidth / 2 + 10, 60);
    doc.text(`ID: ${data.patient.patient_id}`, pageWidth / 2 + 10, 65);
    if (data.patient.gender) doc.text(`Gender: ${data.patient.gender}`, pageWidth / 2 + 10, 70);
    if (data.patient.date_of_birth) doc.text(`DOB: ${data.patient.date_of_birth}`, pageWidth / 2 + 10, 75);

    // Line Divider
    doc.setDrawColor(228, 228, 231); // Zinc-200
    doc.line(20, 85, pageWidth - 20, 85);

    // Summary Section
    let yPos = 100;
    doc.setFontSize(14);
    doc.setTextColor(13, 148, 136); // Teal-600
    doc.setFont('helvetica', 'bold');
    doc.text("Clinical Summary", 20, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(51, 51, 51);
    doc.setFont('helvetica', 'normal');

    const splitSummary = doc.splitTextToSize(data.summary || "No summary provided.", pageWidth - 40);
    doc.text(splitSummary, 20, yPos);

    yPos += splitSummary.length * 5 + 15;

    // Medicines Table
    doc.setFontSize(14);
    doc.setTextColor(13, 148, 136);
    doc.setFont('helvetica', 'bold');
    doc.text("Prescribed Medications", 20, yPos);

    yPos += 5;

    const medicineRows = data.medicines.map(med => [
        med.medicine_name,
        `${med.dosage} ${med.dosage_unit}`,
        med.frequency,
        med.duration_days ? `${med.duration_days} days` : '-',
        med.instructions || '-'
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Medicine', 'Dosage', 'Frequency', 'Duration', 'Instructions']],
        body: medicineRows,
        headStyles: { fillColor: [13, 148, 136] },
        styles: { fontSize: 9 },
        margin: { left: 20, right: 20 }
    });

    // Footer with Disclaimer
    const footerY = doc.internal.pageSize.height - 30;
    doc.setFontSize(8);
    doc.setTextColor(161, 161, 170); // Zinc-400
    doc.text("This is a digitally generated record. Verify authenticity at medsense.app/verify", pageWidth / 2, footerY, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, footerY + 5, { align: 'center' });

    return doc.output('blob');
};
