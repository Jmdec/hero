export type GuidelineFields = {
    clientName: string;
    companyName: string;
    email: string;
    phone: string;
    building: string;
    premisesAddress: string;
    service: string;
    term: string;
    useDate: string;
    endDate: string;
    time: string;
    seatsOrParticipants: string;
    duration: string;
    quotationAmount: string;
    applicableFees: string;
    otherRequirements: string;
};

export const EMPTY_GUIDELINE_FIELDS: GuidelineFields = {
    clientName: "",
    companyName: "",
    email: "",
    phone: "",
    building: "",
    premisesAddress: "",
    service: "",
    term: "",
    useDate: "",
    endDate: "",
    time: "",
    seatsOrParticipants: "",
    duration: "",
    quotationAmount: "",
    applicableFees: "",
    otherRequirements: "",
};

export function getGuidelineBranchAddress(branch?: string | null): string {
    const normalized = String(branch || "").trim().toLowerCase();
    if (normalized.includes("insular")) {
        return "11F Insular Life Building, Makati, Philippines";
    }
    if (normalized.includes("tower") || normalized === "s01") {
        return "23F Tower 6789, 6789 Ayala Ave., Brgy. Bel Air, Makati, Philippines";
    }
    return "";
}

export function mapQuotationDetailToGuidelineFields(
    detail?: Partial<{
        full_name: string | null;
        company_name: string | null;
        email: string | null;
        phone: string | null;
        date: string | null;
        end_date: string | null;
        time: string | null;
        seats: number | string | null;
        duration_type: string | null;
        total: number | string | null;
        contract_admin_fee: number | string | null;
        other_requirements: string | null;
        guideline_fields: Partial<GuidelineFields> | null;
    }> | null,
    quotation?: { service_name?: string | null; lease_term?: string | null; branch?: string | null }
): GuidelineFields {
    const saved = detail?.guideline_fields || {};
    return {
        ...EMPTY_GUIDELINE_FIELDS,
        clientName: detail?.full_name || "",
        companyName: detail?.company_name || "",
        email: detail?.email || "",
        phone: detail?.phone || "",
        building: quotation?.branch || "",
        service: quotation?.service_name || "",
        term: quotation?.lease_term || "",
        useDate: detail?.date || "",
        endDate: detail?.end_date || "",
        time: detail?.time || "",
        seatsOrParticipants: detail?.seats == null ? "" : String(detail.seats),
        duration: detail?.duration_type || "",
        quotationAmount: detail?.total == null ? "" : String(detail.total),
        applicableFees: detail?.contract_admin_fee == null ? "" : String(detail.contract_admin_fee),
        otherRequirements: detail?.other_requirements || "",
        ...saved,
        premisesAddress: saved.premisesAddress || getGuidelineBranchAddress(quotation?.branch) || "",
    };
}

export function mapGuidelineFieldsToQuotationDetail(fields: GuidelineFields) {
    const amount = Number(fields.quotationAmount.replace(/[^0-9.-]/g, ""));
    const fees = Number(fields.applicableFees.replace(/[^0-9.-]/g, ""));
    return {
        full_name: fields.clientName,
        company_name: fields.companyName || null,
        email: fields.email,
        phone: fields.phone,
        date: fields.useDate || null,
        end_date: fields.endDate || null,
        time: fields.time || null,
        seats: Number(fields.seatsOrParticipants) || null,
        duration_type: fields.duration || null,
        total: Number.isFinite(amount) ? amount : null,
        contract_admin_fee: Number.isFinite(fees) ? fees : null,
        other_requirements: fields.otherRequirements || null,
        guideline_fields: fields,
    };
}
