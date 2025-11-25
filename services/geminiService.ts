import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ViveToolResult, Tip, Platform } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = 'gemini-2.5-flash';

// Schema for ViveTool List
const viveToolListSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      featureName: { type: Type.STRING, description: "Nome della funzionalità Windows" },
      featureId: { type: Type.STRING, description: "L'ID numerico della funzionalità (es. 12345678)" },
      command: { type: Type.STRING, description: "Il comando completo vivetool /enable /id:..." },
      description: { type: Type.STRING, description: "Breve spiegazione chiara di cosa fa" },
      riskLevel: { type: Type.STRING, enum: ['Low', 'Medium', 'High'], description: "Livello di rischio per la stabilità" }
    },
    required: ["featureName", "featureId", "command", "description", "riskLevel"]
  }
};

// Schema for Tips
const tipsSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      content: { type: Type.STRING },
      category: { type: Type.STRING, enum: ['System', 'Productivity', 'Hidden', 'Customization', 'Cheats', 'Gameplay'] }
    },
    required: ["title", "content", "category"]
  }
};

export const generateViveToolFeatures = async (category: string = 'Trending'): Promise<ViveToolResult[]> => {
  try {
    const prompt = `
      Genera una lista di 5 funzionalità nascoste o tweak utili per Windows 11 che si possono attivare con ViveTool.
      Categoria richiesta: "${category}".
      
      Se la categoria è "Trending", elenca le 5 funzionalità più popolari e stabili del momento per Windows 11 (es. Moment features, Taskbar changes, Notepad tabs, ecc).
      Se la categoria è specifica (es. "Taskbar"), trova ID relativi a quella parte del sistema.
      
      Assicurati che gli ID siano reali o storicamente accurati per Windows 10/11.
      Rispondi in Italiano.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: viveToolListSchema,
        systemInstruction: "Sei un esperto di Windows Modding. Fornisci solo ID validi e comandi corretti. Sii conciso nelle descrizioni."
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ViveToolResult[];
    }
    return [];
  } catch (error) {
    console.error("Errore generazione ViveTool:", error);
    throw error;
  }
};

export const generateTips = async (platform: Platform, query: string): Promise<Tip[]> => {
  try {
    let prompt = '';
    let sysInstruction = '';

    if (platform === 'Games') {
      prompt = `
        L'utente vuole trucchi, codici console o segreti per il videogioco PC: "${query}".
        
        Genera una lista di 6 trucchi (Cheats) funzionanti.
        - Nel campo 'title' metti il CODICE da digitare o il nome del trucco (es. "god_mode 1" o "Soldi Infiniti").
        - Nel campo 'content' spiega l'effetto e come attivarlo (es. "Apri la console con \\ e scrivi...").
        - Usa la categoria 'Cheats' per codici diretti, 'Gameplay' per consigli strategici o sbloccabili.
        
        Se il gioco non ha trucchi ufficiali (es. giochi multiplayer online), fornisci consigli strategici avanzati o "meta tips".
      `;
      sysInstruction = "Sei un esperto di Gaming e trucchi per PC. Conosci i codici console di tutti i giochi esistenti (GTA, Skyrim, The Sims, etc).";
    } else {
      const platformSpecifics = platform === 'iPhone' 
        ? 'Apple iPhone 14 Plus (iOS 16/17/18)' 
        : 'Windows 10/11 PC, Command Prompt, Registry Editor, PowerShell, GodMode';

      prompt = `
        Genera 6 trucchi, consigli o "hacks" avanzati ed esclusivi per ${platformSpecifics}.
        
        Contesto specifico: "${query}".
        
        Se l'utente chiede "tutti i trucchi", spazia tra:
        - Modifiche al Registro di Sistema (Regedit)
        - Comandi CMD/PowerShell per power users
        - Funzionalità segrete dell'interfaccia
        - Ottimizzazioni di rete e privacy
        
        Assicurati che i consigli siano pratici, tecnicamente validi e "nerd".
        Rispondi in Italiano.
      `;
      sysInstruction = "Sei un hacker etico ed esperto informatico. Fornisci trucchi concreti, codici da digitare e path di registro precisi.";
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: tipsSchema,
        systemInstruction: sysInstruction
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as Tip[];
    }
    return [];
  } catch (error) {
    console.error("Errore generazione Tips:", error);
    throw error;
  }
};

export const generateRegCode = async (description: string): Promise<string> => {
  try {
    const prompt = `
      Genera il contenuto esatto di un file .reg (Windows Registry Script) per risolvere questo problema o applicare questo tweak:
      "${description}"
      
      Regole:
      1. Deve iniziare con "Windows Registry Editor Version 5.00".
      2. Deve essere sicuro e sintatticamente corretto.
      3. Non includere spiegazioni, solo il codice.
      4. Se serve cancellare una chiave, usa il prefisso "-".
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "text/plain",
        systemInstruction: "Sei un generatore di codice di sistema Windows. Restituisci SOLO il blocco di codice per il file .reg."
      }
    });

    let text = response.text || "";
    // Pulizia markdown se presente
    text = text.replace(/```reg/g, '').replace(/```/g, '').trim();
    return text;
  } catch (error) {
    console.error("Errore generazione REG:", error);
    throw error;
  }
};