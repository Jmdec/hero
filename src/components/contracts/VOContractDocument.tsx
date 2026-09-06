export type VOContractFields = {
    userName: string;
    userAddress: string;
    userRep: string;
    userEmail: string;
    userContact: string;
    building: string;
    premisesAddress: string;
    commencementDate: string;
    expirationDate: string;
    fixedFee: string;
    contractFee: string;
    userSignerName: string;
    userSignerAddress: string;
    userSignerCompany: string;
    notaryUserName: string;
    notaryUserId: string;
    notaryUserIssue: string;
    notaryDay: string;
    notaryMonth: string;
    notaryYear: string;
};

export function mapQuotationToVOContractFields(quotation: {
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
}): VOContractFields {
    const d = quotation.detail || {};
    const today = new Date();
    
    return {
        userName: d.full_name || "TO BE FILLED OUT",
        userAddress: d.id_address || "TO BE FILLED OUT",
        userRep: d.signatory_details || d.id_name || "TO BE FILLED OUT",
        userEmail: d.email || "TO BE FILLED OUT",
        userContact: d.phone || "TO BE FILLED OUT",
        building: quotation.branch || "Tower 6789",
        premisesAddress: d.id_address || "23F Tower 6789, 6789 Ayala Avenue, Makati City",
        commencementDate: "TO BE FILLED OUT",
        expirationDate: quotation.lease_term || "TO BE FILLED OUT",
        fixedFee: "TO BE FILLED OUT",
        contractFee: "TO BE FILLED OUT",
        userSignerName: d.signatory_details || d.id_name || d.full_name || "TO BE FILLED OUT",
        userSignerAddress: d.id_address || "TO BE FILLED OUT",
        userSignerCompany: d.company_name || "TO BE FILLED OUT",
        notaryUserName: d.signatory_details || d.full_name || "TO BE FILLED OUT",
        notaryUserId: d.id_number || "TO BE FILLED OUT",
        notaryUserIssue: d.id_address || "TO BE FILLED OUT",
        notaryDay: String(today.getDate()).padStart(2, "0"),
        notaryMonth: today.toLocaleString("en-US", { month: "long" }),
        notaryYear: String(today.getFullYear()),
    };
}

type VOContractDocumentProps = {
    fields: VOContractFields;
};

const EMPTY_TEXT = "TO BE FILLED OUT";

function displayValue(value?: string | null, placeholder = EMPTY_TEXT) {
    const normalized = typeof value === "string" ? value.trim() : "";
    return normalized || placeholder;
}

function LabelCell({ children }: { children: React.ReactNode }) {
    return <td style={{ width: 130, padding: "8px 12px 8px 0", verticalAlign: "top", color: "#6b6155" }}>{children}</td>;
}

function SectionTitle({ number, title }: { number: string; title: string }) {
    return (
        <h3 style={{ margin: "28px 0 10px", fontSize: 15, fontWeight: 700, letterSpacing: "0.02em", color: "#1c1a17" }}>
            <span style={{ display: "inline-block", marginRight: 10, fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "#8a6a52" }}>{number}</span>
            {title}
        </h3>
    );
}

