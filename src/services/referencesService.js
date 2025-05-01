import { supabase } from "./supabase";

export const generateReferenceNumber = async (table, prefix = "FT") => {
  const currentDate = new Date();
  const year = currentDate.getFullYear().toString().slice(-2);
  const month = currentDate.getMonth() + 1;

  // หาเลขล่าสุดจากฐานข้อมูล
  const { data, error } = await supabase
    .from(table)
    .select("reference_number")
    .ilike("reference_number", `${prefix}-${year}-%`)
    .order("reference_number", { ascending: false })
    .limit(1);

  if (error) {
    console.error("Error generating reference number:", error);
    throw error;
  }

  let sequence = 1;
  if (data && data.length > 0) {
    // Extract the last sequence number
    const lastRef = data[0].reference_number;
    const parts = lastRef.split("-");
    if (parts.length >= 4) {
      sequence = parseInt(parts[3], 10) + 1;
    }
  }

  // Format sequence with leading zeros
  const formattedSequence = String(sequence).padStart(4, "0");

  // Generate reference number: FT-YY-M-NNNN
  return `${prefix}-${year}-${month}-${formattedSequence}`;
};

export const formatDate = (date) => {
  if (!date) return "";
  if (typeof date === "string") {
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    date = d;
  }

  const day = date.getDate().toString().padStart(2, "0");
  const month = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ][date.getMonth()];
  const year = date.getFullYear().toString().slice(-2);

  return `${day}${month}${year}`;
};
