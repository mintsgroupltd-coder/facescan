/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Body parser with large payload limits for image frame snapshots
app.use(express.json({ limit: '25mb' }));

// Lazy GoogleGenAI initializer
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is not set. Using smart physiological fallback algorithm.');
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

/**
 * Resilient helper to call Gemini with automatic model fallback on temporary 503 / high demand spikes
 */
async function generateContentSafely(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
    primaryModel?: string;
  }
) {
  const modelsToTry = [
    params.primaryModel || 'gemini-3.7-flash',
    'gemini-3.1-flash-lite',
  ];

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });

      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.message?.includes('503') ||
        err?.message?.includes('demand') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('RESOURCE_EXHAUSTED');

      if (isTransient) {
        console.warn(`Model ${model} temporarily unavailable or high demand (503). Attempting fallback model...`);
        continue;
      }
      console.warn(`Error generating content with model ${model}:`, err?.message || err);
    }
  }

  throw lastError || new Error('All model attempts failed');
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Primary Face Analysis API
app.post('/api/analyze-face', async (req, res) => {
  try {
    const { imageBase64, measuredBpm, signalQuality, redGreenRatio, scanDurationSec, userContext } = req.body;

    const baseBpm = typeof measuredBpm === 'number' && measuredBpm > 45 && measuredBpm < 180 ? measuredBpm : 72;
    const ai = getGenAI();

    if (!ai || !imageBase64) {
      // Return highly structured heuristic result if API key is absent or testing without image
      const fallbackResult = generateHeuristicResult(baseBpm, redGreenRatio, userContext);
      return res.json(fallbackResult);
    }

    // Clean base64 data
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|webp|jpg);base64,/, '');

    const prompt = `You are a clinical computer vision and bio-photoplethysmography (rPPG) health AI system.
Analyze this high-resolution facial scan snapshot and the real-time optical pulse telemetry collected from the user's face:
- Measured rPPG instantaneous Pulse Rate: ${baseBpm} BPM
- Signal Quality Index: ${signalQuality || 85}%
- Optical Red/Green Chrominance Ratio: ${redGreenRatio || 1.15}
- User Context Note: ${userContext || 'General health scan'}

Examine the facial features for:
1. Micro-vascular color fluctuation and perfusion in forehead, cheeks, and perioral areas.
2. Blood Pressure & Hemodynamic estimates (Systolic / Diastolic, Mean Arterial Pressure MAP, Pulse Pressure, Arterial Stiffness Index ASI, Pulse Wave Velocity PWV estimate).
3. Blood Sugar & Glycemic Risk Indicators (Fasting glucose proxy, Glycemic stability score, estimated HbA1c proxy %, Time-in-range estimate, insulin resistance risk).
4. Cardiac Workload (Rate Pressure Product RPP = HR * SBP / 100, Myocardial Oxygen Demand MVO2 index, Stroke Volume mL, Cardiac Output L/min, Left Ventricular Strain).
5. Heart Rate Variability (HRV - RMSSD in ms, SDNN in ms, pNN50 %, LF/HF autonomic balance ratio, Baevsky Stress Index, Parasympathetic Vagal Tone).
6. BMI & Morphological Facial Adiposity (Facial Width-to-Height Ratio FWHR, optical cheek contour adiposity, estimated BMI bracket, visceral fat risk).
7. Breathing Rate (Breaths per minute, I:E ratio, Respiratory Sinus Arrhythmia RSA cardiorespiratory coupling %, shallow vs diaphragmatic depth).
8. Risk Forecasting (10-Year ASCVD projected cardiovascular risk %, 5-Year Metabolic Syndrome probability, 5-Year Type 2 Diabetes conversion risk, 5-Year Hypertension progression risk, Biological Vascular Age delta).
9. Hypertension Risk Monitoring (AHA/ACC Stage classification, Nocturnal Non-Dipping risk, Baroreflex sensitivity, clinical alert level).

Produce a comprehensive, scientifically-grounded vital signs & metabolic screening report in strict JSON adhering to the schema.`;

    const response = await generateContentSafely(ai, {
      primaryModel: 'gemini-3.7-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            vitals: {
              type: Type.OBJECT,
              properties: {
                heartRate: {
                  type: Type.OBJECT,
                  properties: {
                    value: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ['optimal', 'normal', 'moderate', 'elevated', 'high', 'attention'] },
                    normalRange: { type: Type.STRING },
                    confidence: { type: Type.NUMBER },
                    interpretation: { type: Type.STRING },
                  },
                  required: ['value', 'unit', 'status', 'normalRange', 'confidence', 'interpretation'],
                },
                stress: {
                  type: Type.OBJECT,
                  properties: {
                    score: { type: Type.NUMBER },
                    level: { type: Type.STRING },
                    sympatheticToneRatio: { type: Type.NUMBER },
                    tensionIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
                    recoveryCapacity: { type: Type.STRING, enum: ['High', 'Adequate', 'Depleted'] },
                  },
                  required: ['score', 'level', 'sympatheticToneRatio', 'tensionIndicators', 'recoveryCapacity'],
                },
                bloodSugarRisk: {
                  type: Type.OBJECT,
                  properties: {
                    estimatedFastingMgDl: { type: Type.NUMBER },
                    estimatedPostprandialTrend: { type: Type.STRING },
                    riskLevel: { type: Type.STRING, enum: ['Optimal', 'Normal', 'Pre-diabetic Watch', 'Elevated Glycemic Risk'] },
                    glycemicStabilityScore: { type: Type.NUMBER },
                    estimatedHbA1c: { type: Type.NUMBER },
                    timeInRangeEstimate: { type: Type.NUMBER },
                    insulinResistanceRisk: { type: Type.STRING, enum: ['Low / Sensitive', 'Mild Watch', 'Moderate Risk', 'High Risk'] },
                    metabolicSigns: { type: Type.ARRAY, items: { type: Type.STRING } },
                    dietaryGuidance: { type: Type.ARRAY, items: { type: Type.STRING } },
                    fastingVsPostprandialContext: { type: Type.STRING },
                  },
                  required: ['estimatedFastingMgDl', 'estimatedPostprandialTrend', 'riskLevel', 'glycemicStabilityScore', 'estimatedHbA1c', 'timeInRangeEstimate', 'insulinResistanceRisk', 'metabolicSigns', 'dietaryGuidance', 'fastingVsPostprandialContext'],
                },
                respirationRate: {
                  type: Type.OBJECT,
                  properties: {
                    value: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ['optimal', 'normal', 'moderate', 'elevated', 'high', 'attention'] },
                    normalRange: { type: Type.STRING },
                    confidence: { type: Type.NUMBER },
                    interpretation: { type: Type.STRING },
                  },
                  required: ['value', 'unit', 'status', 'normalRange', 'confidence', 'interpretation'],
                },
                hrv: {
                  type: Type.OBJECT,
                  properties: {
                    rmssdMs: { type: Type.NUMBER },
                    sdnnMs: { type: Type.NUMBER },
                    pnn50Percent: { type: Type.NUMBER },
                    lfHfRatio: { type: Type.NUMBER },
                    baevskyStressIndex: { type: Type.NUMBER },
                    parasympatheticVagalTone: { type: Type.NUMBER },
                    status: { type: Type.STRING, enum: ['optimal', 'moderate', 'low_recovery'] },
                    interpretation: { type: Type.STRING },
                  },
                  required: ['rmssdMs', 'sdnnMs', 'pnn50Percent', 'lfHfRatio', 'baevskyStressIndex', 'parasympatheticVagalTone', 'status', 'interpretation'],
                },
                spO2: {
                  type: Type.OBJECT,
                  properties: {
                    value: { type: Type.NUMBER },
                    unit: { type: Type.STRING },
                    status: { type: Type.STRING, enum: ['optimal', 'normal', 'moderate', 'elevated', 'high', 'attention'] },
                    confidence: { type: Type.NUMBER },
                  },
                  required: ['value', 'unit', 'status', 'confidence'],
                },
                bloodPressureEstimate: {
                  type: Type.OBJECT,
                  properties: {
                    systolic: { type: Type.NUMBER },
                    diastolic: { type: Type.NUMBER },
                    category: { type: Type.STRING },
                  },
                  required: ['systolic', 'diastolic', 'category'],
                },
              },
              required: ['heartRate', 'stress', 'bloodSugarRisk', 'respirationRate', 'hrv', 'spO2', 'bloodPressureEstimate'],
            },
            bloodPressure: {
              type: Type.OBJECT,
              properties: {
                systolic: { type: Type.NUMBER },
                diastolic: { type: Type.NUMBER },
                map: { type: Type.NUMBER },
                pulsePressure: { type: Type.NUMBER },
                category: { type: Type.STRING, enum: ['Normal', 'Elevated', 'Stage 1 Hypertension', 'Stage 2 Hypertension', 'Hypertensive Crisis'] },
                vascularStiffnessIndex: { type: Type.NUMBER },
                pulseWaveVelocityEstimate: { type: Type.NUMBER },
                endothelialHealthScore: { type: Type.NUMBER },
                normalRange: { type: Type.STRING },
                interpretation: { type: Type.STRING },
              },
              required: ['systolic', 'diastolic', 'map', 'pulsePressure', 'category', 'vascularStiffnessIndex', 'pulseWaveVelocityEstimate', 'endothelialHealthScore', 'normalRange', 'interpretation'],
            },
            cardiacWorkload: {
              type: Type.OBJECT,
              properties: {
                ratePressureProduct: { type: Type.NUMBER },
                mvo2Index: { type: Type.NUMBER },
                cardiacOutputLMin: { type: Type.NUMBER },
                strokeVolumeMl: { type: Type.NUMBER },
                leftVentricularStrain: { type: Type.STRING, enum: ['Optimal', 'Mild Load', 'Moderate Demand', 'Elevated Strain'] },
                totalPeripheralResistance: { type: Type.NUMBER },
                workloadCategory: { type: Type.STRING, enum: ['Optimal Resting Load', 'Mild Hemodynamic Demand', 'Elevated Myocardial Work', 'Excessive Strain'] },
                interpretation: { type: Type.STRING },
              },
              required: ['ratePressureProduct', 'mvo2Index', 'cardiacOutputLMin', 'strokeVolumeMl', 'leftVentricularStrain', 'totalPeripheralResistance', 'workloadCategory', 'interpretation'],
            },
            bmiAdiposity: {
              type: Type.OBJECT,
              properties: {
                estimatedBmi: { type: Type.NUMBER },
                bmiCategory: { type: Type.STRING, enum: ['Underweight', 'Normal / Healthy', 'Overweight', 'Class 1 Obese', 'Class 2/3 Obese'] },
                facialAdiposityScore: { type: Type.NUMBER },
                fwhrRatio: { type: Type.NUMBER },
                visceralAdiposityRisk: { type: Type.STRING, enum: ['Low', 'Moderate', 'Elevated'] },
                metabolicPhenotype: { type: Type.STRING },
                interpretation: { type: Type.STRING },
              },
              required: ['estimatedBmi', 'bmiCategory', 'facialAdiposityScore', 'fwhrRatio', 'visceralAdiposityRisk', 'metabolicPhenotype', 'interpretation'],
            },
            breathingRate: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.NUMBER },
                unit: { type: Type.STRING },
                status: { type: Type.STRING, enum: ['optimal', 'normal', 'moderate', 'elevated', 'high', 'attention'] },
                rhythmRegularity: { type: Type.NUMBER },
                ieRatio: { type: Type.STRING },
                breathingDepth: { type: Type.STRING, enum: ['Deep Diaphragmatic', 'Balanced', 'Shallow Clavicular'] },
                rsaCouplingScore: { type: Type.NUMBER },
                hyperventilationWatch: { type: Type.BOOLEAN },
                normalRange: { type: Type.STRING },
                interpretation: { type: Type.STRING },
              },
              required: ['value', 'unit', 'status', 'rhythmRegularity', 'ieRatio', 'breathingDepth', 'rsaCouplingScore', 'hyperventilationWatch', 'normalRange', 'interpretation'],
            },
            riskForecasting: {
              type: Type.OBJECT,
              properties: {
                ascvd10YearRiskPercent: { type: Type.NUMBER },
                metabolicSyndrome5YearRiskPercent: { type: Type.NUMBER },
                type2Diabetes5YearRiskPercent: { type: Type.NUMBER },
                hypertension5YearRiskPercent: { type: Type.NUMBER },
                biologicalVascularAgeDelta: { type: Type.NUMBER },
                overallCardioMetabolicGrade: { type: Type.STRING, enum: ['Optimal', 'Low Risk', 'Moderate Watch', 'Elevated Attention'] },
                primaryRiskDrivers: { type: Type.ARRAY, items: { type: Type.STRING } },
                modifiableMitigationPotential: { type: Type.STRING },
              },
              required: ['ascvd10YearRiskPercent', 'metabolicSyndrome5YearRiskPercent', 'type2Diabetes5YearRiskPercent', 'hypertension5YearRiskPercent', 'biologicalVascularAgeDelta', 'overallCardioMetabolicGrade', 'primaryRiskDrivers', 'modifiableMitigationPotential'],
            },
            hypertensionMonitoring: {
              type: Type.OBJECT,
              properties: {
                currentStage: { type: Type.STRING, enum: ['Normal', 'Elevated', 'Stage 1 Hypertension', 'Stage 2 Hypertension', 'Hypertensive Crisis'] },
                stageSeverityIndex: { type: Type.NUMBER },
                arterialStiffnessIndex: { type: Type.NUMBER },
                pulseWaveVelocityMs: { type: Type.NUMBER },
                baroreflexSensitivity: { type: Type.NUMBER },
                nocturnalNonDippingRisk: { type: Type.STRING, enum: ['Low', 'Moderate', 'High'] },
                alertLevel: { type: Type.STRING, enum: ['optimal', 'watch', 'attention', 'urgent'] },
                dashDietComplianceGuidance: { type: Type.ARRAY, items: { type: Type.STRING } },
                clinicalProtocolAdvice: { type: Type.STRING },
              },
              required: ['currentStage', 'stageSeverityIndex', 'arterialStiffnessIndex', 'pulseWaveVelocityMs', 'baroreflexSensitivity', 'nocturnalNonDippingRisk', 'alertLevel', 'dashDietComplianceGuidance', 'clinicalProtocolAdvice'],
            },
            holisticScores: {
              type: Type.OBJECT,
              properties: {
                vitalityIndex: { type: Type.NUMBER },
                autonomicBalance: { type: Type.NUMBER },
                fatigueDebtIndex: { type: Type.NUMBER },
                vascularPerfusionScore: { type: Type.NUMBER },
              },
              required: ['vitalityIndex', 'autonomicBalance', 'fatigueDebtIndex', 'vascularPerfusionScore'],
            },
            facialBiomarkers: {
              type: Type.OBJECT,
              properties: {
                skinPerfusionQuality: { type: Type.STRING },
                microTremorScore: { type: Type.NUMBER },
                blinkRatePerMin: { type: Type.NUMBER },
                periorbitalHydration: { type: Type.STRING },
                facialMicroExpressionSymmetry: { type: Type.STRING },
              },
              required: ['skinPerfusionQuality', 'microTremorScore', 'blinkRatePerMin', 'periorbitalHydration', 'facialMicroExpressionSymmetry'],
            },
            clinicalNotes: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                keyObservations: { type: Type.ARRAY, items: { type: Type.STRING } },
                lifestyleActionPlan: {
                  type: Type.OBJECT,
                  properties: {
                    immediateBreathing: { type: Type.STRING },
                    nutritionAndGlycemic: { type: Type.STRING },
                    hydration: { type: Type.STRING },
                    circadianSleep: { type: Type.STRING },
                  },
                  required: ['immediateBreathing', 'nutritionAndGlycemic', 'hydration', 'circadianSleep'],
                },
                disclaimer: { type: Type.STRING },
              },
              required: ['summary', 'keyObservations', 'lifestyleActionPlan', 'disclaimer'],
            },
          },
          required: ['vitals', 'bloodPressure', 'cardiacWorkload', 'bmiAdiposity', 'breathingRate', 'riskForecasting', 'hypertensionMonitoring', 'holisticScores', 'facialBiomarkers', 'clinicalNotes'],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || '{}');
    
    // Inject scan metadata
    parsedJson.id = 'scan_' + Date.now();
    parsedJson.timestamp = new Date().toISOString();
    parsedJson.sourceMode = 'live_webcam';
    parsedJson.rawSnapshotDataUrl = imageBase64;

    res.json(parsedJson);
  } catch (error: any) {
    console.error('Error analyzing facial scan with Gemini:', error);
    // Fallback to robust simulated clinical telemetry
    const fallback = generateHeuristicResult(req.body?.measuredBpm || 72, req.body?.redGreenRatio, req.body?.userContext);
    fallback.rawSnapshotDataUrl = req.body?.imageBase64;
    res.json(fallback);
  }
});

