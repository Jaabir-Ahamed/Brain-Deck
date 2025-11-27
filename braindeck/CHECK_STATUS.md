# 🔍 Simple Status Check (Fixed)

The localStorage approach had issues. Use this instead:

## Method 1: Direct API Check (Easiest)

**Just paste this in the browser console (F12 > Console):**

```javascript
// Get current user
fetch('/api/auth/session')
  .then(r => r.json())
  .then(session => {
    if (!session.user) {
      console.error('❌ Not logged in')
      return
    }
    
    // Get all uploads for this user
    return fetch('/api/uploads?userId=' + session.user.id)
  })
  .then(r => r.json())
  .then(uploads => {
    console.log('📄 All Uploads:', uploads)
    
    if (uploads.length === 0) {
      console.log('❌ No uploads found')
      return
    }
    
    // Check status of most recent upload
    const latest = uploads[0]
    console.log('🔍 Checking latest upload:', latest.file_name)
    
    return fetch('/api/generate/status?uploadId=' + latest.id)
      .then(r => r.json())
      .then(status => {
        console.log('\n📊 === STATUS ===')
        console.log('File:', status.upload.fileName)
        console.log('Status:', status.upload.status)
        console.log('Job Status:', status.job?.status)
        console.log('Duration:', status.durationMinutes, 'minutes')
        console.log('Cards Created:', status.cardsCreated)
        if (status.job?.error) {
          console.error('❌ Error:', status.job.error)
        }
        console.log('================\n')
        return status
      })
  })
  .catch(err => console.error('❌ Error:', err))
```

## Method 2: Look at the UI

The easiest way - just look at the page:

1. Go to http://localhost:3000/uploads
2. Look at "Recent Uploads" section
3. You should see:
   - ✅ **"Complete"** = Done! Refresh the page
   - 🔄 **"Processing"** = Still working (wait)
   - ❌ **"Error"** = Failed (click diagnostics button 🩺)

## Method 3: Check Database Directly

If you have access to Supabase dashboard:

1. Go to your Supabase project
2. Click "Table Editor"
3. Open "uploads" table
4. Look at the "status" column for your PDF
5. Also check "generation_jobs" table for detailed progress

## What Each Status Means

| Status | Meaning | What To Do |
|--------|---------|------------|
| `queued` | Waiting to start | Wait (should start in seconds) |
| `processing` | AI is working | Wait (1-15 minutes) |
| `done` | Completed successfully | Refresh page, cards should be ready! |
| `error` | Failed | Click diagnostics button (🩺) |

## If It Says "Processing" for Too Long

**After 15 minutes**, something is stuck. Try:

1. **Delete the upload** (trash icon 🗑️)
2. **Check if the PDF has text**:
   - Open your PDF
   - Try to select/copy text
   - If you can't, it's scanned → Enable "Vision Model" toggle
3. **Re-upload**

## Quick Terminal Check

If you prefer terminal:

```bash
# Check if Ollama is actually processing (high CPU means working)
ps aux | grep ollama | grep -v grep

# If CPU is low (<5%), it might be stuck or done
```

## Auto-Refresh Monitor (Once You Have Upload ID)

```javascript
// Replace 'UPLOAD_ID_HERE' with actual ID from Method 1 above
const uploadId = 'UPLOAD_ID_HERE'

const monitor = setInterval(async () => {
  const res = await fetch('/api/generate/status?uploadId=' + uploadId)
  const data = await res.json()
  console.clear()
  console.log('🔄', new Date().toLocaleTimeString())
  console.log('Status:', data.upload.status)
  console.log('Duration:', data.durationMinutes, 'min')
  console.log('Cards:', data.cardsCreated)
  
  if (data.upload.status === 'done') {
    console.log('✅ COMPLETE! Refresh the page.')
    clearInterval(monitor)
  }
}, 5000) // Check every 5 seconds
```

---

**TIP**: The UI on /uploads page should update automatically when it's done. Just wait and watch the progress bar!

