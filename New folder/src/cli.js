// #!/usr/bin/env node
// import { Command } from "commander";
// import fs from "fs";
// import { enqueue, listJobs, status } from "./queue.js";
// import { startWorkers } from "./worker.js";
// import { loadJobs, saveJobs } from "./db.js";
// import { loadConfig, setConfig } from "./config.js";

// const program = new Command();
// program.version("1.0.0").description("QueueCTL - Background Job Queue System");

// program
//   .command("enqueue <jobJson>")
//   .description("Add a new job to the queue")
//   .action((jobJson) => {
//     const job = JSON.parse(jobJson);
//     enqueue(job);
//   });

// program
//   .command("worker <action>")
//   .description("Manage worker processes (start or stop)")
//   .option("--count <n>", "Number of workers", "1")
//   .action(async (action, options) => {
//     if (action === "start") {
//       await startWorkers(parseInt(options.count));
//     } else if (action === "stop") {
//       console.log("🛑 Stopping workers (press Ctrl+C to stop manually)");
//       process.exit(0);
//     } else {
//       console.log("Usage: queuectl worker start --count 2");
//     }
//   });


// program
//   .command("list")
//   .description("List jobs")
//   .option("--state <state>", "Filter by job state")
//   .action((opts) => listJobs(opts.state));

// program
//   .command("status")
//   .description("Show queue summary")
//   .action(() => status());

// program
//   .command("dlq")
//   .description("Manage Dead Letter Queue")
//   .option("list", "List dead jobs")
//   .option("retry <id>", "Retry a dead job")
//   .action((options) => {
//     const jobs = loadJobs();
//     if (options.list) {
//       const dead = jobs.filter((j) => j.state === "dead");
//       console.table(dead, ["id", "command", "attempts"]);
//     } else if (options.retry) {
//       const job = jobs.find((j) => j.id === options.retry);
//       if (!job) return console.log("Job not found");
//       job.state = "pending";
//       job.attempts = 0;
//       saveJobs(jobs);
//       console.log(`🔁 Retried job ${job.id}`);
//     }
//   });

// program
//   .command("config")
//   .description("View or set configuration")
//   .option("set <key> <value>", "Set configuration")
//   .action((key, value) => {
//     if (key === "set") {
//       setConfig(value[0], parseInt(value[1]));
//     } else {
//       console.table(loadConfig());
//     }
//   });

// program.parse(process.argv);




import { Command } from "commander";
import { enqueue, listJobs, status } from "./queue.js";
import { startWorkers } from "./worker.js";
import { loadJobs, saveJobs } from "./db.js";
import { loadConfig, setConfig } from "./config.js";

const program = new Command();
program
  .name("queuectl")
  .description("QueueCTL - Background Job Queue System")
  .version("1.0.0");

//
// ENQUEUE
//
program
  .command("enqueue <jobJson>")
  .description("Add a new job to the queue")
  .action((jobJson) => {
    try {
      const job = JSON.parse(jobJson);
      enqueue(job);
    } catch (err) {
      console.error("❌ Invalid JSON. Example:");
      console.error(`queuectl enqueue '{"id":"job1","command":"echo Hello"}'`);
    }
  });

//
// WORKER
//
const worker = program.command("worker").description("Manage worker processes");

worker
  .command("start")
  .description("Start one or more workers")
  .option("--count <n>", "Number of workers", "1")
  .action(async (opts) => {
    const count = parseInt(opts.count);
    await startWorkers(count);
  });

worker
  .command("stop")
  .description("Stop running workers gracefully")
  .action(() => {
    console.log("🛑 Stopping workers (press Ctrl+C to stop manually)");
    process.exit(0);
  });

//
// LIST
//
program
  .command("list")
  .description("List jobs")
  .option("--state <state>", "Filter by job state")
  .action((opts) => listJobs(opts.state));

//
// STATUS
//
program
  .command("status")
  .description("Show summary of all job states")
  .action(() => status());

//
// DLQ
//
const dlq = program.command("dlq").description("Manage Dead Letter Queue");

dlq
  .command("list")
  .description("List all dead jobs")
  .action(() => {
    const jobs = loadJobs();
    const dead = jobs.filter((j) => j.state === "dead");
    if (dead.length === 0) {
      console.log("✅ No jobs in Dead Letter Queue.");
      return;
    }
    console.table(dead, ["id", "command", "attempts"]);
  });

dlq
  .command("retry <id>")
  .description("Retry a job from the Dead Letter Queue")
  .action((id) => {
    const jobs = loadJobs();
    const job = jobs.find((j) => j.id === id);
    if (!job) return console.log(`❌ Job '${id}' not found.`);
    if (job.state !== "dead") return console.log(`⚠️ Job '${id}' is not in DLQ.`);

    job.state = "pending";
    job.attempts = 0;
    saveJobs(jobs);
    console.log(`🔁 Job '${job.id}' retried and moved to pending queue.`);
  });

//
// CONFIG
//
const config = program.command("config").description("View or set configuration");

config
  .command("get")
  .description("Show current configuration")
  .action(() => {
    console.table(loadConfig());
  });

config
  .command("set <key> <value>")
  .description("Set a configuration value (e.g. max_retries 5)")
  .action((key, value) => {
    setConfig(key, parseInt(value));
    console.log(`⚙️ Config updated: ${key} = ${value}`);
  });

//
// Parse CLI arguments
//
program.parse(process.argv);