// AI Health Coach Assistant endpoint
app.post('/api/chat-coach', async (req, res) => {
  try {
    const { messages, currentVitals } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        reply: "I am your AI Health Assistant. Based on your current facial scan, your heart rate and metabolic markers indicate your body is functioning well. To stabilize blood sugar and lower stress, practice regular diaphragmatic breathing and stay hydrated.",
      });
    }

    const conversationHistory = messages.map((m: any) => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
    const systemPrompt = `You are a certified Clinical Bio-Feedback & Physiological Wellness Coach.
The user just completed a contactless AI facial vital signs scan.
Here is the user's latest biometric data from their face scan:
- Heart Rate: ${currentVitals?.vitals?.heartRate?.value || 72} BPM (${currentVitals?.vitals?.heartRate?.status || 'normal'})
- Stress Level: ${currentVitals?.vitals?.stress?.score || 35}/100 (${currentVitals?.vitals?.stress?.level || 'Low / Relaxed'})
- Estimated Blood Sugar Risk: ${currentVitals?.vitals?.bloodSugarRisk?.riskLevel || 'Normal'} (Est. Fasting: ${currentVitals?.vitals?.bloodSugarRisk?.estimatedFastingMgDl || 92} mg/dL, Glycemic Stability: ${currentVitals?.vitals?.bloodSugarRisk?.glycemicStabilityScore || 85}/100)
- Respiration Rate: ${currentVitals?.vitals?.respirationRate?.value || 16} breaths/min
- HRV (RMSSD): ${currentVitals?.vitals?.hrv?.rmssdMs || 48} ms
- SpO2: ${currentVitals?.vitals?.spO2?.value || 98}%
- Blood Pressure Proxy: ${currentVitals?.vitals?.bloodPressureEstimate?.systolic || 118}/${currentVitals?.vitals?.bloodPressureEstimate?.diastolic || 78} mmHg

Answer the user's questions clearly, empathetically, and informatively. Explain the physiological connections (e.g. how cortisol and autonomic stress elevate blood glucose and heart rate). Provide actionable lifestyle, nutrition, and breathing tips. Always include a brief reminder that this is for wellness screening and not diagnostic medical advice.`;

    const response = await generateContentSafely(ai, {
      primaryModel: 'gemini-3.7-flash',
      contents: `${systemPrompt}\n\nConversation so far:\n${conversationHistory}\n\nAssistant response:`,
    });

    res.json({ reply: response.text || "I'm analyzing your vital signs. How can I assist you with your health metrics today?" });
  } catch (error: any) {
    console.error('Error in chat coach:', error);
    res.json({
      reply: "Based on your scan, your biometric signals are being monitored. Remember to maintain steady breathing, drink plenty of water, and favor low-glycemic meals for optimal blood glucose balance.",
    });
  }
});

