
import React, { useState } from 'react';
import { generateTips, generateRegCode } from '../services/geminiService';
import { Tip, Platform } from '../types';
import { WindowsIcon, AppleIcon, SparklesIcon, DownloadIcon, SearchIcon, GamepadIcon } from './Icons';

// --- INTERFACCE E DATI STATICI ---

type RegCategory = 
  | 'Org Fix' 
  | 'Interface' 
  | 'Context Menu' 
  | 'Performance' 
  | 'Privacy' 
  | 'System' 
  | 'Network' 
  | 'Gaming'
  | 'Input/Devices'
  | 'Security'
  | 'Boot/Power';

interface RegistryFix {
  id: string;
  title: string;
  description: string;
  category: RegCategory;
  content: string;
  recommended?: boolean;
  warning?: string;
}

// --- DATABASE ENCICLOPEDICO .REG (Espanso) ---
const COMMON_REGISTRY_FIXES: RegistryFix[] = [
  // ==========================================
  // 🔴 ORG FIX & UPDATES (SBLOCCO GESTIONE)
  // ==========================================
  {
    id: 'fix_org_master',
    title: 'MASTER RESET: Sblocco Totale Policy',
    description: 'Rimuove "Gestito dall\'organizzazione" da Update, Defender, Edge e Privacy. Pulisce tutte le policy.',
    category: 'Org Fix',
    recommended: true,
    content: `Windows Registry Editor Version 5.00
[-HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate]
[-HKEY_CURRENT_USER\\Software\\Policies\\Microsoft\\Windows\\WindowsUpdate]
[-HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection]
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection]
"AllowTelemetry"=dword:00000001
[-HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows Defender]
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows Defender]
"DisableAntiSpyware"=dword:00000000
[-HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Edge]`
  },
  {
    id: 'fix_org_update_force',
    title: 'Sblocca Windows Update',
    description: 'Forza la riattivazione degli aggiornamenti automatici bloccati dalle policy.',
    category: 'Org Fix',
    content: `Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate\\AU]
"NoAutoUpdate"=dword:00000000
"AUOptions"=dword:00000004
[-HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate]
[-HKEY_CURRENT_USER\\Software\\Policies\\Microsoft\\Windows\\WindowsUpdate]`
  },
  {
    id: 'fix_org_defender_enable',
    title: 'Riattiva Defender Disattivato',
    description: 'Se Defender è grigio o disattivato dall\'amministratore, questo lo riattiva.',
    category: 'Org Fix',
    content: `Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows Defender]
"DisableAntiSpyware"=dword:00000000
"DisableRealtimeMonitoring"=dword:00000000
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows Defender\\Real-Time Protection]
"DisableBehaviorMonitoring"=dword:00000000
"DisableOnAccessProtection"=dword:00000000
"DisableScanOnRealtimeEnable"=dword:00000000`
  },
  {
    id: 'fix_smartscreen',
    title: 'Disabilita SmartScreen',
    description: 'Disabilita il filtro SmartScreen per le app (utile se blocca eseguibili legittimi).',
    category: 'Org Fix',
    content: `Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\System]
"EnableSmartScreen"=dword:00000000
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\AppHost]
"EnableWebContentEvaluation"=dword:00000000`
  },

  // ==========================================
  // 🎨 INTERFACE & EXPLORER
  // ==========================================
  {
    id: 'ui_classic_context',
    title: 'Menu Contestuale Classico (Win 11)',
    description: 'Ripristina il menu del tasto destro completo stile Windows 10.',
    category: 'Interface',
    recommended: true,
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Software\\Classes\\CLSID\\{86ca1aa0-34aa-4e8b-a509-50c905bae2a2}\\InprocServer32]
@=""`
  },
  {
    id: 'ui_taskbar_left',
    title: 'Taskbar a Sinistra (Win 11)',
    description: 'Sposta il menu Start e le icone a sinistra invece che al centro.',
    category: 'Interface',
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced]
"TaskbarAl"=dword:00000000`
  },
  {
    id: 'ui_seconds_clock',
    title: 'Mostra Secondi Orologio',
    description: 'Aggiunge i secondi all\'orologio nella system tray.',
    category: 'Interface',
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced]
"ShowSecondsInSystemClock"=dword:00000001`
  },
  {
    id: 'ui_photoviewer',
    title: 'Visualizzatore Foto Win7',
    description: 'Riattiva il vecchio e veloce Visualizzatore Foto di Windows 7.',
    category: 'Interface',
    content: `Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows Photo Viewer\\Capabilities\\FileAssociations]
