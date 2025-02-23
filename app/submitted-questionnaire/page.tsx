"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Console } from "console";

interface FormattedData {
  Section: any;
  Question: any;
  Answer: any;
  Contact_Name: any;
  Contact_Email: any;
}

export default function SubmittedQuestionnaire() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // State to store the fetched form IDs and submitted data
  const [formIds, setFormIds] = useState<number[]>([]);
  const [forms, setForms] = useState<{ formId: any; formName: any }[]>([]);

  const [submittedData, setSubmittedData] = useState<
    { contactName: string; contactEmail: string; jobTitle: string }[]
  >([]);
  const [formId, setFormId] = useState<number | string>("");
  const [contactInfo, setContactInfo] = useState<
    { Contact_Name: string; Contact_Email: string; Job_Title: string }[]
  >([]);

  useEffect(() => {
    const fetchFormIds = async () => {
      let allData: { form_id: number; form_name: string }[] = []; // Explicitly define type
      let hasMoreData = true;
      let offset = 0;
      const limit = 1000; // Fetch 1000 records at a time
  
      while (hasMoreData) {
        const { data, error } = await supabase
          .from("questions")
          .select("form_id, form_name")
          .order("id")
          .range(offset, offset + limit - 1); // Fetch records in chunks of 1000
  
        if (error) {
          console.error("Error fetching form ids: ", error.message);
          break;
        }
  
        if (data && data.length > 0) {
          allData = allData.concat(data); // Add the fetched data to allData array
          offset += limit; // Increase the offset for the next batch
        } else {
          hasMoreData = false; // No more data to fetch
        }
      }
  
      // Remove duplicates by form_id and form_name
      const uniqueForms = Array.from(
        new Map(
          allData.map((item) => [
            `${item.form_id}-${item.form_name}`, // Ensure uniqueness by form_id and form_name
            { formId: item.form_id, formName: item.form_name },
          ])
        ).values()
      );
  
      // Sort the forms by form_id (ascending)
      const sortedForms = uniqueForms.sort((a, b) => a.formId - b.formId);
  
      // Set the sorted and unique forms
      setForms(sortedForms);
    };
  
    fetchFormIds();
  }, []);    
  

  useEffect(() => {
    setSubmittedData([]);
    const fetchSubmittedQuestionnaire = async () => {
      try {
        if (!formId) return;

        if (formId == 0) {
          const { data, error } = await supabase.from("questions").select(
            `
              responses (
                organization_id,
                organizations (
                  id,
                  contactName,
                  contactEmail,
                  jobTitle
                )
              )
            `
          );
          console.log(`Fetching submitted users for Form ID: ${formId}`);

          // Fetch users who submitted responses for the selected form

          if (error) {
            throw new Error(error.message);
          }

          console.log("✅ Raw Data:", data);

          // Extract unique users from responses
          const users = data.flatMap((question) =>
            question.responses.flatMap(
              (response) => response.organizations || []
            )
          );

          // Remove duplicate users based on organization_id
          const uniqueUsers = Array.from(
            new Map(users.map((user) => [user.id, user])).values()
          );

          console.log("✅ Unique Users:", uniqueUsers);

          setSubmittedData(uniqueUsers);
        } else {
          const { data, error } = await supabase
            .from("questions")
            .select(
              `
              responses (
                organization_id,
                organizations (
                  id,
                  contactName,
                  contactEmail,
                  jobTitle
                )
              )
            `
            )
            .eq("form_id", formId);
          console.log(`Fetching submitted users for Form ID: ${formId}`);

          // Fetch users who submitted responses for the selected form

          if (error) {
            throw new Error(error.message);
          }

          console.log("✅ Raw Data:", data);

          // Extract unique users from responses
          const users = data.flatMap((question) =>
            question.responses.flatMap(
              (response) => response.organizations || []
            )
          );

          // Remove duplicate users based on organization_id
          const uniqueUsers = Array.from(
            new Map(users.map((user) => [user.id, user])).values()
          );

          console.log("✅ Unique Users:", uniqueUsers);

          setSubmittedData(uniqueUsers);
        }
      } catch (error) {
        console.error("❌ Error fetching submitted users:", error);
      }
    };

    fetchSubmittedQuestionnaire();
  }, [formId]);

  const handleExportToExcel = async () => {
    try {
      console.log("🔄 Starting Export...");
      if (!formId) {
        window.alert("⚠️ Please select a form.");
        return;
      }

      // Fetch data from Supabase
      const { data, error } = await supabase
        .from("questions")
        .select(
          `
                id, label, section, responses (
                    answer, organization_id, organizations (
                        contactName, contactEmail, jobTitle
                    )
                )
            `
        )
        .order("id")
        .eq("form_id", formId);

      if (error) {
        console.error("❌ Error fetching data:", error.message);
        return;
      }

      console.log("✅ Fetched Data:", data);

      if (!data || data.length === 0) {
        console.warn("⚠️ No data available for export.");
        return;
      }

      // Step 1: Organize data into questionMap and userMap
      const questionMap = new Map();
      const userMap = new Map();

      data.forEach((question) => {
        // Ensure uniqueness using section, label, and question ID
        const questionKey = `${question.section} - ${question.label} - ${question.id}`;
        questionMap.set(questionKey, {
          label: `${question.section} - ${question.label}`,
          id: question.id,
        }); // Store the label and id

        question.responses.forEach((response) => {
          const organizations = Array.isArray(response.organizations)
            ? response.organizations
            : [response.organizations];

          organizations.forEach((org) => {
            const userName = org.contactName || "Unknown";

            // Initialize user data if not already created
            if (!userMap.has(userName)) {
              userMap.set(userName, {});
            }

            // Handle file path answers
            let answer = response.answer || "[Blank]";
            if (answer.startsWith("files/")) {
              const fileUrl = supabase.storage
                .from("organization_descriptions")
                .getPublicUrl(answer).data.publicUrl;

              answer = {
                t: "s",
                v: "Download File",
                l: { Target: fileUrl },
              };
            }

            // Store the answer for the current user and question
            userMap.get(userName)[questionKey] = answer;
          });
        });
      });

      // Step 2: Convert Maps to Array format
      const rowHeaders = Array.from(questionMap.values()); // Questions as rows
      const columnHeaders = ["User Name", ...Array.from(userMap.keys())]; // User names as columns

      // For each question, we will create a row with answers for each user
      const rowData = rowHeaders.map(({ label, id }) => {
        const row = [label]; // Start with the question label
        // Add the answer for each user (or [Blank] if not found)
        columnHeaders.slice(1).forEach((userName) => {
          const userAnswers = userMap.get(userName);
          const questionKey = `${label} - ${id}`; // Reconstruct the question key
          const answer = userAnswers ? userAnswers[questionKey] : "[Blank]";
          row.push(answer);
        });
        return row;
      });

      // Combine headers and data into final formatted data
      const formattedData = [columnHeaders, ...rowData];

      console.log("✅ Formatted Data:", formattedData);

      if (formattedData.length === 0) {
        console.warn("⚠️ No valid responses found.");
        window.alert("⚠️ No data available for export.");
        return;
      }

      // Step 3: Create an Excel worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(formattedData);

      // Auto adjust column width
      const colWidths = formattedData[0].map((_, colIndex) => ({
        wch:
          Math.max(
            ...formattedData.map(
              (row) => (row[colIndex] || "").toString().length
            )
          ) + 2, // Padding
      }));

      worksheet["!cols"] = colWidths;

      // Create a workbook and append the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Responses");

      // Generate and save the Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const dataBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `Form_${formId}_Responses.xlsx`;

      // Create a download link
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log("✅ Export Successful! File Ready for Download.");
    } catch (error) {
      console.error("❌ Unexpected Error:", error);
    }
  };

  const getFormId = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const formId = event.target.value; // Get the selected formId (could be empty "")
    setFormId(formId); // Update the state with the formId
    console.log("select = ", formId);
  };

  //   const handleRowClick = (email: string) => {
  //     window.location.href = `/another-page?email=${encodeURIComponent(email)}`;
  //   };

  //   const handleSearch = async () => {
  //     console.log("🔄 Starting Search...");

  //     if (!formId) {
  //       window.alert("⚠️ Please select a form.");
  //       return;
  //     }

  //     try {
  //       const { data, error } = await supabase
  //         .from("questions")
  //         .select(
  //           `id,
  //         label,
  //         section,
  //         responses (
  //           responses_id,
  //           answer,
  //           organization_id,
  //           organizations (
  //             id,
  //             contactName,
  //             contactEmail,
  //             jobTitle
  //           )
  //         )`
  //         )
  //         .eq("form_id", formId);

  //       if (error) {
  //         console.error("❌ Error fetching data:", error.message);
  //         return;
  //       }

  //       console.log("✅ Fetched Data:", data);

  //       if (!data || data.length === 0) {
  //         console.warn("⚠️ No data found.");
  //         return;
  //       }

  //       // Extracting contact information from the responses
  //       const contactInfo = data.flatMap((question) =>
  //         question.responses.flatMap(
  //           (response) =>
  //             response.organizations?.map((org) => ({
  //               Contact_Name: org.contactName,
  //               Contact_Email: org.contactEmail,
  //               Job_Title: org.jobTitle,
  //             })) || []
  //         )
  //       );
  //       // Update the global contactInfo state
  //       setContactInfo(contactInfo);
  //       console.log("✅ Contact Information:", contactInfo);

  //       // Now, you can use `contactInfo` as needed, for example:
  //       // setContactData(contactInfo);  // Or handle it as required
  //     } catch (error) {
  //       console.error("❌ Unexpected Error:", error);
  //     }
  //   };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-r from-indigo-600 to-purple-600">
      <div className="max-w-4xl w-full mx-auto bg-white p-10 rounded-xl shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-indigo-600 mb-6">
          Submitted Questionnaires
        </h1>
        <p className="text-lg text-center text-gray-600 mb-8">
          Here you can view the submitted questionnaires.
        </p>

        {/* Form Section: Dropdown and Search Button */}
        <div className="flex justify-between mb-6">
          <div className="flex items-center">
            <label htmlFor="formId" className="mr-4 text-gray-600">
              Select Form
            </label>
            <select
              id="formId"
              value={formId}
              onChange={getFormId}
              className="p-2 border border-gray-300 rounded"
            >
              <option key="" value="">
                -- Select Form --
              </option>
              {/* <option key={0} value={0}>
                All forms
              </option> */}
              {forms.map((form) => (
                <option key={form.formId} value={form.formId}>
                  Form {form.formId} - {form.formName}
                </option>
              ))}
            </select>
          </div>

          {/* <button
            onClick={handleSearch}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Search
          </button> */}
          <button
            onClick={handleExportToExcel}
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Export to excel
          </button>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-indigo-600 text-white text-left text-sm font-medium">
                  Contact Name
                </th>
                <th className="px-6 py-3 bg-indigo-600 text-white text-left text-sm font-medium">
                  Contact Email
                </th>
                <th className="px-6 py-3 bg-indigo-600 text-white text-left text-sm font-medium">
                  Job Title
                </th>
              </tr>
            </thead>
            <tbody>
              {submittedData.length > 0 ? (
                submittedData.map((data, index) => (
                  <tr
                    key={index}
                    className="border-t border-gray-300 cursor-pointer"
                    // onClick={() => handleRowClick(data.contactEmail)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {data.contactName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {data.contactEmail}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {data.jobTitle}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-4 text-sm text-gray-800 text-center"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
