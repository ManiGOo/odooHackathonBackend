import Tesseract from "tesseract.js";
import dayjs from "dayjs";
import axios from "axios";

/**
 * processReceipt
 * @param {Buffer} fileBuffer
 * @param {string} baseCurrency
 * @param {string} originalCurrency
 */
export const processReceipt = async (fileBuffer, baseCurrency, originalCurrency) => {
  try {
    const { data } = await Tesseract.recognize(fileBuffer, "eng", {
      logger: (m) => console.log(m),
    });

    const text = data.text;

    const amountMatch = text.match(/\b\d+(?:\.\d{1,2})?\b/);
    const dateMatch = text.match(/\b(0?[1-9]|[12][0-9]|3[01])[\/\-](0?[1-9]|1[012])[\/\-]\d{2,4}\b/);

    const originalAmount = amountMatch ? parseFloat(amountMatch[0]) : 0;
    const expenseDate = dateMatch ? dayjs(dateMatch[0]).toDate() : new Date();

    let exchangeRate = 1;
    if (originalCurrency && originalCurrency !== baseCurrency) {
      const resp = await axios.get(`https://api.exchangerate-api.com/v4/latest/${originalCurrency}`);
      exchangeRate = resp.data.rates[baseCurrency] || 1;
    }

    const amount = originalAmount * exchangeRate;

    return {
      original_amount: originalAmount,
      amount,
      original_currency: originalCurrency || baseCurrency,
      currency: baseCurrency,
      exchange_rate: exchangeRate,
      expense_date: expenseDate,
      raw_text: text,
    };
  } catch (err) {
    console.error("OCR processing error:", err);
    throw new Error("Failed to process receipt");
  }
};