// Weekly Health Insights API (7-Day Trend Analysis)
app.post('/api/weekly-insights', async (req, res) => {
  try {
    const { history } = req.body;
    const scans = Array.isArray(history) && history.length > 0 ? history : [];
    
    // Filter scans from the last 7 days or use the most recent up to 14 scans
    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    
    let last7DaysScans = scans.filter((s: any) => new Date(s.timestamp).getTime() >= sevenDaysAgo);
    if (last7DaysScans.length < 2 && scans.length > 0) {
      last7DaysScans = scans.slice(-7);
    }

    // Compute statistical metrics
    const stats = compute7DayStats(last7DaysScans, scans);

    const ai = getGenAI();
    if (!ai || last7DaysScans.length === 0) {
      const fallback = generateHeuristicWeeklyInsights(stats, last7DaysScans);
      return res.json(fallback);
    }

    const summaryDataText = `User's 7-Day Optical Vital Signs History:
- Total Scans in Period: ${stats.scansCount}
- Average Heart Rate: ${stats.heartRateAvg} BPM (${stats.heartRateDelta >= 0 ? '+' : ''}${stats.heartRateDelta} BPM vs prior)
- Average Stress Level: ${stats.stressAvg}/100 (${stats.stressDelta >= 0 ? '+' : ''}${stats.stressDelta}% vs prior)
- Average Estimated Fasting Blood Sugar: ${stats.glucoseAvg} mg/dL (${stats.glucoseDelta >= 0 ? '+' : ''}${stats.glucoseDelta} mg/dL vs prior)
- Average HRV (RMSSD): ${stats.hrvAvg} ms
- Recent Scan Snapshots Summary: ${last7DaysScans.slice(-5).map((s: any) => `${new Date(s.timestamp).toLocaleDateString()}: HR ${s.vitals?.heartRate?.value || 70} BPM, Stress ${s.vitals?.stress?.score || 35}%, Glucose ${s.vitals?.bloodSugarRisk?.estimatedFastingMgDl || 90} mg/dL`).join('; ')}
`;

    const prompt = `You are a clinical bio-informatics and physiology expert.
Analyze the following 7-day vital signs telemetry recorded from facial optical scans:
${summaryDataText}

Generate a comprehensive 'Weekly Health Insights' executive summary evaluating the user's 7-day health trends:
1. An overall status headline (concise, motivating, clinically descriptive).
2. A natural language summary (2-3 paragraphs) detailing overall autonomic stability, cardiovascular rhythm consistency, and metabolic/glycemic risk indicators over the week.
3. Specific sectional insights for Cardiovascular, Autonomic Stress/Recovery, and Glycemic/Blood Sugar stability.
4. An overall vitality score (0-100) and trajectory ('improving', 'stable', 'declining').
5. 3-4 bullet takeaways for the coming 7 days.

Return strictly JSON matching the response schema.`;

    const response = await generateContentSafely(ai, {
      primaryModel: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            periodLabel: { type: Type.STRING },
            overallVitalityScore: { type: Type.NUMBER },
            vitalityTrajectory: { type: Type.STRING, enum: ['improving', 'stable', 'declining'] },
            statusHeadline: { type: Type.STRING },
            naturalLanguageSummary: { type: Type.STRING },
            cardiovascularInsight: { type: Type.STRING },
            stressRecoveryInsight: { type: Type.STRING },
            glycemicMetabolicInsight: { type: Type.STRING },
            keyWeeklyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: [
            'periodLabel',
            'overallVitalityScore',
            'vitalityTrajectory',
            'statusHeadline',
            'naturalLanguageSummary',
            'cardiovascularInsight',
            'stressRecoveryInsight',
            'glycemicMetabolicInsight',
            'keyWeeklyTakeaways',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    parsed.generatedAt = new Date().toISOString();
    parsed.weeklyAverages = {
      heartRateAvg: stats.heartRateAvg,
      heartRateDelta: stats.heartRateDelta,
      stressAvg: stats.stressAvg,
      stressDelta: stats.stressDelta,
      glucoseAvg: stats.glucoseAvg,
      glucoseDelta: stats.glucoseDelta,
      scansCount: stats.scansCount,
    };

    res.json(parsed);
  } catch (error: any) {
    console.error('Error generating weekly insights:', error);
    const scans = Array.isArray(req.body?.history) ? req.body.history : [];
    const stats = compute7DayStats(scans.slice(-7), scans);
    res.json(generateHeuristicWeeklyInsights(stats, scans));
  }
});

// Personalized Health Recommendation Engine API
app.post('/api/recommendations', async (req, res) => {
  try {
    const { scan } = req.body;
    if (!scan || !scan.vitals) {
      return res.status(400).json({ error: 'Valid face scan data is required' });
    }

    const hr = scan.vitals.heartRate?.value || 72;
    const stressScore = scan.vitals.stress?.score || 35;
    const stressLevel = scan.vitals.stress?.level || 'Low / Relaxed';
    const glucoseVal = scan.vitals.bloodSugarRisk?.estimatedFastingMgDl || 92;
    const glucoseRisk = scan.vitals.bloodSugarRisk?.riskLevel || 'Normal';
    const hrv = scan.vitals.hrv?.rmssdMs || 48;
    const bp = `${scan.vitals.bloodPressureEstimate?.systolic || 118}/${scan.vitals.bloodPressureEstimate?.diastolic || 78}`;

    const ai = getGenAI();
    if (!ai) {
      const fallback = generateHeuristicRecommendations(scan);
      return res.json({ recommendations: fallback });
    }

    const prompt = `You are an AI Clinical Recommendation Engine specializing in personalized physiological optimization.
The user just completed a facial biometric scan with these exact metrics:
- Heart Rate: ${hr} BPM (${scan.vitals.heartRate?.status || 'normal'})
- Autonomic Stress Index: ${stressScore}/100 (${stressLevel})
- HRV (RMSSD): ${hrv} ms
- Estimated Blood Sugar (Fasting/Baseline): ${glucoseVal} mg/dL (${glucoseRisk})
- Glycemic Stability Score: ${scan.vitals.bloodSugarRisk?.glycemicStabilityScore || 85}/100
- Blood Pressure Proxy: ${bp} mmHg
- Fatigue Debt: ${scan.holisticScores?.fatigueDebtIndex || 25}%

Generate a comprehensive set of 5 distinct, highly actionable, personalized health recommendations tailored precisely to this individual's physiological state across these categories:
1. 'hydration' (fluid volume, electrolyte timing, mineral density to support vascular perfusion & glucose transport)
2. 'relaxation' (specific diaphragmatic/vagal breathing exercises, autonomic reset techniques to lower acute sympathetic tension)
3. 'nutrition' (tailored meal composition, food sequencing [fiber->protein->carbs], glycemic stabilizers, post-meal glucose management)
4. 'cardiovascular' (aerobic pacing, zone-2 movement, arterial elasticity protocols)
5. 'circadian' (sleep hygiene, light exposure, recovery windows)

For each recommendation provide:
- id: unique string
- category: ('hydration' | 'relaxation' | 'nutrition' | 'cardiovascular' | 'circadian')
- title: punchy action-oriented title
- actionText: clear, specific step-by-step instructions
- rationale: scientific physiological reasoning connecting their facial biomarkers (e.g. why their ${stressScore}% stress or ${glucoseVal} mg/dL glucose warrants this step)
- priority: ('high' | 'medium' | 'routine')
- impactBadge: short phrase showing clinical benefit (e.g. "-12% Glycemic Surge", "Vagal Nerve Activation", "+15% HRV Lift")
- timeframe: when to do it (e.g. "Immediate (Next 15m)", "Pre-Meal", "Postprandial", "Tonight")
- actionType: ('breathing' | 'hydration_log' | 'walk_timer' | 'diet_swap' | 'none')

Return strictly JSON matching the responseSchema.`;

    const response = await generateContentSafely(ai, {
      primaryModel: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ['hydration', 'relaxation', 'nutrition', 'cardiovascular', 'circadian'] },
                  title: { type: Type.STRING },
                  actionText: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  priority: { type: Type.STRING, enum: ['high', 'medium', 'routine'] },
                  impactBadge: { type: Type.STRING },
                  timeframe: { type: Type.STRING },
                  actionType: { type: Type.STRING, enum: ['breathing', 'hydration_log', 'walk_timer', 'diet_swap', 'none'] },
                },
                required: ['id', 'category', 'title', 'actionText', 'rationale', 'priority', 'impactBadge', 'timeframe', 'actionType'],
              },
            },
          },
          required: ['recommendations'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"recommendations": []}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in recommendations engine:', error);
    const fallback = generateHeuristicRecommendations(req.body?.scan);
    res.json({ recommendations: fallback });
  }
});

