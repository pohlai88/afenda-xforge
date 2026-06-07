# `@repo/jurisdictions-vn`

Vietnam jurisdiction helpers for xforge.

## Purpose

This package keeps Vietnam-specific constants and pure calculation helpers out of feature packages. It is intentionally limited to reusable jurisdiction logic:

- VAT, PIT, and CIT calculation helpers
- social, health, and unemployment insurance calculations
- e-invoice data contracts and XML generation helpers
- Vietnamese bank metadata and VietQR helpers
- currency/date formatting utilities

## Adoption Boundary

The source was inspired by Viet-ERP's `@vierp/vietnam` package, but xforge keeps this package framework-free and domain-neutral. Do not add ERP module schemas, invoice persistence, provider credentials, or runtime sync handlers here.

## Data Freshness

Legal constants can change. Any change to tax rates, insurance caps, bank metadata, or e-invoice requirements should include:

- the effective date
- the source regulation or provider reference
- focused tests for the changed calculation
- a note in the feature or release changelog that consumes the change

## Verification Checklist

- VAT forward and reverse calculations allow expected VND rounding
- PIT bracket changes are tested at bracket boundaries
- CIT preferential rates are tested by company size and zone
- insurance calculations apply the salary cap consistently
- bank lookup works by code and BIN
- generated e-invoice XML escapes user-provided values
