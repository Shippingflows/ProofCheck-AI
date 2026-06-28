"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getInspections,
  getInspectionById,
  getFindings,
  getAuditEvents,
  getStats,
} from "@/data/mock-repository";

export function useInspections() {
  return useQuery({
    queryKey: ["inspections"],
    queryFn: getInspections,
  });
}

export function useInspection(id: string) {
  return useQuery({
    queryKey: ["inspection", id],
    queryFn: () => getInspectionById(id),
    enabled: !!id,
  });
}

export function useFindings(inspectionId: string) {
  return useQuery({
    queryKey: ["findings", inspectionId],
    queryFn: () => getFindings(inspectionId),
    enabled: !!inspectionId,
  });
}

export function useAuditEvents(inspectionId?: string) {
  return useQuery({
    queryKey: ["auditEvents", inspectionId],
    queryFn: () => getAuditEvents(inspectionId),
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });
}
