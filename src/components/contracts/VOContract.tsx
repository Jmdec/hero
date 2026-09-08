"use client";

import { type ChangeEvent, useEffect, useState } from "react";
import VOContractDocument, { type VOContractFields, resolveBranchAddress } from "./VOContractDocument";

type FieldKey = keyof VOContractFields;

const initialFields: VOContractFields = {
    userName: "",
    userAddress: "",
    userRep: "",
    userEmail: "",
    userContact: "",
    building: "",
    premisesAddress: "",
    commencementDate: "",
    expirationDate: "",
    fixedFee: "",
    contractFee: "",
    userSignerName: "",
    userSignerAddress: "",
    userSignerCompany: "",
    notaryUserName: "",
    notaryUserId: "",
    notaryUserIssue: "",
    notaryDay: "",
    notaryMonth: "",
    notaryYear: "2026",
};

type VOContractProps = {
    initialValues?: Partial<VOContractFields>;
    hideControls?: boolean;
    onFieldsChange?: (fields: VOContractFields) => void;
};

export function mapVOContractFieldsToQuotationDetail(fields: VOContractFields) {
    const parseAmount = (value: string) => {
        if (!value.trim()) return null;
        const amount = Number(value.replace(/[^0-9.-]/g, ""));
        return Number.isFinite(amount) ? amount : null;
    };
    const packagePrice = parseAmount(fields.fixedFee);
    const contractAdminFee = parseAmount(fields.contractFee);
    const monthsMatch = fields.expirationDate.match(/(\d+(?:\.\d+)?)\s*month/i);
    const commencementDate = new Date(fields.commencementDate);

    return {
        full_name: fields.userName,
        email: fields.userEmail,
        phone: fields.userContact,
        id_address: fields.userAddress || fields.premisesAddress,
        signatory_details: fields.userRep || fields.userSignerName,
        id_number: fields.notaryUserId,
        signatory_id_address: fields.userSignerAddress,
        company_name: fields.userSignerCompany,
        date: Number.isNaN(commencementDate.getTime()) ? null : commencementDate.toISOString().slice(0, 10),
        months: monthsMatch ? Number(monthsMatch[1]) : null,
        package_price: packagePrice,
        contract_admin_fee: contractAdminFee,
    };
}

export function mapQuotationDetailToVOContractFields(detail?: Partial<{
    full_name: string | null;
    company_name: string | null;
    email: string | null;
    phone: string | null;
    id_name: string | null;
    id_address: string | null;
    signatory_details: string | null;
    id_number: string | null;
    signatory_id_address: string | null;
    signatory_id_number: string | null;
    contract_admin_fee?: number | string | null;
    package_name?: string | null;
    date?: string | null;
    months?: number | string | null;
    package_price?: number | string | null;
    branch?: string | null;
}> | null): VOContractFields {
    const startDate = detail?.date ? new Date(detail.date) : null;
    
    const commencement = detail?.date
        ? Number.isNaN(startDate?.getTime() ?? NaN)
            ? String(detail.date)
            : startDate!.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })
        : "";

    const expiration = (() => {
        if (!startDate || Number.isNaN(startDate.getTime())) return "";
        const months = detail?.months ? Number(detail.months) : 12;
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + (Number.isFinite(months) ? months : 12));
        endDate.setDate(endDate.getDate() - 1);
        return endDate.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
    })();

    const { building, premisesAddress } = resolveBranchAddress(detail?.branch || "Tower 6789");

    return {
        userName: detail?.full_name || detail?.id_name || "",
        userAddress: detail?.id_address || "",
        userRep: detail?.signatory_details || detail?.id_name || "",
        userEmail: detail?.email || "",
        userContact: detail?.phone || "",
        building,
        premisesAddress,
        commencementDate: commencement,
        expirationDate: expiration,
        fixedFee: detail?.package_price
            ? `PHP ${Number(detail.package_price).toLocaleString("en-PH")}`
            : detail?.contract_admin_fee
                ? `PHP ${Number(detail.contract_admin_fee).toLocaleString("en-PH")}`
                : "",
        contractFee: detail?.contract_admin_fee
            ? `PHP ${Number(detail.contract_admin_fee).toLocaleString("en-PH")}`
            : "",
        userSignerName: detail?.signatory_details || detail?.full_name || "",
        userSignerAddress: detail?.signatory_id_address || detail?.id_address || "",
        userSignerCompany: detail?.company_name || "",
        notaryUserName: detail?.signatory_details || detail?.full_name || "",
        notaryUserId: detail?.id_number || detail?.signatory_id_number || "",
        notaryUserIssue: detail?.id_address || detail?.signatory_id_address || "",
        notaryDay: startDate ? String(startDate.getDate()) : "",
        notaryMonth: startDate ? startDate.toLocaleDateString("en-PH", { month: "long" }) : "",
        notaryYear: startDate ? String(startDate.getFullYear()) : "2026",
    };
}

