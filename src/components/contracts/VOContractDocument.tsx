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

const BRANCH_ADDRESS_MAP: Record<string, { building: string; premisesAddress: string }> = {
    "insular life": {
        building: "Insular Life",
        premisesAddress: "11F Insular Life Building, Ayala Ave, Makati City, Metro Manila",
    },
    "tower 6789": {
        building: "Tower 6789",
        premisesAddress: "23F TOWER6789, 6789 Ayala Ave, Makati City, 1209 Metro Manila",
    },
};

export function resolveBranchAddress(branch?: string | null): { building: string; premisesAddress: string } {
    if (!branch) {
        return { building: "TO BE FILLED OUT", premisesAddress: "TO BE FILLED OUT" };
    }
    const key = branch.trim().toLowerCase();
    const match = BRANCH_ADDRESS_MAP[key];
    if (match) return match;
    return { building: branch, premisesAddress: "TO BE FILLED OUT" };
}

export function mapQuotationToVOContractFields(quotation: {
    detail?: {
        full_name?: string | null;
        id_address?: string | null;
        signatory_details?: string | null;
        id_name?: string | null;
        email?: string | null;
        phone?: string | null;
        contact_address?: string | null;
        company_name?: string | null;
        id_number?: string | null;
        signatory_id_address?: string | null;
        signatory_id_number?: string | null;
        package_price?: number | string | null;
        contract_admin_fee?: number | string | null;
        date?: string | null;
        months?: number | string | null;
    } | null;
    branch?: string | null;
    lease_term?: string | null;
}): VOContractFields {
    const d = quotation.detail || {};
    const startDate = d.date ? new Date(d.date) : null;

    const commencement = d.date
        ? Number.isNaN(startDate?.getTime() ?? NaN)
            ? String(d.date)
            : startDate!.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })
        : "TO BE FILLED OUT";

    const expiration = (() => {
        if (!startDate || Number.isNaN(startDate.getTime())) {
            return quotation.lease_term || "TO BE FILLED OUT";
        }
        const months = d.months ? Number(d.months) : 12;
        const endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + (Number.isFinite(months) ? months : 12));
        endDate.setDate(endDate.getDate() - 1);
        return endDate.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
    })();

    const formatAmount = (value?: number | string | null) => {
        if (value === null || value === undefined || value === "") return "TO BE FILLED OUT";
        const amount = Number(value);
        return Number.isFinite(amount) ? `PHP ${amount.toLocaleString("en-PH")}` : String(value);
    };
    const notaryDate = startDate && !Number.isNaN(startDate.getTime()) ? startDate : new Date();

    const { building, premisesAddress } = resolveBranchAddress(quotation.branch);

    return {
        userName: d.full_name || d.id_name || "TO BE FILLED OUT",
        userAddress: d.contact_address || d.id_address || "TO BE FILLED OUT",
        userRep: d.signatory_details || d.id_name || "TO BE FILLED OUT",
        userEmail: d.email || "TO BE FILLED OUT",
        userContact: d.phone || "TO BE FILLED OUT",
        building,
        premisesAddress,
        commencementDate: commencement,
        expirationDate: expiration,
        fixedFee: formatAmount(d.package_price),
        contractFee: formatAmount(d.contract_admin_fee),
        userSignerName: d.signatory_details || d.id_name || d.full_name || "TO BE FILLED OUT",
        userSignerAddress: d.contact_address || d.signatory_id_address || d.id_address || "TO BE FILLED OUT",
        userSignerCompany: d.company_name || "TO BE FILLED OUT",
        notaryUserName: d.signatory_details || d.full_name || "TO BE FILLED OUT",
        notaryUserId: d.id_number || d.signatory_id_number || "TO BE FILLED OUT",
        notaryUserIssue: d.contact_address || d.id_address || d.signatory_id_address || "TO BE FILLED OUT",
        notaryDay: String(notaryDate.getDate()).padStart(2, "0"),
        notaryMonth: notaryDate.toLocaleString("en-US", { month: "long" }),
        notaryYear: String(notaryDate.getFullYear()),
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
        <h3 style={{ margin: "20px 0 8px", fontSize: 15, fontWeight: 700, letterSpacing: "0.02em", color: "#1c1a17" }}>
            <span style={{ display: "inline-block", marginRight: 10, fontSize: 16 }}>{number}</span>
            ({title})
        </h3>
    );
}

