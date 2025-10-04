import axios from "axios";

/**
 * Convert an amount from one currency to another
 * @param {number} amount
 * @param {string} fromCurrency
 * @param {string} toCurrency
 * @returns {number} converted amount
 */
export const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;

  try {
    const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    const rate = res.data.rates[toCurrency];
    if (!rate) throw new Error(`Conversion rate not found for ${toCurrency}`);
    return amount * rate;
  } catch (err) {
    console.error("Currency conversion failed:", err);
    throw new Error("Currency conversion failed");
  }
};

/**
 * Fetch exchange rate between two currencies
 */
export const getExchangeRate = async (fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return 1;

  try {
    const res = await axios.get(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
    const rate = res.data.rates[toCurrency];
    if (!rate) throw new Error(`Rate not found for ${toCurrency}`);
    return rate;
  } catch (err) {
    console.error("Fetching exchange rate failed:", err);
    throw new Error("Failed to get exchange rate");
  }
};
