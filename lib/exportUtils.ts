import { IOrderItem } from "@/lib/database/models/order.model";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToCsv = (orders: IOrderItem[]) => {
  try {
    const headers = ["Order ID", "Buyer", "Buyer Email", "Created", "Amount"];
    const rows = orders.map((order) => [
      order._id || "N/A",
      order.buyer || "Unknown",
      order.buyerEmail || "N/A",
      new Date(order.createdAt).toLocaleString() || "N/A",
      `$${Number(order.totalAmount).toFixed(2)}` || "$0.00",
    ]);

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += headers.join(",") + "\n";
    rows.forEach((row) => {
      csvContent += row.map((cell) => `"${cell}"`).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `orders_${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error exporting to CSV:", error);
    alert("Failed to export CSV. Please try again.");
  }
};

export const exportToPdf = (orders: IOrderItem[]) => {
  const doc = new jsPDF({
    orientation: "landscape",
  });

  // Header
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(36);
  doc.setTextColor(255, 255, 255);
  doc.setFillColor(75, 85, 99);
  doc.rect(0, 0, doc.internal.pageSize.width, 40, "F");
  const pageWidth = doc.internal.pageSize.width;
  const textWidth = doc.getTextWidth("Orders");
  const xPosition = (pageWidth - textWidth) / 2;
  doc.text("Orders", xPosition, 28);

  // Event Title
  if (orders.length > 0) {
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.setFont("Helvetica", "normal");
    doc.text(orders[0].eventTitle || "Untitled Event", 14, 50);
  }

  // Table Headers and Rows
  const headers = ["Order ID", "Buyer", "Buyer Email", "Created", "Amount"];
  const rows = orders.map((order) => [
    order._id || "N/A",
    order.buyer || "Unknown",
    order.buyerEmail || "N/A",
    new Date(order.createdAt).toLocaleString() || "N/A",
    `$${Number(order.totalAmount).toFixed(2)}` || "$0.00",
  ]);

  autoTable(doc, {
    startY: orders.length > 0 ? 60 : 40,
    head: [headers],
    body: rows,
    styles: {
      font: "Helvetica",
      fontSize: 10,
      cellPadding: 4,
      textColor: [0, 0, 0],
      overflow: "linebreak",
      fillColor: [255, 255, 255],
    },
    headStyles: {
      fillColor: [55, 65, 81],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: "bold",
      halign: "left",
      cellPadding: { top: 4, left: 6, bottom: 4, right: 6 },
    },
    columnStyles: {
      0: { textColor: [99, 102, 241], fontStyle: "bold" },
      4: { halign: "right", fontStyle: "bold" },
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    didDrawPage: () => {
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()}`,
        doc.internal.pageSize.width - 20,
        doc.internal.pageSize.height - 10,
        { align: "right" },
      );
    },
  });

  doc.save(`orders_${new Date().toISOString().split("T")[0]}.pdf`);
};