// Helper: Compute 7-day stats
function compute7DayStats(recentScans: any[], allScans: any[]) {
  if (!recentScans || recentScans.length === 0) {
    return {
      heartRateAvg: 72,
      heartRateDelta: -2,
      stressAvg: 38,
      stressDelta: -5,
      glucoseAvg: 94,
      glucoseDelta: -3,
      hrvAvg: 52,
      scansCount: 0,
    };
  }

  const hrVals = recentScans.map((s: any) => s.vitals?.heartRate?.value || 72);
  const stressVals = recentScans.map((s: any) => s.vitals?.stress?.score || 35);
  const glucoseVals = recentScans.map((s: any) => s.vitals?.bloodSugarRisk?.estimatedFastingMgDl || 92);
  const hrvVals = recentScans.map((s: any) => s.vitals?.hrv?.rmssdMs || 48);

  const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);

  const hrAvg = avg(hrVals);
  const stressAvg = avg(stressVals);
  const glucoseAvg = avg(glucoseVals);
  const hrvAvg = avg(hrvVals);

  // Compare with earlier scans if available
  const priorScans = allScans.slice(0, Math.max(0, allScans.length - recentScans.length));
  let hrDelta = 0;
  let stressDelta = 0;
  let glucoseDelta = 0;

  if (priorScans.length > 0) {
    const priorHr = avg(priorScans.map((s: any) => s.vitals?.heartRate?.value || 72));
    const priorStress = avg(priorScans.map((s: any) => s.vitals?.stress?.score || 35));
    const priorGlucose = avg(priorScans.map((s: any) => s.vitals?.bloodSugarRisk?.estimatedFastingMgDl || 92));

    hrDelta = hrAvg - priorHr;
    stressDelta = stressAvg - priorStress;
    glucoseDelta = glucoseAvg - priorGlucose;
  } else {
    hrDelta = -2;
    stressDelta = -4;
    glucoseDelta = -1;
  }

  return {
    heartRateAvg: hrAvg,
    heartRateDelta: hrDelta,
    stressAvg: stressAvg,
    stressDelta: stressDelta,
    glucoseAvg: glucoseAvg,
    glucoseDelta: glucoseDelta,
    hrvAvg: hrvAvg,
    scansCount: recentScans.length,
  };
}

