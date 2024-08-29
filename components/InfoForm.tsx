"use client";
import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { set } from "react-hook-form";

type Inputs = {
  fullName: string;
  phoneNumber: string;
  email?: string;
  bankName?: string;
  position?: string;
};

export default function InputForm() {
  const [formData, setFormData] = useState<Inputs>({
    fullName: "",
    phoneNumber: "",
    email: "",
    bankName: "",
    position: "",
  });
  const [errors, setErrors] = useState<Inputs>({
    fullName: "",
    phoneNumber: "",
    email: "",
    bankName: "",
    position: "",
  });

  const [loading, setLoading] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const tempErrors: Inputs = {
      fullName: "",
      phoneNumber: "",
      email:"",
      bankName:"",
      position:""
    };
    tempErrors.fullName = formData.fullName ? "" : "Full name is required.";
    tempErrors.bankName = formData.bankName ? "" : "Bank name is required.";
    tempErrors.position = formData.position ? "" : "Position is required.";
    tempErrors.phoneNumber = formData.phoneNumber
    
      ? /\d{10}/.test(formData.phoneNumber)
        ? ""
        : "Phone number is not valid."
      : "Phone number is required.";
    tempErrors.email = formData.email
      ? /\S+@\S+\.\S+/.test(formData.email)
        ? ""
        : "Email is not valid."
      : "Email is required.";
    setErrors({ ...tempErrors });
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      const supabase = createClient();
      // Handle form submission here
      const { fullName, phoneNumber, email, bankName, position } = formData;

      const result = await supabase
        .from("customers")
        .insert({ full_name: fullName, phone_number: phoneNumber, email, bank_name: bankName, position });

      console.log(result);

      clearForm();
      setLoading(false);
      setSubmitted(true);
    }
  };

  const clearForm = () => {
    setFormData({ fullName: "", phoneNumber: "", email: "", bankName: "", position: "" });
    setErrors({ fullName: "", phoneNumber: "", email: "", bankName: "", position: "" });
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
              htmlFor="fullName"
              className="block text-primary text-sm font-bold mb-2"
            >
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              className="shadow appearance-none border rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs italic">{errors.fullName}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="phoneNumber"
              className="block text-primary text-sm font-bold mb-2"
            >
              Phone Number
            </label>
            <input
              type="tel"
              name="phoneNumber"
              id="phoneNumber"
              className="shadow appearance-none border rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs italic">
                {errors.phoneNumber}
              </p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-primary text-sm font-bold mb-2"
            >
              Email 
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic">{errors.email}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="bankName"
              className="block text-primary text-sm font-bold mb-2"
            >
              Bank Name 
            </label>
            <input
              type="text"
              name="bankName"
              id="bankName"
              className="shadow appearance-none border rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.bankName}
              onChange={handleChange}
            />
            {errors.bankName && (
              <p className="text-red-500 text-xs italic">{errors.bankName}</p>
            )}
          </div>
          <div className="mb-4">
            <label
              htmlFor="position"
              className="block text-primary text-sm font-bold mb-2"
            >
              Position 
            </label>
            <input
              type="text"
              name="position"
              id="position"
              className="shadow appearance-none border rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.position}
              onChange={handleChange}
            />
            {errors.position && (
              <p className="text-red-500 text-xs italic">{errors.position}</p>
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
