import React from "react";
import VOContractDocument, { mapQuotationToVOContractFields } from "@/components/contracts/VOContractDocument";

export interface QuotationPayloadForRendering {
    detail?: {
        full_name?: string | null;
        id_address?: string | null;
        signatory_details?: string | null;
        id_name?: string | null;
        email?: string | null;
        phone?: string | null;
        company_name?: string | null;
        id_number?: string | null;
    } | null;
    branch?: string | null;
    lease_term?: string | null;
}

export async function renderVirtualOfficeContractHtml(quotation: QuotationPayloadForRendering): Promise<string> {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const fields = mapQuotationToVOContractFields(quotation);
    const html = renderToStaticMarkup(React.createElement(VOContractDocument, { fields }));
    return html;
}
