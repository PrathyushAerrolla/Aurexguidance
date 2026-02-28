import React, { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, File, X, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Document {
  id: number;
  fileName: string;
  fileType: string;
  fileUrl: string;
  uploadedAt: Date;
}

interface DocumentUploadProps {
  careerPlanId?: number;
  title?: string;
}

export function DocumentUpload({ careerPlanId, title = "Career Documents" }: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<"resume" | "certificate" | "portfolio">("resume");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success("Document uploaded successfully!");
      setSelectedFile(null);
      listQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload document");
    },
  });

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Document deleted");
      listQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete document");
    },
  });

  const listQuery = trpc.documents.list.useQuery();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      uploadMutation.mutate({
        fileName: selectedFile.name,
        fileType,
        fileData: base64,
        careerPlanId,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const documents = listQuery.data || [];
  const filteredDocs = careerPlanId
    ? documents.filter((d: any) => d.careerPlanId === careerPlanId)
    : documents;

  return (
    <Card className="bg-card border-border p-6 w-full">
      <h3 className="text-lg font-semibold mb-6 text-foreground">{title}</h3>

      {/* Upload Section */}
      <div className="mb-8 p-6 border-2 border-dashed border-muted rounded-lg hover:border-accent/50 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        />

        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <p className="font-semibold text-foreground mb-2">
            {selectedFile ? selectedFile.name : "Click to upload or drag and drop"}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            PDF, DOC, DOCX, JPG, or PNG (max 10MB)
          </p>

          <div className="flex items-center gap-2 justify-center mb-4">
            <select
              value={fileType}
              onChange={(e) => setFileType(e.target.value as "resume" | "certificate" | "portfolio")}
              className="px-3 py-2 rounded-lg border border-border bg-input text-foreground text-sm"
            >
              <option value="resume">Resume</option>
              <option value="certificate">Certificate</option>
              <option value="portfolio">Portfolio</option>
            </select>
          </div>

          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Choose File
            </Button>
            {selectedFile && (
              <>
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="btn-primary gap-2"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setSelectedFile(null)}
                  variant="outline"
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocs.length > 0 && (
        <div>
          <h4 className="font-semibold text-foreground mb-4">Your Documents</h4>
          <div className="space-y-3">
            {filteredDocs.map((doc: any) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-muted/50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <File className="w-5 h-5 text-accent flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{doc.fileName}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.fileType.charAt(0).toUpperCase() + doc.fileType.slice(1)} •{" "}
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    onClick={() => window.open(doc.fileUrl, "_blank")}
                    variant="ghost"
                    size="sm"
                    className="gap-2 hover:bg-accent/10"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                  <Button
                    onClick={() => deleteMutation.mutate({ documentId: doc.id })}
                    disabled={deleteMutation.isPending}
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredDocs.length === 0 && !selectedFile && (
        <p className="text-center text-muted-foreground text-sm">No documents uploaded yet</p>
      )}
    </Card>
  );
}