export default function VOContractDocument({ fields }: VOContractDocumentProps) {
    return (
        <div style={{ fontFamily: '"Source Serif 4", Georgia, "Times New Roman", serif' }}>
            <div style={{ textAlign: "left", fontFamily: "IBM Plex Mono, ui-monospace, monospace", fontSize: 10, marginBottom: 12 }}>
                CONFIDENTIAL
            </div>

            <h1 style={{ margin: "0 0 24px", textAlign: "center", fontSize: 20, fontWeight: 700, textTransform: "uppercase" }}>
                Virtual Office Service Agreement
            </h1>

            <p style={{ margin: "0 0 20px" }}>
                This Virtual Office Service Agreement (&ldquo;<span style={{ fontWeight: 600 }}>Agreement</span>&rdquo;), is made by and between:
            </p>

            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid rgba(28,26,23,0.15)", marginBottom: 10, tableLayout: "fixed" }}>
                <colgroup>
                    <col style={{ width: 120 }} />
                    <col style={{ width: 140 }} />
                    <col />
                </colgroup>
                <tbody>
                    <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                        <td rowSpan={2} style={{ background: "#f6f3ec", padding: "10px 12px", fontWeight: 600, borderRight: "1px solid rgba(28,26,23,0.15)" }}>PROVIDER</td>
                        <td style={{ padding: "6px 12px 6px 12px", verticalAlign: "top", color: "#6b6155", borderRight: "1px solid rgba(28,26,23,0.15)" }}>Name</td>
                        <td style={{ padding: "10px 12px", verticalAlign: "top", fontSize: 14 }}>
                            Hero Serviced Office, Inc., INC.
                        </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                        <td style={{ padding: "6px 12px 6px 12px", verticalAlign: "top", color: "#6b6155", borderRight: "1px solid rgba(28,26,23,0.15)" }}>Address</td>
                        <td style={{ padding: "10px 12px", verticalAlign: "top", fontSize: 14 }}>
                            23F Tower 6789, 6789 Ayala Avenue, 1209 Makati City, Metro Manila, Philippines
                        </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                        <td rowSpan={5} style={{ background: "#f6f3ec", padding: "10px 12px", fontWeight: 600, borderRight: "1px solid rgba(28,26,23,0.15)" }}>USER</td>
                        <td style={{ padding: "10px 12px 10px 12px", verticalAlign: "top", color: "#6b6155", borderRight: "1px solid rgba(28,26,23,0.15)" }}>Name</td>
                        <td style={{ padding: "10px 12px", verticalAlign: "top", fontSize: 14 }}>{displayValue(fields.userName)}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                        <td style={{ padding: "8px 12px 8px 12px", verticalAlign: "top", color: "#6b6155", borderRight: "1px solid rgba(28,26,23,0.15)" }}>Address</td>
                        <td style={{ padding: "8px 12px", verticalAlign: "top", fontSize: 14 }}>{displayValue(fields.userAddress)}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                        <td style={{ padding: "8px 12px 8px 12px", verticalAlign: "top", color: "#6b6155", borderRight: "1px solid rgba(28,26,23,0.15)" }}>Representative</td>
                        <td style={{ padding: "8px 12px", verticalAlign: "top", fontSize: 14 }}>{displayValue(fields.userRep)}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                        <td style={{ padding: "8px 12px 8px 12px", verticalAlign: "top", color: "#6b6155", borderRight: "1px solid rgba(28,26,23,0.15)" }}>Email Address</td>
                        <td style={{ padding: "8px 12px", verticalAlign: "top", fontSize: 14 }}>{displayValue(fields.userEmail)}</td>
                    </tr>
                    <tr>
                        <td style={{ padding: "8px 12px 8px 12px", verticalAlign: "top", color: "#6b6155", borderRight: "1px solid rgba(28,26,23,0.15)" }}>Contact No.</td>
                        <td style={{ padding: "8px 12px", verticalAlign: "top", fontSize: 14 }}>{displayValue(fields.userContact)}</td>
                    </tr>
                </tbody>
            </table>
            <p>(The above parties are individually referred to herein as a “<span style={{ fontWeight: 700 }}>Party</span>,” and collectively as the “<span style={{ fontWeight: 700 }}>Parties</span>.”)</p>

            <h2 style={{ margin: "25px 20px 0 12px", textAlign: "center" }}>
                <span style={{ display: "block", fontWeight: 700, fontSize: 15, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Summary of Terms and Conditions
                </span>
                <span style={{ display: "block", margin: "0 0 20px", fontWeight: 400, fontSize: 13.5, textTransform: "none" }}>
                    (&ldquo;Agreement Overview&rdquo;)
                </span>
            </h2>

            <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid rgba(28,26,23,0.15)", marginBottom: 10, tableLayout: "fixed" }}>
                <colgroup>
                    <col style={{ width: 200 }} />
                    <col />
                    <col />
                </colgroup>
                <tbody>
                    <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                        <td style={{ background: "#f6f3ec", padding: "10px 12px", fontWeight: 600 }}>Building</td>
                        <td colSpan={2} style={{ padding: "10px 12px", fontSize: 14 }}>{displayValue(fields.building)}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                        <td style={{ background: "#f6f3ec", padding: "10px 12px", fontWeight: 600 }}>Premises / Rented Address</td>
                        <td colSpan={2} style={{ padding: "10px 12px", fontSize: 14 }}>{displayValue(fields.premisesAddress)}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                        <td style={{ background: "#f6f3ec", padding: "10px 12px", fontWeight: 600, verticalAlign: "top" }}>Rental Period</td>
                        <td style={{ padding: "10px 12px", borderRight: "1px solid rgba(28,26,23,0.15)", fontSize: 14 }}>
                            <span style={{ color: "#6b6155" }}>Commencement Date: </span>
                            <div>{displayValue(fields.commencementDate)}</div>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14 }}>
                            <span style={{ color: "#6b6155" }}>Expiration Date: </span>
                            <div>{displayValue(fields.expirationDate)}</div>
                        </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                        <td style={{ background: "#f6f3ec", padding: "10px 12px", fontWeight: 600 }}>
                            Fixed Fee
                            <div style={{ marginTop: 2, fontSize: 11, fontWeight: 400, color: "#6b6155" }}>Commencement to Expiration Date, excl. VAT</div>
                        </td>
                        <td colSpan={2} style={{ padding: "10px 12px", fontSize: 14 }}>{displayValue(fields.fixedFee)}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                        <td style={{ background: "#f6f3ec", padding: "10px 12px", fontWeight: 600 }}>
                            Facility Service Fees based on use
                        </td>
                        <td style={{ padding: "10px 12px", borderRight: "1px solid rgba(28,26,23,0.15)", fontSize: 14 }}>
                            Copy / Printer Use
                            <div>Color : PHP    40/page</div>
                            <div>B/W   : PHP    8/page</div>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 14 }}>
                            Conference Room
                            <div>Small : PHP   1,500/hour</div>
                            <div>Large : PHP   3,000/hour</div>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ background: "#f6f3ec", padding: "10px 12px", fontWeight: 600 }}>
                            Contract Fee
                            <div style={{ marginTop: 2, fontSize: 11, fontWeight: 400, color: "#6b6155" }}>excl. VAT</div>
                        </td>
                        <td colSpan={2} style={{ padding: "10px 12px", fontSize: 14 }}>{displayValue(fields.contractFee)}</td>
                    </tr>
                </tbody>
            </table>

            <div style={{ pageBreakBefore: "always", breakBefore: "page" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid rgba(28,26,23,0.15)", marginBottom: 10, tableLayout: "fixed" }}>
                    <tr>
                        <td style={{ padding: "8px 12px 8px 12px", fontSize: 14 }}>
                            <div style={{ fontWeight: 600 }}>Remark:</div>
                            <ol>
                                <li>The Contract Fee (PHP1,000+VAT) shall be charged to the USER for every renewal or amendment of this Agreement.</li>
                                <li>Payment shall be made in full upon signing.</li>
                                <li>The USER shall provide the Provider with at least two (2) months’ written notice prior to the expiration of this Agreement.</li>
                                <li>A Certification Fee shall be charged to the USER for every request made.</li>
                            </ol>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ padding: "8px 12px 8px 12px", fontSize: 14 }}>
                            <div style={{ fontWeight: 600 }}>Inclusion:</div>
                            <ol>
                                <li>Business Address</li>
                                <li>Mail Handling</li>
                                <li>Copies of the basic permits of the Provider</li>
                            </ol>
                        </td>
                    </tr>
                </table>
            </div>

            <SectionTitle number="Article 1" title="Use of the Rented Address" />
            <ol style={{ margin: "0 0 0 22px", padding: 0 }}>
                <li>The Provider shall allow the USER to use the Rented Address indicated in the Agreement Overview <span style={{ fontWeight: 600 }}>(without any dedicated office space)</span> on a non-exclusive basis as its business address in accordance with the terms and conditions herein.</li>
                <li>The USER shall use the Rented Address solely for registration purposes and business correspondences to facilitate the proper and lawful conduct of its business, and not for any other purpose. In no case shall the USER use the Rented Address for any illegal, unlawful or immoral trade or activity.</li>
                <li>During its use of the Rented Address, the USER shall hold the Provider free and harmless from any damage, liability or responsibility to any person or property arising out of or as a consequence of the use of the Rented Address by the USER.</li>
                <li>If the USER wishes to use any of the conference rooms and other facilities of the Provider at the Premises, then the USER may do so on an as-is-where-is and non-exclusive basis subject to the payment of the fees therefore and subject to the availability thereof. The USER shall also comply with the handbook and other related documents issued by the Provider from time to time (collectively, the “<span style={{ fontWeight: 600 }}>Handbook</span>”), the rules and regulations of the administrator of the Building and all laws applicable to the conduct of the business of the USER. </li>
            </ol>

            <SectionTitle number="Article 2" title="Fixed Fee and Other Fees" />
            <ol style={{ margin: "0 0 0 22px", padding: 0 }}>
                <li>The USER shall pay to the Provider the Fixed Fee, plus the VAT thereon, as consideration for the use of the Rented Address on or before the Commencement Date, which shall not be refundable.</li>
                <li>If the USER requests in writing to avail of any of the various optional services provided by the Provider, then the USER shall also pay the Monthly Optional Service Fees provided in the Agreement Overview, plus the VAT thereon, which shall be paid on or before the due date of invoice.</li>
                <li>The Facility Service Fees to be charged as provided in the Agreement Overview shall be paid on or before the due date of invoice.</li>
                <li>The invoice shall be considered delivered and accepted by the USER once sent to the email address mentioned above, unless the Provider is otherwise informed of any change in email address.</li>
                <li>The USER shall pay all reasonable costs relating to this Agreement, including any legal costs, stamp duties, and any bank charges.</li>
                <li>If the USER fails to make any payment due under this Agreement on time, then the USER shall pay an additional interest at the rate of at 2% of the total amount due per month until payment, a fraction of a month shall be considered one (1) whole month. Also, if the Provider is constrained to engage the services of a lawyer for the collection of any unpaid amount, the USER agrees to pay twenty five percent (25%) of the total amount due, but in no case less than Twenty Thousand Pesos (PHP 20,000.000) for attorney’s fees.</li>
            </ol>

            <SectionTitle number="Article 3" title="Service" />
            <p style={{ margin: "0 0 0 22px", padding: 0 }}>
                Provider will provide services during <span style={{ fontWeight: 600 }}>business hours</span> from <span style={{ fontWeight: 600 }}>9:00 am</span> to <span style={{ fontWeight: 600 }}>6:00 PM</span> from Monday to Friday and Provider will adhere to any public holidays in accordance with Philippine law. Provider may also declare certain business days as off day(s) subject to Provider giving at least 5 business days prior notice.
            </p>

            <SectionTitle number="Article 4" title="Rental Period and Renewal" />
            <ol style={{ margin: "0 0 0 22px", padding: 0 }}>
                <li>The Rental Period shall be as indicated in the Agreement Overview. Upon the Expiration date or termination of this Agreement, the USER shall immediately cease using the Rented Address.</li>
                <li>There shall be no tacit renewal of this Agreement. The Parties shall have no obligation to renew this Agreement, however, if the Parties wish to conclude a new agreement upon terms and conditions that are similar or different from those contained in this Agreement (the "New Agreement"), then the New Agreement shall take effect from the day following the Expiration Date.</li>
            </ol>

            <SectionTitle number="Article 5" title="Revision of Other Fees" />
            <p style={{ margin: "0 0 0 22px", padding: 0 }}>
                The Provider has the right to adjust the Monthly Optional Service Fees and Facility Service Fees by providing at least one (1)-month prior notice.
            </p>

            <SectionTitle number="Article 6" title="Reportorial Obligations" />
            <ol style={{ margin: "0 0 0 22px", padding: 0 }}>
                <li>The USER shall promptly provide all the permits, registrations, licenses or other documents of the USER as may be required from time to time by the Provider or any government authority. </li>
                <li>The Provider shall have the right to immediately terminate this Agreement upon written notice to the USER and without incurring any liability therefore for any failure of the USER to timely provide the required document.</li>
            </ol>

            <SectionTitle number="Article 7" title="Prohibited Acts" />
            <ol style={{ margin: "0 0 0 22px", padding: 0 }}>
                <li>The USER shall not commit any of the following acts: </li>
                <ol type="a" style={{ margin: "0 0 0 22px", padding: 0 }}>
                    <li>Use the Rented Address for any purpose other than that set forth in Article 1(2);</li>
                    <li>Directly or indirectly allow a third party to use the Rented Address for any purpose;</li>
                    <li>Perform any other act contrary to the provisions of this Agreement, the Handbook or any applicable law, rule or regulation.</li>
                </ol>
                <li>If the USER violates this article and causes damages to the Provider and/or other users and persons, then the USER shall be liable to compensate the Provider and/or such affected persons for the full amount of such damages. The same shall apply when the employees, agents, representatives and other persons authorized by the USER violate this article.</li>
                <li>The USER and its guests shall use the premises in a considerate manner at all times. Conduct deemed disorderly at the sole discretion of the Provider shall be grounds for immediate expulsion from the premises and the termination of this Agreement. In such cases, no refund of fees shall be made.</li>
            </ol>

            <SectionTitle number="Article 8" title="Confidentiality" />
            <p style={{ margin: "0 0 0 22px", padding: 0 }}>
                The Provider guarantees that all customer information will be kept with strict confidentiality and will not be sold or released to any third party. However, Provider reserves the right to release information of the USER to a third party at its sole discretion if the Provider suspects that the USER is in breach of this Agreement or is in violation of the law.
            </p>

            <SectionTitle number="Article 9" title="Disclaimers" />
            <ol style={{ margin: "0 0 0 22px", padding: 0 }}>
                <li>The Provider shall not be liable for any loss, damage, theft, disclosure, misuse or misappropriation of the mail, information, including confidential information, and any other property of the USER. This clause shall not apply if any of the above occurs due to the gross negligence or willful misconduct of the Provider (including its employees).</li>
                <li>In addition to the preceding paragraph, the Provider shall not be liable for any loss or damage caused by any event of force majeure or circumstances beyond its reasonable control, which include the services provided by third parties, that may result in any loss, injury or damage to the USER.</li>
            </ol>

            <SectionTitle number="Article 10" title="Free and Harmless" />
            <p style={{ margin: "0 0 0 22px", padding: 0 }}>
                The USER, including its employees, agents or representatives, shall not hold the Provider, its directors, officers, employees, agents or representatives liable, civilly or criminally, for any action done or caused to be done pursuant to any provision of this Agreement.  Any and all such actions of the Provider and such persons shall also not be the subject of any temporary restraining order or injunction.
            </p>

            <SectionTitle number="Article 11" title="Relationship of the Parties" />
            <p style={{ margin: "0 0 0 22px", padding: 0 }}>
                The Parties agree that each of them is an independent contractor and not an agent, joint venture or partner of the other Party. This Agreement shall not be construed to constitute or to create a partnership or a joint venture or any other form of legal association that would impose liability upon a Party for the act or failure to act of the other Party or as providing a Party with the right, power or authority (express or implied) to create any duty or obligation on behalf of the other Party.
            </p>

            <SectionTitle number="Article 12" title="Miscellaneous" />
            <ol type="a" style={{ margin: "0 0 0 22px", padding: 0 }}>
                <li>Where demand or notice is required to be given under this Agreement, notice sent to the USER at the address of its representative (or such other address designated by the USER in writing) by registered mail, personal delivery, electronic mail or facsimile, shall be considered sufficient compliance with such requirement.</li>
                <li>This Agreement, including its formation, validity, performance and execution, shall be governed by and construed in accordance with the internal laws of the Philippines.</li>
                <li>If any provision of this Agreement is held by any competent authority to be illegal or invalid, then the remainder of the provisions hereof shall remain in effect.</li>
                <li>This Agreement constitutes the entire agreement between the Parties with respect to the subject matter hereof, and supersedes all prior communications and agreements of the Parties with regard to the same.</li>
                <li>No amendment of any provision of this Agreement shall be binding unless made in writing and duly signed by the duly authorized representatives of the Parties.</li>
                <li>The USER shall not assign or transfer any of its rights, interests and obligations under this Agreement, in whole or in part, without the prior written consent of the Provider, which consent may be withheld or granted, with or without conditions. Any assignment or transfer in violation of this clause shall be void and of no effect.</li>
                <li>All <span style={{ fontWeight: 600 }}>taxes</span> in relation to this Agreement, including the payment of <span style={{ fontWeight: 600 }}>documentary stamp</span> taxes, shall be exclusively for the account of the USER.</li>
            </ol>

            <SectionTitle number="Article 13" title="Contract Fee" />
            <ol style={{ margin: "0 0 0 22px", padding: 0 }}>
                <li>The USER shall pay the Contract Fee provided in the Agreement Overview, including the VAT thereon, to the Provider on the date of execution of this Agreement as an administration fee.</li>
                <li>The Contract Fee shall not be refunded for any reason.</li>
            </ol>

            <p style={{ margin: "28px 0 28px" }}><span style={{ fontWeight: 600 }}>IN WITNESS WHEREOF,</span> the Parties have caused this Agreement to be executed by their respective duly authorized representatives on the date first written above.</p>

            <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 30 }}>
                <tbody>
                    <tr>
                        <td style={{ width: "50%", padding: "0 26px 0 0", verticalAlign: "top" }}>
                            <p>The Provider:</p>
                            <div style={{ width: 190, height: 1, background: "rgba(28,26,23,0.4)", margin: "44px 0 8px" }} />
                            <p style={{ margin: "0 0 4px", fontSize: 14 }}>Name: Raymund A. Taguibao</p>
                            <p style={{ margin: "0 0 4px", marginLeft: 46, fontSize: 14 }}>General Manager</p>
                            <p style={{ margin: "0 0 4px", marginLeft: 46, fontSize: 14, fontWeight: 600 }}>Hero Serviced Office, Inc.</p>
                        </td>
                    </tr>
                    <tr>
                        <td style={{ width: "50%", verticalAlign: "top", padding: "25px 0 0" }}>
                            <p>The USER:</p>
                            <div style={{ width: 190, height: 1, background: "rgba(28,26,23,0.4)", margin: "44px 0 8px" }} />
                            <p style={{ margin: "0 0 4px", fontSize: 14 }}>Name: {displayValue(fields.userSignerName)}</p>
                            <p style={{ margin: "0 0 4px", fontSize: 14 }}>Address: {displayValue(fields.userSignerAddress)}</p>
                            <p style={{ margin: "0 0 4px", fontSize: 14 }}>Company: <span style={{ fontWeight: 600 }}>{displayValue(fields.userSignerCompany)}</span></p>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div style={{ pageBreakBefore: "always", breakBefore: "page" }}>
                <h2 style={{ margin: "0 0 40px", textAlign: "center", fontSize: 15, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Acknowledgment</h2>
                <p>
                    REPUBLIC OF THE PHILIPPINES)<br />
                    CITY OF MAKATI, METRO MANILA) S.S.
                </p>

                <p style={{ margin: "40px 0 18px" }}>
                    BEFORE ME, a notary public for and in Makati City, Metro Manila, on this {displayValue(fields.notaryDay, "___")} day of {displayValue(fields.notaryMonth, "________")}, {displayValue(fields.notaryYear, "_____")} at Makati City, Philippines, personally appeared the following:
                </p>

                <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid rgba(28,26,23,0.15)", marginBottom: 18 }}>
                    <thead>
                        <tr style={{ background: "#f6f3ec", textAlign: "center" }}>
                            <th style={{ borderBottom: "1px solid rgba(28,26,23,0.15)", padding: "8px 12px", fontWeight: 700 }}>Name</th>
                            <th style={{ borderBottom: "1px solid rgba(28,26,23,0.15)", padding: "8px 12px", fontWeight: 700 }}>Gov&apos;t Issued I.D./Passport No.</th>
                            <th style={{ borderBottom: "1px solid rgba(28,26,23,0.15)", padding: "8px 12px", fontWeight: 700 }}>Date/Place of Issue</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ textAlign: "center", borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                            <td style={{ padding: "8px 12px", fontSize: 14 }}>Raymund Taguibao</td>
                            <td style={{ padding: "8px 12px", fontSize: 14 }}>N01-95-175-815</td>
                            <td style={{ padding: "8px 12px", fontSize: 14 }}>0CT. 05, 2023/LTO PH</td>
                        </tr>
                        <tr style={{ textAlign: "center", borderBottom: "1px solid rgba(28,26,23,0.15)" }}>
                            <td style={{ padding: "8px 12px", fontSize: 14 }}>{displayValue(fields.notaryUserName)}</td>
                            <td style={{ padding: "8px 12px", fontSize: 14 }}>{displayValue(fields.notaryUserId)}</td>
                            <td style={{ padding: "8px 12px", fontSize: 14 }}>{displayValue(fields.notaryUserIssue)}</td>
                        </tr>
                    </tbody>
                </table>

                <p style={{ margin: "0 0 18px" }}>
                    personally known to me to be the same persons who executed the foregoing instrument and acknowledged to me that the same is their free act and voluntary deed as well as the free act and voluntary deed of the corporations which they represent.
                </p>

                <p>
                    <span style={{ fontWeight: 600 }}>IN WITNESS WHEREOF,</span> I have here unto set my hand and affixed my notarial seal at the place and on the date first written above.
                </p>

                <div style={{ marginTop: 44 }}>
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 450, }} />

                        <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                            NOTARY PUBLIC
                        </span>
                    </div>

                    <div>
                        Doc. No. ____;<br />
                        Page No. ____;<br />
                        Book No. ____;<br />
                        Series of 2026.
                    </div>
                </div>
            </div>
        </div>
    );
}
