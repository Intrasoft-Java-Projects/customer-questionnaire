"use client";
import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { set } from "react-hook-form";

type Inputs = {
  fullName: string;
  phoneNumber: string;
  email?: string;
};

export default function InputForm() {
  const [formData, setFormData] = useState<Inputs>({
    fullName: "",
    phoneNumber: "",
    email: "",
  });
  const [errors, setErrors] = useState<Inputs>({
    fullName: "",
    phoneNumber: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const [submitted, setSubmitted] = useState(false);

  const validateForm = () => {
    const tempErrors: Inputs = {
      fullName: "",
      phoneNumber: "",
    };
    tempErrors.fullName = formData.fullName ? "" : "Full name is required.";
    tempErrors.phoneNumber = formData.phoneNumber
      ? /\d{10}/.test(formData.phoneNumber)
        ? ""
        : "Phone number is not valid."
      : "Phone number is required.";
    tempErrors.email = formData.email
      ? /\S+@\S+\.\S+/.test(formData.email)
        ? ""
        : "Email is not valid."
      : "";
    setErrors({ ...tempErrors });
    return Object.values(tempErrors).every((x) => x === "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      const supabase = createClient();
      // Handle form submission here
      const { fullName, phoneNumber, email } = formData;

      const result = await supabase
        .from("customers")
        .insert({ full_name: fullName, phone_number: phoneNumber, email });

      console.log(result);

      clearForm();
      setLoading(false);
      setSubmitted(true);
    }
  };

  const clearForm = () => {
    setFormData({ fullName: "", phoneNumber: "", email: "" });
    setErrors({ fullName: "", phoneNumber: "", email: "" });
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
        <h1 className="text-4xl font-bold text-primary mb-4">Thank you</h1>
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
              placeholder="John Doe"
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
              placeholder="962123456789"
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
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={formData.email}
              onChange={handleChange}
              placeholder="john.doe@emai.com"
            />
            {errors.email && (
              <p className="text-red-500 text-xs italic">{errors.email}</p>
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
