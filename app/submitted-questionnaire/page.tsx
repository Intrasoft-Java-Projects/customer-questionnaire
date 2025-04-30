"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Console } from "console";
import ResizableTable from "@/app/submitted-questionnaire/ResizableTable";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

type UserAnswer = {
  question: string;
  answer: string;
};

interface Question {
  id: number;
  label: string;
  section: string;
  form_id: number;
  responses: ResponseData[];
}

interface ResponseData {
  answer: string;
  organization_id: number;
  organizations: Organization[];
}

interface Organization {
  contactName?: string;
  contactEmail?: string;
  jobTitle?: string;
}
export default function SubmittedQuestionnaire() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // State to store the fetched form IDs and submitted data
  // const [formIds, setFormIds] = useState<number[]>([]);
  const [forms, setForms] = useState<{ formId: any; formName: any }[]>([]);

  // const [users, setUsers] = useState<{ userId: number; username: string }[]>(
  //   []
  // );
  const [userId, setUserId] = useState<string>("");

  const [submittedData, setSubmittedData] = useState<
    {
      id: string;
      contactName: string;
      contactEmail: string;
      jobTitle: string;
    }[]
  >([]);
  const [formId, setFormId] = useState<number | string>("");
  // const [contactInfo, setContactInfo] = useState<
  //   { Contact_Name: string; Contact_Email: string; Job_Title: string }[]
  // >([]);
  const [tableHeaders, setTableHeaders] = useState<string[]>(["User Name"]);
  const [tableData, setTableData] = useState<any[][]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchFormIds = async () => {
      let allData: { id: number; name: string }[] = []; // Explicitly define type
      let hasMoreData = true;
      let offset = 0;
      const limit = 1000; // Fetch 1000 records at a time
      while (hasMoreData) {
        const { data, error } = await supabase
          .from("forms")
          .select("id, name")
          .order("id")
          .range(offset, offset + limit - 1); // Fetch records in chunks of 1000
          console.log(data)
        if (error) {
          console.error("Error fetching form ids: ", error.message);
          break;
        }

        if (data && data.length > 0) {
          allData = allData.concat(data); // Add the fetched data to allData array
          console.log("allData =",allData)
          offset += limit; // Increase the offset for the next batch
        } else {
          hasMoreData = false; // No more data to fetch
        }
      }

      // Remove duplicates by form_id and form_name
      const uniqueForms = Array.from(
        new Map(
          allData.map((item) => [
            `${item.id}-${item.name}`, // Ensure uniqueness by form_id and form_name
            { formId: item.id, formName: item.name },
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

  // useEffect(() => {
  //   const fetchUsers = async () => {
  //     try {
  //       const { data, error } = await supabase
  //         .from("organizations")
  //         .select("id, contactName");
  //       console.log(data);
  //       if (error) {
  //         console.error("Error fetching users:", error.message);
  //         return;
  //       }

  //       // Map the data to match the expected state structure
  //       const formattedUsers =
  //         data?.map((user) => ({
  //           userId: user.id,
  //           username: user.contactName,
  //         })) || [];

  //       // setUsers(formattedUsers);
  //     } catch (err) {
  //       console.error("Unexpected error:", err);
  //     }
  //   };

  //   fetchUsers();
  // }, []);

  useEffect(() => {
    setSubmittedData([]);
    const fetchSubmittedQuestionnaire = async () => {
      try {
        if (!formId || formId === "0") return;

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

  const handleExport = () => {
    if (formId === "0") {
      console.log("export All Froms To Excel");
      exportAllFormsToExcel();
    } else {
      console.log("handle Export To Excel");

      handleExportToExcel();
    }
  };

  const exportAllFormsToExcel = async () => {
    setLoading(true);

    try {
      console.log("🔄 Starting Export for All Forms...");

      // Step 1: Fetch all form IDs with pagination
      const pageSize = 1000;
      let allFormData: { form_id: number }[] = [];
      let from = 0;
      let to = pageSize - 1;
      let hasMoreData = true;

      while (hasMoreData) {
        const { data, error } = await supabase
          .from("questions")
          .select("form_id")
          .neq("form_id", 92) // Exclude form_id = 92
          .not("form_id", "is", null) // Ensure form_id is not null
          .range(from, to);

        if (error) {
          console.error("❌ Error fetching form IDs:", error.message);
          return;
        }

        if (data.length === 0) {
          hasMoreData = false;
        } else {
          allFormData = allFormData.concat(data as { form_id: number }[]);
          from += pageSize;
          to += pageSize;
        }
      }

      // Extract unique form IDs
      const uniqueFormIds: number[] = Array.from(
        new Set(allFormData.map((item) => item.form_id))
      );

      if (uniqueFormIds.length === 0) {
        console.warn("⚠️ No forms found in the questions table.");
        window.alert("⚠️ No forms available for export.");
        return;
      }

      console.log(`📄 Found ${uniqueFormIds.length} unique forms`);

      // Step 2: Create an Excel workbook
      const workbook = XLSX.utils.book_new();

      for (const formId of uniqueFormIds) {
        console.log(`📄 Processing Form ID: ${formId}`);

        // Step 3: Fetch questions and responses for each form_id with pagination
        let allQuestions: Question[] = [];
        let from = 0;
        let to = pageSize - 1;
        let hasMoreQuestions = true;

        while (hasMoreQuestions) {
          const { data, error } = await supabase
            .from("questions")
            .select(
              `
              id, label, section, form_id, responses (
                  answer, organization_id, organizations (
                      contactName, contactEmail, jobTitle
                  )
              )
              `
            )
            .order("id")
            .eq("form_id", formId)
            .range(from, to);

          if (error) {
            console.error(
              `❌ Error fetching data for Form ID ${formId}:`,
              error.message
            );
            continue;
          }

          if (data.length === 0) {
            hasMoreQuestions = false;
          } else {
            allQuestions = allQuestions.concat(data as Question[]);
            from += pageSize;
            to += pageSize;
          }
        }

        if (allQuestions.length === 0) {
          console.warn(
            `⚠️ No data available for Form ID ${formId}. Skipping...`
          );
          continue;
        }

        // Step 4: Organize data into questionMap and userMap
        const questionMap = new Map<string, { label: string; id: number }>();
        const userMap = new Map<string, Record<string, string>>();

        allQuestions.forEach((question: Question) => {
          const questionKey = `${question.section} - ${question.label} - ${question.id}`;
          questionMap.set(questionKey, {
            label: `${question.section} - ${question.label}`,
            id: question.id,
          });

          question.responses.forEach((response: ResponseData) => {
            const organizations = Array.isArray(response.organizations)
              ? response.organizations
              : [response.organizations];

            organizations.forEach((org: Organization) => {
              const rawName = org.contactEmail || "Unknown";
              console.log("name ",rawName)
              const userName = rawName.includes("@") ? rawName.split("@")[0] : rawName;
              if (!userMap.has(userName)) {
                userMap.set(userName, {});
              }

              let answer = response.answer || "[Blank]";

              // Format file answers as clickable links
              if (typeof answer === "string" && answer.startsWith("files/")) {
                const fileUrl = supabase.storage
                  .from("organization_descriptions")
                  .getPublicUrl(answer).data.publicUrl;

                answer = `=HYPERLINK("${fileUrl}", "Download File")`;
              }

              userMap.get(userName)![questionKey] = answer;
            });
          });
        });

        // Step 5: Convert Maps to Array format
        const rowHeaders = Array.from(questionMap.values());
        const columnHeaders = ["User Name", ...Array.from(userMap.keys())];

        const rowData = rowHeaders.map(({ label, id }) => {
          const row = [label];
          columnHeaders.slice(1).forEach((userName) => {
            const userAnswers = userMap.get(userName);
            const questionKey = `${label} - ${id}`;
            const answer = userAnswers ? userAnswers[questionKey] : "[Blank]";
            row.push(answer);
          });
          return row;
        });

        const formattedData = [columnHeaders, ...rowData];

        console.log(`✅ Formatted Data for Form ID ${formId}:`, formattedData);

        if (formattedData.length === 0) {
          console.warn(
            `⚠️ No valid responses found for Form ID ${formId}. Skipping...`
          );
          continue;
        }

        // Step 6: Create an Excel worksheet for this form
        const worksheet = XLSX.utils.aoa_to_sheet(formattedData);

        // Auto adjust column width
        worksheet["!cols"] = formattedData[0].map((_, colIndex) => ({
          wch:
            Math.max(
              ...formattedData.map(
                (row) => (row[colIndex] || "").toString().length
              )
            ) + 2,
        }));

        // Append this sheet to the workbook
        XLSX.utils.book_append_sheet(
          workbook,
          worksheet,
          `Form_${formId}`.substring(0, 31)
        );
      }

      // Step 7: Generate and save the Excel file
      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const dataBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const fileName = `All_Forms_Responses.xlsx`;

      saveAs(dataBlob, fileName);

      console.log("✅ Export Successful! All forms are included.");
    } catch (error) {
      console.error("❌ Unexpected Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportToExcel = async () => {
    setLoading(true);
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
            const rawName = org.contactEmail || "Unknown";
            console.log("name ",rawName)
            const userName = rawName.includes("@") ? rawName.split("@")[0] : rawName;

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
    } finally {
      setLoading(false);
    }
  };

  const getFormId = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const formId = event.target.value; // Get the selected formId (could be empty "")
    setFormId(formId); // Update the state with the formId
    setUserId("");
    setTableHeaders([]);
    setTableData([]);
    console.log("select = ", formId);
  };

  const handleUserChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUserId = e.target.value;
    setUserId(selectedUserId);

    try {
      if (!formId) {
        window.alert("⚠️ Please select a form.");
        return;
      }

      // Fetch data from Supabase
      const { data, error } = await supabase
        .from("questions")
        .select(
          `id, label, section, form_id, responses (
            answer, organization_id, organizations (
              contactName, contactEmail, jobTitle, id
            )
          )`
        )
        .order("id")
        .eq("form_id", formId);

      if (error) {
        console.error("❌ Error fetching data:", error.message);
        return;
      }

      console.log("✅ Fetched Data:", data);

      if (!data || data.length === 0) {
        console.warn("⚠️ No data available.");
        setTableHeaders([]);
        setTableData([]);
        return;
      }

      // Organize data using an object for uniqueness
      const questionList: Array<any> = [];
      const userList: Record<
        string,
        { email: string; name: string; answers: any[] }
      > = {};

      data.forEach((question) => {
        questionList.push(question.label);

        question.responses.forEach((response) => {
          const organizations = Array.isArray(response.organizations)
            ? response.organizations
            : [response.organizations];

          organizations.forEach((org) => {
            if (!org || typeof org !== "object") {
              console.warn("⚠️ Skipping invalid organization object:", org);
              return;
            }

            const orgId = org.id;
            if (selectedUserId !== "0" && orgId !== parseInt(selectedUserId)) {
              return;
            }

            const userEmail =
              org.contactEmail || `unknown_${orgId}@example.com`; // Use email for uniqueness
              const rawName = org.contactEmail || "Unknown";
              console.log("name ",rawName)
              const userName = rawName.includes("@") ? rawName.split("@")[0] : rawName;

            if (!userList[userEmail]) {
              userList[userEmail] = {
                email: userEmail,
                name: userName,
                answers: [],
              };
            }

            let answer = response.answer || "[Blank]";
            if (typeof answer === "string" && answer.startsWith("files/")) {
              const fileUrl = supabase.storage
                .from("organization_descriptions")
                .getPublicUrl(answer).data.publicUrl;

              answer = `<a href="${fileUrl}" download class="text-indigo-600 underline hover:text-indigo-800">
                Download File
              </a>`;
            }

            userList[userEmail].answers.push({
              question: question.label,
              answer,
            });
          });
        });
      });

      console.log("✅ Final userList:", userList);
      console.log("✅ Final questionList:", questionList);

      const userEmails = Object.keys(userList);
      const questionLabels = questionList;

      if (userEmails.length === 0) {
        console.warn("⚠️ No users found.");
        setTableHeaders(["Questions"]);
        setTableData([]);
        return;
      }

      // ✅ Show username in header, but keep email for uniqueness
      const tableHeadersWithNames = [
        "Questions",
        ...userEmails.map((email) => `${userList[email].name}`),
      ];

      setTableHeaders(tableHeadersWithNames);

      const tableRows = questionLabels.map((label) => {
        const row = [label];
        userEmails.forEach((email) => {
          const userEntry = userList[email];
          const userAnswer =
            userEntry?.answers.find(
              (entry: { question: string }) => entry.question === label
            )?.answer || "[Blank]";
          row.push(userAnswer);
        });
        return row;
      });

      setTableData(tableRows);

      console.log("✅ Updated Table Headers:", tableHeadersWithNames);
      console.log("✅ Updated Table Data:", tableRows);
    } catch (error) {
      console.error("❌ Unexpected Error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#E5E7EB] p-4 flex justify-center items-center">
      <div className="w-full max-w-6xl bg-white shadow-2xl rounded-2xl overflow-hidden">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-[#0E2245] text-white p-6 rounded-lg flex items-center space-x-4 shadow-lg">
              <AiOutlineLoading3Quarters className="animate-spin text-4xl" />
              <span className="text-lg font-medium">Exporting Data...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-[#0E2245] text-white text-center p-8 rounded-t-2xl">
          <h1 className="text-5xl font-bold mb-2">Submitted Questionnaires</h1>
          <p className="text-lg opacity-80">View all submitted data</p>
        </div>

        {/* Form Section */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Form Selector */}
            <div className="flex flex-col">
              <label
                htmlFor="formId"
                className="text-[#0E2245] text-sm font-semibold mb-2"
              >
                Select Form
              </label>
              <select
                id="formId"
                value={formId}
                onChange={getFormId}
                className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#0E2245] outline-none"
              >
                <option value="">-- Select Form --</option>
                <option key={0} value={0}>
                  All forms
                </option>
                {forms.map((form) => (
                  <option key={form.formId} value={form.formId}>
                    Form {form.formId} - {form.formName}
                  </option>
                ))}
              </select>
            </div>

            {/* User Selector */}
            <div className="flex flex-col">
              <label
                htmlFor="userId"
                className="text-[#0E2245] text-sm font-semibold mb-2"
              >
                Search by User
              </label>
              <select
                id="userId"
                value={userId}
                onChange={handleUserChange}
                className="p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-[#0E2245] outline-none"
              >
                <option value="">-- Select User --</option>
                <option key={0} value={0}>
                  All Form Users
                </option>
                {submittedData.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.contactEmail}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <div className="flex justify-end items-end">
              <button
                onClick={handleExport}
                disabled={loading}
                className={`px-8 py-3 rounded-lg font-medium text-white transition-all duration-300 ease-in-out shadow-md ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#0E2245] hover:bg-[#091C36] hover:scale-105"
                }`}
              >
                {loading ? "Exporting..." : "Export to Excel"}
              </button>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="p-8 overflow-x-auto">
          <ResizableTable tableHeaders={tableHeaders} tableData={tableData} />
        </div>
      </div>
    </div>
  );
}