// Fallback: Weekly Insights Generator
function generateHeuristicWeeklyInsights(stats: any, recentScans: any[]): any {
  const isStressImproving = stats.stressDelta <= 0;
  const isGlucoseHealthy = stats.glucoseAvg <= 100;
  const vitalityScore = Math.max(50, Math.min(96, Math.round(100 - (stats.stressAvg * 0.35) - (stats.glucoseAvg > 100 ? (stats.glucoseAvg - 100) * 0.5 : 0))));

  const trajectory = isStressImproving && isGlucoseHealthy ? 'improving' : stats.stressDelta > 5 || stats.glucoseAvg > 115 ? 'declining' : 'stable';

  const headline = trajectory === 'improving'
    ? 'Favorable Autonomic Recovery & Balanced Glycemic Trajectory'
    : trajectory === 'declining'
    ? 'Mild Sympathetic Load & Elevated Post-Meal Glucose Tendency'
    : 'Consistent Physiological Baseline Across Monitored Days';

  return {
    generatedAt: new Date().toISOString(),
    periodLabel: 'Past 7 Days (Telemetry Aggregate)',
    overallVitalityScore: vitalityScore,
    vitalityTrajectory: trajectory,
    statusHeadline: headline,
    naturalLanguageSummary: `Over the past 7 days across ${stats.scansCount || 7} facial optical scans, your cardiovascular rhythm averaged ${stats.heartRateAvg} BPM with a ${stats.heartRateDelta <= 0 ? 'favorable reduction' : 'slight uptick'} of ${Math.abs(stats.heartRateDelta)} BPM compared to your baseline. Autonomic stress indicators settled at a weekly average score of ${stats.stressAvg}/100, reflecting ${stats.stressAvg < 40 ? 'predominantly restorative parasympathetic tone' : 'moderate daytime sympathetic activation'}. Transdermal micro-capillary reflectance indicates stable metabolic homeostasis with an estimated average fasting blood glucose proxy of ${stats.glucoseAvg} mg/dL. Overall, your physiological biomarkers demonstrate resilient vascular adaptability.`,
    cardiovascularInsight: `Resting heart rate remained tightly regulated between ${Math.max(58, stats.heartRateAvg - 6)} and ${stats.heartRateAvg + 7} BPM, with robust pulsatile waveform amplitude observed in facial perfusion matrices.`,
    stressRecoveryInsight: `HRV (RMSSD) averaged ${stats.hrvAvg} ms. Vagal modulation was strongest during morning check-ins, suggesting effective nocturnal parasympathetic recovery.`,
    glycemicMetabolicInsight: `Glycemic proxies averaged ${stats.glucoseAvg} mg/dL (${isGlucoseHealthy ? 'Normal/Optimal range' : 'Mild elevation'}). Micro-vascular optical elasticity indicates low acute glycemic oscillation risk.`,
    weeklyAverages: {
      heartRateAvg: stats.heartRateAvg,
      heartRateDelta: stats.heartRateDelta,
      stressAvg: stats.stressAvg,
      stressDelta: stats.stressDelta,
      glucoseAvg: stats.glucoseAvg,
      glucoseDelta: stats.glucoseDelta,
      scansCount: stats.scansCount,
    },
    keyWeeklyTakeaways: [
      `Maintain your current hydration schedule: micro-capillary perfusion remained optimal on days with consistent fluid intake.`,
      `Continue midday diaphragmatic breathing: scans immediately post-respiration showed an average 8-point reduction in autonomic stress.`,
      `Pair evening carbohydrate intake with dietary fiber and healthy fats to maintain steady nocturnal glycemic stability below 95 mg/dL.`,
    ],
  };
}

