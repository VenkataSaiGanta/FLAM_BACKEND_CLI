import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { loadJobs, saveJobs } from "./db.js";

export function enqueue(jobData) {
  const jobs = loadJobs();
  const job = {
    id: jobData.id || uuidv4(),
    command: jobData.command,
    state: "pending",
    attempts: 0,
    max_retries: jobData.max_retries || 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  jobs.push(job);
  saveJobs(jobs);
  console.log(`✅ Job ${job.id} enqueued`);
}

export function listJobs(state) {
  const jobs = loadJobs();
  const filtered = state ? jobs.filter((j) => j.state === state) : jobs;
  console.table(filtered, ["id", "command", "state", "attempts"]);
}

export function status() {
  const jobs = loadJobs();
  const summary = jobs.reduce(
    (acc, j) => {
      acc[j.state] = (acc[j.state] || 0) + 1;
      return acc;
    },
    {}
  );
  console.log("📊 Job Status:");
  console.table(summary);
}
