"use client";

import { useEffect, useRef } from "react";

export default function ResizableTable({
  tableHeaders,
  tableData,
}: {
  tableHeaders: string[];
  tableData: any[][];
}) {
  const tableRef = useRef<HTMLTableElement>(null);

  useEffect(() => {
    if (!tableRef.current) return;

    const table = tableRef.current;
    const headers = table.querySelectorAll("th");

    headers.forEach((header) => {
      const resizer = document.createElement("div");
      resizer.className = "resizer";
      resizer.style.width = "8px";
      resizer.style.height = "100%";
      resizer.style.position = "absolute";
      resizer.style.top = "0";
      resizer.style.right = "-4px"; // Ensure resizer is fully visible
      resizer.style.cursor = "col-resize";
      resizer.style.userSelect = "none";
      resizer.style.backgroundColor = "transparent";
      (header as HTMLElement).style.position = "relative";
      (header as HTMLElement).style.minWidth = "80px"; // Prevent collapsing
      (header as HTMLElement).appendChild(resizer);

      let startX: number, startWidth: number;

      const startResize = (e: MouseEvent) => {
        startX = e.clientX;
        startWidth = (header as HTMLElement).offsetWidth;

        document.addEventListener("mousemove", resize);
        document.addEventListener("mouseup", stopResize);
      };

      const resize = (e: MouseEvent) => {
        const width = Math.max(80, startWidth + (e.clientX - startX)); // Set a minimum width
        (header as HTMLElement).style.width = `${width}px`;
      };

      const stopResize = () => {
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", stopResize);
      };

      resizer.addEventListener("mousedown", startResize);
    });
  }, []);

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      <table ref={tableRef} className="min-w-full text-sm text-left text-gray-800 border border-gray-300">
        <thead className="bg-[#0E2245] text-white sticky top-0 z-10">
          <tr>
            {tableHeaders.map((header, index) => (
              <th
                key={index}
                className="px-6 py-4 font-semibold tracking-wide border border-gray-300"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.length > 0 ? (
            tableData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-b ${
                  rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-indigo-50 transition-colors`}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 text-sm font-medium text-gray-900 border border-gray-300"
                  >
                    {typeof cell === "string" && cell.includes("Download File") ? (
                      <span dangerouslySetInnerHTML={{ __html: cell }} />
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={tableHeaders.length} className="px-6 py-4 text-center text-gray-500">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
