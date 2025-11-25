
import React, { useState } from 'react';
import { AppView } from './types';
import ViveToolView from './components/ViveToolView';
import TipsView from './components/TipsView';
import { TerminalIcon, SparklesIcon, WindowsIcon, DownloadIcon } from './components/Icons';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [showInstallWizard, setShowInstallWizard] = useState(false);

  // --- SOLUZIONE BATCH FILE (UNIVERSALE WINDOWS) ---
  const downloadBatInstaller = () => {
    const currentUrl = window.location.href;
    
    // Script Batch ibrido che genera un VBS temporaneo per creare lo shortcut
    // Questo metodo è il più robusto perché usa variabili d'ambiente (%USERPROFILE%)
    // e comandi standard disponibili su tutti i Windows (XP, 7, 10, 11).
    const batScript = `@echo off
chcp 65001 >nul
cls
color 0b
echo ==========================================
echo      INSTALLAZIONE TECHMASTER APP
echo ==========================================
echo.
echo 1. Rilevamento percorso Desktop...
set "TARGET_URL=${currentUrl}"
set "ICON_NAME=TechMaster"
set "VBS_SCRIPT=%TEMP%\\CreateShortcut_%RANDOM%.vbs"

echo 2. Generazione collegamento App...

:: Scrive lo script VBS temporaneo
echo Set oWS = WScript.CreateObject("WScript.Shell") > "%VBS_SCRIPT%"
echo sLinkFile = oWS.ExpandEnvironmentStrings("%%USERPROFILE%%\\Desktop\\%ICON_NAME%.lnk") >> "%VBS_SCRIPT%"
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> "%VBS_SCRIPT%"

:: Tenta di usare Edge o Chrome in modalità App
echo oLink.TargetPath = "cmd.exe" >> "%VBS_SCRIPT%"
echo oLink.Arguments = "/c start msedge --app=" ^& "${currentUrl}" >> "%VBS_SCRIPT%"
echo oLink.IconLocation = "shell32.dll,14" >> "%VBS_SCRIPT%"
echo oLink.WindowStyle = 7 >> "%VBS_SCRIPT%"
echo oLink.Description = "TechMaster App" >> "%VBS_SCRIPT%"
echo oLink.Save >> "%VBS_SCRIPT%"

:: Esegue lo script
cscript /nologo "%VBS_SCRIPT%"

:: Pulizia
del "%VBS_SCRIPT%"

echo.
echo ==========================================
echo   INSTALLAZIONE COMPLETATA!
echo   Trovi l'icona sul tuo Desktop.
echo ==========================================
echo.
echo Premi un tasto per chiudere...
pause >nul
`;

    const blob = new Blob([batScript], { type: 'application/x-bat' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Setup_TechMaster.bat';
    document.body.appendChild(a);
    a.click();
    
    // FIX: Ritardo la revoca per evitare ERR_FILE_NOT_FOUND su alcuni browser
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 2000);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.VIVETOOL:
        return <ViveToolView />;
      case AppView.TIPS:
        return <TipsView />;
      case AppView.HOME:
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-12 animate-fade-in px-4">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500">
                TechMaster
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                La suite definitiva per personalizzare Windows e padroneggiare il tuo iPhone.
                Potenziata dall'Intelligenza Artificiale.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
              <button
                onClick={() => setCurrentView(AppView.VIVETOOL)}
                className="group relative bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-emerald-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] text-left"
              >
                <div className="absolute top-6 right-6 p-3 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                  <TerminalIcon className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">ViveTool ID Finder</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Genera ID e comandi per attivare funzionalità nascoste di Windows 10 e 11.
                </p>
              </button>

              <button
                onClick={() => setCurrentView(AppView.TIPS)}
                className="group relative bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-2xl border border-slate-700 hover:border-purple-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.2)] text-left"
              >
                <div className="absolute top-6 right-6 p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                  <SparklesIcon className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Genius Tips</h3>
                <p className="text-slate-400 group-hover:text-slate-300 transition-colors">
                  Scopri trucchi esclusivi per PC, codici Giochi e iPhone 14 Plus.
                </p>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentView(AppView.HOME)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-lg shadow-lg">
                T
              </div>
              <span className="font-bold text-xl text-white tracking-tight hidden md:block">TechMaster</span>
            </button>
            
            <button 
              onClick={() => setShowInstallWizard(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-full transition-all animate-fade-in shadow-lg shadow-blue-900/50 ml-2 border border-blue-400"
            >
              <WindowsIcon className="w-4 h-4" />
              INSTALLA SU PC
            </button>
          </div>

          <nav className="flex gap-1 md:gap-6">
            <button
              onClick={() => setCurrentView(AppView.VIVETOOL)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === AppView.VIVETOOL 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ViveTool
            </button>
            <button
              onClick={() => setCurrentView(AppView.TIPS)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentView === AppView.TIPS 
                  ? 'bg-purple-500/10 text-purple-400' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Trucchi
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {renderContent()}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-600 text-sm">
          <p>© {new Date().getFullYear()} TechMaster Tool. Powered by Google Gemini.</p>
          <p className="mt-2 text-xs">Usa ViveTool a tuo rischio. Effettua sempre un backup.</p>
        </div>
      </footer>

      {/* WINDOWS INSTALLER WIZARD (BATCH) */}
      {showInstallWizard && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-fade-in backdrop-blur-sm">
          <div className="bg-slate-100 text-slate-900 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-400 font-sans relative">
            
            {/* Header stile Installer */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-4 flex items-center justify-between shadow-md">
               <h3 className="text-white font-bold text-lg flex items-center gap-2">
                 <WindowsIcon className="w-5 h-5" />
                 TechMaster Setup
               </h3>
               <button onClick={() => setShowInstallWizard(false)} className="text-white hover:bg-white/20 rounded-full w-8 h-8 flex items-center justify-center transition-colors">✕</button>
            </div>

            <div className="p-8">
              <div className="flex gap-6 mb-8 items-start">
                 <div className="w-16 h-16 bg-blue-100 border-2 border-blue-200 rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                    <WindowsIcon className="w-8 h-8 text-blue-600" />
                 </div>
                 <div>
                    <h4 className="font-bold text-xl mb-2 text-slate-800">Installazione Sicura</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                       Questo pacchetto <strong>Setup.bat</strong> configurerà automaticamente l'applicazione sul tuo sistema.
                    </p>
                 </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
                 <h5 className="font-bold text-yellow-800 text-xs uppercase mb-2">⚠️ Istruzioni Importanti</h5>
                 <ol className="list-decimal list-inside text-sm text-slate-700 space-y-2">
                    <li>Scarica ed apri il file <strong>Setup_TechMaster.bat</strong>.</li>
                    <li>Se vedi una schermata blu ("PC Protetto da Windows"), clicca su <u>Ulteriori Informazioni</u>.</li>
                    <li>Poi clicca il pulsante <strong>Esegui Comunque</strong>.</li>
                 </ol>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-200">
                 <button 
                   onClick={() => setShowInstallWizard(false)}
                   className="px-5 py-2.5 text-sm font-medium border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
                 >
                   Chiudi
                 </button>
                 <button 
                   onClick={downloadBatInstaller}
                   className="px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                 >
                   <DownloadIcon className="w-4 h-4" />
                   SCARICA SETUP (.BAT)
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