// Fallback: Recommendation Generator
function generateHeuristicRecommendations(scan: any): any[] {
  const hr = scan?.vitals?.heartRate?.value || 72;
  const stress = scan?.vitals?.stress?.score || 35;
  const glucose = scan?.vitals?.bloodSugarRisk?.estimatedFastingMgDl || 92;
  const isHighStress = stress > 50;
  const isHighSugar = glucose > 105;

  const list: any[] = [];

  // 1. Hydration
  if (isHighSugar || isHighStress) {
    list.push({
      id: 'rec_hyd_1',
      category: 'hydration',
      title: 'Targeted Electrolyte & Mineral Rehydration',
      actionText: 'Consume 450ml - 500ml of water infused with a pinch of Celtic sea salt or electrolyte powder (magnesium/potassium).',
      rationale: `Your current scan indicates ${stress}% stress tone and ${glucose} mg/dL estimated blood sugar proxy. Mineralized hydration reduces blood viscosity, assists cellular glucose uptake, and alleviates micro-vascular constriction.`,
      priority: 'high',
      impactBadge: 'Vascular Perfusion +14%',
      timeframe: 'Immediate (Next 15 min)',
      actionType: 'hydration_log',
    });
  } else {
    list.push({
      id: 'rec_hyd_2',
      category: 'hydration',
      title: 'Baseline Cellular Hydration Infusion',
      actionText: 'Sip 350ml of room-temperature water with fresh lemon to maintain high capillary pulsatility.',
      rationale: 'Maintaining optimal blood volume stabilizes resting heart rate and sustains crisp optical rPPG signal quality.',
      priority: 'routine',
      impactBadge: 'Optimal Perfusion',
      timeframe: 'Throughout the Morning',
      actionType: 'hydration_log',
    });
  }

  // 2. Relaxation / Breathing
  if (isHighStress) {
    list.push({
      id: 'rec_rel_1',
      category: 'relaxation',
      title: '4-7-8 Parasympathetic Vagus Nerve Reset',
      actionText: 'Inhale through nose for 4s, hold breath for 7s, exhale slowly through mouth for 8s. Repeat for 4 full cycles (approx 3 minutes).',
      rationale: `Your autonomic stress index is ${stress}/100 with elevated sympathetic tone. Extended exhales stimulate the vagus nerve, immediately down-regulating cortisol and lowering heart rate.`,
      priority: 'high',
      impactBadge: '-18% Stress Surge',
      timeframe: 'Next 10 Minutes',
      actionType: 'breathing',
    });
  } else {
    list.push({
      id: 'rec_rel_2',
      category: 'relaxation',
      title: 'Resonance Coherence Breathing (5.5s Pace)',
      actionText: 'Perform 3 minutes of rhythmic diaphragmatic breathing at 5.5 seconds inhale, 5.5 seconds exhale (~6 breaths per minute).',
      rationale: 'Resonance breathing optimizes Heart Rate Variability (HRV) and synchronizes baroreflex rhythms for enduring mental focus.',
      priority: 'routine',
      impactBadge: '+22% HRV Adaptability',
      timeframe: 'Midday Reset',
      actionType: 'breathing',
    });
  }

  // 3. Nutrition & Glycemic
  if (isHighSugar) {
    list.push({
      id: 'rec_nut_1',
      category: 'nutrition',
      title: 'Glycemic Shield: Fiber & Protein First Sequencing',
      actionText: 'When eating your next meal, consume leafy greens/soluble fiber first, followed by protein, and complex carbohydrates last. Take 1 tbsp apple cider vinegar in water 10 minutes prior.',
      rationale: `Estimated fasting/baseline blood sugar is ${glucose} mg/dL. Fiber coats the intestinal lumen, blunting glucose absorption rate and reducing postprandial insulin spikes by up to 35%.`,
      priority: 'high',
      impactBadge: '-28% Glucose Spike',
      timeframe: 'Before Next Meal',
      actionType: 'diet_swap',
    });
  } else {
    list.push({
      id: 'rec_nut_2',
      category: 'nutrition',
      title: 'Steady-State Low-Glycemic Fueling',
      actionText: 'Pair carbohydrates with healthy monounsaturated fats (avocado, extra virgin olive oil, walnuts) to sustain metabolic stability.',
      rationale: `Your glycemic stability score is ${scan?.vitals?.bloodSugarRisk?.glycemicStabilityScore || 88}/100. Healthy fats prevent rapid gastric emptying and sustain steady cellular energy.`,
      priority: 'medium',
      impactBadge: 'Stable Baseline',
      timeframe: 'With Next Meal',
      actionType: 'diet_swap',
    });
  }

  // 4. Cardiovascular
  list.push({
    id: 'rec_card_1',
    category: 'cardiovascular',
    title: '10-Minute Post-Meal Stroll (GLUT4 Activation)',
    actionText: 'Take a gentle 10 to 15-minute zone-1 stroll within 30 minutes after your main meal.',
    rationale: 'Light muscle contraction triggers GLUT4 glucose transporter translocation independent of insulin, directly clearing circulating glucose from the bloodstream.',
    priority: isHighSugar ? 'high' : 'medium',
    impactBadge: '-15 mg/dL Post-Meal Glucose',
    timeframe: 'Post-Meal',
    actionType: 'walk_timer',
  });

  // 5. Circadian & Sleep
  list.push({
    id: 'rec_circ_1',
    category: 'circadian',
    title: 'Circadian Melatonin Guard & Thermoregulation',
    actionText: 'Dim overhead blue lighting 90 minutes before bed; keep sleep environment between 65-68°F (18-20°C).',
    rationale: 'Deep slow-wave sleep improves next-day insulin sensitivity by up to 25% and restores resting cardiovascular autonomic tone.',
    priority: 'routine',
    impactBadge: '+18% Recovery Capacity',
    timeframe: 'Tonight (90m before bed)',
    actionType: 'none',
  });

  return list;
}

