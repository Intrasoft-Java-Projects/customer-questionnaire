"use client";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Console } from "console";
import Papa, { ParseResult } from "papaparse";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

interface FormattedData {
  Section: any;
  Question: any;
  Answer: any;
  Contact_Name: any;
  Contact_Email: any;
}
type QuestionRow = {
  section?: string;
  type?: string;
  label?: string;
  options?: string;
  parent_question_id?: string;
  condition_value?: string;
  subsection?: string;
  status?: string;
  form_id?: string;
};

export default function SubmittedQuestionnaire() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // State to store the fetched form IDs and submitted data
  const [forms, setForms] = useState<{ formId: any; formName: any }[]>([]);
  const [submittedData, setSubmittedData] = useState<
    { contactName: string; contactEmail: string; jobTitle: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [formId, setFormId] = useState<number | string>("");
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    const fetchFormIds = async () => {
      let allData: { id: number; name: string }[] = [];
      let hasMoreData = true;
      let offset = 0;
      const limit = 1000;
      while (hasMoreData) {
        const { data, error } = await supabase
          .from("forms")
          .select("id, name")
          .order("id")
          .range(offset, offset + limit - 1);
        console.log(data);
        if (error) {
          console.error("Error fetching form ids: ", error.message);
          break;
        }

        if (data && data.length > 0) {
          allData = allData.concat(data);
          console.log("allData =", allData);
          offset += limit;
        } else {
          hasMoreData = false;
        }
      }

      const uniqueForms = Array.from(
        new Map(
          allData.map((item) => [
            `${item.id}-${item.name}`,
            { formId: item.id, formName: item.name },
          ])
        ).values()
      );

      const sortedForms = uniqueForms.sort((a, b) => a.formId - b.formId);

      setForms(sortedForms);
    };

    fetchFormIds();
  }, []);

  useEffect(() => {
    const fetchFormQuestions = async () => {
      if (!formId) return;

      const { data, error } = await supabase
        .from("questions")
        .select("id,section, label, type, options")
        .eq("form_id", formId)
        .order("id", { ascending: true }); // 👈 this adds ordering

      if (error) {
        console.error("Error fetching questions:", error);
      } else {
        setQuestions(data || []); // null-safe fallback
      }
      console.log(data)
    };

    fetchFormQuestions();
  }, [formId]);

  const getFormId = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const formId = event.target.value; // Get the selected formId (could be empty "")
    setFormId(formId); // Update the state with the formId
    console.log("select = ", formId);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setLoading(true);

    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse<QuestionRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results: ParseResult<QuestionRow>) {
        const rows = results.data;

        const formattedRows = rows.map((row: QuestionRow) => {
          const cleanOptions = (
            type: string | undefined,
            options: string | undefined
          ): any[] | null => {
            if (
              !["select", "radio", "checkbox"].includes(
                (type || "").toLowerCase()
              )
            ) {
              return null; // Don't format options if the type is not valid
            }

            if (!options || options.trim() === "") return null;

            // Split the options string into an array and map them into an object format
            const optionArray = options.split(",").map((opt: string) => {
              const val = opt.trim();
              return { label: val, value: val };
            });

            return optionArray; // Return the formatted array of objects
          };

          console.log("Parsed options:", row.options);

          return {
            section: row.section?.trim() || null,
            type: row.type?.trim() || null,
            label: row.label?.trim() || null,
            options: cleanOptions(row.type, row.options), // Store as an array of objects
            parent_question_id: row.parent_question_id?.trim() || null,
            condition_value: row.condition_value?.trim() || null,
            subsection: row.subsection?.trim() || null,
            status: row.status?.trim() || "active",
            form_id:
              row.form_id && !isNaN(Number(row.form_id))
                ? parseInt(row.form_id)
                : null,
          };
        });

        console.log("Formatted rows to insert:", formattedRows);

        const { data, error } = await supabase
          .from("questions")
          .insert(formattedRows);
        if (error) {
          console.error("Insert error:", error);
          alert("Error importing questions. Check console for details.");
        } else {
          console.log("Inserted:", data);
          alert("Questions imported successfully!");
        }
      },
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#E5E7EB] p-6 flex justify-center items-center">
    <div className="w-full max-w-6xl bg-white shadow-2xl rounded-3xl overflow-hidden">
      {loading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-[#0E2245] text-white px-8 py-6 rounded-xl flex items-center gap-4 shadow-lg animate-fade-in">
            <AiOutlineLoading3Quarters className="animate-spin text-3xl" />
            <span className="text-lg font-semibold tracking-wide">Exporting Data...</span>
          </div>
        </div>
      )}
  
      <div className="bg-[#0E2245] text-white text-center p-10 rounded-t-3xl">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Submitted Questions</h1>
        <p className="text-lg opacity-90">View all added questions</p>
      </div>
  
      <div className="px-10 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* Dropdown */}
          <div className="flex flex-col">
            <label htmlFor="formId" className="text-[#0E2245] text-sm font-semibold mb-2">
              Select Form
            </label>
            <select
              id="formId"
              value={formId}
              onChange={getFormId}
              className="p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#0E2245] outline-none transition"
            >
              <option value="">-- Select Form --</option>
              {forms.map((form) => (
                <option key={form.formId} value={form.formId}>
                  Form {form.formId} - {form.formName}
                </option>
              ))}
            </select>
          </div>
  
          {/* Spacer on small screens */}
          <div className="hidden md:block" />
  
          {/* Button */}
          <div className="flex justify-end">
            <button
              onClick={triggerFileInput}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-semibold text-white shadow-md transition-transform duration-300 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#0E2245] hover:bg-[#091C36] hover:scale-105"
              }`}
            >
              {loading ? "Importing..." : "Import Questions from Excel"}
            </button>
          </div>
  
          {/* Hidden file input */}
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
  
      {/* Table Section */}
      <div className="overflow-x-auto px-10 pb-10">
        <table className="min-w-full text-sm text-left rounded-xl overflow-hidden">
          <thead className="bg-[#0E2245] text-white">
            <tr>
              <th className="px-6 py-3 font-medium">Section</th>
              <th className="px-6 py-3 font-medium">Question</th>
              <th className="px-6 py-3 font-medium">Type</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q, index) => (
              <tr
                key={index}
                className={`transition-colors ${
                  index % 2 === 0 ? "bg-[#1C2B46]" : "bg-[#122035]"
                } hover:bg-[#0A1A2F] text-white`}
              >
                <td className="px-6 py-4">{q.section}</td>
                <td className="px-6 py-4">{q.label}</td>
                <td className="px-6 py-4">{q.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
  );
}
