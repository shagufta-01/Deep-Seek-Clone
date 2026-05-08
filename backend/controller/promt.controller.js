import { GoogleGenerativeAI } from "@google/generative-ai";
import { Promt } from "../model/promt.model.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const sendPromt = async (req, res) => {
  const { content } = req.body;
  const userId = req.userId;

  if (!content || content.trim() === "") {
    return res.status(400).json({
      error: "Prompt content is required",
    });
  }

  try {
    // Save user prompt
    await Promt.create({
      userId,
      role: "user",
      content,
    });

    // Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    // Send to Gemini
    const result = await model.generateContent(content);

    const aiContent = result.response.text();

    // Save AI response
    await Promt.create({
      userId,
      role: "assistant",
      content: aiContent,
    });

    return res.status(200).json({
      reply: aiContent,
    });

  } catch (error) {
    console.log("Error in Prompt:", error);

    return res.status(500).json({
      error: "Something went wrong with the AI response",
    });
  }
};