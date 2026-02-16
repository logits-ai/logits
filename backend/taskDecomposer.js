import fetch from "node-fetch";

const PROMPT = `
Break the task into AT MOST 5 very small steps.
Each step must take less than 2 minutes.
Steps must NOT repeat.
Steps must be concrete and immediately doable.
Return ONLY a numbered list.
`;

export async function generateSteps(task) {
  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemma3:4b",
      prompt: `${PROMPT}\n\nTask: ${task}`,
      stream: false
    }),
  });

  const data = await response.json();

  return cleanSteps(data.response);
}

function cleanSteps(text) {
  return text
    .split("\n")
    .map(line => line.replace(/^\d+\.?\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 5)
    .map(step => step.slice(0, 120)); // safety limit
}