".bmp"="PhotoViewer.FileAssoc.Tiff"
".gif"="PhotoViewer.FileAssoc.Tiff"
".jpg"="PhotoViewer.FileAssoc.Tiff"
".jpeg"="PhotoViewer.FileAssoc.Tiff"
".png"="PhotoViewer.FileAssoc.Tiff"`
  },
  {
    id: 'ui_thispc_desktop',
    title: 'Icona Questo PC su Desktop',
    description: 'Fa apparire l\'icona Computer sul desktop.',
    category: 'Interface',
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\HideDesktopIcons\\NewStartPanel]
"{20D04FE0-3AEA-1069-A2D8-08002B30309D}"=dword:00000000`
  },
  {
    id: 'ui_disable_search_web',
    title: 'Disabilita Ricerca Web nel Start',
    description: 'Quando cerchi nel menu Start, cerca solo i file locali, non su internet.',
    category: 'Interface',
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Software\\Policies\\Microsoft\\Windows\\Explorer]
"DisableSearchBoxSuggestions"=dword:00000001
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search]
"DisableWebSearch"=dword:00000001`
  },
  {
    id: 'ui_remove_widgets',
    title: 'Rimuovi Widgets e News',
    description: 'Rimuove l\'icona del meteo/notizie dalla barra delle applicazioni.',
    category: 'Interface',
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced]
"TaskbarDa"=dword:00000000`
  },
  {
    id: 'ui_dark_mode_apps',
    title: 'Forza Dark Mode (App)',
    description: 'Forza la modalità scura per le applicazioni.',
    category: 'Interface',
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize]
"AppsUseLightTheme"=dword:00000000`
  },
  {
    id: 'ui_dark_mode_sys',
    title: 'Forza Dark Mode (Sistema)',
    description: 'Forza la modalità scura per la barra delle applicazioni e start.',
    category: 'Interface',
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize]
"SystemUsesLightTheme"=dword:00000000`
  },
  {
    id: 'ui_no_transparency',
    title: 'Disabilita Trasparenze',
    description: 'Rende le finestre solide, migliorando la leggibilità e le performance.',
    category: 'Interface',
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize]
"EnableTransparency"=dword:00000000`
  },

  // ==========================================
  // 🖱️ CONTEXT MENU (TASTO DESTRO)
  // ==========================================
  {
    id: 'ctx_copy_to',
    title: 'Aggiungi "Copia nella cartella..."',
    description: 'Aggiunge una scorciatoia rapida per copiare file in una cartella specifica.',
    category: 'Context Menu',
    content: `Windows Registry Editor Version 5.00
[HKEY_CLASSES_ROOT\\AllFilesystemObjects\\shellex\\ContextMenuHandlers\\Copy To]
@="{C2FBB630-2971-11D1-A18C-00C04FD75D13}"`
  },
  {
    id: 'ctx_move_to',
    title: 'Aggiungi "Sposta nella cartella..."',
    description: 'Aggiunge una scorciatoia rapida per spostare file.',
    category: 'Context Menu',
    content: `Windows Registry Editor Version 5.00
[HKEY_CLASSES_ROOT\\AllFilesystemObjects\\shellex\\ContextMenuHandlers\\Move To]
@="{C2FBB631-2971-11D1-A18C-00C04FD75D13}"`
  },
  {
    id: 'ctx_notepad',
    title: 'Aggiungi "Apri con Blocco Note"',
    description: 'Aggiunge l\'opzione per aprire qualsiasi file con Blocco Note.',
    category: 'Context Menu',
    content: `Windows Registry Editor Version 5.00