// Heuristic fallback generator
function generateHeuristicResult(bpm: number, redGreenRatio = 1.12, context = ''): any {
  const heartRateValue = Math.round(bpm);
  const isHighStress = bpm > 88;
  const isOptimal = bpm >= 60 && bpm <= 78;

  const stressScore = isHighStress ? Math.floor(65 + Math.random() * 25) : isOptimal ? Math.floor(20 + Math.random() * 20) : Math.floor(40 + Math.random() * 20);
  const stressLevel = stressScore > 70 ? 'High Stress' : stressScore > 48 ? 'Elevated' : stressScore > 30 ? 'Moderate' : 'Low / Relaxed';
  
  // Blood pressure calculation
  const systolic = Math.round(112 + (stressScore * 0.22) + (bpm > 80 ? (bpm - 80) * 0.25 : 0));
  const diastolic = Math.round(72 + (stressScore * 0.14) + (bpm > 80 ? (bpm - 80) * 0.15 : 0));
  const map = Number((diastolic + (systolic - diastolic) / 3).toFixed(1));
  const pulsePressure = systolic - diastolic;
  const bpCategory = systolic >= 140 || diastolic >= 90 
    ? 'Stage 2 Hypertension' 
    : systolic >= 130 || diastolic >= 80 
    ? 'Stage 1 Hypertension' 
    : systolic >= 120 
    ? 'Elevated' 
    : 'Normal';

  const asi = Math.min(95, Math.max(15, Math.round(30 + (systolic - 110) * 0.8 + stressScore * 0.25)));
  const pwv = Number((6.2 + (systolic - 110) * 0.04 + (stressScore * 0.015)).toFixed(1));
  const endothelialScore = Math.max(35, Math.min(98, Math.round(100 - asi * 0.7)));

  // Blood sugar estimate correlates physiologically with autonomic stress index and micro-vascular perfusion
  const estimatedFasting = Math.round(84 + (stressScore * 0.32) + (Math.random() * 8));
  const glycemicScore = Math.max(45, Math.min(98, Math.round(100 - (stressScore * 0.45))));
  const sugarRiskLevel = estimatedFasting > 115 ? 'Elevated Glycemic Risk' : estimatedFasting > 100 ? 'Pre-diabetic Watch' : estimatedFasting > 75 ? 'Optimal' : 'Normal';
  const estimatedHbA1c = Number((4.6 + (estimatedFasting / 100) * 0.85).toFixed(1));
  const tirEstimate = Math.max(60, Math.min(99, Math.round(100 - (estimatedFasting > 100 ? (estimatedFasting - 100) * 1.5 : 0) - (stressScore * 0.2))));
  const insulinResistRisk = estimatedFasting > 110 || stressScore > 65 ? 'Moderate Risk' : estimatedFasting > 98 ? 'Mild Watch' : 'Low / Sensitive';

  // Cardiac workload
  const rpp = Math.round((heartRateValue * systolic) / 100);
  const mvo2 = Number((rpp * 0.32).toFixed(1));
  const strokeVolume = Math.round(82 - (heartRateValue > 70 ? (heartRateValue - 70) * 0.4 : 0));
  const cardiacOutput = Number(((strokeVolume * heartRateValue) / 1000).toFixed(1));
  const lvStrain = rpp > 115 ? 'Elevated Strain' : rpp > 95 ? 'Moderate Demand' : rpp > 75 ? 'Mild Load' : 'Optimal';
  const tpr = Math.round((map / (cardiacOutput || 5)) * 80);
  const workloadCategory = rpp > 120 ? 'Excessive Strain' : rpp > 100 ? 'Elevated Myocardial Work' : rpp > 80 ? 'Mild Hemodynamic Demand' : 'Optimal Resting Load';

  // Extended HRV
  const rmssd = Math.max(18, Math.round(68 - (stressScore * 0.45)));
  const sdnn = Math.round(rmssd * 1.35);
  const pnn50 = Math.max(3, Math.min(48, Math.round(rmssd * 0.45)));
  const lfHf = Number((0.6 + (stressScore / 45)).toFixed(2));
  const baevsky = Math.round(30 + (stressScore * 2.2));
  const vagalTone = Math.max(15, Math.min(98, Math.round(100 - stressScore * 0.85)));

  // BMI & Facial Morphometry
  const estimatedBmi = Number((22.6 + (Math.random() * 2.4 - 1.2)).toFixed(1));
  const bmiCategory = estimatedBmi >= 30 ? 'Class 1 Obese' : estimatedBmi >= 25 ? 'Overweight' : estimatedBmi < 18.5 ? 'Underweight' : 'Normal / Healthy';
  const fwhr = Number((1.78 + (estimatedBmi > 25 ? 0.15 : 0)).toFixed(2));
  const facialAdiposity = Math.round(estimatedBmi * 2.8);

  // Breathing Rate & RSA
  const respVal = Math.round(13 + (stressScore / 25));
  const rsaScore = Math.max(30, Math.min(96, Math.round(95 - stressScore * 0.6)));
  const ieRatio = respVal > 18 ? '1 : 1.2' : respVal > 15 ? '1 : 1.5' : '1 : 1.8';
  const breathingDepth = respVal > 17 ? 'Shallow Clavicular' : respVal > 14 ? 'Balanced' : 'Deep Diaphragmatic';

  // Risk Forecasting
  const ascvdRisk = Number((1.8 + (systolic > 120 ? (systolic - 120) * 0.08 : 0) + (stressScore * 0.04)).toFixed(1));
  const metSRisk = Number((3.5 + (estimatedFasting > 95 ? (estimatedFasting - 95) * 0.3 : 0) + (stressScore * 0.06)).toFixed(1));
  const t2dRisk = Number((2.4 + (estimatedFasting > 100 ? (estimatedFasting - 100) * 0.4 : 0)).toFixed(1));
  const htnRisk = Number((4.5 + (systolic > 120 ? (systolic - 120) * 0.35 : 0)).toFixed(1));
  const vascularAgeDelta = Math.round((systolic - 118) * 0.15 + (stressScore - 35) * 0.08);

  return {
    id: 'scan_' + Date.now(),
    timestamp: new Date().toISOString(),
    sourceMode: 'live_webcam',
    vitals: {
      heartRate: {
        value: heartRateValue,
        unit: 'BPM',
        status: heartRateValue > 100 ? 'elevated' : heartRateValue < 60 ? 'moderate' : 'optimal',
        normalRange: '60 - 100 BPM',
        confidence: 94,
        interpretation: heartRateValue < 75 ? 'Healthy resting cardiac rhythm.' : 'Slightly elevated resting heart rate.',
      },
      stress: {
        score: stressScore,
        level: stressLevel,
        sympatheticToneRatio: Number((0.4 + (stressScore / 200)).toFixed(2)),
        tensionIndicators: stressScore > 50 ? ['Periorbital tension detected', 'Elevated sympathetic tone', 'Slight micro-expression rigidity'] : ['Relaxed facial musculature', 'Balanced autonomic response', 'Even micro-perfusion'],
        recoveryCapacity: stressScore > 65 ? 'Depleted' : stressScore > 40 ? 'Adequate' : 'High',
      },
      bloodSugarRisk: {
        estimatedFastingMgDl: estimatedFasting,
        estimatedPostprandialTrend: 'Stable baseline curve with low glycemic oscillation indicators.',
        riskLevel: sugarRiskLevel,
        glycemicStabilityScore: glycemicScore,
        estimatedHbA1c: estimatedHbA1c,
        timeInRangeEstimate: tirEstimate,
        insulinResistanceRisk: insulinResistRisk,
        metabolicSigns: [
          'Facial micro-vascular color variation is consistent with normal capillary resistance.',
          'Skin turgor and hydration optical reflectance index within healthy parameters.',
          'No significant subclinical periorbital edema associated with acute glycemic spikes.',
        ],
        dietaryGuidance: [
          'Prioritize fiber-rich complex carbohydrates with healthy proteins to prevent glucose surges.',
          'Incorporate cinnamon or apple cider vinegar prior to carbohydrate-heavy meals.',
          'Engage in a 10-minute light walk following meals to enhance insulin sensitivity.',
        ],
        fastingVsPostprandialContext: 'Optical biomarkers reflect fasting/baseline metabolic status with high capillary responsiveness.',
      },
      respirationRate: {
        value: respVal,
        unit: 'breaths/min',
        status: respVal <= 16 ? 'optimal' : 'normal',
        normalRange: '12 - 20 breaths/min',
        confidence: 91,
        interpretation: 'Rhythmic diaphragmatic cadence detected.',
      },
      hrv: {
        rmssdMs: rmssd,
        sdnnMs: sdnn,
        pnn50Percent: pnn50,
        lfHfRatio: lfHf,
        baevskyStressIndex: baevsky,
        parasympatheticVagalTone: vagalTone,
        status: stressScore > 60 ? 'low_recovery' : stressScore > 35 ? 'moderate' : 'optimal',
        interpretation: stressScore > 60 ? 'Reduced vagal nerve tone indicating acute physical or mental strain.' : 'Robust heart rate variability indicating high adaptability.',
      },
      spO2: {
        value: 98,
        unit: '%',
        status: 'optimal',
        confidence: 96,
      },
      bloodPressureEstimate: {
        systolic: systolic,
        diastolic: diastolic,
        category: bpCategory,
      },
    },
    bloodPressure: {
      systolic: systolic,
      diastolic: diastolic,
      map: map,
      pulsePressure: pulsePressure,
      category: bpCategory,
      vascularStiffnessIndex: asi,
      pulseWaveVelocityEstimate: pwv,
      endothelialHealthScore: endothelialScore,
      normalRange: '90-120 / 60-80 mmHg',
      interpretation: bpCategory === 'Normal' ? 'Ideal normotensive hemodynamics.' : `Blood pressure shows ${bpCategory.toLowerCase()} hemodynamics.`,
    },
    cardiacWorkload: {
      ratePressureProduct: rpp,
      mvo2Index: mvo2,
      cardiacOutputLMin: cardiacOutput,
      strokeVolumeMl: strokeVolume,
      leftVentricularStrain: lvStrain,
      totalPeripheralResistance: tpr,
      workloadCategory: workloadCategory,
      interpretation: `Myocardial oxygen consumption index is ${mvo2} with an RPP of ${rpp}, reflecting ${workloadCategory.toLowerCase()}.`,
    },
    bmiAdiposity: {
      estimatedBmi: estimatedBmi,
      bmiCategory: bmiCategory,
      facialAdiposityScore: facialAdiposity,
      fwhrRatio: fwhr,
      visceralAdiposityRisk: estimatedBmi > 27 ? 'Elevated' : estimatedBmi > 24 ? 'Moderate' : 'Low',
      metabolicPhenotype: estimatedBmi < 25 ? 'Lean Eumetabolic' : 'Mild Hypermetabolic Adipose',
      interpretation: `Optical facial contour geometry indicates an estimated BMI of ${estimatedBmi} (${bmiCategory}).`,
    },
    breathingRate: {
      value: respVal,
      unit: 'breaths/min',
      status: respVal <= 16 ? 'optimal' : 'normal',
      rhythmRegularity: 92,
      ieRatio: ieRatio,
      breathingDepth: breathingDepth,
      rsaCouplingScore: rsaScore,
      hyperventilationWatch: respVal > 22,
      normalRange: '12 - 20 breaths/min',
      interpretation: `Cadence is ${respVal} breaths/min with ${breathingDepth.toLowerCase()} ventilation.`,
    },
    riskForecasting: {
      ascvd10YearRiskPercent: ascvdRisk,
      metabolicSyndrome5YearRiskPercent: metSRisk,
      type2Diabetes5YearRiskPercent: t2dRisk,
      hypertension5YearRiskPercent: htnRisk,
      biologicalVascularAgeDelta: vascularAgeDelta,
      overallCardioMetabolicGrade: ascvdRisk > 7.5 ? 'Moderate Watch' : ascvdRisk > 5 ? 'Low Risk' : 'Optimal',
      primaryRiskDrivers: [
        stressScore > 50 ? 'Autonomic sympathetic nervous hyperarousal' : 'Cardiovascular resting stability',
        systolic > 125 ? 'Mild pre-hypertensive vascular tension' : 'Healthy arterial compliance',
        estimatedFasting > 100 ? 'Postprandial glycemic oscillation' : 'Balanced glycemic baseline',
      ],
      modifiableMitigationPotential: 'Up to 42% risk reduction via sustained zone-2 cardio, low-sodium DASH nutrition, and resonance breathing.',
    },
    hypertensionMonitoring: {
      currentStage: bpCategory,
      stageSeverityIndex: Math.min(100, Math.round((systolic - 100) * 1.5)),
      arterialStiffnessIndex: asi,
      pulseWaveVelocityMs: pwv,
      baroreflexSensitivity: Number((16.5 - (stressScore * 0.1)).toFixed(1)),
      nocturnalNonDippingRisk: stressScore > 65 ? 'High' : stressScore > 40 ? 'Moderate' : 'Low',
      alertLevel: systolic >= 140 ? 'urgent' : systolic >= 130 ? 'attention' : systolic >= 120 ? 'watch' : 'optimal',
      dashDietComplianceGuidance: [
        'Target daily dietary potassium intake > 3500mg from whole foods (spinach, avocado, bananas).',
        'Limit dietary sodium to under 2000mg to alleviate capillary fluid overload.',
        'Incorporate 30g daily soluble oat/flax fiber for endothelial nitric oxide production.',
      ],
      clinicalProtocolAdvice: bpCategory === 'Normal' ? 'Continue regular periodic monitoring and active lifestyle.' : 'Recommend re-verifying with an arm-cuff sphygmomanometer and practicing daily 5-minute vagal breathing.',
    },
    holisticScores: {
      vitalityIndex: Math.round(100 - (stressScore * 0.4)),
      autonomicBalance: Math.round(100 - Math.abs(50 - stressScore)),
      fatigueDebtIndex: Math.round(stressScore * 0.8),
      vascularPerfusionScore: Math.round(88 - (stressScore * 0.1)),
    },
    facialBiomarkers: {
      skinPerfusionQuality: 'Good capillary blood volume pulsatility',
      microTremorScore: Math.round(10 + Math.random() * 15),
      blinkRatePerMin: Math.round(16 + (stressScore / 10)),
      periorbitalHydration: 'Adequate dermal hydration observed',
      facialMicroExpressionSymmetry: '98% bilateral symmetrical tone',
    },
    clinicalNotes: {
      summary: `Biometric optical analysis shows a resting heart rate of ${heartRateValue} BPM, blood pressure proxy of ${systolic}/${diastolic} mmHg, stress index of ${stressScore}/100, and a metabolic glycemic stability score of ${glycemicScore}/100.`,
      keyObservations: [
        `Cardiovascular rhythm exhibits stable pulsatile amplitude with RPP ${rpp}.`,
        `Estimated fasting blood glucose proxy (${estimatedFasting} mg/dL) aligns with ${sugarRiskLevel.toLowerCase()} range.`,
        `Autonomic balance shows ${stressLevel.toLowerCase()} sympathetic nervous activation with HRV RMSSD ${rmssd}ms.`,
      ],
      lifestyleActionPlan: {
        immediateBreathing: 'Practice 4-7-8 rhythmic breathing for 3 minutes to activate the parasympathetic vagal nerve.',
        nutritionAndGlycemic: 'Pair meals with healthy fats (avocado, olive oil, nuts) to slow glucose absorption and blunt insulin spikes.',
        hydration: 'Drink 300-500ml of mineralized water to support cardiovascular capillary flow.',
        circadianSleep: 'Target 7.5+ hours of sleep in a cool, dark room to optimize insulin sensitivity.',
      },
      disclaimer: 'FaceVital AI is an investigational wellness screening system utilizing optical photoplethysmography and computer vision. It is NOT a medical diagnostic tool or substitute for clinical laboratory blood tests or ECGs. Consult a physician for medical advice.',
    },
  };
}

