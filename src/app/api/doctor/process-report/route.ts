
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const reportType = formData.get("reportType") as string;
        const patientName = formData.get("patientName") as string;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 }
            );
        }

        // In a real application, we would use an OCR service (like layoutlmv3) or an LLM (Gemini Pro Vision)
        // to extract text and structure from the PDF.
        // For now, we will simulate this process by returning structured data based on the report type.

        // Simulate processing delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const ehrData = generateMockData(reportType, patientName);

        return NextResponse.json({
            success: true,
            ehrData
        });

    } catch (error) {
        console.error("Error processing report:", error);
        return NextResponse.json(
            { error: "Failed to process report" },
            { status: 500 }
        );
    }
}

function generateMockData(type: string, patientName: string) {
    const baseData = {
        patient_name: patientName,
        report_date: new Date().toISOString().split('T')[0],
        status: "final",
    };

    switch (type) {
        case "Blood Test":
            return {
                ...baseData,
                test_type: "Complete Blood Count (CBC)",
                results: [
                    { parameter: "Hemoglobin", value: 14.2, unit: "g/dL", range: "13.5-17.5", flag: "Normal" },
                    { parameter: "WBC", value: 7800, unit: "/mcL", range: "4500-11000", flag: "Normal" },
                    { parameter: "RBC", value: 4.8, unit: "M/mcL", range: "4.5-5.5", flag: "Normal" },
                    { parameter: "Platelets", value: 245000, unit: "/mcL", range: "150000-400000", flag: "Normal" }
                ],
                interpretation: "All blood parameters are within normal limits."
            };
        case "X-Ray":
            return {
                ...baseData,
                modality: "X-Ray",
                region: "Chest PA View",
                findings: [
                    "Trachea is central.",
                    "Both lung fields are clear.",
                    "Cardiac shadow is normal in size and configuration.",
                    "Costophrenic angles are clear.",
                    "No bony abnormality seen."
                ],
                impression: "Normal Chest X-Ray. No active lung pathology."
            };
        case "ECG":
            return {
                ...baseData,
                test_type: "Resting 12-lead ECG",
                heart_rate: "72 bpm",
                rhythm: "Sinus Rhythm",
                intervals: {
                    QT: "380ms",
                    PR: "160ms",
                    QRS: "88ms"
                },
                impression: "Normal Sinus Rhythm. No ST-T changes."
            };
        default:
            return {
                ...baseData,
                type: type,
                summary: "Report content processed successfully.",
                note: "Automatic extraction completed."
            };
    }
}
