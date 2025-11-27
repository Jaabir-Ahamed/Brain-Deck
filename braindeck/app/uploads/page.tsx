"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppStore } from "@/lib/store"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Upload, FileText, CheckCircle2, AlertCircle, X, Trash2, Stethoscope } from "lucide-react"
import { toast } from "sonner"
import { supabaseBrowser } from "@/lib/supabase"

export default function UploadsPage() {
  const router = useRouter()
  const { uploads, addUpload, updateUploadStatus, deleteUpload, setUploads } = useAppStore()
  const [dragActive, setDragActive] = useState(false)
  const [preferVL, setPreferVL] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [diagnosing, setDiagnosing] = useState<string | null>(null)

  // Fetch uploads from API on mount
  useEffect(() => {
    async function fetchUploads() {
      try {
        const { data: { user } } = await supabaseBrowser().auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        const response = await fetch(`/api/uploads?userId=${user.id}`)
        if (response.ok) {
          const data = await response.json()
          // Use database format directly
          setUploads(data)
        }
      } catch (error) {
        console.error("Failed to fetch uploads:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUploads()
  }, [setUploads])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file")
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be less than 20MB")
      return
    }

    // Get current user
    const { data: { user } } = await supabaseBrowser().auth.getUser()
    if (!user) {
      toast.error("Please sign in to upload files")
      return
    }

    const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
    
    // Upload file to Supabase
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("userId", user.id)

      const response = await fetch("/api/upload-file", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const upload = await response.json()
      
      // Add to local store - use database format directly
      addUpload(upload)

      toast.success("PDF uploaded successfully")

      // Update to processing immediately
      updateUploadStatus(upload.id, "processing")

      // Call generate API
      try {
        const genResponse = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadId: upload.id,
            targetCount: 50,
            preferVL,
          }),
        })

        if (!genResponse.ok) {
          const error = await genResponse.json()
          throw new Error(error.error || "Generation failed")
        }

        const result = await genResponse.json()
        updateUploadStatus(upload.id, "done")
        
        if (result.deckId && result.deckName) {
          toast.success(`${result.created} flashcards created in deck "${result.deckName}"`)
          // Navigate to the deck after a short delay
          setTimeout(() => {
            router.push(`/decks/${result.deckId}`)
          }, 1500)
        } else {
          toast.success(`${result.created} suggestions generated using ${result.model} model`)
        }
      } catch (error: any) {
        updateUploadStatus(upload.id, "error")
        toast.error(`Generation failed: ${error.message}`)
      }
    } catch (error: any) {
      toast.error(`Upload failed: ${error.message}`)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDeleteUpload = async (uploadId: string) => {
    if (!confirm("Are you sure you want to delete this upload? This action cannot be undone.")) {
      return
    }

    setDeletingId(uploadId)
    try {
      const response = await fetch(`/api/uploads?id=${uploadId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to delete upload")
      }

      // Remove from local store
      deleteUpload(uploadId)
      toast.success("Upload deleted successfully")
    } catch (error: any) {
      toast.error(`Failed to delete upload: ${error.message}`)
    } finally {
      setDeletingId(null)
    }
  }

  const handleDiagnose = async (uploadId: string) => {
    setDiagnosing(uploadId)
    try {
      const response = await fetch("/api/generate/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId, preferVL }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Diagnostics failed")
      }

      const result = await response.json()

      if (result.ok) {
        toast.success(
          `✓ PDF parsed: ${result.pages} pages, ${result.totalChars} chars\n` +
          `✓ Model: ${result.model}\n` +
          `✓ Sample: ${result.sample.suggestions.length} cards generated`,
          { duration: 5000 }
        )
      } else {
        toast.error(
          `⚠ Issues found:\n` +
          `Pages: ${result.pages}, Chars: ${result.totalChars}\n` +
          `${result.error || "AI output validation failed"}`,
          { duration: 5000 }
        )
      }
    } catch (error: any) {
      toast.error(`Diagnostics failed: ${error.message}`)
    } finally {
      setDiagnosing(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "done":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-destructive" />
      default:
        return <FileText className="w-5 h-5 text-blue-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "queued":
        return "Queued"
      case "processing":
        return "Processing"
      case "done":
        return "Complete"
      case "error":
        return "Error"
      default:
        return status
    }
  }

  const getProgress = (status: string) => {
    switch (status) {
      case "queued":
        return 10
      case "processing":
        return 50
      case "done":
        return 100
      case "error":
        return 0
      default:
        return 0
    }
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Uploads</h1>
          <p className="text-muted-foreground mt-2">Upload PDFs to generate flashcard suggestions</p>
        </div>

        {/* Model Selection */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="vl-toggle" className="text-base font-medium">
                  Use Vision Model (qwen2.5vl:7b)
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable for scanned/image-heavy PDFs. Default: qwen2.5:7b-instruct
                </p>
              </div>
              <Switch id="vl-toggle" checked={preferVL} onCheckedChange={setPreferVL} />
            </div>
          </CardContent>
        </Card>

        {/* Dropzone */}
        <Card
          className={`border-2 border-dashed transition-colors ${
            dragActive ? "border-primary bg-primary/5" : "border-border"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="font-semibold text-lg mb-2">Drop your PDF here</h3>
              <p className="text-muted-foreground mb-6">or click to browse (max 20MB)</p>
              <input type="file" accept=".pdf" onChange={handleFileInput} className="hidden" id="pdf-input" />
              <Button asChild>
                <label htmlFor="pdf-input" className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </label>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upload List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading uploads...</div>
        ) : uploads.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Uploads</h2>
            {uploads.map((upload) => (
              <Card key={upload.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getStatusIcon(upload.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium truncate">{upload.file_name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {getStatusLabel(upload.status)}
                          </span>
                          {upload.status === "error" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-600"
                              onClick={() => handleDiagnose(upload.id)}
                              disabled={diagnosing === upload.id}
                              title="Run diagnostics"
                            >
                              {diagnosing === upload.id ? (
                                <X className="h-4 w-4 animate-spin" />
                              ) : (
                                <Stethoscope className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteUpload(upload.id)}
                            disabled={deletingId === upload.id}
                            title="Delete upload"
                          >
                            {deletingId === upload.id ? (
                              <X className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {upload.size_mb || 0}MB • {upload.page_count || 0} pages
                      </p>
                      <Progress value={getProgress(upload.status)} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : null}
      </div>
    </AppShell>
  )
}