[HKEY_CLASSES_ROOT\\*\\shell\\Open with Notepad]
@="Apri con Blocco Note"
[HKEY_CLASSES_ROOT\\*\\shell\\Open with Notepad\\command]
@="notepad.exe %1"`
  },
  {
    id: 'ctx_godmode',
    title: 'Aggiungi God Mode al Desktop',
    description: 'Aggiunge un collegamento al menu contestuale del Desktop per accedere a tutte le impostazioni.',
    category: 'Context Menu',
    content: `Windows Registry Editor Version 5.00
[HKEY_CLASSES_ROOT\\DesktopBackground\\Shell\\GodMode]
@="God Mode"
"Icon"="control.exe"
[HKEY_CLASSES_ROOT\\DesktopBackground\\Shell\\GodMode\\command]
@="explorer.exe shell:::{ED7BA470-8E54-465E-825C-99712043E01C}"`
  },
  {
    id: 'ctx_take_ownership',
    title: 'Aggiungi "Take Ownership"',
    description: 'Diventa proprietario di qualsiasi file/cartella bloccata con un click.',
    category: 'Context Menu',
    content: `Windows Registry Editor Version 5.00
[HKEY_CLASSES_ROOT\\*\\shell\\runas]
@="Take Ownership"
"NoWorkingDirectory"=""
[HKEY_CLASSES_ROOT\\*\\shell\\runas\\command]
@="cmd.exe /c takeown /f \\"%1\\" && icacls \\"%1\\" /grant administrators:F"
"IsolatedCommand"="cmd.exe /c takeown /f \\"%1\\" && icacls \\"%1\\" /grant administrators:F"`
  },

  // ==========================================
  // 🚀 PERFORMANCE
  // ==========================================
  {
    id: 'perf_menu_delay',
    title: 'Menu Ultra Veloci',
    description: 'Rimuove il ritardo di 400ms nell\'apertura dei menu.',
    category: 'Performance',
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Control Panel\\Desktop]
"MenuShowDelay"="0"`
  },
  {
    id: 'perf_game_mode',
    title: 'Forza Game Mode',
    description: 'Attiva la modalità gioco e la priorità GPU.',
    category: 'Performance',
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Software\\Microsoft\\GameBar]
"AllowAutoGameMode"=dword:00000001
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games]
"GPU Priority"=dword:00000008
"Priority"=dword:00000006`
  },
  {
    id: 'perf_bg_apps',
    title: 'Stop App in Background',
    description: 'Impedisce alle app universali di girare in background consumando RAM.',
    category: 'Performance',
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\BackgroundAccessApplications]
"GlobalUserDisabled"=dword:00000001`
  },
  {
    id: 'perf_throttling',
    title: 'Disabilita Network Throttling',
    description: 'Rimuove i limiti di Windows sulla gestione dei pacchetti di rete (utile per Gaming/Download).',
    category: 'Performance',
    content: `Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile]
"NetworkThrottlingIndex"=dword:ffffffff`
  },
  {
    id: 'perf_disable_animations',
    title: 'Disabilita Animazioni Finestre',
    description: 'Rende l\'apertura delle finestre istantanea rimuovendo le animazioni.',
    category: 'Performance',
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Control Panel\\Desktop\\WindowMetrics]
"MinAnimate"="0"
[HKEY_CURRENT_USER\\Control Panel\\Desktop]
"UserPreferencesMask"=hex:90,12,03,80`
  },

  // ==========================================
  // 🔒 PRIVACY & BLOAT
  // ==========================================
  {
    id: 'priv_telemetry',
    title: 'Blocca Telemetria Totale',
    description: 'Disabilita la raccolta dati Microsoft e il feedback automatico.',
    category: 'Privacy',
    content: `Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\DataCollection]
"AllowTelemetry"=dword:00000000
"MaxTelemetryAllowed"=dword:00000000
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\AdvertisingInfo]
"DisabledByGroupPolicy"=dword:00000001`
  },
  {
    id: 'priv_cortana',
    title: 'Disabilita Cortana',
    description: 'Spegne completamente l\'assistente vocale.',
    category: 'Privacy',
    content: `Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\Windows Search]
