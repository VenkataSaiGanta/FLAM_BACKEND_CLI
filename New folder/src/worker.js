// import { exec } from "child_process";
// import { loadJobs, saveJobs, updateJob } from "./db.js";
// import { loadConfig } from "./config.js";
// import { sleep } from "./utils.js";

// let stopFlag = false;

// export async function startWorkers(count = 1) {
//   console.log(`🚀 Starting ${count} worker(s)...`);
//   const workers = [];
//   for (let i = 0; i < count; i++) {
//     workers.push(runWorker(i + 1));
//   }

//   process.on("SIGINT", () => {
//     console.log("\n🛑 Stopping workers gracefully...");
//     stopFlag = true;
//   });

//   await Promise.all(workers);
// }

// async function runWorker(workerId) {
//   const config = loadConfig();

//   while (!stopFlag) {
//     const jobs = loadJobs();
//     // pick a pending job only
//     const job = jobs.find((j) => j.state === "pending");

//     // no more jobs — exit
//     if (!job) {
//       console.log(`✅ Worker-${workerId}: No pending jobs left. Exiting.`);
//       break;
//     }

//     // lock the job to prevent duplicate processing by another worker
//     updateJob(job.id, { state: "locked" });

//     console.log(`👷 Worker-${workerId} processing job ${job.id}`);
//     updateJob(job.id, { state: "processing" });

//     const success = await executeCommand(job.command);
//     const updatedJob = loadJobs().find((j) => j.id === job.id);

//     if (success) {
//       updateJob(job.id, { state: "completed" });
//       console.log(`✅ Job ${job.id} completed`);
//     } else {
//       const attempts = updatedJob.attempts + 1;
//       if (attempts >= updatedJob.max_retries) {
//         updateJob(job.id, { state: "dead", attempts });
//         console.log(`💀 Job ${job.id} moved to DLQ`);
//       } else {
//         const delay = Math.pow(config.backoff_base, attempts) * 1000;
//         console.log(`⚠️ Job ${job.id} failed. Retrying in ${delay / 1000}s`);
//         updateJob(job.id, { state: "failed", attempts });
//         setTimeout(() => {
//           updateJob(job.id, { state: "pending" });
//         }, delay);
//       }
//     }

//     // short delay before checking for new jobs again
//     await sleep(500);
//   }

//   console.log(`👋 Worker-${workerId} exiting.`);
// }

// function executeCommand(cmd) {
//   return new Promise((resolve) => {
//     const child = exec(cmd, (error, stdout, stderr) => {
//       if (error) {
//         console.log(`❌ Command failed: ${cmd}`);
//         if (stderr.trim()) console.log(stderr.trim());
//         resolve(false);
//       } else {
//         if (stdout.trim()) console.log(stdout.trim());
//         resolve(true);
//       }
//     });

//     // Optional: stream live output as it happens (useful for long-running jobs)
//     child.stdout?.pipe(process.stdout);
//     child.stderr?.pipe(process.stderr);
//   });
// }



// import { exec } from "child_process";
// import { loadJobs, saveJobs, updateJob } from "./db.js";
// import { loadConfig } from "./config.js";
// import { sleep } from "./utils.js";

// let stopFlag = false;

// export async function startWorkers(count = 1) {
//   console.log(`🚀 Starting ${count} worker(s)...`);
//   const workers = [];
//   for (let i = 0; i < count; i++) {
//     workers.push(runWorker(i + 1));
//   }

//   process.on("SIGINT", () => {
//     console.log("\n🛑 Stopping workers gracefully...");
//     stopFlag = true;
//   });

//   await Promise.all(workers);
// }

// async function runWorker(workerId) {
//   const config = loadConfig();

//   while (!stopFlag) {
//     const jobs = loadJobs();
//     // Pick only pending jobs
//     const job = jobs.find((j) => j.state === "pending");

//     if (!job) {
//       console.log(`✅ Worker-${workerId}: No pending jobs left. Exiting.`);
//       break;
//     }

//     // Lock job to prevent duplicate processing
//     updateJob(job.id, { state: "locked" });
//     console.log(`👷 Worker-${workerId} processing job ${job.id}`);
//     updateJob(job.id, { state: "processing" });

//     const success = await executeCommand(job.command);
//     const updatedJob = loadJobs().find((j) => j.id === job.id);

//     if (success) {
//       updateJob(job.id, { state: "completed" });
//       console.log(`✅ Job ${job.id} completed`);
//     } else {
//       // increment attempt count
//       const attempts = updatedJob.attempts + 1;
//       const maxRetries = updatedJob.max_retries || config.max_retries;

//       if (attempts >= maxRetries) {
//         // move to DLQ
//         updateJob(job.id, { state: "dead", attempts });
//         console.log(`💀 Job ${job.id} moved to DLQ after ${attempts} attempts`);
//       } else {
//         // exponential backoff delay
//         const delay = Math.pow(config.backoff_base, attempts) * 1000;
//         console.log(
//           `⚠️ Job ${job.id} failed (attempt ${attempts}/${maxRetries}). Retrying in ${delay / 1000}s...`
//         );

//         // persist failed attempt before requeue
//         updateJob(job.id, { state: "failed", attempts });

