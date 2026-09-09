export type DocumentType = "contract" | "guideline";

export function getDocumentType(
    serviceName?: string | null,
    leaseTerm?: string | null
): DocumentType {
    const service = String(serviceName || "").trim().toLowerCase();
    const term = String(leaseTerm || "").trim().toLowerCase();

    if (service.includes("meeting room") || service.includes("meeting-room")) {
        return "guideline";
    }

    if (
        service.includes("co-working") ||
        service.includes("coworking") ||
        service.includes("co working")
    ) {
        return term.includes("daily") || term.includes("weekly")
            ? "guideline"
            : "contract";
    }

    return "contract";
}

export function getQuotationDocumentType(quotation: {
    service_name?: string | null;
    lease_term?: string | null;
    detail?: { duration_type?: string | null } | null;
}): DocumentType {
    return getDocumentType(
        quotation.service_name,
        quotation.lease_term || quotation.detail?.duration_type
    );
}

export function getDocumentLabel(documentType: DocumentType): string {
    return documentType === "guideline" ? "Guideline" : "Contract";
}

export function getDocumentFilename(
    quotation: { service_name?: string | null; lease_term?: string | null; detail?: { duration_type?: string | null } | null },
    documentType = getQuotationDocumentType(quotation)
): string {
    const serviceText = String(quotation.service_name || "Service").trim().toLowerCase();
    const service = serviceText.includes("meeting room") || serviceText.includes("meeting-room")
        ? "MeetingRoom"
        : serviceText.includes("co-working") || serviceText.includes("co working") || serviceText.includes("coworking")
            ? "CoWorking"
            : serviceText.replace(/[^a-z0-9]+/gi, "") || "Service";
    const term = String(quotation.lease_term || quotation.detail?.duration_type || "")
        .trim()
        .toLowerCase();
    const termLabel = term.includes("daily")
        ? "Daily"
        : term.includes("weekly")
            ? "Weekly"
            : term.includes("monthly")
                ? "Monthly"
                : term.includes("yearly") || term.includes("annual")
                    ? "Yearly"
                    : term
                        .replace(/[^a-z0-9]+/gi, "")
                        .replace(/^./, (value) => value.toUpperCase()) || "Service";

    return `HERO_${service}_${termLabel}_${getDocumentLabel(documentType)}.pdf`;
}