"AllowCortana"=dword:00000000
"AllowCortanaAboveLock"=dword:00000000`
  },
  {
    id: 'priv_ads_explorer',
    title: 'No Pubblicità in Esplora File',
    description: 'Rimuove i banner di OneDrive e Office da Esplora Risorse.',
    category: 'Privacy',
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced]
"ShowSyncProviderNotifications"=dword:00000000`
  },
  {
    id: 'priv_location',
    title: 'Disabilita Tracciamento Posizione',
    description: 'Disabilita i servizi di localizzazione a livello di sistema.',
    category: 'Privacy',
    content: `Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\LocationAndSensors]
"DisableLocation"=dword:00000001`
  },
  {
    id: 'priv_feedback',
    title: 'Stop Feedback Requests',
    description: 'Impedisce a Windows di chiederti "Quanto ti piace questo prodotto?".',
    category: 'Privacy',
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Software\\Microsoft\\Siuf\\Rules]
"NumberOfSIUFInPeriod"=dword:00000000`
  },

  // ==========================================
  // ⚙️ SYSTEM CORE
  // ==========================================
  {
    id: 'sys_bsod_reboot',
    title: 'No Riavvio Automatico BSOD',
    description: 'Ti permette di leggere l\'errore in caso di schermata blu invece di riavviare subito.',
    category: 'System',
    content: `Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\CrashControl]
"AutoReboot"=dword:00000000`
  },
  {
    id: 'sys_verbose',
    title: 'Avvio Verbose (Dettagliato)',
    description: 'Mostra i driver e i servizi caricati durante l\'avvio invece della rotella.',
    category: 'System',
    content: `Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System]
"VerboseStatus"=dword:00000001`
  },
  {
    id: 'sys_driver_update',
    title: 'Blocca Driver in Windows Update',
    description: 'Impedisce a Windows Update di sovrascrivere i tuoi driver (GPU/Audio) funzionanti.',
    category: 'System',
    recommended: true,
    content: `Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\WindowsUpdate]
"ExcludeWUDriversInQualityUpdate"=dword:00000001`
  },
  {
    id: 'sys_uac_dim',
    title: 'UAC: Non Oscurare Schermo',
    description: 'Mantiene le notifiche di sicurezza ma non oscura tutto lo schermo (più veloce).',
    category: 'System',
    content: `Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Policies\\System]
"PromptOnSecureDesktop"=dword:00000000`
  },

  // ==========================================
  // 🌐 NETWORK & INTERNET
  // ==========================================
  {
    id: 'net_tcp_window',
    title: 'TCP Auto Tuning',
    description: 'Abilita il tuning automatico TCP per connessioni a banda larga.',
    category: 'Network',
    content: `Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\Tcpip\\Parameters]
"TcpWindowSize"=dword:0005ae4c
"GlobalMaxTcpWindowSize"=dword:0005ae4c`
  },
  {
    id: 'net_dns_prio',
    title: 'Correggi Priorità DNS',
    description: 'Migliora la risoluzione dei nomi correggendo la priorità dei servizi locali.',
    category: 'Network',
    content: `Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Services\\Dnscache\\Parameters]
"ServerPriorityTimeLimit"=dword:00000000
"ServicePriority"=dword:00000000
"ClientPriorityTimeLimit"=dword:00000000`
  },
  
  // ==========================================
  // 🎮 INPUT / DEVICES
  // ==========================================
  {
    id: 'input_numlock',
    title: 'NumLock Sempre Attivo',
    description: 'Forza l\'accensione del tastierino numerico al boot.',
    category: 'Input/Devices',
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Control Panel\\Keyboard]
"InitialKeyboardIndicators"="2"`
  },
  {
    id: 'input_sticky_keys',
    title: 'Disabilita Tasti Permanenti',
    description: 'Disabilita la fastidiosa finestra dei Tasti Permanenti (Shift premuto 5 volte).',
    category: 'Input/Devices',
    content: `Windows Registry Editor Version 5.00
[HKEY_CURRENT_USER\\Control Panel\\Accessibility\\StickyKeys]
"Flags"="506"`
  },
  
  // ==========================================
  // ⚡ BOOT & POWER
  // ==========================================
  {
    id: 'boot_fast_startup',
    title: 'Disabilita Avvio Rapido',
    description: 'Risolve problemi di spegnimento non completo e corruzione dati SSD.',
    category: 'Boot/Power',
    content: `Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Session Manager\\Power]
"HiberbootEnabled"=dword:00000000`
  },
  {
    id: 'boot_lock_screen',
    title: 'Disabilita Schermata di Blocco',
    description: 'Salta la schermata di blocco (quella con l\'orologio) e vai subito al login.',
    category: 'Boot/Power',
    content: `Windows Registry Editor Version 5.00
[HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows\\Personalization]
"NoLockScreen"=dword:00000001`
  }
];