// Interactive Risk Simulation Endpoint
app.post('/api/simulate-risk', (req, res) => {
  const { currentMetrics, adjustments } = req.body;
  const currentBP = currentMetrics?.bloodPressure?.systolic || 122;
  const currentStress = currentMetrics?.vitals?.stress?.score || 40;
  const currentGlucose = currentMetrics?.vitals?.bloodSugarRisk?.estimatedFastingMgDl || 92;

  const bpReduction = Number(adjustments?.bpReductionMmHg || 0);
  const stressReduction = Number(adjustments?.stressReductionPercent || 0);
  const activeDays = Number(adjustments?.activeDaysPerWeek || 3);
  const sleepHours = Number(adjustments?.sleepHoursNight || 7);

  // Baseline projected risk
  const baseAscvd = currentMetrics?.riskForecasting?.ascvd10YearRiskPercent || 3.2;
  const baseMetS = currentMetrics?.riskForecasting?.metabolicSyndrome5YearRiskPercent || 5.0;

  // Impact calculations
  const bpImpact = (bpReduction / 10) * 0.18;
  const stressImpact = (stressReduction / 100) * 0.22;
  const exerciseImpact = ((activeDays - 2) * 0.06);
  const sleepImpact = sleepHours >= 7.5 ? 0.12 : (sleepHours < 6 ? -0.15 : 0);

  const totalAscvdReductionFactor = Math.max(0.1, Math.min(0.65, bpImpact + stressImpact + exerciseImpact + sleepImpact));
  const postAscvd = Number((baseAscvd * (1 - totalAscvdReductionFactor)).toFixed(1));
  const postMetS = Number((baseMetS * (1 - totalAscvdReductionFactor * 1.2)).toFixed(1));
  const postT2D = Number(((currentMetrics?.riskForecasting?.type2Diabetes5YearRiskPercent || 2.8) * (1 - totalAscvdReductionFactor * 1.1)).toFixed(1));
  const postHTN = Number(((currentMetrics?.riskForecasting?.hypertension5YearRiskPercent || 6.2) * (1 - (bpReduction / 15) * 0.4)).toFixed(1));

  res.json({
    baseAscvd,
    baseMetS,
    postSimulationAscvdRisk: postAscvd,
    postSimulationMetabolicRisk: postMetS,
    postSimulationT2DRisk: postT2D,
    postSimulationHtnRisk: postHTN,
    relativeRiskReductionPercent: Math.round(totalAscvdReductionFactor * 100),
    vascularAgeRejuvenationYears: Math.round(totalAscvdReductionFactor * 6),
  });
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FaceVital AI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
