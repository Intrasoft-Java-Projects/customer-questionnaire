"use client";
import { useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js"; // For client-side usage

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type Inputs = {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactNumber: string;
  descriptionOrg: File | null;
  general1: string;
  general2: string;
  general3: string;
  general3Input: string;
  general4: string;
  financial1: string;
  financial2: string;
  financial3: string;
  financial4: string;
  financial5: string;
  scm1: string;
  scm2: string;
  scm3: string;
  scm4: string;
  scm5: string;
  hr1: string;
  hr2: string;
  hr3: string;
  hr4: string;
  hr5: string;
  pm1: string;
  pm2: string;
  pm3: string;
  pm4: string;
  rem1: string;
  rem2: string;
  rem3: string;
  rem4: string;
  sidm1: string;
  sidm2: string;
  sidm3: string;
  sidm4: string;
  security1: string;
  security2: string;
  report1: string;
  report2: string;
  report3: string;
  training1: string;
  training2: string;
  training3: string;
  training4: string;
  erp1: string;
  erp1Input: string;
  erp1Select: string;
  erp2: string;
  erp2Input: string;
  erp3: string;
};

export default function InputForm() {
  const [formData, setFormData] = useState<Inputs>({
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactNumber: "",
    descriptionOrg: null,
    general1: "",
    general2: "",
    general3: "",
    general3Input: "",
    general4: "",
    financial1: "",
    financial2: "",
    financial3: "",
    financial4: "",
    financial5: "",
    scm1: "",
    scm2: "",
    scm3: "",
    scm4: "",
    scm5: "",
    hr1: "",
    hr2: "",
    hr3: "",
    hr4: "",
    hr5: "",
    pm1: "",
    pm2: "",
    pm3: "",
    pm4: "",
    rem1: "",
    rem2: "",
    rem3: "",
    rem4: "",
    sidm1: "",
    sidm2: "",
    sidm3: "",
    sidm4: "",
    security1: "",
    security2: "",
    report1: "",
    report2: "",
    report3: "",
    training1: "",
    training2: "",
    training3: "",
    training4: "",
    erp1: "",
    erp1Input: "",
    erp1Select: "",
    erp2: "",
    erp2Input: "",
    erp3: "",
  });

  const [errors, setErrors] = useState<Partial<Inputs>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const tempErrors: Partial<Inputs> = {};
    tempErrors.companyName = formData.companyName ? "" : "Company Name is required.";
    tempErrors.contactName = formData.contactName ? "" : "Contact name is required.";
    tempErrors.contactNumber = formData.contactNumber
      ? /\d{10}/.test(formData.contactNumber)
        ? ""
        : "Phone number is not valid."
      : "Phone number is required.";
    tempErrors.contactEmail = formData.contactEmail
      ? /\S+@\S+\.\S+/.test(formData.contactEmail)
        ? ""
        : "Contact Email is not valid."
      : "Contact Email is required.";
    setErrors(tempErrors);
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { data } = await supabase.auth.signInWithPassword({
      email: "fawazalrefai@hotmail.com", // Replace with actual input
      password: "Liver@1992",   // Replace with actual input
    });

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error retrieving session:", error.message);
    }

    console.log("Session data:", session); // Log session data for debugging

    if (!session) {
      console.error("User is not authenticated.");
      alert("Please log in to submit the form.");
      return;
    }


    if (!validateForm()) return;

    setLoading(true);
    let fileUrl = null;

    // Step 2: Upload file to Supabase storage if a file is selected
    if (formData.descriptionOrg) {
      const file = formData.descriptionOrg;
      const fileName = `${Date.now()}_${file.name}`; // Generate a unique filename

      const { data, error } = await supabase.storage
        .from("organization_descriptions") // replace with your actual bucket name
        .upload(fileName, file);

      if (error) {
        console.error("Error uploading file:", error.message);
        setLoading(false);
        return;
      }

      // Step 3: Get the public URL of the uploaded file using the file path
      const { data: publicUrlData } = supabase.storage
        .from("organization_descriptions")
        .getPublicUrl(data.path);

      fileUrl = publicUrlData?.publicUrl || null; // Safely access publicUrl
    }

    // Step 4: Submit other form data with file URL to Supabase
    const {
      companyName, contactName, contactEmail, contactNumber,
      general1, general2, general3, general3Input, general4,
      financial1, financial2, financial3, financial4, financial5,
      scm1, scm2, scm3, scm4, scm5,
      hr1, hr2, hr3, hr4, hr5,
      pm1, pm2, pm3, pm4,
      rem1, rem2, rem3, rem4,
      sidm1, sidm2, sidm3, sidm4,
      security1, security2,
      report1, report2, report3,
      training1, training2, training3, training4,
      erp1, erp1Input, erp1Select, erp2, erp2Input, erp3
    } = formData;

    const { data: insertData, error: insertError } = await supabase
      .from("company")
      .insert({
        company_name: companyName,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_number: contactNumber,
        description_org: fileUrl, // Store the file URL in the database
        general1,
        general2,
        general3,
        general3_input: general3Input,
        general4,
        financial1,
        financial2,
        financial3,
        financial4,
        financial5,
        scm1, scm2, scm3, scm4, scm5,
        hr1, hr2, hr3, hr4, hr5,
        pm1, pm2, pm3, pm4,
        rem1, rem2, rem3, rem4,
        sidm1, sidm2, sidm3, sidm4,
        security1, security2,
        report1, report2, report3,
        training1, training2, training3, training4,
        erp1, erp1_input: erp1Input, erp1_select: erp1Select, erp2, erp2_input: erp2Input, erp3
      });

    if (insertError) {
      console.error("Error inserting data:", insertError.message);
    } else {
      console.log("Data submitted successfully:", insertData);
    }

    clearForm();
    setLoading(false);
    setSubmitted(true);
  };

  const clearForm = () => {
    setFormData({
      companyName: "",
      contactName: "",
      contactEmail: "",
      contactNumber: "",
      descriptionOrg: null,
      general1: "",
      general2: "",
      general3: "",
      general3Input: "",
      general4: "",
      financial1: "",
      financial2: "",
      financial3: "",
      financial4: "",
      financial5: "",
      scm1: "",
      scm2: "",
      scm3: "",
      scm4: "",
      scm5: "",
      hr1: "",
      hr2: "",
      hr3: "",
      hr4: "",
      hr5: "",
      pm1: "",
      pm2: "",
      pm3: "",
      pm4: "",
      rem1: "",
      rem2: "",
      rem3: "",
      rem4: "",
      sidm1: "",
      sidm2: "",
      sidm3: "",
      sidm4: "",
      security1: "",
      security2: "",
      report1: "",
      report2: "",
      report3: "",
      training1: "",
      training2: "",
      training3: "",
      training4: "",
      erp1: "",
      erp1Input: "",
      erp1Select: "",
      erp2: "",
      erp2Input: "",
      erp3: "",
    });
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "general1" || name === "general2" || name === "general3"
        || name === "financial4" || name === "financial5"
        || name === "scm4" || name === "scm5"
        || name === "hr3" || name === "hr4" || name === "hr5"
        || name === "pm2" || name === "pm3" || name === "pm4"
        || name === "rem1" || name === "rem2" || name === "rem3" || name === "rem4"
        || name === "sidm2"
        || name === "security1" || name === "security2"
        || name === "report2" || name === "report3"
        || name === "training2" || name === "training4"
        || name === "erp1" || name === "erp2"
        ? String(value) : value,
    }));
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === "erp1Select" || name === "erp3"
        ? String(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setFormData((prevData) => ({ ...prevData, descriptionOrg: file }));
  };

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
              <input type="text" name="companyName" className="w-full mt-2 p-2 border rounded" value={formData.companyName} onChange={handleChange} required />
            </label>
            <label className="block mb-4">Contact Name:
              <input type="text" name="contactName" className="w-full mt-2 p-2 border rounded" value={formData.contactName} onChange={handleChange} required />
            </label>
            <label className="block mb-4">Contact Email:
              <input type="email" name="contactEmail" className="w-full mt-2 p-2 border rounded" value={formData.contactEmail} onChange={handleChange} required />
            </label>
            <label className="block mb-4">Contact Number:
              <input type="tel" name="contactNumber" className="w-full mt-2 p-2 border rounded" value={formData.contactNumber} onChange={handleChange} required />
            </label>
          </fieldset>

          <fieldset className="mb-6">
            <legend>{sectionCounter++}. Exploring ERP System Preferences</legend>

            <label className="block mt-4 mb-2">
              - Are you currently using any ERP system?
            </label>
            <div className="flex">
              <div className="flex items-center mr-4">
                <input type="radio" name="erp1" value="Yes" checked={formData.erp1 === "Yes"} onChange={handleChange} />
                <label className="ml-2">Yes</label>
              </div>
              <div className="flex items-center mr-4">
                <input type="radio" name="erp1" value="No" checked={formData.erp1 === "No"} onChange={handleChange} />
                <label className="ml-2">No</label>
              </div>
              <div className="flex items-center mr-4">
                <input type="radio" name="erp1" value="Not Sure" checked={formData.erp1 === "Not Sure"} onChange={handleChange} />
                <label className="ml-2">Not Sure</label>
              </div>
            </div>

            <label htmlFor="erp1Input" className="block mt-2 mb-2">
              If yes, please specify the system and how satisfied are you with your current ERP system?
            </label>
            <div className="grid gap-6 mb-6 md:grid-cols-2">
              <input type="text" name="erp1Input" id="erp1Input" className="w-full p-2 border rounded" value={formData.erp1Input} onChange={handleChange} />
              <select
                name="erp1Select"
                id="erp1Select"
                className="w-full p-2 border rounded"
                value={formData.erp1Select || "No Choose"} // Sets default value
                onChange={handleSelect}
              >
                <option>Choose satisfaction level</option> {/* Disabled default placeholder */}
                <option value="Very Satisfied">Very Satisfied</option>
                <option value="Satisfied">Satisfied</option>
                <option value="Neutral">Neutral</option>
                <option value="Dissatisfied">Dissatisfied</option>
                <option value="Very Dissatisfied">Very Dissatisfied</option>
              </select>
            </div>
            <hr className="mt-5 mb-5" />

            <label className="block mt-4 mb-2">
              - Which ERP system are you considering or would prefer?
            </label>
            <div className="flex">
              <div className="flex items-center mr-4">
                <input type="radio" name="erp2" value="SAP" checked={formData.erp2 === "SAP"} onChange={handleChange} />
                <label className="ml-2">SAP</label>
              </div>
              <div className="flex items-center mr-4">
                <input type="radio" name="erp2" value="Oracle" checked={formData.erp2 === "Oracle"} onChange={handleChange} />
                <label className="ml-2">Oracle</label>
              </div>
              <div className="flex items-center mr-4">
                <input type="radio" name="erp2" value="Undecided" checked={formData.erp2 === "Undecided"} onChange={handleChange} />
                <label className="ml-2">Undecided</label>
              </div>
              <div className="flex items-center mr-4">
                <input type="radio" name="erp2" value="Other" checked={formData.erp2 === "Other"} onChange={handleChange} />
                <label className="ml-2">Other</label>
              </div>
            </div>

            <label htmlFor="erp2Input" className="block mt-2 mb-2">
              If other, please specify:
            </label>
            <input type="text" name="erp2Input" id="erp2Input" className="w-full p-2 border rounded" value={formData.erp2Input} onChange={handleChange} />

            <hr className="mt-5 mb-5" />

            <label htmlFor="erp3" className="block mt-2 mb-2">
              - What is the preferred deployment option?
            </label>
            <select
              name="erp3"
              id="erp3"
              className="w-full p-2 border rounded"
              value={formData.erp3 || "No Choose"} // Sets default value
              onChange={handleSelect}
            >
              <option>Choose preferred deployment option</option> {/* Disabled default placeholder */}
              <option value="Cloud">Cloud</option>
              <option value="On-Premise">On-Premise</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Not Sure">Not Sure</option>
            </select>
          </fieldset>

          <fieldset className="mb-6">
            <legend>{sectionCounter++}. General</legend>

            <label htmlFor="descriptionOrg" className="block mb-2">
              - Please provide minimum one-page high-level description about your organization including; industry, market, core products, and services, illustrating business process the revenue cycle and it related cost per each legal entity if there is more than one legal entity within your organization.
            </label>
            <input
              className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
              id="descriptionOrg"
              name="descriptionOrg"
              type="file"
              onChange={handleFileChange}
            />
            <p className="mt-1 text-sm text-gray-500" id="file_input_help">Note: please any supporting document regarding this point -if any-.</p>

            <hr className="mt-5 mb-5" />

            <label className="block mt-4 mb-2">
              - Is your organization willing to adopt the best business practices offered by the standard tier one ERP applications?
            </label>
            <div className="flex">
              <div className="flex items-center mr-4">
                <input type="radio" name="general1" value="Yes" checked={formData.general1 === "Yes"} onChange={handleChange} />
                <label className="ml-2">Yes</label>
              </div>
              <div className="flex items-center mr-4">
                <input type="radio" name="general1" value="No" checked={formData.general1 === "No"} onChange={handleChange} />
                <label className="ml-2">No</label>
              </div>
              <div className="flex items-center mr-4">
                <input type="radio" name="general1" value="Not Sure" checked={formData.general1 === "Not Sure"} onChange={handleChange} />
                <label className="ml-2">Not Sure</label>
              </div>
            </div>

            <hr className="mt-5 mb-5" />

            <label className="block mt-4 mb-2">
              - Is your organization willing to implement change management for adopting the standard tier one ERP applications?
            </label>
            <div className="flex">
              <div className="flex items-center mr-4">
                <input type="radio" name="general2" value="Yes" checked={formData.general2 === "Yes"} onChange={handleChange} />
                <label className="ml-2">Yes</label>
              </div>
              <div className="flex items-center mr-4">
                <input type="radio" name="general2" value="No" checked={formData.general2 === "No"} onChange={handleChange} />
                <label className="ml-2">No</label>
              </div>
              <div className="flex items-center mr-4">
                <input type="radio" name="general2" value="Not Sure" checked={formData.general2 === "Not Sure"} onChange={handleChange} />
                <label className="ml-2">Not Sure</label>
              </div>
            </div>

            <hr className="mt-5 mb-5" />

            <label className="block mt-4 mb-2">
              - Do you believe your organization has a unique requirement?
            </label>
            <div className="flex">
              <div className="flex items-center mr-4">
                <input type="radio" name="general3" value="Yes" checked={formData.general3 === "Yes"} onChange={handleChange} />
                <label className="ml-2">Yes</label>
              </div>
              <div className="flex items-center mr-4">
                <input type="radio" name="general3" value="No" checked={formData.general3 === "No"} onChange={handleChange} />
                <label className="ml-2">No</label>
              </div>
              <div className="flex items-center mr-4">
                <input type="radio" name="general3" value="Not Sure" checked={formData.general3 === "Not Sure"} onChange={handleChange} />
                <label className="ml-2">Not Sure</label>
              </div>
            </div>

            <label htmlFor="general3Input" className="block mt-2 mb-2">
              If yes, please list it:
            </label>
            <input type="text" name="general3Input" id="general3Input" className="w-full p-2 border rounded" value={formData.general3Input} onChange={handleChange} />

            <hr className="mt-5 mb-5" />

            <label htmlFor="general4" className="block mt-4 mb-2">
              - What is your expectation for the Project plan duration?
            </label>
            <input type="text" name="general4" id="general4" className="w-full p-2 border rounded" placeholder="(e.g., 3-6 months)" value={formData.general4} onChange={handleChange} />

          </fieldset>

          <fieldset className="mb-6">
            <legend>{sectionCounter++}. Financials Module</legend>

            <fieldset className="mb-6">
              <legend className="subLegend">Current Processes and Requirements</legend>

              <label htmlFor="financial1" className="block mt-4 mb-2">
                - What are the current financial reporting requirements and compliance standards that must be adhered to?
              </label>
              <input type="text" name="financial1" id="financial1" className="w-full p-2 border rounded" placeholder="(e.g., governmental or regulatory standards)" value={formData.financial1} onChange={handleChange} />

              <hr className="mt-5 mb-5" />

              <label htmlFor="financial2" className="block mt-4 mb-2">
                - How are budget planning and forecasting managed? Are there specific pain points with budgeting across departments?
              </label>
              <input type="text" name="financial2" id="financial2" className="w-full p-2 border rounded" value={formData.financial2} onChange={handleChange} />

              <hr className="mt-5 mb-5" />

              <label htmlFor="financial3" className="block mt-4 mb-2">
                -	What are the major challenges in managing accounts payable, accounts receivable, Fixed Assets and cash flow tracking?
              </label>
              <input type="text" name="financial3" id="financial3" className="w-full p-2 border rounded" value={formData.financial3} onChange={handleChange} />

            </fieldset>

            <fieldset className="mb-6">
              <legend className="subLegend">Future Needs</legend>

              <label className="block mt-4 mb-2">
                - Are there any anticipated changes in financial regulations that the ERP system needs to accommodate?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="financial4" value="Yes" checked={formData.financial4 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="financial4" value="No" checked={formData.financial4 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="financial4" value="Not Sure" checked={formData.financial4 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

              <hr className="mt-5 mb-5" />

              <label className="block mt-4 mb-2">
                - Does the entity need capabilities for consolidating financial data across departments for unified reporting?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="financial5" value="Yes" checked={formData.financial5 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="financial5" value="No" checked={formData.financial5 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="financial5" value="Not Sure" checked={formData.financial5 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

            </fieldset>
          </fieldset>

          <fieldset className="mb-6">
            <legend>{sectionCounter++}. Supply Chain Management (SCM)</legend>

            <fieldset className="mb-6">
              <legend className="subLegend">Current Operations and Pain Points</legend>

              <label htmlFor="scm1" className="block mt-4 mb-2">
                - What are the entity's main supply chain processes, and are they centralized or managed separately across departments?
              </label>
              <input type="text" name="scm1" id="scm1" className="w-full p-2 border rounded" value={formData.scm1} onChange={handleChange} />

              <hr className="mt-5 mb-5" />

              <label htmlFor="scm2" className="block mt-4 mb-2">
                - How is procurement handled? Are there any challenges with vendor management, sourcing, or contract compliance?
              </label>
              <input type="text" name="scm2" id="scm2" className="w-full p-2 border rounded" value={formData.scm2} onChange={handleChange} />

              <hr className="mt-5 mb-5" />

              <label htmlFor="scm3" className="block mt-4 mb-2">
                - How many warehouses does your organization have?
              </label>
              <input type="text" name="scm3" id="scm3" className="w-full p-2 border rounded" value={formData.scm3} onChange={handleChange} />

            </fieldset>

            <fieldset className="mb-6">
              <legend className="subLegend">Desired Enhancements</legend>

              <label className="block mt-4 mb-2">
                -	Would the entity benefit from demand forecasting and automated procurement workflows?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="scm4" value="Yes" checked={formData.scm4 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="scm4" value="No" checked={formData.scm4 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="scm4" value="Not Sure" checked={formData.scm4 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

              <hr className="mt-5 mb-5" />

              <label className="block mt-4 mb-2">
                -	Is there a need for robust inventory management with tracking capabilities?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="scm5" value="Yes" checked={formData.scm5 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="scm5" value="No" checked={formData.scm5 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="scm5" value="Not Sure" checked={formData.scm5 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

            </fieldset>

          </fieldset>

          <fieldset className="mb-6">
            <legend>{sectionCounter++}. Human Resources (HR)</legend>

            <fieldset className="mb-6">
              <legend className="subLegend">Current System Overview</legend>

              <label htmlFor="hr1" className="block mt-4 mb-2">
                - What HR functions are currently managed manually or through separate systems?
              </label>
              <input type="text" name="hr1" id="hr1" className="w-full p-2 border rounded" placeholder="(e.g., recruitment, payroll, performance management)" value={formData.hr1} onChange={handleChange} />

              <hr className="mt-5 mb-5" />

              <label htmlFor="hr2" className="block mt-4 mb-2">
                - How are employee records, payroll, and benefits administration currently managed?
              </label>
              <input type="text" name="hr2" id="hr2" className="w-full p-2 border rounded" value={formData.hr2} onChange={handleChange} />

              <hr className="mt-5 mb-5" />

              <label className="block mt-4 mb-2">
                -	Are there specific compliance needs for labor laws, reporting, and benefits?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="hr3" value="Yes" checked={formData.hr3 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="hr3" value="No" checked={formData.hr3 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="hr3" value="Not Sure" checked={formData.hr3 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

            </fieldset>

            <fieldset className="mb-6">
              <legend className="subLegend">System Needs</legend>

              <label className="block mt-4 mb-2">
                -	Is the entity looking for comprehensive workforce planning, including recruitment, learning management, and succession planning?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="hr4" value="Yes" checked={formData.hr4 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="hr4" value="No" checked={formData.hr4 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="hr4" value="Not Sure" checked={formData.hr4 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

              <hr className="mt-5 mb-5" />

              <label className="block mt-4 mb-2">
                -	Would the team benefit from enhanced employee self-service features for time and attendance, leave requests, and benefits enrollment?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="hr5" value="Yes" checked={formData.hr5 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="hr5" value="No" checked={formData.hr5 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="hr5" value="Not Sure" checked={formData.hr5 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

            </fieldset>
          </fieldset>

          <fieldset className="mb-6">
            <legend>{sectionCounter++}. Project Management</legend>

            <fieldset className="mb-6">
              <legend className="subLegend">Existing Project Processes</legend>

              <label htmlFor="pm1" className="block mt-4 mb-2">
                - What types of projects does the entity handle, and are they tracked by individual departments or centrally?
              </label>
              <input type="text" name="pm1" id="pm1" className="w-full p-2 border rounded" value={formData.pm1} onChange={handleChange} />

              <hr className="mt-5 mb-5" />

              <label className="block mt-4 mb-2">
                -	Are project budgets, milestones, and resources monitored with current tools? What are the pain points?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="pm2" value="Yes" checked={formData.pm2 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="pm2" value="No" checked={formData.pm2 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="pm2" value="Not Sure" checked={formData.pm2 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

            </fieldset>

            <fieldset className="mb-6">
              <legend className="subLegend">Project Tracking and Reporting Needs</legend>

              <label className="block mt-4 mb-2">
                -	Does the entity require advanced project tracking for milestones, resource allocation, and inter-departmental collaboration?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="pm3" value="Yes" checked={formData.pm3 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="pm3" value="No" checked={formData.pm3 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="pm3" value="Not Sure" checked={formData.pm3 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

              <hr className="mt-5 mb-5" />

              <label className="block mt-4 mb-2">
                -	Would project forecasting and time tracking be helpful for better resource utilization?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="pm4" value="Yes" checked={formData.pm4 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="pm4" value="No" checked={formData.pm4 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="pm4" value="Not Sure" checked={formData.pm4 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

            </fieldset>
          </fieldset>

          <fieldset className="mb-6">
            <legend>{sectionCounter++}. Real Estate Management</legend>

            <fieldset className="mb-6">
              <legend className="subLegend">Current Management of Real Estate Assets</legend>

              <label className="block mt-4 mb-2">
                -	Does the entity own or lease any properties? How are leases, asset maintenance, and compliance managed?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="rem1" value="Yes" checked={formData.rem1 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="rem1" value="No" checked={formData.rem1 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="rem1" value="Not Sure" checked={formData.rem1 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

              <hr className="mt-5 mb-5" />

              <label className="block mt-4 mb-2">
                -	Are there challenges in tracking asset lifecycle, maintenance, or rental payments?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="rem2" value="Yes" checked={formData.rem2 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="rem2" value="No" checked={formData.rem2 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="rem2" value="Not Sure" checked={formData.rem2 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

            </fieldset>

            <fieldset className="mb-6">
              <legend className="subLegend">Future Asset Management Needs</legend>

              <label className="block mt-4 mb-2">
                -	Does the organization need detailed tracking for real estate assets, including depreciation, asset lifecycle, and maintenance scheduling?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="rem3" value="Yes" checked={formData.rem3 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="rem3" value="No" checked={formData.rem3 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="rem3" value="Not Sure" checked={formData.rem3 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

              <hr className="mt-5 mb-5" />

              <label className="block mt-4 mb-2">
                -	Would the team benefit from integration with financial modules for unified tracking of asset-related expenses?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="rem4" value="Yes" checked={formData.rem4 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="rem4" value="No" checked={formData.rem4 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="rem4" value="Not Sure" checked={formData.rem4 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

            </fieldset>
          </fieldset>

          <fieldset className="mb-6">
            <legend>{sectionCounter++}. System Integration and Data Management</legend>

            <fieldset className="mb-6">
              <legend className="subLegend">Existing Data Sources and Systems</legend>

              <label htmlFor="sidm1" className="block mt-4 mb-2">
                - What other systems are currently used within the entity?
              </label>
              <input type="text" name="sidm1" id="sidm1" className="w-full p-2 border rounded" placeholder="(e.g., legacy systems, specialized applications)" value={formData.sidm1} onChange={handleChange} />

              <hr className="mt-5 mb-5" />

              <label className="block mt-4 mb-2">
                -	Are there challenges with data silos, inconsistent data formats, or lack of a centralized data repository?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="sidm2" value="Yes" checked={formData.sidm2 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="sidm2" value="No" checked={formData.sidm2 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="sidm2" value="Not Sure" checked={formData.sidm2 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

            </fieldset>

            <fieldset className="mb-6">
              <legend className="subLegend">Data Governance and Migration</legend>

              <label htmlFor="sidm3" className="block mt-4 mb-2">
                - What data governance standards does the entity follow, and are there specific security or data-sharing requirements?
              </label>
              <input type="text" name="sidm3" id="sidm3" className="w-full p-2 border rounded" value={formData.sidm3} onChange={handleChange} />

              <hr className="mt-5 mb-5" />

              <label htmlFor="sidm4" className="block mt-4 mb-2">
                - What data governance standards does the entity follow, and are there specific security or data-sharing requirements?
              </label>
              <input type="text" name="sidm4" id="sidm4" className="w-full p-2 border rounded" value={formData.sidm4} onChange={handleChange} />
            </fieldset>
          </fieldset>

          <fieldset className="mb-6">
            <legend>{sectionCounter++}. Compliance and Security</legend>

            <fieldset className="mb-6">
              <legend className="subLegend">Regulatory Requirements</legend>

              <label className="block mt-4 mb-2">
                -	Are there specific government or industry standards the ERP system must comply with (e.g., data protection, audit requirements)?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="security1" value="Yes" checked={formData.security1 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="security1" value="No" checked={formData.security1 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="security1" value="Not Sure" checked={formData.security1 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

            </fieldset>

            <fieldset className="mb-6">
              <legend className="subLegend">Data Security Needs</legend>

              <label className="block mt-4 mb-2">
                -	Does the entity have specific cybersecurity protocols and data access policies? How should these be reflected in the ERP system?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="security2" value="Yes" checked={formData.security2 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="security2" value="No" checked={formData.security2 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="security2" value="Not Sure" checked={formData.security2 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

            </fieldset>
          </fieldset>

          <fieldset className="mb-6">
            <legend>{sectionCounter++}. Reporting and Analytics</legend>

            <fieldset className="mb-6">
              <legend className="subLegend">Current Reporting Processes</legend>

              <label htmlFor="report1" className="block mt-4 mb-2">
                - How are reports currently generated, and are there specific data visualization or analytics requirements?
              </label>
              <input type="text" name="report1" id="report1" className="w-full p-2 border rounded" value={formData.report1} onChange={handleChange} />

            </fieldset>

            <fieldset className="mb-6">
              <legend className="subLegend">Analytics and Decision Support</legend>

              <label className="block mt-4 mb-2">
                -	Is there a need for advanced reporting, such as predictive analytics, to support decision-making?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="report2" value="Yes" checked={formData.report2 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="report2" value="No" checked={formData.report2 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="report2" value="Not Sure" checked={formData.report2 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

              <hr className="mt-5 mb-5" />

              <label className="block mt-4 mb-2">
                -	Are there specific reporting formats or dashboards required for different departments?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="report3" value="Yes" checked={formData.report3 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="report3" value="No" checked={formData.report3 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="report3" value="Not Sure" checked={formData.report3 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

            </fieldset>
          </fieldset>

          <fieldset className="mb-6">
            <legend>{sectionCounter++}. Change Management and Training Needs</legend>

            <fieldset className="mb-6">
              <legend className="subLegend">Employee Readiness</legend>

              <label htmlFor="training1" className="block mt-4 mb-2">
                - What is the general skill level of the staff in terms of technology use?
              </label>
              <input type="text" name="training1" id="training1" className="w-full p-2 border rounded" value={formData.training1} onChange={handleChange} />

              <hr className="mt-5 mb-5" />

              <label className="block mt-4 mb-2">
                -	Are there any anticipated challenges with transitioning employees to a new ERP system?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="training2" value="Yes" checked={formData.training2 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="training2" value="No" checked={formData.training2 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="training2" value="Not Sure" checked={formData.training2 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

            </fieldset>

            <fieldset className="mb-6">
              <legend className="subLegend">Training and Support</legend>

              <label htmlFor="training3" className="block mt-4 mb-2">
                - What training delivery methods are preferred?
              </label>
              <input type="text" name="training3" id="training3" className="w-full p-2 border rounded" placeholder="(e.g., on-site, virtual, train-the-trainer)" value={formData.training3} onChange={handleChange} />

              <hr className="mt-5 mb-5" />

              <label className="block mt-4 mb-2">
                -	Are there any anticipated challenges with transitioning employees to a new ERP system?
              </label>
              <div className="flex">
                <div className="flex items-center mr-4">
                  <input type="radio" name="training4" value="Yes" checked={formData.training4 === "Yes"} onChange={handleChange} />
                  <label className="ml-2">Yes</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="training4" value="No" checked={formData.training4 === "No"} onChange={handleChange} />
                  <label className="ml-2">No</label>
                </div>
                <div className="flex items-center mr-4">
                  <input type="radio" name="training4" value="Not Sure" checked={formData.training4 === "Not Sure"} onChange={handleChange} />
                  <label className="ml-2">Not Sure</label>
                </div>
              </div>

            </fieldset>
          </fieldset>

          {/* Submit Button */}
          <div className="flex items-center justify-center">
            <button
              className={`${loading ? "bg-primary cursor-not-allowed" : "bg-secondary hover:bg-primary"
                } text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline`}
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
