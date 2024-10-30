"use client";
import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

type Inputs = {
  customerName: string;
  customerEmail: string;
  companyName: string;
  contactNumber: string;
  currentERPUsage: string;
  currentERPSystem?: string;
  currentERPSatisfaction?: string;
  erpPreference: string;
  erpPreferenceOther?: string;
  deploymentPreference: string;
  moduleInterests: string[];
  budgetRange: string;
  implementationTimeline: string;
  keyChallenges?: string;
  trainingExpectations?: string;
  customizationNeeded: string;
  customizationDetails?: string;
  dataMigrationNeeded: string;
  complianceRequirements?: string;
  integrationNeeded: string;
  integrationDetails?: string;
  numberOfEntities: number;
  operatingCountries: string;
  numberOfLocations: number;
  numberOfEmployees: number;
  numberOfBankAccounts: number;
  chartOfAccountsSample?: File | null;
  additionalComments?: string;
};

export default function InputForm() {
  const [formData, setFormData] = useState<Inputs>({
    customerName: "",
    customerEmail: "",
    companyName: "",
    contactNumber: "",
    currentERPUsage: "",
    erpPreference: "",
    deploymentPreference: "",
    moduleInterests: [],
    budgetRange: "",
    implementationTimeline: "",
    customizationNeeded: "",
    dataMigrationNeeded: "",
    integrationNeeded: "",
    numberOfEntities: 0,
    operatingCountries: "",
    numberOfLocations: 0,
    numberOfEmployees: 0,
    numberOfBankAccounts: 0,
    chartOfAccountsSample: null,
  });

  const [errors, setErrors] = useState<Partial<Inputs>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const tempErrors: Partial<Inputs> = {};
    if (!formData.customerName) tempErrors.customerName = "Customer name is required.";
    if (!formData.customerEmail) tempErrors.customerEmail = "Customer email is required.";
    if (!formData.companyName) tempErrors.companyName = "Company name is required.";
    if (!formData.contactNumber) tempErrors.contactNumber = "Contact number is required.";
    if (!formData.budgetRange) tempErrors.budgetRange = "Budget range is required.";
    if (!formData.implementationTimeline) tempErrors.implementationTimeline = "Implementation timeline is required.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    const supabase = createClient();

    // Submit data to Supabase
    const result = await supabase.from("company").insert(formData);
    console.log(result);

    setLoading(false);
    setSubmitted(true);
    clearForm();
  };

  const clearForm = () => {
    setFormData({
      customerName: "",
      customerEmail: "",
      companyName: "",
      contactNumber: "",
      currentERPUsage: "",
      erpPreference: "",
      deploymentPreference: "",
      moduleInterests: [],
      budgetRange: "",
      implementationTimeline: "",
      customizationNeeded: "",
      dataMigrationNeeded: "",
      integrationNeeded: "",
      numberOfEntities: 0,
      operatingCountries: "",
      numberOfLocations: 0,
      numberOfEmployees: 0,
      numberOfBankAccounts: 0,
      chartOfAccountsSample: null,
    });
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    // Handle checkboxes
    if (type === "checkbox") {
      const target = e.target as HTMLInputElement; // Explicitly asserting as HTMLInputElement
      setFormData((prevData) => ({
        ...prevData,
        [name]: target.checked
          ? [...((prevData[name as keyof Inputs] as string[]) || []), value]
          : (prevData[name as keyof Inputs] as string[]).filter((item) => item !== value),
      }));
    }
    // Handle file inputs
    else if (type === "file") {
      const target = e.target as HTMLInputElement; // Explicitly asserting as HTMLInputElement
      setFormData((prevData) => ({
        ...prevData,
        [name]: target.files?.[0] || null,
      }));
    }
    // Handle other input types (text, select, textarea)
    else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50">
      <Image alt="logo" src="/netcompany-intrasoft-logo.jpg" width={200} height={200} className="mb-4" />
      <h1 className="text-2xl font-bold text-primary mb-6">ERP Preference Questionnaire</h1>

      {submitted ? (
        <h1 className="text-2xl text-green-600 mb-4 font-semibold">Thank you for submitting!</h1>
      ) : (
        <form className="bg-white shadow-lg p-8 rounded-lg max-w-3xl w-full" onSubmit={handleSubmit} encType="multipart/form-data">

          {/* Customer Information */}
          <fieldset className="mb-6">
            <legend>Customer Information</legend>
            <label className="block mb-4">Company Name:
              <input type="text" name="companyName" className="w-full mt-2 p-2 border rounded" onChange={handleChange} required />
            </label>
            <label className="block mb-4">Contact Name:
              <input type="text" name="customerName" className="w-full mt-2 p-2 border rounded" onChange={handleChange} required />
            </label>
            <label className="block mb-4">Contact Email:
              <input type="email" name="customerEmail" className="w-full mt-2 p-2 border rounded" onChange={handleChange} required />
            </label>
            <label className="block mb-4">Contact Number:
              <input type="tel" name="contactNumber" className="w-full mt-2 p-2 border rounded" onChange={handleChange} required />
            </label>
          </fieldset>

          {/* 1. General */}
          <fieldset className="mb-6">
            <legend>1. General</legend>


            <div className="mb-4">
              <label
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-justify"
                htmlFor="multiple_files"
              >
                Please provide minimum one-page high-level description about your organization including; industry, market, core products, and services, illustrating business process the revenue cycle and it related cost per each legal entity if there is more than one legal entity within your organization.
              </label>
              <input
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                id="multiple_files"
                type="file"
                multiple
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-300" id="file_input_help">Note: please any supporting document regarding this point -if any-.</p>
            </div>


          </fieldset>

          {/* 2. Which ERP system are you considering or would prefer? */}
          <fieldset className="mb-6">
            <legend>2. Which ERP system are you considering or would prefer?</legend>

            <div className="flex items-center mb-4">
              <input
                id="default-radio-1"
                type="radio"
                value="SAP"
                name="erpPreference"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="default-radio-1"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                SAP
              </label>
            </div>

            <div className="flex items-center mb-4">
              <input
                id="default-radio-2"
                type="radio"
                value="Oracle"
                name="erpPreference"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="default-radio-2"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Oracle
              </label>
            </div>

            <div className="flex items-center mb-4">
              <input
                id="default-radio-3"
                type="radio"
                value="Undecided"
                name="erpPreference"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="default-radio-3"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Undecided
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="default-radio-4"
                type="radio"
                value="Other"
                name="erpPreference"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="default-radio-4"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Other
              </label>
            </div>
            <input type="text" name="erpPreferenceOther" className="w-full mt-2 p-2 border rounded" placeholder="Please specify" />

          </fieldset>

          {/* 3. Preferred Deployment Option: */}
          <fieldset className="mb-6">
            <legend>3. Preferred Deployment Option:</legend>

            <div className="flex items-center mb-4">
              <input
                id="default-radio-1"
                type="radio"
                value="Cloud"
                name="deploymentPreference"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="default-radio-1"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Cloud
              </label>
            </div>

            <div className="flex items-center mb-4">
              <input
                id="default-radio-2"
                type="radio"
                value="On-Premise"
                name="deploymentPreference"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="default-radio-2"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                On-Premise
              </label>
            </div>

            <div className="flex items-center mb-4">
              <input
                id="default-radio-3"
                type="radio"
                value="Hybrid"
                name="deploymentPreference"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="default-radio-3"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Hybrid
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="default-radio-4"
                type="radio"
                value="Not Sure"
                name="deploymentPreference"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="default-radio-4"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Not Sure
              </label>
            </div>

          </fieldset>

          {/* 4. ERP Modules of Interest (Select all that apply): */}
          <fieldset className="mb-6">
            <legend>4. ERP Modules of Interest (Select all that apply):</legend>

            <label></label>

            <div className="flex items-center mb-4">
              <input
                id="default-checkbox"
                type="checkbox"
                value=""
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="default-checkbox"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Default checkbox
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="checked-checkbox"
                type="checkbox"
                value=""
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="checked-checkbox"
                className="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                Checked state
              </label>
            </div>

          </fieldset>


          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-2 px-4 font-semibold rounded text-white transition-all ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'}`}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Questionnaire"}
          </button>
        </form>
      )}
    </div>
  );
}
