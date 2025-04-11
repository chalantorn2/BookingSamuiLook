import React, { useState } from "react";
import PricingTable from "../common/PricingTable";

const VisaForm = ({ formData, setFormData, pricing, updatePricing }) => {
  const [visaData, setVisaData] = useState({
    description: "",
    date: "",
    reference: "",
    remark: "",
    country: "",
    visaType: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setVisaData({
      ...visaData,
      [name]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <input
              type="text"
              name="description"
              className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Visa Vietnam"
              value={visaData.description}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="text"
              name="date"
              className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="02MAR25"
              value={visaData.date}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Country</label>
            <input
              type="text"
              name="country"
              className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Vietnam"
              value={visaData.country}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Visa Type</label>
            <select
              name="visaType"
              className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              value={visaData.visaType}
              onChange={handleChange}
            >
              <option value="">Select visa type</option>
              <option value="tourist">Tourist</option>
              <option value="business">Business</option>
              <option value="transit">Transit</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Remark</label>
            <textarea
              name="remark"
              className="w-full border border-gray-400 rounded-md p-2 h-24 focus:ring-blue-500 focus:border-blue-500"
              placeholder="รายละเอียดเพิ่มเติม"
              value={visaData.remark}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Reference</label>
            <input
              type="text"
              name="reference"
              className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="2356498721"
              value={visaData.reference}
              onChange={handleChange}
            />
          </div>

          {/* Price Calculation */}
          <div className="mt-6">
            <PricingTable
              pricing={pricing}
              updatePricing={updatePricing}
              config={{
                showHeaders: true,
                showBorder: true,
                showTotal: true,
                enableEdit: true,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisaForm;
