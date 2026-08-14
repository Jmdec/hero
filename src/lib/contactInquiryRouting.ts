export type ContactBranchInterest = "tower-6789" | "insular-life" | "both";

const RECIPIENTS = {
    chairman: process.env.CHAIRMAN_EMAIL || "",
    president: process.env.PRESIDENT_EMAIL || "",
    generalManager: process.env.GENERAL_MANAGER_EMAIL || "rataguibao@rbtconsulting.com.ph",
    salesOfficer: process.env.SALES_OFFICER_EMAIL || "salesofficer@heroph.net",
    digitalMarketing: process.env.DIGITAL_MARKETING_EMAIL || "digitalsalesmarketing@heroph.net",
    accounting: process.env.ACCOUNTING_EMAIL || "",
    branchManagers: {
        S01: process.env.BRANCH_MANAGER_S01_EMAIL || "sales@heroph.net",
        S02: process.env.BRANCH_MANAGER_S02_EMAIL || "c_francisco@heroph.net",
    },
};

const INQUIRY_LABELS: Record<string, string> = {
    "private-office": "Private Office",
    "virtual-office": "Virtual Office",
    "co-working-space": "Co-Working Space",
    "meeting-room": "Meeting Room",
    "event-space": "Event Space",
    "ocular-visit": "Ocular Visit",
    partnership: "Partnership",
    others: "Others",
};

const BRANCH_LABELS: Record<ContactBranchInterest, string> = {
    "tower-6789": "Tower 6789",
    "insular-life": "Insular Life Building",
    both: "Both Branches",
};

function toUniqueEmails(values: Array<string | null | undefined>): string[] {
    const seen = new Set<string>();
    const list: string[] = [];

    for (const value of values) {
        const email = (value || "").trim();
        if (!email) continue;
        const key = email.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        list.push(email);
    }

    return list;
}

export function extractContactBranchInterest(
    dynamicData?: Record<string, unknown> | null,
): ContactBranchInterest | null {
    const raw = dynamicData?.branchInterest ?? dynamicData?.interestedBranch;
    if (raw === "tower-6789" || raw === "insular-life" || raw === "both") {
        return raw;
    }
    return null;
}

export function getContactBranchLabel(value?: string | null): string {
    if (!value) return "Not specified";
    if (value === "tower-6789" || value === "insular-life" || value === "both") {
        return BRANCH_LABELS[value];
    }
    return value;
}

export function getContactInquiryLabel(value?: string | null): string {
    if (!value) return "Inquiry";
    return INQUIRY_LABELS[value] || value;
}

export function getContactInquiryRecipients(branchInterest?: string | null) {
    const branchRecipients = branchInterest === "both"
        ? [RECIPIENTS.branchManagers.S01, RECIPIENTS.branchManagers.S02]
        : branchInterest === "insular-life"
            ? [RECIPIENTS.branchManagers.S02]
            : [RECIPIENTS.branchManagers.S01];

    return {
        president: RECIPIENTS.president,
        chairman: RECIPIENTS.chairman,
        standardRecipients: toUniqueEmails([
            RECIPIENTS.generalManager,
            ...branchRecipients,
            RECIPIENTS.salesOfficer,
            RECIPIENTS.digitalMarketing,
        ]),
    };
}
