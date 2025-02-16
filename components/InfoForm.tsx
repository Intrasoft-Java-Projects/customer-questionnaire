"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { useSearchParams } from "next/navigation"; 
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { data } from "autoprefixer";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type Question = {
  id: number;
  form_id: number;
  section: string;
  subsection?: string;
  type: string;
  label: string;
  options?: { label: string; value: string }[];
  parent_question_id?: number;
  condition_value?: string;
};

export default function DynamicForm() {
  const searchParams = useSearchParams();
  const formId = Number(searchParams.get("formId")); // Read formId from query string

  const [questions, setQuestions] = useState<Question[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // State for collapsed/expanded fieldsets
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    if (!formId) return;

    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("*")
        .eq("form_id", formId) // Fetch questions for the specific form
        .eq("status", true)
        .order("id");
      if (error) console.error("Error fetching questions:", error.message);
      setQuestions(data || []);

      // Initialize all sections as collapsed
      const initialCollapsedState: Record<string, boolean> = {};
      data?.forEach((q) => {
        if (q.section) initialCollapsedState[q.section] = true;
        if (q.subsection)
          initialCollapsedState[`${q.section}-${q.subsection}`] = true;
      });

      setCollapsedSections(initialCollapsedState);
      setLoading(false);
    };
    fetchQuestions();
  }, [formId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const target = e.target;
    const { name, value, type } = target;

    if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: target.checked,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    console.log("Updated formData:", formData);
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const customerData = {
        contactName: formData.contactName,
        jobScope: formData.jobScope,
        jobTitle: formData.jobTitle,
        contactEmail: formData.contactEmail,
      };

      // Check if the organization already exists
      const { data: existingOrganization, error: checkError } = await supabase
        .from("organizations")
        .select("*")
        .eq("contactEmail", customerData.contactEmail)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      let organization_id;

      if (existingOrganization) {
        // Update the existing record
        const { error: updateError } = await supabase
          .from("organizations")
          .update(customerData)
          .eq("contactEmail", customerData.contactEmail);

        if (updateError) throw updateError;

        organization_id = existingOrganization.id;
      } else {
        // Insert new organization
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .insert([customerData])
          .select("*")
          .single();

        if (orgError) throw orgError;

        organization_id = orgData.id;
      }

      // Prepare responses
      const responsePayload = await Promise.all(
        questions.map(async (question) => {
          let answer = formData[question.id] || "";

          // If it's a file, upload it to Supabase Storage
          if (
            question.type === "file" &&
            formData[question.id] instanceof File
          ) {
            const file = formData[question.id];
            const { data: fileData, error: fileError } = await supabase.storage
              .from("organization_descriptions") // Replace "uploads" with your storage bucket name
              .upload(
                `files/${organization_id}/${question.id}/${file.name}`,
                file
              );

            if (fileError) throw fileError;
            answer = fileData?.path || ""; // Use the file path as the answer
          }

          return {
            organization_id,
            question_id: question.id,
            answer,
          };
        })
      );

      // Upsert responses (insert or update)
      const { error: responseError } = await supabase
      .from("responses")
      .upsert(responsePayload, { onConflict: ["organization_id", "question_id"] }); // Ensure these columns have a unique constraint
    
    if (responseError) throw responseError;

      setSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred while submitting the form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderQuestion = (question: Question) => {
    const { id, type, label, options, parent_question_id, condition_value } =
      question;

    // Check if this question is a conditional sub-question and if it should be displayed
    const shouldDisplay =
      !parent_question_id || // Show if it's a parent question
      (parent_question_id && formData[parent_question_id] === condition_value); // Show if condition matches

    if (!shouldDisplay) return null;

    switch (type) {
      case "text":
        return (
          <label key={id} className="block">
            {label}
            <input
              type="text"
              name={String(id)}
              value={formData[id] || ""} // Ensure it updates properly
              onChange={handleChange}
              className="w-full mt-2 p-2 border rounded"
            />
          </label>
        );

      case "radio":
        return (
          <div key={id} className="mb-4">
            <label className="block">{label}</label>
            {options?.map((option) => (
              <label key={option.value} className="mr-4">
                <input
                  type="radio"
                  name={String(id)}
                  value={option.value}
                  checked={formData[id] === option.value}
                  onChange={handleChange}
                  className="mr-2"
                />
                {option.label}
              </label>
            ))}

            {/* Render sub-questions conditionally */}
            {questions
              .filter(
                (subQuestion) =>
                  subQuestion.parent_question_id === id &&
                  formData[id] === subQuestion.condition_value
              )
              .map((subQuestion) => (
                <div className="ml-4 mt-4" key={subQuestion.id}>
                  {renderQuestion(subQuestion)}
                </div>
              ))}
          </div>
        );

      case "select":
        return (
          <div key={id} className="mb-4">
            <label className="block">{label}</label>
            <select
              name={String(id)}
              value={formData[id] || ""}
              onChange={handleChange}
              className="w-full mt-2 p-2 border rounded"
            >
              <option value="">Select an option</option>
              {options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "checkbox":
        return (
          <div key={id} className="mb-4">
            <label className="block">{label}</label>
            {options?.map((option) => (
              <label key={option.value} className="mr-4 flex items-center">
                <input
                  type="checkbox"
                  name={`${id}-${option.value}`}
                  value={option.value}
                  checked={formData[id]?.includes(option.value) || false} // Ensure checkbox stays checked
                  onChange={(e) => handleCheckboxChange(e, id)}
                  className="mr-2"
                />
                {option.label}
              </label>
            ))}
          </div>
        );

      case "file":
        return (
          <label key={id} className="block mb-4">
            {label}
            <input
              type="file"
              name={String(id)}
              onChange={(e) => handleFileChange(e, id)}
              className="w-full mt-2 p-2 border rounded"
            />
            {formData[id] && (
              <p className="text-sm text-gray-600 mt-1">
                Uploaded: {formData[id]?.name || formData[id]}
              </p>
            )}
          </label>
        );

      case "textarea":
        return (
          <label key={id} className="block mb-4">
            {label}
            <textarea
              name={String(id)}
              value={formData[id] || ""}
              onChange={handleChange}
              className="w-full mt-2 p-2 border rounded"
            />
          </label>
        );

      default:
        return null;
    }
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    questionId: number
  ) => {
    const { value, checked } = e.target;

    setFormData((prevData) => {
      const currentValues = prevData[questionId] || [];
      const updatedValues = checked
        ? [...currentValues, value] // add value if checked
        : currentValues.filter((v: string) => v !== value); // remove value if unchecked

      return {
        ...prevData,
        [questionId]: updatedValues,
      };
    });
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    questionId: number
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prevData) => ({
        ...prevData,
        [questionId]: file, // Store the file in formData
      }));
    }
  };

  // Toggle collapse for sections and subsections
  const toggleCollapse = (key: string) => {
    setCollapsedSections((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  const handleSaveProgress = async () => {
    if (!formData.contactEmail) {
      alert("Please enter your email before saving progress.");
      return;
    }

    try {
      const savePayload = Object.entries(formData).map(
        ([questionId, answer]) => ({
          form_id: formId,
          contactEmail: formData.contactEmail,
          question_id: Number(questionId),
          answer: typeof answer === "object" ? JSON.stringify(answer) : answer, // Handle files and arrays
        })
      );

      const { error } = await supabase
        .from("progress")
        .upsert(savePayload, {
          onConflict: ["form_id", "contactEmail", "question_id"],
        });

      if (error) throw error;

      alert("Progress saved successfully!");
    } catch (error) {
      console.error("Error saving progress:", error);
      alert("Failed to save progress. Please try again.");
    }
  };

  const handleSearch = async () => {
    if (!formData.contactEmail) {
      alert("Please enter an email to search.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Get Organization ID based on email
      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("contactEmail", formData.contactEmail)
        .single();

      if (orgError) throw orgError;
      if (!orgData) {
        alert("No organization found for this email.");
        setLoading(false);
        return;
      }

      const organizationId = orgData.id;

      // Step 2: Get responses for the organization
      const { data: responses, error: resError } = await supabase
        .from("responses")
        .select("question_id, answer")
        .eq("organization_id", organizationId);

      if (resError) throw resError;

      if (responses.length === 0) {
        alert("No saved progress found for this email.");
      } else {
        // Step 3: Populate the form with retrieved data
        const savedData: Record<string, any> = {};
        responses.forEach((entry) => {
          savedData[String(entry.question_id)] =
            entry.answer.startsWith("{") || entry.answer.startsWith("[")
              ? JSON.parse(entry.answer) // Handle JSON data
              : entry.answer;
          console.log("Raw responses from Supabase:", responses);
          console.log("Saved Data before setting formData:", savedData);
        });
        setFormData((prevData) => ({
          ...prevData,
          ...savedData, // Updating the retrieved data in formData
        }));
      }
    } catch (error) {
      console.error("Error fetching progress:", error);
      alert("Failed to retrieve saved progress.");
    } finally {
      setLoading(false);
    }
  };

  const groupedQuestions = questions.reduce((acc, question) => {
    const section = question.section || "General";
    const subsection = question.subsection || "No Subsection";
    if (!acc[section]) acc[section] = {};
    if (!acc[section][subsection]) acc[section][subsection] = [];
    acc[section][subsection].push(question);
    return acc;
  }, {} as Record<string, Record<string, Question[]>>);

  let sectionCounter = 1;

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50">
      <Image
        alt="logo"
        src="/netcompany-intrasoft-logo.png"
        width={200}
        height={200}
        className="m-4"
      />
      <h1 className="text-2xl font-bold text-primary m-4">
        ERP Discovery Questionnaire
      </h1>

      <div className="px-8 py-4 max-w-3xl w-full">
        <h3 className="font-bold text-primary">
          This questionnaire is conducted with the utmost confidentiality, and
          all responses will be kept strictly confidential.
        </h3>
      </div>

      {submitted ? (
        <h1 className="text-2xl text-green-600 mb-4 font-semibold">
          Thank you for submitting!
        </h1>
      ) : (
        <form
          className="bg-white shadow-lg p-8 rounded-lg max-w-3xl w-full"
          onSubmit={handleSubmit}
          encType="multipart/form-data"
        >
          {/* Customer Information */}
          <fieldset className="mb-6">
            <legend>Customer Information</legend>
            <label className="block mb-4 relative">
              Contact Email:
              <div className="relative">
                <input
                  type="email"
                  name="contactEmail"
                  className="w-full mt-2 p-2 border rounded pr-10"
                  value={formData.contactEmail || ""}
                  onChange={handleChange}
                  required
                />
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600"
                  onClick={handleSearch}
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                </span>
              </div>
            </label>
            <label className="block mb-4">
              Contact Name:
              <input
                type="text"
                name="contactName"
                className="w-full mt-2 p-2 border rounded"
                value={formData.contactName || ""}
                onChange={handleChange}
                required
              />
            </label>
            <label className="block mb-4">
              Job Title:
              <input
                type="text"
                name="jobTitle"
                className="w-full mt-2 p-2 border rounded"
                value={formData.jobTitle || ""}
                onChange={handleChange}
                required
              />
            </label>
            <label className="block mb-4">
              Job Scope (i.e., Vehicles, Spares, Service, Other OEM (Zeekr,
              Smart, Chery)):
              <input
                type="tel"
                name="jobScope"
                className="w-full mt-2 p-2 border rounded"
                value={formData.jobScope || ""}
                onChange={handleChange}
                required
              />
            </label>
          </fieldset>

          {/* Dynamic Questions */}
          {loading ? (
            <p>Loading...</p>
          ) : (
            Object.entries(groupedQuestions).map(([section, subsections]) => (
              <fieldset key={section} className="mb-6">
                <legend className="font-bold">
                  <button
                    type="button"
                    onClick={() => toggleCollapse(section)}
                    className="text-left w-full"
                  >
                    {sectionCounter++}. {section}
                  </button>
                </legend>
                {!collapsedSections[section] &&
                  Object.entries(subsections).map(([subsection, questions]) =>
                    subsection === "No Subsection" ? (
                      questions
                        .filter((question) => !question.parent_question_id)
                        .map((question) => (
                          <div key={question.id}>
                            {renderQuestion(question)}
                          </div>
                        ))
                    ) : (
                      <fieldset key={subsection} className="mb-6">
                        <legend className="subLegend">
                          <button
                            type="button"
                            onClick={() =>
                              toggleCollapse(`${section}-${subsection}`)
                            }
                            className="text-left w-full"
                          >
                            {subsection}
                          </button>
                        </legend>
                        {!collapsedSections[`${section}-${subsection}`] &&
                          questions
                            .filter((question) => !question.parent_question_id)
                            .map((question) => renderQuestion(question))}
                      </fieldset>
                    )
                  )}
              </fieldset>
            ))
          )}

          <div className="flex items-center justify-center">
            <button
              className={`${
                loading
                  ? "bg-primary cursor-not-allowed"
                  : "bg-secondary hover:bg-primary"
              } text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline`}
              type="submit"
              disabled={loading}
            >
              Submit
            </button>
          </div>
        </form>
      )}
      <button
        onClick={handleSubmit}
        className="fixed bottom-8 right-8 bg-blue-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
      >
        Save Progress
      </button>
    </div>
  );
}