export default function VOContractDocument({ fields }: VOContractDocumentProps) {
    return (
        <div style={{ color: "#1c1a17", background: "#fff", fontSize: 13.5, lineHeight: 1.7, fontFamily: 'Georgia, "Times New Roman", serif' }}>
            <div style={{ fontFamily: '"Source Serif 4", Georgia, "Times New Roman", serif' }}>
                <div style={{ textAlign: "left", fontFamily: "IBM Plex Mono, ui-monospace, monospace", fontSize: 10, letterSpacing: 4, color: "#8a6a52", marginBottom: 12 }}>
                    CONFIDENTIAL
                </div>

                <h1 style={{ margin: "0 0 24px", textAlign: "center", fontSize: 20, letterSpacing: 2, fontWeight: 700, textTransform: "uppercase" }}>
                    Virtual Office Service Agreement
                </h1>

                <p style={{ margin: "0 0 20px" }}>
                    This Virtual Office Service Agreement (&ldquo;Agreement&rdquo;), is made by and between:
                </p>

                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18 }}>
                    <tbody>
                        <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                            <td style={{ width: 110, padding: "6px 12px 6px 0", verticalAlign: "top", fontWeight: 700 }}>PROVIDER</td>
                            <td style={{ width: 90, padding: "6px 12px 6px 0", verticalAlign: "top", color: "#6b6155" }}>Name</td>
                            <td style={{ padding: "6px 0", verticalAlign: "top" }}>HERO SERVICED OFFICE, INC.</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                            <td style={{ padding: "6px 12px 6px 0" }} />
                            <td style={{ padding: "6px 12px 6px 0", verticalAlign: "top", color: "#6b6155" }}>Address</td>
                            <td style={{ padding: "6px 0", verticalAlign: "top" }}>
                                23F Tower 6789, 6789 Ayala Avenue, 1209 Makati City, Metro Manila, Philippines
                            </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                            <td style={{ width: 110, padding: "10px 12px 10px 0", verticalAlign: "top", fontWeight: 700 }}>USER</td>
                            <td style={{ width: 90, padding: "10px 12px 10px 0", verticalAlign: "top", color: "#6b6155" }}>Name</td>
                            <td style={{ padding: "10px 0", verticalAlign: "top" }}>{displayValue(fields.userName)}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                            <td />
                            <td style={{ padding: "8px 12px 8px 0", verticalAlign: "top", color: "#6b6155" }}>Address</td>
                            <td style={{ padding: "8px 0", verticalAlign: "top" }}>{displayValue(fields.userAddress)}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                            <td />
                            <td style={{ padding: "8px 12px 8px 0", verticalAlign: "top", color: "#6b6155" }}>Representative</td>
                            <td style={{ padding: "8px 0", verticalAlign: "top" }}>{displayValue(fields.userRep)}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                            <td />
                            <td style={{ padding: "8px 12px 8px 0", verticalAlign: "top", color: "#6b6155" }}>Email Address</td>
                            <td style={{ padding: "8px 0", verticalAlign: "top" }}>{displayValue(fields.userEmail)}</td>
                        </tr>
                        <tr>
                            <td />
                            <td style={{ padding: "8px 12px 8px 0", verticalAlign: "top", color: "#6b6155" }}>Contact No.</td>
                            <td style={{ padding: "8px 0", verticalAlign: "top" }}>{displayValue(fields.userContact)}</td>
                        </tr>
                    </tbody>
                </table>

                <h2 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Summary of Terms and Conditions <span style={{ fontWeight: 400, color: "#6b6155", letterSpacing: 0, textTransform: "none" }}>(&ldquo;Agreement Overview&rdquo;)</span>
                </h2>

                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid rgba(28,26,23,0.15)", marginBottom: 10 }}>
                    <tbody>
                        <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                            <td style={{ width: 180, background: "#f6f3ec", padding: "10px 12px", fontWeight: 600 }}>Building</td>
                            <td style={{ padding: "10px 12px" }}>{displayValue(fields.building)}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                            <td style={{ background: "#f6f3ec", padding: "10px 12px", fontWeight: 600 }}>Premises / Rented Address</td>
                            <td style={{ padding: "10px 12px" }}>{displayValue(fields.premisesAddress)}</td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                            <td style={{ background: "#f6f3ec", padding: "10px 12px", fontWeight: 600, verticalAlign: "top" }}>Rental Period</td>
                            <td style={{ padding: "10px 12px" }}>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 18px" }}>
                                    <span><span style={{ color: "#6b6155" }}>Commencement Date: </span>{displayValue(fields.commencementDate)}</span>
                                    <span><span style={{ color: "#6b6155" }}>Expiration Date: </span>{displayValue(fields.expirationDate)}</span>
                                </div>
                            </td>
                        </tr>
                        <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                            <td style={{ background: "#f6f3ec", padding: "10px 12px", fontWeight: 600 }}>
                                Fixed Fee
                                <div style={{ marginTop: 2, fontSize: 11, fontWeight: 400, color: "#6b6155" }}>Commencement to Expiration Date, incl. VAT</div>
                            </td>
                            <td style={{ padding: "10px 12px" }}>{displayValue(fields.fixedFee)}</td>
                        </tr>
                        <tr>
                            <td style={{ background: "#f6f3ec", padding: "10px 12px", fontWeight: 600 }}>
                                Contract Fee
                                <div style={{ marginTop: 2, fontSize: 11, fontWeight: 400, color: "#6b6155" }}>Incl. VAT</div>
                            </td>
                            <td style={{ padding: "10px 12px" }}>{displayValue(fields.contractFee)}</td>
                        </tr>
                    </tbody>
                </table>

                <SectionTitle number="Art. 1" title="Use of the Rented Address" />
                <ol style={{ margin: "0 0 0 22px", padding: 0 }}>
                    <li>The Provider shall allow the USER to use the Rented Address indicated in the Agreement Overview.</li>
                    <li>The USER shall use the Rented Address solely for registration purposes and business correspondences.</li>
                    <li>The USER shall hold the Provider harmless from any damage, liability, or responsibility arising from use of the Rented Address.</li>
                </ol>

                <SectionTitle number="Art. 2" title="Fixed Fee and Other Fees" />
                <ol style={{ margin: "0 0 0 22px", padding: 0 }}>
                    <li>The USER shall pay to the Provider the Fixed Fee, plus VAT thereon, as consideration for the use of the Rented Address.</li>
                    <li>If the USER requests optional services, the USER shall also pay applicable service fees.</li>
                </ol>

                <SectionTitle number="Art. 3" title="Term of Agreement" />
                <p style={{ margin: 0 }}>This Agreement shall commence on the Commencement Date and continue until the Expiration Date unless earlier terminated or renewed by mutual agreement of the Parties in writing.</p>

                <SectionTitle number="Art. 4" title="Inclusion" />
                <p style={{ margin: 0 }}>The Fixed Fee covers the use of the Rented Address and such services as are included in the Agreement Overview and the applicable service package of the Provider.</p>

                <SectionTitle number="Art. 5" title="Payment Instruction" />
                <p style={{ margin: 0 }}>The USER shall pay all amounts due to the Provider on the date or dates indicated in the Agreement Overview, and in accordance with the payment instructions provided by the Provider.</p>

                <SectionTitle number="Art. 6" title="Representations and Warranties" />
                <p style={{ margin: 0 }}>The USER represents that the information provided in this Agreement is true and correct, and that the USER shall abide by the laws and regulations applicable to the use of the Rented Address.</p>

                <SectionTitle number="Art. 7" title="Responsibility and Liability" />
                <p style={{ margin: 0 }}>The USER shall be solely responsible for any acts, omissions, liabilities, and consequences arising from the USER's use of the Rented Address and/or from the USER's business correspondences.</p>

                <SectionTitle number="Art. 8" title="Confidentiality" />
                <p style={{ margin: 0 }}>The Parties shall keep confidential any information exchanged in connection with the subject matter of this Agreement and shall use such information only for the purpose of the Agreement.</p>

                <SectionTitle number="Art. 9" title="Notices" />
                <p style={{ margin: 0 }}>All notices under this Agreement shall be in writing and shall be deemed valid when delivered by hand, registered mail, or electronic mail to the addresses or email addresses stated in the Agreement.</p>

                <SectionTitle number="Art. 10" title="Governing Law" />
                <p style={{ margin: 0 }}>This Agreement shall be governed by and construed in accordance with the laws of the Republic of the Philippines, without regard to conflict-of-laws principles.</p>

                <SectionTitle number="Art. 11" title="Entire Agreement" />
                <p style={{ margin: 0 }}>This Agreement constitutes the entire understanding between the Parties and supersedes all prior negotiations, understandings, and arrangements relating to the subject matter hereof.</p>

                <SectionTitle number="Art. 12" title="Amendment" />
                <p style={{ margin: 0 }}>Any amendment or modification to this Agreement must be in writing and signed by both Parties to be effective.</p>

                <SectionTitle number="Art. 13" title="Contract Fee" />
                <p style={{ margin: 0 }}>The USER shall pay the Contract Fee provided in the Agreement Overview, including VAT thereon, to the Provider on the date of execution of this Agreement as an administration fee.</p>

                <hr style={{ border: "0", borderTop: "1px solid rgba(28,26,23,0.15)", margin: "36px 0 28px" }} />

                <p style={{ margin: "0 0 28px" }}>IN WITNESS WHEREOF, the Parties have caused this Agreement to be executed by their respective duly authorized representatives on the date first written above.</p>

                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 30 }}>
                    <tbody>
                        <tr>
                            <td style={{ width: "50%", padding: "0 26px 0 0", verticalAlign: "top" }}>
                                <p style={{ margin: "0 0 8px", fontSize: 12, color: "#6b6155" }}>The Provider:</p>
                                <div style={{ width: 190, height: 1, background: "rgba(28,26,23,0.4)", margin: "44px 0 8px" }} />
                                <p style={{ margin: 0, fontWeight: 600 }}>Raymund A. Taguibao</p>
                                <p style={{ margin: 0, color: "#6b6155" }}>General Manager</p>
                                <p style={{ margin: 0, color: "#6b6155" }}>HERO SERVICED OFFICE, INC.</p>
                            </td>
                            <td style={{ width: "50%", padding: 0, verticalAlign: "top" }}>
                                <p style={{ margin: "0 0 8px", fontSize: 12, color: "#6b6155" }}>The USER:</p>
                                <div style={{ width: 190, height: 1, background: "rgba(28,26,23,0.4)", margin: "44px 0 8px" }} />
                                <p style={{ margin: "0 0 4px" }}>Name: {displayValue(fields.userSignerName)}</p>
                                <p style={{ margin: "0 0 4px" }}>Address: {displayValue(fields.userSignerAddress)}</p>
                                <p style={{ margin: 0 }}>Company: {displayValue(fields.userSignerCompany)}</p>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <h2 style={{ margin: "0 0 16px", textAlign: "center", fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Acknowledgment</h2>
                <p style={{ margin: "0 0 18px" }}>
                    BEFORE ME, a notary public for and in Makati City, Metro Manila, on this {displayValue(fields.notaryDay, "___")} day of {displayValue(fields.notaryMonth, "________")} {displayValue(fields.notaryYear)} at Makati City, Philippines, personally appeared the following:
                </p>

                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid rgba(28,26,23,0.15)", marginBottom: 18 }}>
                    <thead>
                        <tr style={{ background: "#f6f3ec" }}>
                            <th style={{ borderBottom: "1px solid rgba(28,26,23,0.15)", padding: "8px 12px", textAlign: "left", fontWeight: 700 }}>Name</th>
                            <th style={{ borderBottom: "1px solid rgba(28,26,23,0.15)", padding: "8px 12px", textAlign: "left", fontWeight: 700 }}>Gov&apos;t Issued I.D./Passport No.</th>
                            <th style={{ borderBottom: "1px solid rgba(28,26,23,0.15)", padding: "8px 12px", textAlign: "left", fontWeight: 700 }}>Date/Place of Issue</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: "8px 12px" }}>{displayValue(fields.notaryUserName)}</td>
                            <td style={{ padding: "8px 12px" }}>{displayValue(fields.notaryUserId)}</td>
                            <td style={{ padding: "8px 12px" }}>{displayValue(fields.notaryUserIssue)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
