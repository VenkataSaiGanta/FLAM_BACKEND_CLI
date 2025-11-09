import fs from "fs";
import path from "path";

const dataDir = path.resolve("data");
const jobsFile = path.join(dataDir, "jobs.json");

// Ensure folder + file exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(jobsFile)) fs.writeFileSync(jobsFile, "[]");

export function loadJobs() {
  try {
    const content = fs.readFileSync(jobsFile, "utf-8");
    return content.trim() ? JSON.parse(content) : [];
  } catch (err) {
    console.error("⚠️ Error reading jobs file. Reinitializing...");
    fs.writeFileSync(jobsFile, "[]");
    return [];
  }
}

export function saveJobs(jobs) {
  fs.writeFileSync(jobsFile, JSON.stringify(jobs, null, 2));
}

export function updateJob(id, updates) {
  const jobs = loadJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) return;
  jobs[idx] = { ...jobs[idx], ...updates, updated_at: new Date().toISOString() };
  saveJobs(jobs);
}

export function getJobByState(state) {
  return loadJobs().filter((j) => j.state === state);
}

export function getJob(id) {
  return loadJobs().find((j) => j.id === id);
}