export default function VOContract({ initialValues = {}, hideControls = false, onFieldsChange }: VOContractProps) {
    const [fields, setFields] = useState<VOContractFields>({ ...initialFields, ...initialValues });
    const [editing, setEditing] = useState(!hideControls);

    useEffect(() => {
        setFields({ ...initialFields, ...initialValues });
        if (hideControls) {
            setEditing(false);
        }
    }, [initialValues, hideControls]);

    const setField = (key: FieldKey) => (event: ChangeEvent<HTMLInputElement>) => {
        setFields((current) => {
            const next = { ...current, [key]: event.target.value };
            onFieldsChange?.(next);
            return next;
        });
    };

    return (
        <div className="min-h-screen">
            <style>{`
        @media print {
          .no-print { display: none !important; }
          .page { box-shadow: none !important; }
        }
        .serif { font-family: "Source Serif 4", Georgia, "Times New Roman", serif; }
      `}</style>

            {editing && !hideControls ? (
                <div className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="text-xs font-medium text-[#64748B]">Client Name<input value={fields.userName} onChange={setField("userName")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B]">Client Address<input value={fields.userAddress} onChange={setField("userAddress")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B]">Representative<input value={fields.userRep} onChange={setField("userRep")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B]">Email<input value={fields.userEmail} onChange={setField("userEmail")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B]">Contact No.<input value={fields.userContact} onChange={setField("userContact")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B]">Building<input value={fields.building} onChange={setField("building")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B] md:col-span-2">Premises / Rented Address<input value={fields.premisesAddress} onChange={setField("premisesAddress")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B]">Commencement Date<input value={fields.commencementDate} onChange={setField("commencementDate")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B]">Expiration Date<input value={fields.expirationDate} onChange={setField("expirationDate")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B]">Fixed Fee<input value={fields.fixedFee} onChange={setField("fixedFee")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B]">Contract Fee<input value={fields.contractFee} onChange={setField("contractFee")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B]">Signer Name<input value={fields.userSignerName} onChange={setField("userSignerName")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B]">Signer Address<input value={fields.userSignerAddress} onChange={setField("userSignerAddress")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B] md:col-span-2">Signer Company<input value={fields.userSignerCompany} onChange={setField("userSignerCompany")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B]">Notary User Name<input value={fields.notaryUserName} onChange={setField("notaryUserName")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B]">Notary ID<input value={fields.notaryUserId} onChange={setField("notaryUserId")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B] md:col-span-2">Notary Issue<input value={fields.notaryUserIssue} onChange={setField("notaryUserIssue")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B]">Notary Day<input value={fields.notaryDay} onChange={setField("notaryDay")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B]">Notary Month<input value={fields.notaryMonth} onChange={setField("notaryMonth")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                        <label className="text-xs font-medium text-[#64748B]">Notary Year<input value={fields.notaryYear} onChange={setField("notaryYear")} className="mt-1 w-full rounded-md border border-[#D9E2F0] px-3 py-2 text-sm text-[#0B1F4A]" /></label>
                    </div>
                </div>
            ) : (
                <VOContractDocument fields={fields} />
            )}
        </div>
    );
}
