import React, { useState } from "react";
import PricingTable from "../../common/PricingTable";
const OtherServiceForm = ({
  formData,
  setFormData,
  pricing,
  updatePricing,
}) => {
  const [otherData, setOtherData] = useState({
    description: "",
    date: "",
    reference: "",
    remark: "",
    serviceType: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setOtherData({
      ...otherData,
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
              placeholder="PG Resident Card"
              value={otherData.description}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="text"
              name="date"
              className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="DD/MM/YYYY"
              value={otherData.date}
              onChange={handleChange}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Remark</label>
            <textarea
              name="remark"
              className="w-full border border-gray-400 rounded-md p-2 h-24 focus:ring-blue-500 focus:border-blue-500"
              placeholder="รายละเอียดเพิ่มเติม"
              value={otherData.remark}
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
              placeholder="32164598"
              value={otherData.reference}
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

export default OtherServiceForm;
