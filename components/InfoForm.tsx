"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type Question = {
  id: number;
  section: string;
  subsection?: string;
  type: string;
  label: string;
  options?: { label: string; value: string }[];
  parent_question_id?: number;
  condition_value?: string;
};

export default function DynamicForm() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  // State for collapsed/expanded fieldsets
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase.from("questions").select("*").eq("status", true).order("id");
      if (error) console.error("Error fetching questions:", error.message);
      setQuestions(data || []);
      setLoading(false);
    };
    fetchQuestions();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        [target.name]: target.checked,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [target.name]: target.value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const customerData = {
        companyName: formData.companyName,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactNumber: formData.contactNumber,
      };

      const { data: existingOrganization, error: checkError } = await supabase
        .from("organizations")
        .select("*")
        .eq("contactEmail", customerData.contactEmail)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingOrganization) {
        alert("This contact email already exists. Please use a different email or update the existing entry.");
        setLoading(false);
        return;
      }

      const { data: orgData, error: orgError } = await supabase
        .from("organizations")
        .insert([customerData])
        .select("*")
        .single();
      if (orgError) throw orgError;

      const organization_id = orgData.id;

      const responsePayload = await Promise.all(questions.map(async (question) => {
        let answer = formData[question.id] || "";

        // If it's a file, upload it to Supabase Storage
        if (question.type === "file" && formData[question.id] instanceof File) {
          const file = formData[question.id];
          const { data: fileData, error: fileError } = await supabase
            .storage
            .from("organization_descriptions") // Replace "uploads" with your storage bucket name
            .upload(`files/${organization_id}/${question.id}/${file.name}`, file);

          if (fileError) throw fileError;
          answer = fileData?.path || ""; // Use the file path as the answer
        }

        return {
          organization_id,
          question_id: question.id,
          answer,
        };
      }));

      const { error: responseError } = await supabase.from("responses").insert(responsePayload);
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
    const { id, type, label, options, parent_question_id, condition_value } = question;

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
              value={formData[id] || ""}
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
                  checked={formData[id]?.includes(option.value) || false}
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
          </label>
        );

      default:
        return null;
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, questionId: number) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, questionId: number) => {
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
      <Image alt="logo" src="/netcompany-intrasoft-logo.png" width={200} height={200} className="m-4" />
      <h1 className="text-2xl font-bold text-primary m-4">ERP Discovery Questionnaire</h1>

      <div className="px-8 py-4 max-w-3xl w-full">
        <h3 className="font-bold text-primary">This questionnaire is conducted with the utmost confidentiality, and all responses will be kept strictly confidential.</h3>
      </div>

      {submitted ? (
        <h1 className="text-2xl text-green-600 mb-4 font-semibold">Thank you for submitting!</h1>
      ) : (
        <form className="bg-white shadow-lg p-8 rounded-lg max-w-3xl w-full" onSubmit={handleSubmit} encType="multipart/form-data">

          {/* Customer Information */}
          <fieldset className="mb-6">
            <legend>Customer Information</legend>
            <label className="block mb-4">Company Name:
              <input type="text" name="companyName" className="w-full mt-2 p-2 border rounded" value={formData.companyName || ""} onChange={handleChange} required />
            </label>
            <label className="block mb-4">Contact Name:
              <input type="text" name="contactName" className="w-full mt-2 p-2 border rounded" value={formData.contactName || ""} onChange={handleChange} required />
            </label>
            <label className="block mb-4">Contact Email:
              <input type="email" name="contactEmail" className="w-full mt-2 p-2 border rounded" value={formData.contactEmail || ""} onChange={handleChange} required />
            </label>
            <label className="block mb-4">Contact Number:
              <input type="tel" name="contactNumber" className="w-full mt-2 p-2 border rounded" value={formData.contactNumber || ""} onChange={handleChange} required />
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
                {!collapsedSections[section] && Object.entries(subsections).map(([subsection, questions]) =>
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
                          onClick={() => toggleCollapse(`${section}-${subsection}`)}
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
              className={`${loading ? "bg-primary cursor-not-allowed" : "bg-secondary hover:bg-primary"} text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline`}
              type="submit"
              disabled={loading}
            >
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