//         setTimeout(() => {
//           const jobsAfterDelay = loadJobs();
//           const jobCheck = jobsAfterDelay.find((j) => j.id === job.id);
//           // only requeue if job is still failed
//           if (jobCheck && jobCheck.state === "failed") {
//             updateJob(job.id, { state: "pending" });
//           }
//         }, delay);
//       }
//     }

//     await sleep(500); // small pause before next job
//   }

//   console.log(`👋 Worker-${workerId} exiting.`);
// }

// function executeCommand(cmd) {
//   return new Promise((resolve) => {
//     const child = exec(cmd, (error, stdout, stderr) => {
//       if (error) {
//         console.log(`❌ Command failed: ${cmd}`);
//         if (stderr.trim()) console.log(stderr.trim());
//         resolve(false);
//       } else {
//         if (stdout.trim()) console.log(stdout.trim());
//         resolve(true);
//       }
//     });

//     // Stream live output for long-running commands
//     child.stdout?.pipe(process.stdout);
//     child.stderr?.pipe(process.stderr);
//   });
// }




import { exec } from "child_process";
import fs from "fs";
import { loadJobs, saveJobs, updateJob } from "./db.js";
import { loadConfig } from "./config.js";
import { sleep } from "./utils.js";

let stopFlag = false;

export async function startWorkers(count = 1) {
  console.log(`🚀 Starting ${count} worker(s)...`);

  // 🔄 Recover any stuck jobs from previous crash
  const jobs = loadJobs();
  let recovered = 0;
  for (const job of jobs) {
    if (job.state === "locked" || job.state === "processing") {
      job.state = "failed";
      job.attempts = (job.attempts || 0) + 1;
      recovered++;
    }
  }
  if (recovered > 0) {
    saveJobs(jobs);
    console.log(`🔄 Recovered ${recovered} stuck jobs (moved to failed).`);
  }

  const workers = [];
  for (let i = 0; i < count; i++) {
    workers.push(runWorker(i + 1));
  }

  process.on("SIGINT", () => {
    console.log("\n🛑 Stopping workers gracefully...");
    stopFlag = true;
  });

  await Promise.all(workers);
}

async function runWorker(workerId) {
  const config = loadConfig();

  while (!stopFlag) {
    const jobs = loadJobs();
    // pick a pending job
    const job = jobs.find((j) => j.state === "pending");

    if (!job) {
      console.log(`✅ Worker-${workerId}: No pending jobs left. Exiting.`);
      break;
    }

    // lock the job
    updateJob(job.id, { state: "locked" });
    console.log(`👷 Worker-${workerId} processing job ${job.id}`);
    updateJob(job.id, { state: "processing" });

    const success = await executeCommand(job);
    const updatedJob = loadJobs().find((j) => j.id === job.id);

    if (success) {
      updateJob(job.id, { state: "completed" });
      console.log(`✅ Job ${job.id} completed`);
    } else {
      const attempts = updatedJob.attempts + 1;
      const maxRetries = updatedJob.max_retries || config.max_retries;

      if (attempts >= maxRetries) {
        updateJob(job.id, { state: "dead", attempts });
        console.log(`💀 Job ${job.id} moved to DLQ after ${attempts} attempts`);
      } else {
        const delay = Math.pow(config.backoff_base, attempts) * 1000;
        console.log(
          `⚠️ Job ${job.id} failed (attempt ${attempts}/${maxRetries}). Retrying in ${delay / 1000}s...`
        );
        updateJob(job.id, { state: "failed", attempts });

        setTimeout(() => {
          const jobsAfterDelay = loadJobs();
          const jobCheck = jobsAfterDelay.find((j) => j.id === job.id);
          if (jobCheck && jobCheck.state === "failed") {
            updateJob(job.id, { state: "pending" });
          }
        }, delay);
      }
    }

    await sleep(500);
  }

  console.log(`👋 Worker-${workerId} exiting.`);
}

function executeCommand(job) {
  const { command: cmd, id } = job;

  return new Promise((resolve) => {
    // ensure logs directory exists
    const logDir = "./logs";
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

    const logFile = `${logDir}/job-${id}.log`;
    fs.appendFileSync(logFile, `\n[${new Date().toISOString()}] START: ${cmd}\n`);

    const child = exec(cmd, { timeout: 10000 }, (error, stdout, stderr) => {
      if (stdout?.trim()) {
        console.log(stdout.trim());
        fs.appendFileSync(logFile, stdout + "\n");
      }

      if (stderr?.trim()) {
        console.error(stderr.trim());
        fs.appendFileSync(logFile, stderr + "\n");
      }

      if (error) {
        if (error.killed) {
          console.log(`⏰ Job ${id} timed out`);
          fs.appendFileSync(logFile, `TIMEOUT: ${cmd}\n`);
        } else {
          console.log(`❌ Command failed: ${cmd}`);
          fs.appendFileSync(logFile, `ERROR: ${error.message}\n`);
        }
        fs.appendFileSync(logFile, `\n[${new Date().toISOString()}] END (FAIL)\n`);
        resolve(false);
      } else {
        fs.appendFileSync(logFile, `\n[${new Date().toISOString()}] END (SUCCESS)\n`);
        resolve(true);
      }
    });

    // stream to console as well
    child.stdout?.pipe(process.stdout);
    child.stderr?.pipe(process.stderr);
  });
}
