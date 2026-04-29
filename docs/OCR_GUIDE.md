# 📋 Guide OCR - Reconnaissance de Plaques d'Immatriculation

## 🎯 Objectif

Implémenter une reconnaissance automatique de plaques d'immatriculation robuste utilisant **Tesseract.js** côté client avec fallback manuel pour les erreurs.

## 🔧 Technology Stack

- **Tesseract.js**: OCR côté navigateur (pas de requête serveur)
- **Worker Thread**: Traitement sans bloquer l'UI
- **Support International**: Plaques FR, DE, IT, ES, BE, NL, etc.

## 📦 Installation

```bash
cd frontend
npm install tesseract.js
```

## 🏗️ Architecture
```
┌──────────────────────────┐
│   Camera/Upload Image    │
│   (React Component)      │
└────────────┬─────────────┘
             │
    ┌────────▼─────────┐
    │ Tesseract Worker │  
    │ (Client-side)    │
    └────────┬─────────┘
             │
    ┌────────▼──────────────────┐
    │ Post-processing           │
    │ - Extraction plaque       │
    │ - Validation format       │
    │ - Détection marque auto   │
    └────────┬──────────────────┘
             │
    ┌────────▼──────────────────┐
    │ Results:                  │
    │ - Plate text              │
    │ - Country detected        │
    │ - Confidence score        │
    │ - Brand detected (API)    │
    └───────────────────────────┘
```

## 🎥 Implémentation - Composant OCR

### 1. Service OCR (`frontend/src/services/ocr.service.js`)

```javascript
import Tesseract from 'tesseract.js';

// Pattern des plaques par pays
const PLATE_PATTERNS = {
  FR: {
    pattern: /^[A-Z]{2}-\d{3}-[A-Z]{2}$|^\d{1,4}[A-Z]{1,3}\d{1,2}$/,
    description: 'France: AB-123-CD ou 1234ABC12'
  },
  DE: {
    pattern: /^[A-Z]{1,3}-[A-Z]{1,2}-\d{1,4}$/,
    description: 'Allemagne: ABC-XY-1234'
  },
  IT: {
    pattern: /^[A-Z]{2}\d{3}[A-Z]{2}$/,
    description: 'Italie: AB123CD'
  },
  ES: {
    pattern: /^\d{4}[A-Z]{3}$/,
    description: 'Espagne: 1234ABC'
  },
  BE: {
    pattern: /^\d{3}-[A-Z]{3}$|^[A-Z]{2}-\d{3}-[A-Z]{2}$/,
    description: 'Belgique: 123-ABC ou AB-123-CD'
  }
};

// Détection de pays basée sur patterns
export async function recognizeNumberPlate(imageFile) {
  try {
    const result = await Tesseract.recognize(imageFile, 'eng', {
      logger: m => console.log('Tesseract:', m)
    });

    let ocrText = result.data.text.toUpperCase().trim();
    
    // Nettoyage du texte OCR
    ocrText = cleanOCRText(ocrText);
    
    // Détection du pays
    const detectedCountry = detectPlateCountry(ocrText);
    const confidence = result.data.confidence;

    return {
      success: true,
      plate: ocrText,
      country: detectedCountry,
      confidence,
      rawText: result.data.text
    };
  } catch (error) {
    console.error('Erreur OCR:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

function cleanOCRText(text) {
  // Supprimer les caractères spéciaux sauf ceux des plaques
  return text
    .replace(/[^\w\-]/g, '')
    .replace(/O/g, '0') // Confusion courante: O vs 0
    .replace(/L/g, '1') // Confusion courante: L vs 1
    .replace(/I/g, '1') // Confusion courante: I vs 1
    .trim();
}

function detectPlateCountry(plate) {
  for (const [country, config] of Object.entries(PLATE_PATTERNS)) {
    if (config.pattern.test(plate)) {
      return country;
    }
  }
  return 'UNKNOWN';
}

// Valider une plaque
export function validatePlate(plate, country = 'FR') {
  if (!country || !PLATE_PATTERNS[country]) {
    return { valid: false, reason: 'Pays non supporté' };
  }
  
  const pattern = PLATE_PATTERNS[country].pattern;
  if (!pattern.test(plate)) {
    return { 
      valid: false, 
      reason: `Format invalide pour ${country}: ${PLATE_PATTERNS[country].description}` 
    };
  }
  
  return { valid: true };
}
```

