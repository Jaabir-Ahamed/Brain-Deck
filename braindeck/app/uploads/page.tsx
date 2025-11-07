"use client"

import type React from "react"

import { useState } from "react"
import { useAppStore } from "@/lib/store"
import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export default function UploadsPage() {
  const { uploads, addUpload, updateUploadStatus } = useAppStore()
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type === "application/pdf") {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
        addUpload({
          fileName: file.name,
          sizeMB: Number.parseFloat(sizeMB),
          pageCount: Math.floor(Math.random() * 50) + 10,
          status: "queued",
        })
        toast.success("PDF uploaded (mock)")

        // Simulate processing
        setTimeout(() => {
          const uploads_list = useAppStore.getState().uploads
          const lastUpload = uploads_list[uploads_list.length - 1]
          updateUploadStatus(lastUpload.id, "processing")
        }, 500)

        setTimeout(() => {
          const uploads_list = useAppStore.getState().uploads
          const lastUpload = uploads_list[uploads_list.length - 1]
          updateUploadStatus(lastUpload.id, "done")
          toast.success("42 suggestions generated (mock)")
        }, 2000)
      } else {
        toast.error("Please upload a PDF file")
      }
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type === "application/pdf" && file.size <= 20 * 1024 * 1024) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
        addUpload({
          fileName: file.name,
          sizeMB: Number.parseFloat(sizeMB),
          pageCount: Math.floor(Math.random() * 50) + 10,
          status: "queued",
        })
        toast.success("PDF uploaded (mock)")

        setTimeout(() => {
          const uploads_list = useAppStore.getState().uploads
          const lastUpload = uploads_list[uploads_list.length - 1]
          updateUploadStatus(lastUpload.id, "processing")
        }, 500)

        setTimeout(() => {
          const uploads_list = useAppStore.getState().uploads
          const lastUpload = uploads_list[uploads_list.length - 1]
          updateUploadStatus(lastUpload.id, "done")
          toast.success("42 suggestions generated (mock)")
        }, 2000)
      } else {
        toast.error("File must be a PDF and less than 20MB")
      }
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
        {uploads.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Recent Uploads</h2>
            {uploads.map((upload) => (
              <Card key={upload.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getStatusIcon(upload.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium truncate">{upload.fileName}</h3>
                        <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                          {getStatusLabel(upload.status)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {upload.sizeMB}MB • {upload.pageCount} pages
                      </p>
                      <Progress value={getProgress(upload.status)} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