const ACTION_GAMES = ["GTA V", "Minecraft", "The Sims 4", "Skyrim", "Red Dead Redemption 2", "Cyberpunk 2077"];
const CARD_GAMES = [
  // POKER & VARIANTI
  "Zynga Poker", "Governor of Poker 3", "WSOP Poker", "PokerStars Play", 
  "Texas Hold'em Poker: Pokerist", "World Poker Club", "Appeak Poker", "Video Poker",
  
  // BURRACO & CANASTA
  "Burraco Reale", "Burraco Italiano: Jogatina", "Burraco e Pinelle Online", "MyBurraco", "Burraco Pro",
  "Canasta Junction", "Canasta Online", "Canasta - The Card Game", "Hand and Foot Canasta", "Canasta Palace",
  
  // CASINO & SLOTS
  "Slotomania", "Jackpot Party Casino", "DoubleDown Casino", "Huuuge Casino", "Caesars Slots", 
  "Coin Master", "Heart of Vegas", "Big Fish Casino",
  
  // CLASSICI ITALIANI & ALTRI
  "Briscola", "Scopa", "Tressette", "Sette e Mezzo", "Asso Pigliatutto", "Bestia",
  "Microsoft Solitaire Collection", "Uno!", "Phase 10", "Gin Rummy Plus", "Spades Plus", 
  "Solitaire Grand Harvest", "Spider Solitaire"
];

