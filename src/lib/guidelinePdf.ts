import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";
import type { QuotationPayload } from "@/lib/nodemailer";
import { getGuidelineBranchAddress } from "@/lib/guidelineFields";

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BLUE = rgb(0.05, 0.28, 0.63);
const TEXT = rgb(0.08, 0.08, 0.08);
const MUTED = rgb(0.35, 0.35, 0.35);

function clean(value: unknown, fallback = "Not specified"): string {
    const text = String(value ?? "").trim();
    return text || fallback;
}

function money(value: unknown): string {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "Not specified";
    return `PHP ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function date(value?: string | null): string {
    if (!value) return "Not specified";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
        ? value
        : parsed.toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" });
}

function wrapText(text: string, font: PDFFont, size: number, width: number): string[] {
    const words = text.replace(/[\r\n\t]+/g, " ").split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
        const next = current ? `${current} ${word}` : word;
        if (font.widthOfTextAtSize(next, size) > width && current) {
            lines.push(current);
            current = word;
        } else {
            current = next;
        }
    }
    if (current) lines.push(current);
    return lines;
}

function branchInfo(branch?: string | null): { building: string; address: string; phone: string } {
    const normalized = String(branch || "").toLowerCase();
    if (normalized.includes("insular")) {
        return {
            building: "Insular Life Building",
            address: "11F Insular Life Building, Makati, Philippines",
            phone: "(02) 8-246-0801 / (02) 8-246-0831",
        };
    }
    return {
        building: "Tower 6789",
        address: "23F Tower 6789, 6789 Ayala Ave., Brgy. Bel Air, Makati, Philippines",
        phone: "(02) 8-801-3417",
    };
}

function documentTitle(quotation: QuotationPayload): string {
    const service = String(quotation.service_name || "").toLowerCase();
    return service.includes("meeting") ? "MEETING ROOM GUIDELINES" : "CO-WORKING ACCESS GUIDELINES";
}

function officeWording(quotation: QuotationPayload): string {
    const service = String(quotation.service_name || "").toLowerCase();
    return service.includes("meeting") ? "Meeting Room" : "Co-working space";
}

export async function generateGuidelinePdf(quotation: QuotationPayload): Promise<Buffer> {
    const service = String(quotation.service_name || "").toLowerCase();
    return service.includes("meeting")
        ? generateMeetingRoomGuidelinePdf(quotation)
        : generateCoworkingGuidelinePdf(quotation);
}

export async function generateCoworkingGuidelinePdf(quotation: QuotationPayload): Promise<Buffer> {
    return generateGuidelineDocument(quotation);
}

export async function generateMeetingRoomGuidelinePdf(quotation: QuotationPayload): Promise<Buffer> {
    return generateGuidelineDocument(quotation);
}

async function generateGuidelineDocument(quotation: QuotationPayload): Promise<Buffer> {
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const boldItalic = await pdf.embedFont(StandardFonts.HelveticaBoldOblique);
    const saved = quotation.detail.guideline_fields || {};
    const effectiveQuotation: QuotationPayload = {
        ...quotation,
        service_name: saved.service || quotation.service_name,
        branch: saved.building || quotation.branch,
        lease_term: saved.term || quotation.lease_term,
        detail: {
            ...quotation.detail,
            full_name: saved.clientName || quotation.detail.full_name,
            company_name: saved.companyName || quotation.detail.company_name,
            email: saved.email || quotation.detail.email,
            phone: saved.phone || quotation.detail.phone,
            date: saved.useDate || quotation.detail.date,
            end_date: saved.endDate || quotation.detail.end_date,
            time: saved.time || quotation.detail.time,
            seats: saved.seatsOrParticipants ? Number(saved.seatsOrParticipants) || null : quotation.detail.seats,
            duration_type: saved.duration || quotation.detail.duration_type,
            total: saved.quotationAmount || quotation.detail.total,
            contract_admin_fee: saved.applicableFees || quotation.detail.contract_admin_fee,
            other_requirements: saved.otherRequirements || quotation.detail.other_requirements,
        },
    };
    const detail = effectiveQuotation.detail;
    const branch = {
        ...branchInfo(effectiveQuotation.branch),
        address: saved.premisesAddress || getGuidelineBranchAddress(effectiveQuotation.branch) || branchInfo(effectiveQuotation.branch).address,
    };
    const title = documentTitle(effectiveQuotation);
    const wording = officeWording(effectiveQuotation);
    let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    let y = PAGE_HEIGHT - MARGIN;

    const addPage = () => {
        page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
        header();
    };
    const ensure = (height: number) => {
        if (y - height < 58) addPage();
    };

    const text = (value: string, size = 10, options: { bold?: boolean; color?: ReturnType<typeof rgb>; gap?: number; indent?: number } = {}) => {
        const usedFont = options.bold ? bold : font;
        const lines = wrapText(value, usedFont, size, CONTENT_WIDTH - (options.indent || 0));
        ensure(lines.length * size * 1.45 + (options.gap ?? 4));
        for (const line of lines) {
            page.drawText(line, { x: MARGIN + (options.indent || 0), y: y - size, size, font: usedFont, color: options.color || TEXT });
            y -= size * 1.45;
        }
        y -= options.gap ?? 4;
    };

    const centeredText = (value: string, size = 10, options: { bold?: boolean; color?: ReturnType<typeof rgb>; gap?: number } = {}) => {
        const usedFont = options.bold ? bold : font;
        const lines = wrapText(value, usedFont, size, CONTENT_WIDTH);
        ensure(lines.length * size * 1.45 + (options.gap ?? 4));
        for (const line of lines) {
            const lineWidth = usedFont.widthOfTextAtSize(line, size);
            page.drawText(line, { x: MARGIN + (CONTENT_WIDTH - lineWidth) / 2, y: y - size, size, font: usedFont, color: options.color || TEXT });
            y -= size * 1.45;
        }
        y -= options.gap ?? 4;
    };

    const heading = (value: string) => {
        ensure(28);
        centeredText(value, 12, { bold: true, color: TEXT, gap: 6 });
    };

    const numbered = (number: string, titleValue: string, body: string) => {
        ensure(42);
        text(`${number}.   ${titleValue}`, 10, { bold: true, gap: 2 });
        text(body, 10, { gap: 6 });
    };

    const bulletList = (items: string[], options: { indent?: number; bullet?: string; gap?: number } = {}) => {
        const indent = options.indent ?? 14;
        const bullet = options.bullet ?? "\u2022";
        const bulletX = MARGIN + indent;
        const textX = bulletX + 14;
        const size = 10;
        for (const item of items) {
            const lines = wrapText(item, font, size, PAGE_WIDTH - MARGIN - textX);
            ensure(lines.length * size * 1.45);
            lines.forEach((line, i) => {
                if (i === 0) page.drawText(bullet, { x: bulletX, y: y - size, size, font, color: TEXT });
                page.drawText(line, { x: textX, y: y - size, size, font, color: TEXT });
                y -= size * 1.45;
            });
        }
        y -= options.gap ?? 6;
    };

    const columnList = (items: string[], columns = 3, options: { indent?: number; bullet?: string } = {}) => {
        const indent = options.indent ?? 20;
        const bullet = options.bullet ?? "-";
        const size = 10;
        const rowHeight = size * 1.6;
        const rows = Math.ceil(items.length / columns);
        const colWidth = (CONTENT_WIDTH - indent) / columns;
        ensure(rows * rowHeight + 6);
        const top = y;
        items.forEach((item, i) => {
            const row = Math.floor(i / columns);
            const col = i % columns;
            const x = MARGIN + indent + col * colWidth;
            const rowY = top - row * rowHeight - size;
            page.drawText(bullet, { x, y: rowY, size, font, color: TEXT });
            page.drawText(item, { x: x + 14, y: rowY, size, font, color: TEXT });
        });
        y = top - rows * rowHeight - 6;
    };

    // Two-column numbered list — matches the "REQUIREMENTS" layout (items 1-3 left, 4-5 right).
    const twoColumnNumberedList = (items: string[]) => {
        const size = 10;
        const numWidth = 18;
        const colWidth = CONTENT_WIDTH / 2;
        const gutter = 10;
        const mid = Math.ceil(items.length / 2);
        const columns = [items.slice(0, mid), items.slice(mid)];
        const columnLines = columns.map((col, colIndex) =>
            col.map((item, idx) => ({
                label: `${colIndex === 0 ? idx + 1 : mid + idx + 1}.`,
                lines: wrapText(item, font, size, colWidth - numWidth - gutter),
            }))
        );
        const columnHeight = (col: { lines: string[] }[]) =>
            col.reduce((sum, entry) => sum + entry.lines.length * size * 1.45, 0);
        ensure(Math.max(columnHeight(columnLines[0]), columnHeight(columnLines[1])) + 6);
        const top = y;
        columnLines.forEach((col, colIndex) => {
            const xBase = MARGIN + colIndex * colWidth;
            let cy = top;
            for (const entry of col) {
                page.drawText(entry.label, { x: xBase, y: cy - size, size, font, color: TEXT });
                entry.lines.forEach((line) => {
                    page.drawText(line, { x: xBase + numWidth, y: cy - size, size, font, color: TEXT });
                    cy -= size * 1.45;
                });
            }
        });
        const usedHeight = Math.max(columnHeight(columnLines[0]), columnHeight(columnLines[1]));
        y = top - usedHeight - 6;
    };

    const drawTable = (rows: Array<[string, string]>) => {
        const leftWidth = 170;
        const rowHeight = 20;
        for (const [label, value] of rows) {
            ensure(rowHeight);
            const cursor = y;
            page.drawRectangle({ x: MARGIN, y: cursor - rowHeight, width: CONTENT_WIDTH, height: rowHeight, borderColor: TEXT, borderWidth: 0.6 });
            page.drawLine({ start: { x: MARGIN + leftWidth, y: cursor }, end: { x: MARGIN + leftWidth, y: cursor - rowHeight }, thickness: 0.6, color: TEXT });
            page.drawText(label, { x: MARGIN + 6, y: cursor - 14, size: 8.5, font, color: TEXT });
            const valueLines = wrapText(value, font, 8.5, CONTENT_WIDTH - leftWidth - 12);
            page.drawText(valueLines[0] || "", { x: MARGIN + leftWidth + 6, y: cursor - 14, size: 8.5, font: label === "Bank Name" || label === "Account Name" || label === "Account Number" || label === "Swift Code" ? bold : font, color: TEXT });
            y = cursor - rowHeight;
        }
    };

    const drawServicesTable = (groups: Array<{ label: string; rows: Array<[string, string]> }>) => {
        const rowHeight = 20;
        const colWidth = CONTENT_WIDTH / 2;
        const drawRow = (left: string, right: string, useFont: PDFFont, centerBoth: boolean) => {
            ensure(rowHeight);
            const cursor = y;
            page.drawRectangle({ x: MARGIN, y: cursor - rowHeight, width: CONTENT_WIDTH, height: rowHeight, borderColor: TEXT, borderWidth: 0.6 });
            page.drawLine({ start: { x: MARGIN + colWidth, y: cursor }, end: { x: MARGIN + colWidth, y: cursor - rowHeight }, thickness: 0.6, color: TEXT });
            const drawCentered = (value: string, cellX: number) => {
                if (!value) return;
                const size = 8.5;
                const width = useFont.widthOfTextAtSize(value, size);
                page.drawText(value, { x: cellX + (colWidth - width) / 2, y: cursor - 13.5, size, font: useFont, color: TEXT });
            };
            drawCentered(left, MARGIN);
            if (centerBoth) drawCentered(right, MARGIN + colWidth);
            y = cursor - rowHeight;
        };
        drawRow("ITEMS", "RATE", bold, true);
        for (const group of groups) {
            drawRow(group.label, "", bold, false);
            for (const [label, rate] of group.rows) {
                drawRow(label, rate, font, true);
            }
        }
    };

    const header = () => {
        page.drawText("Hero Serviced Office, Inc.", { x: MARGIN, y: PAGE_HEIGHT - 50, size: 10, font: bold, color: TEXT });
        page.drawText("Tower 6789", { x: MARGIN, y: PAGE_HEIGHT - 64, size: 9, font, color: TEXT });
        page.drawText("23F Tower 6789, 6789 Ayala Ave., Brgy. Bel Air, Makati, Philippines", { x: MARGIN, y: PAGE_HEIGHT - 77, size: 7.5, font, color: TEXT });
        page.drawText("(02) 8-801-3417", { x: MARGIN, y: PAGE_HEIGHT - 89, size: 8, font, color: TEXT });
        page.drawText("Hero Serviced Office, Inc.", { x: PAGE_WIDTH - 215, y: PAGE_HEIGHT - 50, size: 10, font: bold, color: TEXT });
        page.drawText("Insular Life Building", { x: PAGE_WIDTH - 215, y: PAGE_HEIGHT - 64, size: 9, font, color: TEXT });
        page.drawText("11F Insular Life Building, Makati, Philippines", { x: PAGE_WIDTH - 215, y: PAGE_HEIGHT - 77, size: 7.5, font, color: TEXT });
        page.drawText("(02) 8-246-0801", { x: PAGE_WIDTH - 215, y: PAGE_HEIGHT - 89, size: 8, font, color: TEXT });
        page.drawText("(02) 8-246-0831", { x: PAGE_WIDTH - 215, y: PAGE_HEIGHT - 99, size: 8, font, color: TEXT });
        y = PAGE_HEIGHT - 126;
    };
    const footer = () => {
        page.drawRectangle({ x: 0, y: 28, width: PAGE_WIDTH, height: 8, color: BLUE });
        page.drawText("www.hero-jpn.co.jp / https://heroph.net/jp/", { x: PAGE_WIDTH / 2 - 95, y: 12, size: 7.5, font, color: MUTED });
    };

    header();
    centeredText(title, 17, { bold: true, gap: 18 });
    heading("REQUIREMENTS:");
    twoColumnNumberedList([
        "Updated and Signed Quotation",
        "Initial Payment as indicated in the Formal Quotation",
        "Proof of Initial Payment",
        "List of Names who will use the office",
        "Primary Government Issued-ID must be presented at the Building Lobby",
    ]);

    heading("PAYMENT GUIDELINES:");
    numbered("1", "Initial Payment Requirement", "The total amount stated in the quotation must be fully settled before use of office premises. Rates are subject to 12% VAT.");
    numbered("2", "Modes of Payment", "You may settle the amount indicated in the quotation through the following payment methods: (a) Bank Transfer to HERO Serviced Office accounts (please see bank account details below); (b) Cash payment.");
    text("Withholding Tax (If Applicable)", 10, { bold: true, gap: 2 });
    text("Kindly provide a copy of the company's BIR Form 2303 for tax withholding purposes.", 10, { gap: 12 });

    heading("BANK DETAILS:");
    drawTable([
        ["Currency / Type", "PHP (PESO) - Current Account"], ["Bank Name", "RCBC"], ["Account Name", "HERO SERVICED OFFICE, INC."], ["Company Address", "23F TOWER6789, Ayala Avenue 6789, Makati City, 1209, Manila, Philippines."], ["Account Number", "0000007589020388"], ["Branch", "Tordesillas"], ["Branch Address", "G/F Metropole Bldg., Tordesillas St. Cor. Gil Puyat Ave., Makati City"], ["Swift Code", "RCBCPHMM"],
    ]);
    y -= 12;
    drawTable([
        ["Currency / Type", "PHP (PESO) - Current Account"], ["Bank Name", "STERLING BANK OF ASIA"], ["Account Name", "HERO SERVICED OFFICE, INC."], ["Company Address", "23F TOWER6789, Ayala Avenue 6789, Makati City, 1209, Manila, Philippines."], ["Account Number", "541-6-000236-80"], ["Branch", "Amorsolo"], ["Branch Address", "G/F Amorsolo Mansion, Amorsolo cor. Herrera Sts., Legaspi Village, 1229 Makati City"], ["Swift Code", "STLAPH22XXX"],
    ]);
    y -= 14;

    heading("BUILDING & OFFICE GUIDELINES:");
    numbered("1", "Office Use", `User shall maintain the cleanliness of the ${wording} before, during and after usage.`);
    numbered("2", "Visitors", "All visitors must always comply with the building and management's rules and regulations. Kindly bring 1 valid government issued ID to be presented at the building lobby.");
    ensure(10 * 1.45 + 2);
    page.drawText("List of Accepted IDs :", { x: MARGIN, y: y - 10, size: 10, font: boldItalic, color: TEXT });
    y -= 10 * 1.45 + 2;
    columnList(["Physical National ID", "UMID/ SSS ID", "Postal ID", "PRC ID", "Driver's License", "Voter's ID", "Passport"], 3);
    numbered("3", "Silence and Proper Conduct", "Tenants are required to observe silence and maintain proper decorum within the premises. Loud conversations, music, disruptive behavior, or any activity that may disturb other tenants is strictly prohibited. Kindly respect the privacy, work environment, and operations of other tenants and companies within the building.");
    numbered("4", "Dress Code and Professionalism", "Proper and decent attire must be always observed. As the office is a shared professional environment, appropriate attire and behavior are expected.");
    text("Prohibited attire:", 10, { bold: true, gap: 2 });
    bulletList(["Shorts, skorts, and mini skirt", "Tank tops, spaghetti straps, cropped tops, jersey shirts, and sando", "Slippers, Crocs and flipflops"]);
    numbered("5", "Prohibited Activities", "The following are not allowed within the office premises:");
    bulletList([
        "Smoking, Vaping and Drinking of Alcoholic beverages",
        "Loitering in common areas",
        "Excessive noise or gatherings",
        "Use of the office for non-approved activities",
        "Taking videos or photos of tenants, their company name and logo without consent or permission",
        "Any conduct that may cause inconvenience, discomfort, or disruption to other tenants",
    ]);
    numbered("6", "Pantry and Co-working Space Access", "Clients may access the pantry and common area. Pantry access includes unlimited coffee, tea and drinking water, as well as the use of microwave facilities. Proper cleanliness and courtesy must be observed after use. Kindly bring your own glass and mugs. Delivery of foods are allowed at the expense of the User. Cooking, plugging or using heating devices are not allowed.");
    numbered("7", "Bringing of Equipment", "All equipment to be brought inside the office shall be subject to the Provider's approval and may be subject to additional charges.");
    footer();

    page = pdf.addPage([
        PAGE_WIDTH,
        PAGE_HEIGHT,
    ]);

    header();

    y = PAGE_HEIGHT - 126;

    text("8.   Additional Services", 10, { bold: true, gap: 3 });

    drawServicesTable([
        {
            label: "Meeting Room:",
            rows: [
                ["Hourly", "PHP 1,500"],
                ["Daily (8 hours)", "PHP 9,000"],
            ],
        },
        {
            label: "Printing Services:",
            rows: [
                ["Black and White", "PHP 8/page"],
                ["Colored", "PHP 40/page"],
            ],
        },
        {
            label: "Co-Working Space:",
            rows: [
                ["Daily (8 hours)", "PHP 550"],
                ["Monthly", "PHP 6,000"],
            ],
        },
    ]);

    y -= 8;

    text(
        "*All rates are subject to 12% VAT",
        10,
        {
            bold: true,
            gap: 8,
        }
    );

    for (const currentPage of pdf.getPages()) {
        if (currentPage !== page) {
            currentPage.drawRectangle({ x: 0, y: 28, width: PAGE_WIDTH, height: 8, color: BLUE });
            currentPage.drawText("www.hero-jpn.co.jp / https://heroph.net/jp/", { x: PAGE_WIDTH / 2 - 95, y: 12, size: 7.5, font, color: MUTED });
        }
    }
    footer();
    return Buffer.from(await pdf.save());
}