import React, { useState } from "react";
import PricingTable from "../components/PricingTable";

const HotelForm = ({ formData, setFormData, pricing, updatePricing }) => {
  const [hotelData, setHotelData] = useState({
    hotel: "",
    description: "",
    reference: "",
    night: "",
    checkIn: "",
    checkOut: "",
    remark: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHotelData({
      ...hotelData,
      [name]: value,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Hotel</label>
            <input
              type="text"
              name="hotel"
              className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Novotel Suvannaphum"
              value={hotelData.hotel}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <input
              type="text"
              name="description"
              className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Twin Room + Triple Room"
              value={hotelData.description}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Remark</label>
            <textarea
              name="remark"
              className="w-full border border-gray-400 rounded-md p-2 h-24 focus:ring-blue-500 focus:border-blue-500"
              value={hotelData.remark}
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
              placeholder="1234567890"
              value={hotelData.reference}
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Night</label>
              <input
                type="number"
                name="night"
                className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="2"
                value={hotelData.night}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Check In</label>
              <input
                type="text"
                name="checkIn"
                className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="02 MAR 25"
                value={hotelData.checkIn}
                onChange={handleChange}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Check Out
              </label>
              <input
                type="text"
                name="checkOut"
                className="w-full border border-gray-400 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="04 MAR 25"
                value={hotelData.checkOut}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Price Calculation */}
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
  );
};

export default HotelForm;
