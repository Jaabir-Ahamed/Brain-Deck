# 🔍 How to Test if Ollama is Analyzing Your PDF

## Current Status

✅ **Ollama IS Running and Processing!**
- Ollama server: Running (process 955)
- Ollama runner: **Active at 30.9% CPU** (process 4342) ← This means it's working!
- API: Responding (v0.12.10)

## Why "Address Already in Use" is GOOD News

When you see:
```
Error: listen tcp 127.0.0.1:11434: bind: address already in use
```

This means Ollama is **already running**! You don't need to start it again. ✅

## How to Monitor Your Upload Progress

### Method 1: Browser DevTools (Easiest)

1. **Open DevTools** in your browser:
   - Press `F12` or `Cmd+Option+I` (Mac)

2. **Go to Console tab**

3. **Paste this code** and press Enter:
   ```javascript
   // Get upload ID from your recent uploads
   const store = JSON.parse(localStorage.getItem('app-store') || '{}')
   const uploadId = store.state?.uploads?.[0]?.id
   
   console.log('Upload ID:', uploadId)
   
   // Check status
   if (uploadId) {
     fetch(`/api/generate/status?uploadId=${uploadId}`)
       .then(r => r.json())
       .then(data => {
         console.log('📊 Status:', data)
         if (data.durationMinutes) {
           console.log(`⏱️  Running for: ${data.durationMinutes} minutes`)
         }
         console.log(`📄 Cards created so far: ${data.cardsCreated}`)
       })
   }
   ```

4. **Repeat every 30 seconds** to see progress

### Method 2: Terminal Monitor (Real-time)

I've created a status checker for you:

```bash
cd /Users/jaabirsaleem/Desktop/Brain-Deck/braindeck

# First, get your upload ID from the browser console method above
# Then run:
./monitor.sh YOUR_UPLOAD_ID_HERE
```

This will refresh every 3 seconds showing:
- Current status (processing/done/error)
- Duration
- Number of cards created
- Any errors

### Method 3: Quick Manual Check

```bash
# Check if Ollama is responding
curl http://localhost:11434/api/version

# Check if it's processing (look for high CPU %)
ps aux | grep ollama

# If CPU is high (>20%), it's actively working!
```

## Typical Processing Times

| PDF Size | Pages | Expected Time |
|----------|-------|---------------|
| Small    | 1-5   | 30 seconds - 2 minutes |
| Medium   | 5-20  | 2-5 minutes |
| Large    | 20+   | 5-15 minutes |

**Your PDF**: Red-black Trees 1.pdf
- Size: 0.92MB
- Pages: 0 (might be scanned/image-based)
- Expected: 1-5 minutes

## Signs That It's Working

✅ **Good Signs:**
- Ollama process shows **high CPU** (20-90%) ← You have this!
- Upload status shows "Processing"
- No error messages in console
- Dev server is running without errors

❌ **Problem Signs:**
- Status stuck at "Processing" for >15 minutes
- CPU usage drops to 0%
- Error messages in console
- Status shows "error"

## What To Do If It's Stuck

### 1. Check for Errors

```bash
# Check dev server terminal for errors
# Look for lines with "Error:" or "Failed:"
```

### 2. Check Upload Status Directly

Open browser console and run:
```javascript
fetch('/api/uploads?userId=YOUR_USER_ID')
  .then(r => r.json())
  .then(console.log)
```

### 3. Run Diagnostics

```bash
cd /Users/jaabirsaleem/Desktop/Brain-Deck/braindeck

# Get the upload ID from browser, then:
curl -X POST http://localhost:3000/api/generate/diagnose \
  -H "Content-Type: application/json" \
  -d '{"uploadId":"YOUR_UPLOAD_ID","preferVL":false}' | python3 -m json.tool
```

This will show:
- ✅ PDF parsed successfully?
- ✅ How many pages/characters extracted?
- ✅ AI model responding?
- ✅ Sample output validation

### 4. If Truly Stuck (>15 minutes)

1. **Delete the stuck upload** (click trash icon)
2. **Restart Ollama**:
   ```bash
   pkill -9 ollama
   sleep 2
   ollama serve > /tmp/ollama.log 2>&1 &
   ```
3. **Re-upload your PDF**

### 5. Check Ollama Logs

```bash
# If you started Ollama manually
tail -f /tmp/ollama.log

# Or check system logs
log show --predicate 'process == "ollama"' --last 5m
```

## Understanding Your Current Upload

From your screenshot:
- **File**: Red-black Trees 1.pdf
- **Size**: 0.92MB
- **Pages**: 0 ← This might indicate:
  - PDF is scanned/image-based
  - No text was extracted initially
  - You might need to enable "Vision Model" toggle

### Try This:

1. **Enable Vision Model** (toggle at top of page)
2. **Delete current upload** (trash icon)
3. **Re-upload** with Vision Model ON

The Vision Model (`qwen2.5vl:7b`) is better for:
- Scanned documents
- Image-based PDFs
- Documents with minimal text

## Real-Time Progress Tracking

I've added a new API endpoint for you. In your browser console, run this to auto-refresh:

```javascript
// Auto-refresh status every 3 seconds
const uploadId = 'YOUR_UPLOAD_ID' // Replace with actual ID

setInterval(async () => {
  const res = await fetch(`/api/generate/status?uploadId=${uploadId}`)
  const data = await res.json()
  console.clear()
  console.log('📊 Upload Status:', new Date().toLocaleTimeString())
  console.log('Status:', data.upload.status)
  console.log('Job:', data.job?.status)
  console.log('Duration:', data.durationMinutes, 'minutes')
  console.log('Cards Created:', data.cardsCreated)
  if (data.job?.error) console.error('❌ Error:', data.job.error)
}, 3000)
```

## Quick Checklist

Before assuming it's stuck:

- [ ] Ollama process is running (`ps aux | grep ollama`)
- [ ] Ollama CPU is >20% (actively processing)
- [ ] Dev server is running (http://localhost:3000)
- [ ] No errors in browser console (F12 > Console)
- [ ] Less than 15 minutes have passed
- [ ] PDF has actual text (not just scanned images)

## Success Indicators

When it finishes successfully, you'll see:
- ✅ Progress bar reaches 100%
- ✅ Status changes to "Complete"
- ✅ Toast notification: "X flashcards created in deck..."
- ✅ Auto-redirect to the new deck
- ✅ Cards visible in the deck

## FAQ

**Q: How long should I wait?**
A: Max 15 minutes. If longer, something is wrong.

**Q: Can I close the browser?**
A: Yes! Processing happens on the server. You can check back later.

**Q: How do I know it's not frozen?**
A: Check CPU usage. If >20%, it's working.

**Q: What if CPU drops to 0%?**
A: It might have finished or crashed. Check the upload status.

**Q: Should I see flashcards being created in real-time?**
A: No, they all appear when done. But you can check the count via the status API.

## Next Steps

1. **Wait 5-10 more minutes** (if not already past that)
2. **Check browser console** for any error messages
3. **Run the status checker** (Method 1 above)
4. **If stuck >15 min**: Delete and retry with Vision Model ON
5. **Report back** what the status API shows

---

**TIP**: Keep your browser console open (`F12`) while uploading. Any errors will show there immediately!

