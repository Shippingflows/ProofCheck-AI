export enum InspectionStatus {
  Draft = "draft",
  Uploading = "uploading",
  Comparing = "comparing",
  PendingReview = "pending_review",
  Approved = "approved",
  ApprovedWithNotes = "approved_with_notes",
  Rejected = "rejected",
}

export enum CorrectionStatus {
  NotStarted = "not_started",
  DraftNeeded = "draft_needed",
  DraftPrepared = "draft_prepared",
  SentToSupplier = "sent_to_supplier",
  AwaitingResubmission = "awaiting_resubmission",
  Resubmitted = "resubmitted",
  ReInspectionRequired = "re_inspection_required",
  Closed = "closed",
}

export enum AuditActorRole {
  QualityReviewer = "quality_reviewer",
  System = "system",
  Supplier = "supplier",
  Admin = "admin",
}

export enum AuditEventSource {
  System = "system",
  Reviewer = "reviewer",
}

export enum FindingSeverity {
  Critical = "critical",
  Major = "major",
  Minor = "minor",
}

export enum FindingCategory {
  TextContent = "text_content",
  Barcode = "barcode",
  Symbol = "symbol",
  Layout = "layout",
  Color = "color",
  Typography = "typography",
  Metadata = "metadata",
  MissingElement = "missing_element",
}

export enum ReviewDecision {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  CorrectionRequired = "correction_required",
}

export enum AuditAction {
  InspectionCreated = "inspection_created",
  MasterFileUploaded = "master_file_uploaded",
  SupplierFileUploaded = "supplier_file_uploaded",
  ComparisonStarted = "comparison_started",
  ComparisonCompleted = "comparison_completed",
  FindingsGenerated = "findings_generated",
  ReviewStarted = "review_started",
  FindingVerified = "finding_verified",
  FindingDismissed = "finding_dismissed",
  DecisionMade = "decision_made",
  CorrectionRequestSent = "correction_request_sent",
  ReportExported = "report_exported",
}
