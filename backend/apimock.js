import { generateSteps } from "./taskDecomposer.js";

export async function handleTask(task) {
  const steps = await generateSteps(task);

  return {
    steps,
    createdAt: Date.now()
  };
}

// quick test
const res = await handleTask("Clean my room");
console.log(res);
