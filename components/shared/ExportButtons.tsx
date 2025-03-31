"use client";

import { useState } from "react";
import { exportToCsv, exportToPdf } from "@/lib/exportUtils";
import { IOrderItem } from "@/lib/database/models/order.model";

interface ExportButtonsProps {
  orders: IOrderItem[];
}

const ExportButtons: React.FC<ExportButtonsProps> = ({ orders }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportCsv = () => {
    exportToCsv(orders);
    setIsOpen(false);
  };

  const handleExportPdf = () => {
    exportToPdf(orders);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-primary-600 text-sm hover:underline cursor-pointer"
      >
        Export
      </button>
      {isOpen && (
        <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-24 bg-white rounded-md shadow-md z-10 flex flex-col items-center">
          <ul className="py-1">
            <li>
              <button
                onClick={handleExportCsv}
                className="block w-full text-left px-3 py-1 text-sm hover:underline cursor-pointer"
              >
                CSV
              </button>
            </li>
            <li>
              <button
                onClick={handleExportPdf}
                className="block w-full text-left px-3 py-1 text-sm hover:underline cursor-pointer"
              >
                PDF
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ExportButtons;
