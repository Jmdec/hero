export type ContactBranchInterest = "tower-6789" | "insular-life" | "both";

const RECIPIENTS = {
    president: process.env.CONTACT_INQUIRY_PRESIDENT_EMAIL || process.env.PRESIDENT_EMAIL || "infinitech.eirene@gmail.com",
    chairman: process.env.CONTACT_INQUIRY_CHAIRMAN_EMAIL || process.env.CHAIRMAN_EMAIL || "chairman.mock@hero-office.test",
    generalManager: process.env.CONTACT_INQUIRY_GENERAL_MANAGER_EMAIL || process.env.GENERAL_MANAGER_EMAIL || "general.manager.mock@hero-office.test",
    salesOfficer: process.env.CONTACT_INQUIRY_SALES_OFFICER_EMAIL || process.env.SALES_OFFICER_EMAIL || "sales.officer.mock@hero-office.test",
    digitalMarketing: process.env.CONTACT_INQUIRY_DIGITAL_MARKETING_EMAIL || process.env.DIGITAL_MARKETING_EMAIL || "eirenegrc.armilla@gmail.com",
    branchManagers: {
        "tower-6789": process.env.CONTACT_INQUIRY_BRANCH_MANAGER_S01_EMAIL || process.env.BRANCH_MANAGER_S01_EMAIL || "tower6789.manager.mock@hero-office.test",
        "insular-life": process.env.CONTACT_INQUIRY_BRANCH_MANAGER_S02_EMAIL || process.env.BRANCH_MANAGER_S02_EMAIL || "insular.manager.mock@hero-office.test",
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
        ? [RECIPIENTS.branchManagers["tower-6789"], RECIPIENTS.branchManagers["insular-life"]]
        : branchInterest === "insular-life"
            ? [RECIPIENTS.branchManagers["insular-life"]]
            : [RECIPIENTS.branchManagers["tower-6789"]];

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
