import type { VNEInvoice, VNEInvoiceValidationResult } from "../types.ts";
import { VN_CURRENCY_CODE } from "../types.ts";

export const generateVNEInvoiceId = (): string => {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:T.]/gu, "")
    .slice(0, 14);
  const random = `${Math.floor(Math.random() * 100_000)}`.padStart(5, "0");
  return `${timestamp}-${random}`;
};

export const formatVNInvoiceNumber = (
  series: string,
  number: number,
  taxCode?: string,
  date?: Date
): string => {
  const paddedNumber = `${number}`.padStart(6, "0");
  if (taxCode && date) {
    return `${series}/${paddedNumber}/${taxCode}/${date.toISOString().split("T")[0].replace(/-/gu, "")}`;
  }

  return `${series}/${paddedNumber}`;
};

export const validateVNEInvoice = (
  invoice: VNEInvoice
): VNEInvoiceValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!invoice.invoiceNumber.trim()) {
    errors.push("Invoice number is required");
  }
  if (!invoice.series.trim()) {
    errors.push("Invoice series is required");
  }
  if (!(invoice.date instanceof Date) || Number.isNaN(invoice.date.getTime())) {
    errors.push("Invoice date is required and must be valid");
  }
  if (!(invoice.seller.name.trim() && invoice.seller.address.trim())) {
    errors.push("Seller name and address are required");
  }
  if (!invoice.buyer.name.trim()) {
    errors.push("Buyer name is required");
  }
  if (invoice.items.length === 0) {
    errors.push("At least one invoice item is required");
  }

  const calculatedTotal = invoice.items.reduce(
    (sum, item) => sum + item.totalAmount,
    0
  );
  const expectedTotal = invoice.totalBeforeVAT + invoice.totalVAT;
  if (Math.abs(calculatedTotal - expectedTotal) > 1) {
    errors.push(
      `Total mismatch: calculated ${calculatedTotal}, expected ${expectedTotal}`
    );
  }

  if (invoice.currencyCode !== VN_CURRENCY_CODE) {
    warnings.push(
      `Currency should be ${VN_CURRENCY_CODE}, got ${invoice.currencyCode}`
    );
  }

  if (!invoice.seller.taxCode) {
    warnings.push("Seller tax code is recommended");
  }

  return {
    errors,
    valid: errors.length === 0,
    warnings,
  };
};

const escapeXML = (value: string | number): string =>
  `${value}`
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;")
    .replace(/'/gu, "&apos;");

export const generateVNEInvoiceXML = (invoice: VNEInvoice): string => {
  const validation = validateVNEInvoice(invoice);
  if (!validation.valid) {
    throw new Error(`Invalid invoice: ${validation.errors.join(", ")}`);
  }

  const invoiceId = invoice.id ?? generateVNEInvoiceId();
  const issueDate = invoice.date.toISOString().split("T")[0];
  const dueDate = invoice.dueDate?.toISOString().split("T")[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<EInvoice>\n  <InvoiceId>${escapeXML(invoiceId)}</InvoiceId>\n  <InvoiceNumber>${escapeXML(invoice.invoiceNumber)}</InvoiceNumber>\n  <Series>${escapeXML(invoice.series)}</Series>\n  <IssueDate>${issueDate}</IssueDate>`;

  if (dueDate) {
    xml += `\n  <DueDate>${dueDate}</DueDate>`;
  }

  xml += `\n  <Seller>\n    <Name>${escapeXML(invoice.seller.name)}</Name>`;
  if (invoice.seller.taxCode) {
    xml += `\n    <TaxCode>${escapeXML(invoice.seller.taxCode)}</TaxCode>`;
  }
  xml += `\n    <Address>${escapeXML(invoice.seller.address)}</Address>\n  </Seller>\n  <Buyer>\n    <Name>${escapeXML(invoice.buyer.name)}</Name>`;
  if (invoice.buyer.taxCode) {
    xml += `\n    <TaxCode>${escapeXML(invoice.buyer.taxCode)}</TaxCode>`;
  }
  xml += `\n    <Address>${escapeXML(invoice.buyer.address)}</Address>\n  </Buyer>\n  <Items>`;

  for (const item of invoice.items) {
    xml += `\n    <Item>\n      <Description>${escapeXML(item.description)}</Description>\n      <Quantity>${item.quantity}</Quantity>\n      <Unit>${escapeXML(item.unit)}</Unit>\n      <UnitPrice>${item.unitPrice}</UnitPrice>\n      <Amount>${item.amount}</Amount>\n      <VATRate>${item.vatRate}</VATRate>\n      <VATAmount>${item.vatAmount}</VATAmount>\n      <TotalAmount>${item.totalAmount}</TotalAmount>\n    </Item>`;
  }

  xml += `\n  </Items>\n  <Summary>\n    <TotalBeforeVAT>${invoice.totalBeforeVAT}</TotalBeforeVAT>\n    <TotalVAT>${invoice.totalVAT}</TotalVAT>\n    <TotalAfterVAT>${invoice.totalAfterVAT}</TotalAfterVAT>\n    <PaymentMethod>${escapeXML(invoice.paymentMethod)}</PaymentMethod>\n    <CurrencyCode>${escapeXML(invoice.currencyCode)}</CurrencyCode>\n    <Status>${escapeXML(invoice.status)}</Status>\n  </Summary>\n</EInvoice>`;

  return xml;
};
