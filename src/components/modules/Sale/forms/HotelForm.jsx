import React from "react";

const HotelForm = () => {
  return (
    <>
      <div className="bg-blue-500 text-white p-2 rounded-t-md">
        <div className="text-center font-medium">Hotel Booking</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Hotel</label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="Novotel Suvannaphum"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="Twin Room + Triple Room"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Remark</label>
            <textarea className="w-full border rounded-md p-2 h-24"></textarea>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Reference</label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="1234567890"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Night</label>
              <input
                type="number"
                className="w-full border rounded-md p-2"
                placeholder="2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Check In</label>
              <input
                type="text"
                className="w-full border rounded-md p-2"
                placeholder="02 MAR 25"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Check Out</label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="04 MAR 25"
            />
          </div>

          {/* Price Calculation */}
          <div className="mt-4">
            <div className="grid grid-cols-4 gap-4 bg-blue-500 text-white p-2 rounded-t-md text-center">
              <div>Net</div>
              <div>Sale</div>
              <div>Pax</div>
              <div>Total</div>
            </div>

            <div className="grid grid-cols-4 gap-4 p-2 border-b">
              <div className="flex items-center">
                <div className="w-16 text-right mr-2">Adult</div>
                <input
                  type="number"
                  className="flex-1 border rounded-md p-2"
                  placeholder="0.00"
                />
              </div>
              <div>
                <input
                  type="number"
                  className="w-full border rounded-md p-2"
                  placeholder="0.00"
                />
              </div>
              <div>
                <input
                  type="number"
                  className="w-full border rounded-md p-2"
                  placeholder="0"
                />
              </div>
              <div>
                <input
                  type="number"
                  className="w-full border rounded-md p-2"
                  placeholder="0.00"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 p-2 border-b">
              <div className="flex items-center">
                <div className="w-16 text-right mr-2">Child</div>
                <input
                  type="number"
                  className="flex-1 border rounded-md p-2"
                  placeholder="0.00"
                />
              </div>
              <div>
                <input
                  type="number"
                  className="w-full border rounded-md p-2"
                  placeholder="0.00"
                />
              </div>
              <div>
                <input
                  type="number"
                  className="w-full border rounded-md p-2"
                  placeholder="0"
                />
              </div>
              <div>
                <input
                  type="number"
                  className="w-full border rounded-md p-2"
                  placeholder="0.00"
                  disabled
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 p-2 border-b">
              <div className="flex items-center">
                <div className="w-16 text-right mr-2">Infant</div>
                <input
                  type="number"
                  className="flex-1 border rounded-md p-2"
                  placeholder="0.00"
                />
              </div>
              <div>
                <input
                  type="number"
                  className="w-full border rounded-md p-2"
                  placeholder="0.00"
                />
              </div>
              <div>
                <input
                  type="number"
                  className="w-full border rounded-md p-2"
                  placeholder="0"
                />
              </div>
              <div>
                <input
                  type="number"
                  className="w-full border rounded-md p-2"
                  placeholder="0.00"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HotelForm;
