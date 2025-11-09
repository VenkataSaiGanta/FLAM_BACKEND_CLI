# ✅ QueueCTL – Background Job Queue System (Node.js CLI)

QueueCTL is a lightweight, production-ready **background job queue system** supporting:

✅ Multiple workers  
✅ Persistent job storage  
✅ Automatic retries (exponential backoff)  
✅ Dead Letter Queue (DLQ)  
✅ Timeout support  
✅ Graceful shutdown  
✅ Crash recovery for stuck jobs  
✅ Complete CLI interface  

---

# 📁 Project Structure

```
queuectl/
│
├── package.json
├── README.md
├── data/
│   ├── jobs.json
│   └── config.json
│
├── src/
│   ├── cli.js
│   ├── queue.js
│   ├── worker.js
│   ├── db.js
│   ├── config.js
│   ├── utils.js
│
└── test/
    └── test_jobs.sh
```

---

# 🚀 Installation

## ✅ 1. Clone Repository

```bash
git clone https://github.com/<your-username>/queuectl.git
cd queuectl
```

## ✅ 2. Install Dependencies

```bash
npm install
```

## ✅ 3. Fix Windows Line Endings (WSL required)

```bash
sudo apt install dos2unix -y
find . -type f -exec dos2unix {} \;
```

## ✅ 4. Make CLI Executable

```bash
chmod +x src/cli.js
```

## ✅ 5. Link Globally

```bash
sudo npm link
```

Verify installation:

```bash
queuectl --help
which queuectl
```

---

# 📦 CLI Usage

## ✅ Enqueue Jobs

```bash
queuectl enqueue '{"id":"job1","command":"echo Hello QueueCTL"}'
queuectl enqueue '{"id":"job2","command":"sleep 2"}'
queuectl enqueue '{"id":"job3","command":"invalidcmd"}'
```

---

## ✅ List Jobs

```bash
queuectl list
queuectl list --state pending
queuectl list --state completed
queuectl list --state dead
```

---

## ✅ Start Workers

```bash
queuectl worker start --count 3
```

---

# ✅ Dead Letter Queue (DLQ)

### List DLQ

```bash
queuectl dlq list
```

### Retry DLQ Job

```bash
queuectl dlq retry job3
```

---

# ⚙️ Configuration

### Show Current Config

```bash
queuectl config get
```

### Update Config

```bash
queuectl config set max_retries 5
queuectl config set backoff_base 2
queuectl config set timeout 10
```

---

# 🧠 Architecture Overview

## ✅ Job Lifecycle

```
pending → locked → processing → completed
                    ↓
                    failed → pending (after backoff)
                              ↓
                              dead (DLQ)
```

---

## ✅ Worker Engine Features

- Each job runs in its own **child process**
- Retries using **exponential backoff**
- Enforced **per-job timeout**
- Prevents duplicate job processing
- Crash recovery: stuck `processing` jobs become `failed`
- Job persistence stored in `data/jobs.json`

---

# 🧪 Testing Instructions

### ✅ Reset Jobs

```bash
echo "[]" > data/jobs.json
```

### ✅ Enqueue 10 Jobs (example)

```bash
queuectl enqueue '{"id":"job1","command":"echo Hello QueueCTL"}'
queuectl enqueue '{"id":"job2","command":"sleep 2"}'
queuectl enqueue '{"id":"job3","command":"invalidcmd"}'
queuectl enqueue '{"id":"job4","command":"node -v"}'
queuectl enqueue '{"id":"job5","command":"ls ./src"}'
queuectl enqueue '{"id":"job6","command":"cat missingfile.txt"}'
queuectl enqueue '{"id":"job7","command":"echo Processing Done"}'
queuectl enqueue '{"id":"job8","command":"sleep 5"}'
queuectl enqueue '{"id":"job9","command":"idontexist"}'
queuectl enqueue '{"id":"job10","command":"echo Finished OK"}'
```

### ✅ Start Workers

```bash
queuectl worker start --count 3
```

### ✅ Check Status

```bash
queuectl status
queuectl dlq list
```

### ✅ Retry a DLQ Job

```bash
queuectl dlq retry job3
```

---

# ✅ Crash-Recovery Test

Simulate a crash:

```bash
sed -i 's/"state": "completed"/"state": "processing"/' data/jobs.json
```

Restart worker:

```bash
queuectl worker start --count 1
```

Workers will detect stuck jobs and move them to **failed**.

---

# ✅ Assignment Requirements Checklist

✅ Job execution  
✅ Exit-code based failure handling  
✅ Retry + exponential backoff  
✅ DLQ  
✅ Timeout  
✅ Persistent storage  
✅ Worker concurrency  
✅ Crash recovery  
✅ Full CLI interface  
✅ Modular clean code  
✅ Full README  

---

# ✅ Completed!

If you want advanced features like a **web UI**, **priority queues**, or **cron-scheduled jobs**, just tell me! 🚀

