import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, AlignmentType, BorderStyle } from "docx";
import { Patient } from "../store/usePatientStore";
import { FoodLogEntry } from "../types";

export const exportService = {
  // 1. HIGH-FIDELITY EXCEL SPREADSHEET EXPORT
  exportToExcel: (patient: Patient | null, foodLogs: FoodLogEntry[]) => {
    try {
      const wb = XLSX.utils.book_new();

      // Tab 1: Patient Demographic Metadata
      const metadata = [
        ["CLINICAL DIET REPORT - METADATA"],
        [],
        ["Patient ID / Code", patient?.code || "N/A"],
        ["Patient Name", patient?.name || "N/A"],
        ["Date of Birth", patient?.dob || "N/A"],
        ["Gender", patient?.sex === "male" ? "Laki-laki" : "Perempuan"],
        ["Height (cm)", patient?.height || 0],
        ["Weight (kg)", patient?.weight || 0],
        ["Activity Factor", patient?.activityLevel || "N/A"],
        [],
        ["Report Generation Timestamp", new Date().toLocaleString()],
      ];
      const wsMeta = XLSX.utils.aoa_to_sheet(metadata);
      XLSX.utils.book_append_sheet(wb, wsMeta, "Patient Info");

      // Tab 2: Food Log Records & Totals
      const headers = ["Food Name", "Category", "Logged Weight (g)", "Calories (kcal)", "Protein (g)", "Carbs (g)", "Fat (g)", "Fiber (g)", "Sodium (mg)"];
      const rows = foodLogs.map(log => [
        log.name,
        log.category,
        log.weightGrams,
        log.calories,
        log.protein,
        log.carbs,
        log.fat,
        log.fiber,
        log.sodium
      ]);

      // Add a final summary row representing the daily sum of nutrients
      const totalWeight = foodLogs.reduce((sum, item) => sum + item.weightGrams, 0);
      const totalCalories = foodLogs.reduce((sum, item) => sum + item.calories, 0);
      const totalProtein = foodLogs.reduce((sum, item) => sum + item.protein, 0);
      const totalCarbs = foodLogs.reduce((sum, item) => sum + item.carbs, 0);
      const totalFat = foodLogs.reduce((sum, item) => sum + item.fat, 0);
      const totalFiber = foodLogs.reduce((sum, item) => sum + item.fiber, 0);
      const totalSodium = foodLogs.reduce((sum, item) => sum + item.sodium, 0);

      const summaryRow = [
        "TOTAL DAILY CONSUMPTION SUM",
        "-",
        totalWeight,
        totalCalories,
        parseFloat(totalProtein.toFixed(1)),
        parseFloat(totalCarbs.toFixed(1)),
        parseFloat(totalFat.toFixed(1)),
        parseFloat(totalFiber.toFixed(1)),
        totalSodium
      ];

      const wsLog = XLSX.utils.aoa_to_sheet([headers, ...rows, [], summaryRow]);
      XLSX.utils.book_append_sheet(wb, wsLog, "Nutrition Sheet");

      // Write and download
      XLSX.writeFile(wb, `NutriSurvey_Report_${patient?.name || "Patient"}.xlsx`);
    } catch (e) {
      console.error("Excel Export Error", e);
    }
  },

  // 2. MODERN CLINIC-BRANDED PDF EXPORT
  exportToPDF: (patient: Patient | null, foodLogs: FoodLogEntry[]) => {
    try {
      const doc = new jsPDF();

      // Document branding header
      doc.setFillColor(124, 58, 237); // Purple accent banner
      doc.rect(0, 0, 210, 15, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text("NUTRI-INTELLIGENCE CLINICAL REPORT", 14, 10);

      doc.setTextColor(50, 50, 50);
      doc.setFontSize(16);
      doc.text("Clinical Diet & Metabolic Analysis Summary", 14, 28);

      // Metadata section grid
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text("Patient Demographics & Registry Details", 14, 38);
      
      doc.setFont("helvetica", "normal");
      doc.text(`Patient ID: ${patient?.code || "N/A"}`, 14, 44);
      doc.text(`Name: ${patient?.name || "N/A"}`, 14, 49);
      doc.text(`Birthdate: ${patient?.dob || "N/A"}`, 14, 54);
      doc.text(`Gender: ${patient?.sex === "male" ? "Male" : "Female"}`, 14, 59);

      doc.text(`Height: ${patient?.height || 0} cm`, 100, 44);
      doc.text(`Weight: ${patient?.weight || 0} kg`, 100, 49);
      doc.text(`Activity Multiplier: ${patient?.activityLevel || "N/A"}`, 100, 54);
      doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 100, 59);

      // Horizontal separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(14, 65, 196, 65);

      // Section title for ingredients table
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Active Ingredient Log Sheet & Macro Nutrient Breakdown", 14, 73);

      const tableHeaders = [["Food Ingredient", "Category", "Weight (g)", "Calories (kcal)", "Protein (g)", "Carbs (g)", "Fat (g)"]];
      const tableRows = foodLogs.map(log => [
        log.name,
        log.category,
        `${log.weightGrams}g`,
        `${log.calories} kcal`,
        `${log.protein}g`,
        `${log.carbs}g`,
        `${log.fat}g`
      ]);

      // Totals
      const totalCalories = foodLogs.reduce((sum, item) => sum + item.calories, 0);
      const totalProtein = foodLogs.reduce((sum, item) => sum + item.protein, 0);
      const totalCarbs = foodLogs.reduce((sum, item) => sum + item.carbs, 0);
      const totalFat = foodLogs.reduce((sum, item) => sum + item.fat, 0);

      tableRows.push([
        "TOTAL DAILY CONSOLIDATED",
        "-",
        `${foodLogs.reduce((sum, item) => sum + item.weightGrams, 0)}g`,
        `${totalCalories} kcal`,
        `${totalProtein.toFixed(1)}g`,
        `${totalCarbs.toFixed(1)}g`,
        `${totalFat.toFixed(1)}g`
      ]);

      (doc as any).autoTable({
        startY: 78,
        head: tableHeaders,
        body: tableRows,
        theme: "grid",
        headStyles: { fillColor: [124, 58, 237], fontSize: 8 },
        bodyStyles: { fontSize: 8 },
        margin: { left: 14, right: 14 }
      });

      // Save document
      doc.save(`NutriSurvey_Clinical_Report_${patient?.name || "Patient"}.pdf`);
    } catch (e) {
      console.error("PDF Export Error", e);
    }
  },

  // 3. CLINICAL MS WORD (.DOCX) DOCUMENT EXPORT
  exportToWord: async (patient: Patient | null, foodLogs: FoodLogEntry[]) => {
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "NUTRI-INTELLIGENCE CLINICAL PORTAL",
                    bold: true,
                    size: 28,
                    color: "7c3aed"
                  })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [
                  new TextRun({
                    text: "Detailed Clinical Dietary Report & Metabolic Analysis",
                    italics: true,
                    size: 18,
                    color: "555555"
                  })
                ]
              }),
              new Paragraph({
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: "Patient Demographic Information",
                    bold: true,
                    size: 22
                  })
                ]
              }),
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: `Patient ID Code: ${patient?.code || "N/A"}`, bold: true }),
                  new TextRun({ text: "\t\t" }),
                  new TextRun({ text: `Registry Name: ${patient?.name || "N/A"}` })
                ]
              }),
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: `Date of Birth: ${patient?.dob || "N/A"}` }),
                  new TextRun({ text: "\t\t\t" }),
                  new TextRun({ text: `Gender: ${patient?.sex === "male" ? "Male" : "Female"}` })
                ]
              }),
              new Paragraph({
                spacing: { after: 180 },
                children: [
                  new TextRun({ text: `Anthropometrics: Height ${patient?.height || 0} cm, Weight ${patient?.weight || 0} kg` })
                ]
              }),
              new Paragraph({
                spacing: { after: 120 },
                children: [
                  new TextRun({
                    text: "Daily Food Intake List & Nutritional Compendium",
                    bold: true,
                    size: 22
                  })
                ]
              }),
              new Table({
                rows: [
                  // Headers
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Ingredient Name", bold: true })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Category", bold: true })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Weight (g)", bold: true })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Calories", bold: true })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Protein (g)", bold: true })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Carbohydrates (g)", bold: true })] })] }),
                      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Fat (g)", bold: true })] })] })
                    ]
                  }),
                  // Log records
                  ...foodLogs.map(log => 
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph(log.name)] }),
                        new TableCell({ children: [new Paragraph(log.category)] }),
                        new TableCell({ children: [new Paragraph(`${log.weightGrams}g`)] }),
                        new TableCell({ children: [new Paragraph(`${log.calories} kcal`)] }),
                        new TableCell({ children: [new Paragraph(`${log.protein}g`)] }),
                        new TableCell({ children: [new Paragraph(`${log.carbs}g`)] }),
                        new TableCell({ children: [new Paragraph(`${log.fat}g`)] })
                      ]
                    })
                  )
                ]
              }),
              new Paragraph({
                spacing: { before: 200 },
                children: [
                  new TextRun({
                    text: `Compiled and authorized automatically on ${new Date().toLocaleDateString()}. Certified for professional nutritional consultation context.`,
                    italics: true,
                    size: 14,
                    color: "888888"
                  })
                ]
              })
            ]
          }
        ]
      });

      const blob = await Packer.toBlob(doc);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `NutriSurvey_Report_${patient?.name || "Patient"}.docx`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error("Word Export Error", e);
    }
  }
};
