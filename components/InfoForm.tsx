"use client";
import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { set } from "react-hook-form";

type Inputs = {
  companyName: string;
  companyEmail: string;
};

export default function InputForm() {
  const [formData, setFormData] = useState<Inputs>({
    companyName: "",
    companyEmail: "",
  });
  const [errors, setErrors] = useState<Inputs>({
    companyName: "",
    companyEmail: "",
  });

  const [loading, setLoading] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const tempErrors: Inputs = {
      companyName: "",
      companyEmail: "",
    };
    tempErrors.companyName = formData.companyName ? "" : "Company name is required.";
    tempErrors.companyEmail = formData.companyEmail
      ? /\S+@\S+\.\S+/.test(formData.companyEmail)
        ? ""
        : "Company email is not valid."
      : "Company email is required.";
    setErrors({ ...tempErrors });
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      const supabase = createClient();
      // Handle form submission here
      const { companyName, companyEmail } = formData;

      const result = await supabase
        .from("company")
        .insert({ company_name: companyName, company_email: companyEmail });

      console.log(result);

      clearForm();
      setLoading(false);
      setSubmitted(true);
    }
  };

  const clearForm = () => {
    setFormData({ companyName: "", companyEmail: ""});
    setErrors({  companyName: "", companyEmail: ""});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Image
        alt="logo"
        src="/netcompany-intrasoft-logo.jpg"
        width={300}
        height={200}
        className="mx-auto"
      />
      {submitted ? (
        <h1 className="text-2xl text-primary mb-4"><a target="_blank" href="https://netcompany.com/">Visit Website</a></h1>
      ) : (
        <form className="bg-white py-6 px-3 rounded" onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="companyName"
              className="block text-primary text-sm font-bold mb-2"
            >
              Company Name
            </label>
            <input
              type="text"
              name="companyName"
              id="companyName"
              className="shadow appearance-none border rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.companyName}
              onChange={handleChange}
            />
            {errors.companyName && (
              <p className="text-red-500 text-xs italic">{errors.companyName}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="companyEmail"
              className="block text-primary text-sm font-bold mb-2"
            >
              Company Email 
            </label>
            <input
              type="companyEmail"
              name="companyEmail"
              id="companyEmail"
              className="shadow appearance-none border rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.companyEmail}
              onChange={handleChange}
            />
            {errors.companyEmail && (
              <p className="text-red-500 text-xs italic">{errors.companyEmail}</p>
            )}
          </div>
          <div className="flex items-center justify-center">
            <button
              className={
                loading
                  ? `bg-primary text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline cursor-not-allowed`
                  : `bg-secondary hover:bg-primary text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline`
              }
              type="submit"
            >
              Submit
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
