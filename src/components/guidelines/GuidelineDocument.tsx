"use client";

import { ChangeEvent, useState } from "react";
import { EMPTY_GUIDELINE_FIELDS, GuidelineFields } from "@/lib/guidelineFields";

type GuidelineDocumentProps = {
    initialValues?: Partial<GuidelineFields>;
    onFieldsChange?: (fields: GuidelineFields) => void;
};

type FieldKey = keyof GuidelineFields;

const fields: Array<{ key: FieldKey; label: string; wide?: boolean; type?: string }> = [
    { key: "clientName", label: "Client / User Name" },
    { key: "companyName", label: "Company Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Contact No." },
    { key: "building", label: "Building" },
    { key: "premisesAddress", label: "Premises / Address", wide: true },
    { key: "service", label: "Service" },
    { key: "term", label: "Selected Term" },
    { key: "useDate", label: "Booking / Use Date", type: "date" },
    { key: "endDate", label: "End Date", type: "date" },
    { key: "time", label: "Booking / Use Time" },
    { key: "seatsOrParticipants", label: "Seats / Participants" },
    { key: "duration", label: "Duration" },
    { key: "quotationAmount", label: "Quotation Amount" },
    { key: "applicableFees", label: "Applicable Fees" },
    { key: "otherRequirements", label: "Other Requirements", wide: true },
];

export default function GuidelineDocument({ initialValues = {}, onFieldsChange }: GuidelineDocumentProps) {
    const [values, setValues] = useState<GuidelineFields>({ ...EMPTY_GUIDELINE_FIELDS, ...initialValues });

    const update = (key: FieldKey) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValues((current) => {
            const next = { ...current, [key]: event.target.value };
            onFieldsChange?.(next);
            return next;
        });
    };

    return (
        <div className="mx-auto max-w-3xl rounded-xl border border-[#D9E2F0] bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 border-b border-[#E5EAF2] pb-4">
                <p className="text-xl font-bold text-[#1B3A8C]">Hero Serviced Office, Inc.</p>
                <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-[#64748B]">
                    {values.service || "Service"} Guideline
                </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {fields.map((field) => (
                    <label key={field.key} className={`text-xs font-medium text-[#64748B] ${field.wide ? "md:col-span-2" : ""}`}>
                        {field.label}
                        {field.key === "otherRequirements" ? (
                            <textarea
                                value={values[field.key]}
                                onChange={update(field.key)}
                                rows={3}
                                className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]"
                            />
                        ) : (
                            <input
                                type={field.type || "text"}
                                value={values[field.key]}
                                onChange={update(field.key)}
                                className="mt-1 w-full rounded-md border border-[#D9E2F0] bg-white px-3 py-2 text-sm text-[#0B1F4A]"
                            />
                        )}
                    </label>
                ))}
            </div>
            <p className="mt-5 text-xs leading-5 text-[#64748B]">
                These values are used when the guideline PDF is downloaded or emailed. The standard guideline sections remain unchanged.
            </p>
        </div>
    );
}
