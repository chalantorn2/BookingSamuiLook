import React from "react";

const OtherServiceForm = () => {
  return (
    <>
      <div className="bg-blue-500 text-white p-2 rounded-t-md">
        <div className="text-center font-medium">Other</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <input
              type="text"
              className="w-full border rounded-md p-2"
              placeholder="PG Resident Card"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="text" className="w-full border rounded-md p-2" />
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
              placeholder="32164598"
            />
          </div>

          {/* Price Calculation */}
          <div className="mt-8">
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

export default OtherServiceForm;