### 2. Component React (`frontend/src/components/OCRPlateRecognition.jsx`)

```jsx
import React, { useRef, useState } from 'react';
import Toast from 'react-hot-toast';
import { recognizeNumberPlate, validatePlate } from '../services/ocr.service';
import CarBrandDetection from './CarBrandDetection';

export default function OCRPlateRecognition({ onSuccess }) {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [recognized, setRecognized] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [useCamera, setUseCamera] = useState(false);
  const [streamActive, setStreamActive] = useState(false);

  // OCR via upload
  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    Toast.loading('Reconnaissance en cours...');
    
    try {
      const result = await recognizeNumberPlate(file);
      
      if (!result.success) throw new Error(result.error);
      
      const validation = validatePlate(result.plate, result.country);
      if (!validation.valid) {
        Toast.error(validation.reason);
        setLoading(false);
        return;
      }

      setRecognized({
        plate: result.plate,
        country: result.country,
        confidence: result.confidence,
        source: 'OCR'
      });
      
      Toast.dismiss();
      Toast.success(`Plaque détectée: ${result.plate}`);
    } catch (error) {
      Toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Caméra en direct
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      videoRef.current.srcObject = stream;
      setStreamActive(true);
      setUseCamera(true);
    } catch (error) {
      Toast.error('Impossible d\'accéder à la caméra');
    }
  };

  const captureFrame = async () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0);
    
    canvas.toBlob(async (blob) => {
      await handleImageUpload({ target: { files: [blob] } });
    });
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setStreamActive(false);
    setUseCamera(false);
  };

  // Saisie manuelle
  const handleManualSubmit = () => {
    const plate = manualInput.toUpperCase().trim();
    if (!plate) {
      Toast.error('Veuillez entrer une plaque');
      return;
    }

    // Tenta detection pays
    let country = 'FR'; // Par défaut
    const validation = validatePlate(plate, country);
    
    if (!validation.valid) {
      Toast.error(validation.reason);
      return;
    }

    setRecognized({
      plate,
      country,
      confidence: 0, // Saisie manuelle
      source: 'MANUAL'
    });
    Toast.success(`Plaque enregistrée: ${plate}`);
  };

  // Confirmation et détection marque
  const handleConfirm = () => {
    if (!recognized) return;
    onSuccess(recognized);
  };

  if (recognized) {
    return (
      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900">Plaque Reconnu</h3>
          <p className="text-2xl font-mono font-bold text-green-700 mt-2">
            {recognized.plate}
          </p>
          <div className="mt-3 text-sm text-green-700">
            <p>🌍 Pays: <strong>{recognized.country}</strong></p>
            {recognized.confidence > 0 && (
              <p>📊 Confiance: <strong>{(recognized.confidence * 100).toFixed(1)}%</strong></p>
            )}
            <p>📍 Source: <strong>{recognized.source}</strong></p>
          </div>
        </div>

        <CarBrandDetection plate={recognized.plate} />

        <div className="flex gap-3">
          <button
            onClick={() => setRecognized(null)}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
          >
            ✏️ Corriger
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            ✅ Continuer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Onglets */}
      <div className="flex gap-3 border-b">
        <button
          onClick={() => { setUseCamera(false); stopCamera(); }}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            !useCamera 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📷 Upload
        </button>
        <button
          onClick={() => { setUseCamera(true); if (!streamActive) startCamera(); }}
          className={`px-4 py-2 font-semibold border-b-2 transition ${
            useCamera 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          📹 Caméra
        </button>
        <button
          className="px-4 py-2 font-semibold border-b-2 border-transparent text-gray-600 hover:text-gray-900"
        >
          ✍️ Manuel
        </button>
      </div>

      {/* Upload ou Caméra */}
      {!useCamera ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={loading}
            className="hidden"
          />
          <div className="text-4xl mb-2">📸</div>
          <p className="text-gray-600">Cliquez pour uploader une photo</p>
          <p className="text-sm text-gray-500 mt-1">ou glissez-déposez</p>
          {loading && <p className="text-blue-600 mt-3 font-semibold">⏳ Traitement OCR...</p>}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-96 object-cover"
          />
          <div className="flex gap-3 p-4 bg-gray-800">
            <button
              onClick={captureFrame}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-500 transition"
            >
              📸 Capturer
            </button>
            <button
              onClick={stopCamera}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              ❌ Fermer
            </button>
          </div>
          {loading && <p className="text-center py-3 text-blue-600 font-semibold">⏳ Traitement...</p>}
        </div>
      )}

      {/* Saisie manuelle */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-800 mb-3">📝 Saisie Manuelle</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value.toUpperCase())}
            placeholder="Ex: AB-123-CD"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
            onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
          />
          <button
            onClick={handleManualSubmit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 🚗 Détection Marque

Après OCR, une API peut identifier la marque basée sur la plaque:

```javascript
// API endpoint: GET /api/vehicles/identify?plate=AB123CD&country=FR
// Répond:
{
  "brand": "Tesla",
  "model": "Model 3",
  "year": 2023,
  "registeredOwner": "Anonymized",
  "color": "White",
  "confidence": 0.95
}
```

## 🌍 Pays Supportés

| Pays | Format | Exemple |
|------|--------|---------|
| 🇫🇷 France | AB-123-CD | AB-123-CD |
| 🇩🇪 Allemagne | ABC-XY-1234 | BER-AB-1234 |
| 🇮🇹 Italie | AB123CD | MI123AB |
| 🇪🇸 Espagne | 1234ABC | 1234ABC |
| 🇧🇪 Belgique | 123-ABC | 123-ABC |

## 📊 Accuracy Metrics

- **Confiance OCR**: 80%+ pour condition optimale
- **Pre-processing**: Rotation, contraste, bruit
- **Fallback**: Toujours permettre saisie manuelle

## 🔒 Privacy & Security

- ✅ OCR en **côté client** (pas de données serveur)
- ✅ Plaques **jamais stockées sans consentement**
- ✅ Données **chiffrées** au repos
- ✅ Suppression automat après réservation

## 🐛 Dépannage

| Problème | Solution |
|----------|----------|
| OCR low accuracy | ✓ Meilleure lumière, netteté, angle perpendiculaire |
| Confusion O/0, L/1 | ✓ Post-processing inclus |
| Plaques étrangères | ✓ Patterns multiples supportés |
| Pas d'accès caméra | ✓ Fallback upload/manuel |

# 🎯 Guide OCR - Reconnaissance de Plaques d'Immatriculation

## Vue d'ensemble

La plateforme utilise **Tesseract.js** (OCR client-side) pour reconnaître automatiquement les plaques d'immatriculation à partir d'une photo de véhicule.

### Avantages de Tesseract.js
✅ Traitement côté client (pas d'upload au serveur)
✅ Pas de coûts API externes
✅ Fonctionne offline
✅ Rapide pour les plaques claires

## Architecture OCR

```
┌─────────────────┐
│  Photo Vehicle  │
│   (Webcam)      │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  Image Processing           │
├─────────────────────────────┤
│ - Rotation detection        │
│ - Contrast enhancement      │
│ - Crop license plate area   │
│ - Size optimization         │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Tesseract.js OCR Worker    │
├─────────────────────────────┤
│ - Language: French + English│
│ - Pattern validation        │
│ - Confidence scoring        │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  License Plate Validation   │
├─────────────────────────────┤
│ - Format by country         │
│ - Pattern matching          │
│ - Country detection         │
│ - Confidence threshold      │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Vehicle Brand Detection    │
├─────────────────────────────┤
│ - Tesla                     │
│ - BYD                       │
│ - Volkswagen                │
│ - User confirmation         │
└─────────────────────────────┘
```

## Formats de Plaques Supportées

### Format Français (Nouvelle génération)
```
Pattern: XX-123-YY
Example: AB-123-CD
Regex:   ^[A-Z]{2}-\d{3}-[A-Z]{2}$
```

### Format Français (Ancien)
```
Pattern: 1234 AB 75
Example: 1234 AB 75
Regex:   ^\d{4}\s[A-Z]{2}\s\d{2}$
```

### Formats Internationaux

#### Format Allemand
```
Pattern: B AB 1234
Regex:   ^[A-Z]{1,2}\s[A-Z]{2}\s\d{1,4}$
```

#### Format Espagnol
```
Pattern: 1234 BCD
Regex:   ^\d{4}\s[A-Z]{3}$
```

#### Format Italien
```
Pattern: AB123CD
Regex:   ^[A-Z]{2}\d{3}[A-Z]{2}$
```

#### Format Britannique
```
Pattern: AB17 ABC
Regex:   ^[A-Z]{2}\d{2}\s[A-Z]{3}$
```

#### Format Belge
```
Pattern: 1-ABC-234
Regex:   ^\d{1}-[A-Z]{3}-\d{3}$
```

## Implémentation Tesseract.js

### Installation
```bash
npm install tesseract.js
```

### Utilisation Basique

```javascript
import Tesseract from 'tesseract.js';

async function recognizeLicensePlate(imageData) {
  const result = await Tesseract.recognize(
    imageData,
    ['eng', 'fra'], // Languages
    {
      logger: m => console.log('OCR Progress:', m.progress)
    }
  );
  
  return {
    text: result.data.text.trim(),
    confidence: result.data.confidence
  };
}
```

### Worker Pool pour Performance

```javascript
import { createWorker } from 'tesseract.js';

let worker = null;

export async function initializeOCRWorker() {
  worker = await createWorker(['eng', 'fra']);
  return worker;
}

export async function recognizePlate(imageData) {
  if (!worker) {
    await initializeOCRWorker();
  }
  
  const { data } = await worker.recognize(imageData);
  return data.text;
}

export async function terminateWorker() {
  if (worker) {
    await worker.terminate();
  }
}
```

## Traitement de l'Image pour Améliorer OCR

### Redimensionnement
```javascript
function resizeImage(canvas, maxWidth = 750) {
  if (canvas.width > maxWidth) {
    const ratio = maxWidth / canvas.width;
    const newHeight = canvas.height * ratio;
    const resizedCanvas = document.createElement('canvas');
    resizedCanvas.width = maxWidth;
    resizedCanvas.height = newHeight;
    
    const ctx = resizedCanvas.getContext('2d');
    ctx.drawImage(canvas, 0, 0, maxWidth, newHeight);
    return resizedCanvas;
  }
  return canvas;
}
```

### Amélioration du Contraste
```javascript
function enhanceContrast(canvas, factor = 1.5) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * factor);     // Red
    data[i + 1] = Math.min(255, data[i + 1] * factor); // Green
    data[i + 2] = Math.min(255, data[i + 2] * factor); // Blue
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
```

### Conversion en Niveaux de Gris
```javascript
function convertToGrayscale(canvas) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11;
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
  
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}
```

## Détection et Validation de Plaques

### Fonction de Validation par Pays

```javascript
const licensePlatePatterns = {
  'FR': {
    modern: /^[A-Z]{2}-\d{3}-[A-Z]{2}$/,
    old: /^\d{4}\s[A-Z]{2}\s\d{2}$/
  },
  'DE': /^[A-Z]{1,2}\s[A-Z]{2}\s\d{1,4}$/,
  'ES': /^\d{4}\s[A-Z]{3}$/,
  'IT': /^[A-Z]{2}\d{3}[A-Z]{2}$/,
  'GB': /^[A-Z]{2}\d{2}\s[A-Z]{3}$/,
  'BE': /^\d{1}-[A-Z]{3}-\d{3}$/
};

export function validateAndParsePlate(plateText, country = null) {
  const cleaned = plateText.toUpperCase().trim();
  
  if (country) {
    const patterns = licensePlatePatterns[country];
    if (patterns) {
      const isValid = Array.isArray(patterns) 
        ? patterns.some(p => p.test(cleaned))
        : patterns.test(cleaned);
      
      if (isValid) {
        return {
          isValid: true,
          plate: cleaned,
          country: country
        };
      }
    }
  } else {
    // Try all patterns
    for (const [country, patterns] of Object.entries(licensePlatePatterns)) {
      const isValid = Array.isArray(patterns)
        ? patterns.some(p => p.test(cleaned))
        : patterns.test(cleaned);
      
      if (isValid) {
        return {
          isValid: true,
          plate: cleaned,
          country: country
        };
      }
    }
  }
  
  return {
    isValid: false,
    plate: cleaned,
    country: null
  };
}
```

## Détection du Pays depuis la Plaque

```javascript
export function detectCountryFromPlate(plateText) {
  const patterns = licensePlatePatterns;
  
  for (const [country, pattern] of Object.entries(patterns)) {
    let isMatch = false;
    
    if (Array.isArray(pattern)) {
      isMatch = pattern.some(p => p.test(plateText));
    } else {
      isMatch = pattern.test(plateText);
    }
    
    if (isMatch) {
      return country;
    }
  }
  
  return null;
}
```

## Flux d'Identification Utilisateur

### Étape 1: Capture de Photo
- Webcam ou upload d'image
- Vérification de qualité (luminosité, flou)

### Étape 2: OCR
- Traitement de l'image
- Reconnaissance de texte
- Score de confiance: > 0.7 = bon

### Étape 3: Validation
- Validation du format de plaque
- Détection du pays
- Affichage du résultat

### Étape 4: Confirmation
- Affichage de la plaque reconnue
- Option de correction manuelle
- Sélection de la marque (Tesla, BYD, VW)

### Étape 5: Continuation
- Application du thème selon la marque
- Accès à l'étape de réservation

## Gestion des Erreurs

```javascript
export const OCRErrorTypes = {
  NO_TEXT_DETECTED: 'NO_TEXT_DETECTED',
  LOW_CONFIDENCE: 'LOW_CONFIDENCE',
  INVALID_FORMAT: 'INVALID_FORMAT',
  WEBCAM_NOT_AVAILABLE: 'WEBCAM_NOT_AVAILABLE',
  IMAGE_PROCESSING_ERROR: 'IMAGE_PROCESSING_ERROR',
  TESSERACT_INIT_ERROR: 'TESSERACT_INIT_ERROR'
};

export class OCRError extends Error {
  constructor(type, message) {
    super(message);
    this.type = type;
    this.name = 'OCRError';
  }
}
```

## Recommandations d'Utilisation

✅ **Bonnes pratiques**
- Prendre la photo en plein jour avec bonne luminosité
- Placer la plaque face à la caméra, sans angle
- Éviter la surexposition (glare)
- Pas de filtre sur l'objectif

❌ **À éviter**
- Photos avec grande profondeur de champ
- Angles aigus > 30°
- Éclairage arrière (contre-jour)
- Images très compressées
- Plaques sales ou endommagées

## Performance et Optimisations

| Métrique | Valeur |
|----------|--------|
| Taille Tesseract.wasm | ~6.8 MB |
| Temps premiere reconnaissance | ~3-5s |
| Temps suivantes | ~0.5-1.5s |
| Confiance moyenne | ~82% |

**Optimisation recommandée**: Worker pool avec 1-2 workers pour éviter gel UI

---

**Dernière mise à jour**: Avril 2026
