/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import LZString from 'lz-string';
import { FaceScanResult, RedactionOptions, SharedReportPayload } from '../types';

// Simple client-side hash for PIN verification
export function hashPin(pin: string): string {
  let hash = 5381;
  const salted = `facevital_salt_${pin.trim()}_secure`;
  for (let i = 0; i < salted.length; i++) {
    hash = (hash * 33) ^ salted.charCodeAt(i);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Builds a redacted, sanitized payload from a FaceScanResult and user privacy preferences.
 */
export function buildRedactedPayload(
  scan: FaceScanResult,
  options: RedactionOptions
): SharedReportPayload {
  const redactionsApplied: string[] = [];

  // Clone scan object
  const sanitizedScan: FaceScanResult = JSON.parse(JSON.stringify(scan));

  // 1. Redact facial snapshot data
  if (options.redactFaceSnapshot) {
    delete sanitizedScan.rawSnapshotDataUrl;
    redactionsApplied.push('Facial Camera Snapshot (Removed)');
  }

  // 2. Redact raw rPPG signal history to minimize payload size and privacy footprint
  delete sanitizedScan.rppgSignalHistory;

  // 3. Redact user notes / personal reflections
  if (options.excludeUserNotes) {
    delete sanitizedScan.userNotes;
    redactionsApplied.push('Personal Patient Diary & Notes (Excluded)');
  }

  // 4. Anonymize Patient Identifier
  const subjectLabel = options.anonymizePatient
    ? options.patientAlias || `Subject #${sanitizedScan.id.slice(-5).toUpperCase()}`
    : options.patientAlias || 'Patient Confidential';
  
  if (options.anonymizePatient) {
    redactionsApplied.push('Patient Identity (Anonymized)');
  }

  // Calculate Expiration
  const createdAt = new Date().toISOString();
  let expiresAt: string | null = null;
  if (options.expiresInHours && options.expiresInHours > 0) {
    const expDate = new Date(Date.now() + options.expiresInHours * 60 * 60 * 1000);
    expiresAt = expDate.toISOString();
    redactionsApplied.push(`Link Auto-Expiration (${options.expiresInHours} Hours)`);
  } else {
    redactionsApplied.push('Link Expiration (None / Permanent)');
  }

  // PIN security
  const hasPin = Boolean(options.pinCode && options.pinCode.trim().length >= 4);
  const pinHash = hasPin ? hashPin(options.pinCode!.trim()) : undefined;
  if (hasPin) {
    redactionsApplied.push('Healthcare Provider Access PIN Enforced');
  }

  // Check omitted clinical submodules if requested
  if (!options.includeCardiac) {
    sanitizedScan.cardiacWorkload = {
      ...sanitizedScan.cardiacWorkload,
      ratePressureProduct: 0,
      interpretation: '[Module Redacted by Patient]',
    };
    redactionsApplied.push('Cardiac Workload Breakdown (Redacted)');
  }

  if (!options.includeMetabolic) {
    sanitizedScan.vitals.bloodSugarRisk = {
      ...sanitizedScan.vitals.bloodSugarRisk,
      metabolicSigns: ['[Metabolic Signs Redacted]'],
      fastingVsPostprandialContext: '[Redacted by Patient]',
    };
    redactionsApplied.push('Detailed Metabolic Proxies (Redacted)');
  }

  if (!options.includeRiskForecast) {
    sanitizedScan.riskForecasting = {
      ...sanitizedScan.riskForecasting,
      primaryRiskDrivers: ['[Risk Drivers Redacted]'],
      modifiableMitigationPotential: '[Redacted by Patient]',
    };
    redactionsApplied.push('10-Year ASCVD Risk Forecast (Redacted)');
  }

  const shareId = `shr_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;

  return {
    v: 1,
    shareId,
    createdAt,
    expiresAt,
    hasPin,
    pinHash,
    subjectLabel,
    demographics: options.patientAgeGender || 'Adult Patient',
    clinicianNote: options.customClinicianNote,
    redactionsApplied,
    scan: sanitizedScan,
  };
}

/**
 * Encodes a SharedReportPayload into a compact URL-safe string.
 */
export function encodeSharePayload(payload: SharedReportPayload): string {
  try {
    const jsonString = JSON.stringify(payload);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    return compressed;
  } catch (error) {
    console.error('Failed to compress share payload:', error);
    // Fallback to base64
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
  }
}

/**
 * Decodes a compact URL-safe string back into SharedReportPayload.
 */
export function decodeSharePayload(token: string): SharedReportPayload | null {
  if (!token || typeof token !== 'string') return null;

  try {
    // Attempt LZString decompression
    const decompressed = LZString.decompressFromEncodedURIComponent(token);
    if (decompressed) {
      const parsed = JSON.parse(decompressed);
      if (parsed && parsed.scan && parsed.v) {
        return parsed as SharedReportPayload;
      }
    }

    // Fallback attempt standard base64 decoding
    const decodedBase64 = decodeURIComponent(escape(atob(token)));
    const parsedBase64 = JSON.parse(decodedBase64);
    if (parsedBase64 && parsedBase64.scan) {
      return parsedBase64 as SharedReportPayload;
    }
  } catch (error) {
    console.error('Failed to decode share payload token:', error);
  }

  return null;
}

/**
 * Generates the full shareable URL given a payload token.
 */
export function generateShareUrl(token: string): string {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}#share=${token}`;
}

/**
 * Checks URL hash or query params for an active share payload token.
 */
export function extractShareTokenFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Check window.location.hash (e.g. #share=... or #/shared?token=...)
  const hash = window.location.hash;
  if (hash) {
    if (hash.startsWith('#share=')) {
      return hash.replace('#share=', '');
    }
    const hashParams = new URLSearchParams(hash.replace(/^#\/?/, '?'));
    const token = hashParams.get('share') || hashParams.get('token') || hashParams.get('data');
    if (token) return token;
  }

  // 2. Check window.location.search (e.g. ?share=...)
  const searchParams = new URLSearchParams(window.location.search);
  const searchToken = searchParams.get('share') || searchParams.get('token') || searchParams.get('data');
  if (searchToken) return searchToken;

  return null;
}

/**
 * Validates whether a shared payload is currently valid and unexpired.
 */
export function validateShareExpiration(payload: SharedReportPayload): {
  isExpired: boolean;
  expiresInMinutes?: number;
  formattedExpiry?: string;
} {
  if (!payload.expiresAt) {
    return { isExpired: false };
  }

  const expiryTime = new Date(payload.expiresAt).getTime();
  const now = Date.now();

  if (now > expiryTime) {
    return {
      isExpired: true,
      formattedExpiry: new Date(payload.expiresAt).toLocaleString(),
    };
  }

  const remainingMs = expiryTime - now;
  const remainingMinutes = Math.max(1, Math.round(remainingMs / 60000));

  return {
    isExpired: false,
    expiresInMinutes: remainingMinutes,
    formattedExpiry: new Date(payload.expiresAt).toLocaleString(),
  };
}
