"use client";
import React from "react";
import QRCode from "react-qr-code";

interface BarcodeProps {
  value: string;
}

export function QrCodeComponent({ value }: BarcodeProps) {
  return (
    <QRCode value={value} size={64} bgColor="transparent" fgColor="#000000" />
  );
}
