// src/components/common/ApiTest.jsx
import React, { useState } from "react";
import { apiClient } from "../../services/apiClient";
import { getApiBaseUrl } from "../../config/apiConfig";

const ApiTest = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runTests = async () => {
    setLoading(true);
    setTestResults(null);

    const results = {
      apiUrl: getApiBaseUrl(),
      timestamp: new Date().toISOString(),
      tests: [],
    };

    // Test 1: Basic connection
    try {
      console.log("Testing API connection...");
      const connectionTest = await apiClient.testConnection();
      results.tests.push({
        name: "API Connection",
        status: connectionTest.success ? "success" : "failed",
        message: connectionTest.message,
        details: connectionTest.data || connectionTest.error,
      });
    } catch (error) {
      results.tests.push({
        name: "API Connection",
        status: "error",
        message: `Connection error: ${error.message}`,
        details: error,
      });
    }

    // Test 2: Information endpoint
    try {
      console.log("Testing Information endpoint...");
      const infoTest = await apiClient.get("/information.php", {
        action: "suppliers",
        limit: 1,
      });
      results.tests.push({
        name: "Information Endpoint",
        status: "success",
        message: "Information API working",
        details: infoTest,
      });
    } catch (error) {
      results.tests.push({
        name: "Information Endpoint",
        status: "error",
        message: `Information API error: ${error.message}`,
        details: error,
      });
    }

    // Test 3: CORS check
    try {
      console.log("Testing CORS...");
      const corsResponse = await fetch(
        getApiBaseUrl() + "/information.php?action=suppliers&limit=1",
        {
          method: "GET",
          credentials: "include",
        }
      );

      results.tests.push({
        name: "CORS Check",
        status: corsResponse.ok ? "success" : "warning",
        message: corsResponse.ok ? "CORS working" : "CORS might have issues",
        details: {
          status: corsResponse.status,
          headers: Object.fromEntries(corsResponse.headers.entries()),
        },
      });
    } catch (error) {
      results.tests.push({
        name: "CORS Check",
        status: "error",
        message: `CORS error: ${error.message}`,
        details: error,
      });
    }

    setTestResults(results);
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50";
      case "warning":
        return "text-yellow-600 bg-yellow-50";
      case "error":
        return "text-red-600 bg-red-50";
      case "failed":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          API Connection Test
        </h2>
        <button
          onClick={runTests}
          disabled={loading}
          className={`px-4 py-2 rounded-md font-medium ${
            loading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          {loading ? "Testing..." : "Run Tests"}
        </button>
      </div>

      {/* API Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-md">
        <h3 className="font-semibold text-gray-700 mb-2">API Configuration</h3>
        <p className="text-sm text-gray-600">
          <strong>Base URL:</strong> {getApiBaseUrl()}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Environment:</strong>{" "}
          {import.meta.env.PROD ? "Production" : "Development"}
        </p>
      </div>

      {/* Test Results */}
      {testResults && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-800">
              Test Results
            </h3>
            <span className="text-sm text-gray-500">
              {testResults.timestamp}
            </span>
          </div>

          {testResults.tests.map((test, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{test.name}</h4>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    test.status === "success"
                      ? "bg-green-200 text-green-800"
                      : test.status === "warning"
                      ? "bg-yellow-200 text-yellow-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {test.status.toUpperCase()}
                </span>
              </div>

              <p className="text-sm mb-2">{test.message}</p>

              {test.details && (
                <details className="text-xs">
                  <summary className="cursor-pointer font-medium mb-2">
                    Show Details
                  </summary>
                  <pre className="bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Running API tests...</p>
        </div>
      )}
    </div>
  );
};

export default ApiTest;
