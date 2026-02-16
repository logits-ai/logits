# Smart Companion – Task Decomposition Engine

Smart Companion is a backend module that converts vague or overwhelming tasks
into small, concrete, and immediately actionable steps.

The goal is to help users start tasks easily by reducing cognitive load.

## Problem Being Solved

Many users struggle to start tasks not because they are lazy,
but because the task feels too large or unclear.

For example:
"Clean my room" feels overwhelming,
even though it is made of many small actions.

This system breaks such tasks into small micro-steps
that can be completed in under 2 minutes each.

## How the System Works

1. The user provides a high-level task (e.g., "Clean my room")
2. A local AI model generates a structured list of steps
3. Backend logic filters and limits the steps
4. The frontend displays one step at a time to the user

## Backend Contract

### Function
`handleTask(task: string)`

### Input
```json
"Clean my room"

{
  "steps": [
    "Gather all trash from the room into a trash bag.",
    "Collect loose items and place them in a pile.",
    "Make the bed.",
    "Put away items from the pile.",
    "Quickly tidy remaining small items."
  ],
  "createdAt": 1770143339449
}


## Technology Used

- Node.js
- Ollama (local LLM runtime)
- Gemma 3 (4B parameter model)

## Why Local AI?

This project uses a locally running language model instead of a cloud API.

Benefits:
- No API keys required
- No rate limits
- Low latency after warm-up
- Privacy-friendly
- Reliable during demos and hackathons

## Intended User Experience

The frontend is expected to:
- Show only one step at a time
- Allow the user to mark a step as "Done"
- Reveal the next step only after completion

This encourages small wins and reduces overwhelm.