const TipsView: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('Windows');
  const [topic, setTopic] = useState('');
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'AI' | 'REGISTRY'>('REGISTRY');
  const [activeRegCategory, setActiveRegCategory] = useState<RegCategory | 'All'>('All');
  const [localSearch, setLocalSearch] = useState('');
  
  // Custom REG Generator State
  const [customRegPrompt, setCustomRegPrompt] = useState('');
  const [generatingReg, setGeneratingReg] = useState(false);
  const [generatedRegContent, setGeneratedRegContent] = useState<string | null>(null);

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const fetchTips = async (append: boolean = false) => {
    setLoading(true);
    if (!append) setTips([]);

    try {
      const effectiveQuery = topic || (platform === 'Games' ? "Tutti i trucchi generali più utili" : "Dammi trucchi avanzati");
      const data = await generateTips(platform, effectiveQuery);
      setTips(prev => {
        const newTips = data.filter(newItem => !prev.some(existing => existing.title === newItem.title));
        return [...prev, ...newTips];
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRegGenerate = async () => {
    if (!customRegPrompt.trim()) return;
    setGeneratingReg(true);
    setGeneratedRegContent(null);
    try {
      const code = await generateRegCode(customRegPrompt);
      setGeneratedRegContent(code);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingReg(false);
    }
  };

  const handleSearch = () => {
    setViewMode('AI');
    fetchTips(false);
  };
  
  const handleLoadMore = () => fetchTips(true);

  // Auto-fill query for popular games
  const handlePopularGameClick = (game: string) => {
    setTopic(game);
    setLoading(true);
    setTips([]);
    generateTips('Games', game).then(data => {
      setTips(data);
      setLoading(false);
    });
  };

  React.useEffect(() => {
    if (platform === 'iPhone' || platform === 'Games') {
      setViewMode('AI');
      setTips([]);
    } else {
      setViewMode('REGISTRY');
    }
  }, [platform]);

  const filteredFixes = COMMON_REGISTRY_FIXES.filter(fix => {
    const matchesCategory = activeRegCategory === 'All' || fix.category === activeRegCategory;
    const matchesSearch = localSearch === '' || 
      fix.title.toLowerCase().includes(localSearch.toLowerCase()) || 
      fix.description.toLowerCase().includes(localSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">
          <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
            platform === 'Windows' ? 'from-blue-400 to-cyan-400' : 
            platform === 'Games' ? 'from-green-400 to-emerald-400' :
            'from-purple-400 to-pink-400'
          }`}>
            {platform === 'Windows' ? 'Infinite Registry Database' : 
             platform === 'Games' ? 'Universal Game Trainer' : 'iPhone Secrets'}
          </span>
        </h2>
        <p className="text-slate-400">
          {platform === 'Windows' ? 'Oltre 3000 combinazioni possibili. Database statico + Generatore AI.' :
           platform === 'Games' ? 'Trova codici, cheat e segreti per qualsiasi gioco PC esistente.' : 
           'Scopri funzionalità nascoste del tuo dispositivo Apple.'}
        </p>
      </div>

      {/* Platform Toggle */}
      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => setPlatform('Windows')}
          className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 border ${
            platform === 'Windows'
              ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
              : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-750'
          }`}
        >
          <WindowsIcon className="w-5 h-5" />
          <span className="font-bold">Windows PC</span>
        </button>
        <button
          onClick={() => setPlatform('Games')}
          className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 border ${
            platform === 'Games'
              ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
              : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-750'
          }`}
        >
          <GamepadIcon className="w-5 h-5" />
          <span className="font-bold">PC Games</span>
        </button>
        <button
          onClick={() => setPlatform('iPhone')}
          className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 border ${
            platform === 'iPhone'
              ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
              : 'bg-slate-800 border-slate-700 text-slate-500 hover:bg-slate-750'
          }`}
        >
          <AppleIcon className="w-5 h-5" />
          <span className="font-bold">iPhone 14 Plus</span>
        </button>
      </div>

      {/* Sub-Navigation for Windows */}
      {platform === 'Windows' && (
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setViewMode('REGISTRY')}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'REGISTRY' 
              ? 'bg-slate-700 text-white ring-2 ring-slate-500 shadow-lg' 
              : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            📚 Archivio .REG
          </button>
          <button
            onClick={() => { setViewMode('AI'); if(tips.length===0) handleSearch(); }}
            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'AI' 
              ? 'bg-purple-600 text-white ring-2 ring-purple-400 shadow-lg' 
              : 'bg-slate-800/50 text-slate-400 hover:text-white'
            }`}
          >
            🤖 AI Explorer
          </button>
        </div>
      )}

      {/* --- VIEW MODE: REGISTRY LIBRARY (WINDOWS ONLY) --- */}
      {platform === 'Windows' && viewMode === 'REGISTRY' && (
        <div className="space-y-6">
          {/* Custom Generator Block */}
          <div className="bg-gradient-to-r from-slate-900 to-blue-900/20 border border-blue-500/30 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-blue-400" />
              Generatore Infinito .REG
            </h3>
            <p className="text-slate-400 text-sm mb-4">
              Non trovi il fix che cerchi? Descrivilo qui sotto e l'IA genererà il file .reg sicuro per te.
            </p>
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                value={customRegPrompt}
                onChange={(e) => setCustomRegPrompt(e.target.value)}
                placeholder="Es. Disabilita il Bluetooth automaticamente, Nascondi icona volume, Abilita vecchio mixer audio..."
                className="flex-1 bg-black/30 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button 
                onClick={handleCustomRegGenerate}
                disabled={generatingReg || !customRegPrompt}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold disabled:opacity-50 transition-colors"
              >
                {generatingReg ? 'Generazione...' : 'Genera Fix'}
              </button>
            </div>
            {generatedRegContent && (
               <div className="mt-4 p-4 bg-black/40 rounded-lg border border-slate-700 animate-fade-in">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-mono text-emerald-400">Codice Generato con Successo</span>
                    <button 
                      onClick={() => downloadFile('custom_fix.reg', generatedRegContent)}
                      className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded flex items-center gap-1"
                    >
                      <DownloadIcon className="w-3 h-3" /> Scarica .reg
                    </button>
                  </div>
                  <pre className="text-xs text-slate-400 overflow-x-auto p-2 font-mono">
                    {generatedRegContent}
                  </pre>
               </div>
            )}
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-slate-700/50 pb-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-blue-500/20 rounded-xl text-blue-400 shadow-inner">
                    <DownloadIcon className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Database Fix</h3>
                    <p className="text-slate-400 text-sm">
                      {filteredFixes.length} fix visualizzati di {COMMON_REGISTRY_FIXES.length} caricati
                    </p>
                  </div>
                </div>
                
                {/* Local Search */}
                <div className="relative w-full md:w-64">
                   <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                   <input 
                      type="text" 
                      value={localSearch}
                      onChange={(e) => setLocalSearch(e.target.value)}
                      placeholder="Cerca nel database..."
                      className="w-full bg-slate-900/50 border border-slate-600 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                   />
                </div>
             </div>

             {/* Registry Category Filters (Horizontal Scrollable) */}
             <div className="overflow-x-auto pb-4 mb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-700">
               <div className="flex gap-2 min-w-max">
                  <button
                      onClick={() => setActiveRegCategory('All')}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                        activeRegCategory === 'All' 
                        ? 'bg-white text-slate-900 border-white' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      TUTTI
                  </button>
                  {([
                    'Org Fix', 
                    'Interface', 
                    'Performance', 
                    'Privacy', 
                    'Context Menu', 
                    'System', 
                    'Network', 
                    'Gaming', 
                    'Input/Devices', 
                    'Boot/Power'
                  ] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveRegCategory(cat)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                        activeRegCategory === cat 
                        ? 'bg-blue-600 text-white border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.4)]' 
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-blue-500 hover:text-blue-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
               </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFixes.map((fix) => (
                   <div key={fix.id} className={`relative flex flex-col rounded-xl p-5 border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group ${
                      fix.recommended 
                      ? 'bg-gradient-to-br from-blue-900/10 to-slate-900 border-blue-500/30' 
                      : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                   }`}>
                      {fix.recommended && (
                        <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl-lg shadow-sm">
                          TOP
                        </div>
                      )}
                      
                      <div className="mb-3">
                         <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md mb-2 truncate max-w-full ${
                            fix.category === 'Org Fix' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            fix.category === 'Performance' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-slate-700/50 text-slate-400 border border-slate-700'
                         }`}>
                           {fix.category}
                         </span>
                         <h4 className="font-bold text-slate-200 leading-tight group-hover:text-blue-400 transition-colors">
                           {fix.title}
                         </h4>
                      </div>

                      <p className="text-xs text-slate-500 mb-4 flex-grow leading-relaxed">
                        {fix.description}
                      </p>
                      
                      <button
                        onClick={() => downloadFile(`${fix.title.replace(/[\s:/]+/g, '_')}.reg`, fix.content)}
                        className={`w-full mt-auto text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 border transition-all ${
                          fix.recommended 
                          ? 'bg-blue-600 hover:bg-blue-500 text-white border-transparent shadow-lg shadow-blue-900/20' 
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-blue-500 hover:text-white'
                        }`}
                      >
                         <DownloadIcon className="w-4 h-4" />
                         SCARICA
                      </button>
                   </div>
                ))}
                
                {filteredFixes.length === 0 && (
                   <div className="col-span-full text-center py-12 text-slate-500">
                     <p>Nessun fix trovato con questo nome. Usa il generatore AI sopra!</p>
                   </div>
                )}
             </div>
          </div>
          
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 text-center">
             <p className="text-xs text-amber-500/80 font-medium">
               ⚠️ Disclaimer: Le modifiche al registro sono potenti. Anche se questi file sono testati e sicuri, TechMaster consiglia sempre di creare un punto di ripristino prima di procedere.
             </p>
          </div>
        </div>
      )}

      {/* --- VIEW MODE: AI SEARCH (WINDOWS, IPHONE & GAMES) --- */}
      {viewMode === 'AI' && (
        <div className="space-y-6">
          {/* Popular Games Chips - SEPARATI PER CATEGORIA */}
          {platform === 'Games' && (
             <div className="space-y-4 mb-6 animate-fade-in">
                {/* Categoria Action */}
                <div>
                   <h4 className="text-center text-emerald-400 text-xs font-bold uppercase tracking-widest mb-3 opacity-80">
                      🔥 Top Action & RPG
                   </h4>
                   <div className="flex flex-wrap justify-center gap-2">
                     {ACTION_GAMES.map(game => (
                        <button
                          key={game}
                          onClick={() => handlePopularGameClick(game)}
                          className="px-3 py-1 bg-slate-800 hover:bg-emerald-600/20 hover:text-emerald-400 text-slate-400 text-xs rounded-full border border-slate-700 transition-colors"
                        >
                          {game}
                        </button>
                     ))}
                   </div>
                </div>

                {/* Categoria Carte e Casinò */}
                <div className="pt-2 border-t border-slate-800/50">
                   <h4 className="text-center text-pink-400 text-xs font-bold uppercase tracking-widest mb-3 mt-2 opacity-80">
                      🃏 Carte, Poker & Casinò
                   </h4>
                   <div className="flex flex-wrap justify-center gap-2">
                     {CARD_GAMES.map(game => (
                        <button
                          key={game}
                          onClick={() => handlePopularGameClick(game)}
                          className="px-3 py-1 bg-slate-800 hover:bg-pink-600/20 hover:text-pink-400 text-slate-400 text-xs rounded-full border border-slate-700 transition-colors"
                        >
                          {game}
                        </button>
                     ))}
                   </div>
                </div>
             </div>
          )}

          {/* Search Bar */}
          <div className="flex max-w-2xl mx-auto gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                platform === 'Windows' ? "Descrivi il problema o chiedi un trucco (es. velocizzare menu)..." : 
                platform === 'Games' ? "Scrivi il nome del gioco..." :
                "Cerca trucchi iPhone (es. Batteria, Foto)..."
              }
              className={`flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none transition-colors ${
                platform === 'Games' ? 'focus:border-emerald-500' : 'focus:border-purple-500'
              }`}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`text-white px-6 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2 shadow-lg ${
                platform === 'Games' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/20' : 'bg-purple-600 hover:bg-purple-500 shadow-purple-900/20'
              }`}
            >
              {loading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                <>
                  <SparklesIcon className="w-5 h-5" />
                  <span>{platform === 'Games' ? 'Trova Trucchi' : 'Genera'}</span>
                </>
              )}
            </button>
          </div>

          {/* Grid Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tips.map((tip, index) => (
                <div 
                  key={index} 
                  className={`p-6 rounded-2xl transition-all duration-300 group relative overflow-hidden backdrop-blur-sm border hover:scale-[1.01] hover:shadow-xl ${
                    platform === 'Games' 
                      ? 'bg-slate-900/80 border-slate-700 hover:border-emerald-500/50' 
                      : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-purple-500/30'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                      tip.category === 'Cheats' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      tip.category === 'Gameplay' ? 'bg-blue-500/20 text-blue-400' :
                      tip.category === 'Hidden' ? 'bg-pink-500/20 text-pink-400' :
                      tip.category === 'System' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {tip.category}
                    </span>
                  </div>
                  
                  {platform === 'Games' ? (
                     // Layout specifico per Codici Gioco
                     <div className="space-y-3">
                        <div className="bg-black/50 p-3 rounded-lg border border-slate-700 font-mono text-emerald-400 text-lg text-center select-all">
                           {tip.title}
                        </div>
                        <p className="text-sm leading-relaxed text-slate-300 text-center">
                           {tip.content}
                        </p>
                     </div>
                  ) : (
                     // Layout Standard
                     <>
                        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-purple-400 transition-colors">
                          {tip.title}
                        </h3>
                        <p className="text-sm leading-relaxed text-slate-400 whitespace-pre-line">
                          {tip.content}
                        </p>
                     </>
                  )}
                </div>
              )
            )}
          </div>

          {/* Load More Button */}
          {tips.length > 0 && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loading}
                className={`group relative bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 ${
                  platform === 'Games' ? 'hover:border-emerald-500' : 'hover:border-purple-500'
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Ricerca nel database...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>Carica Altri Risultati</span>
                    <svg className="w-4 h-4 group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                  </span>
                )}
              </button>
            </div>
          )}
          
          {!loading && tips.length === 0 && (
             <div className="text-center py-12 text-slate-600">
                <SparklesIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>
                  {platform === 'Games' 
                   ? "Inserisci il nome di un gioco per sbloccare i suoi segreti." 
                   : "Usa l'intelligenza artificiale per trovare soluzioni specifiche."}
                </p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TipsView;
