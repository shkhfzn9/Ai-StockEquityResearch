import React, { useState } from "react";
import { GoogleGenAI } from "@google/genai";
import "./GeminiChat.css";
import { systemPrompt } from "../utils/geminiPrompt";

const GeminiChat = ({ ticker, incomeData, balanceData, cashFlowData }) => {
  const [question, setQuestion] = useState("");
  const [geminiResponse, setGeminiResponse] = useState("");
  const [loading, setLoading] = useState(false);

  // Initialize the GoogleGenAI instance with your API key
  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  });

  const askGemini = async () => {
    if (!question.trim()) return alert("Please enter a question.");

    // Build the context string with financial data
    const context = `
    Ticker: ${ticker}

    Income Statement:
    ${incomeData
      .map(
        (item) => `
      Year: ${item.calendarYear}
      Revenue: ${item.revenue}
      Net Income: ${item.netIncome}
      EBIT: ${item.ebit}
      EBITDA: ${item.ebitda}
      EPS: ${item.eps}
    `
      )
      .join("\n")}

    Balance Sheet:
    ${balanceData
      .map(
        (item) => `
      Year: ${item.calendarYear}
      Assets: ${item.totalAssets}
      Liabilities: ${item.totalLiabilities}
      Equity: ${item.totalStockholdersEquity}
      Total Debt: ${item.totalDebt}
      Cash: ${item.cashAndShortTermInvestments}
      Shares Outstanding: ${item.weightedAverageShsOut}
    `
      )
      .join("\n")}

    Cash Flow Statement:
    ${cashFlowData
      .map(
        (item) => `
      Year: ${item.calendarYear}
      Operating CF: ${item.operatingCashFlow}
      Investing CF: ${item.investmentCashFlow}
      Financing CF: ${item.financingCashFlow}
      Free Cash Flow: ${item.freeCashFlow}
    `
      )
      .join("\n")}

    Question: ${question}
  `;

    // Combine system prompt with context
    const combinedPrompt = `${systemPrompt}\n\n${context}`;

    setLoading(true);

    try {
      // Call Gemini API directly
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: combinedPrompt,
      });

      // Extract the response text
      const text = response.text;
      setGeminiResponse(text);
    } catch (err) {
      console.error("Gemini API error:", err);
      setGeminiResponse(
        "❌ Error calling Gemini API. Please check your API key and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!incomeData?.length) return null;

  return (
    <div className="ai-section">
      <h3>Ask AI stock analyst about: {ticker}</h3>

      <textarea
        rows="4"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="e.g. Explain this company's financial health"
      />

      <button onClick={askGemini} disabled={loading}>
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {geminiResponse && (
        <div className="ai-response">
          <h4>AI Research Assistant:</h4>
          <p>{geminiResponse}</p>
        </div>
      )}
    </div>
  );
};

export default GeminiChat;
