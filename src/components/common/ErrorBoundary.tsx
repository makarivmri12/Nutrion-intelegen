import React, { ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw, Download } from "lucide-react";
import { collectAllData } from "../../services/syncService";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  // Explicitly declare properties to satisfy compiler
  props: Props;
  state: State;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled clinical exception:", error, errorInfo);
  }

  private handleBackup = () => {
    try {
      const data = collectAllData();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nutri-rescue-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Gagal melakukan emergency backup. Silakan salin logs konsol.");
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-[#121212] border border-red-500/30 rounded-xl p-8 shadow-2xl text-center space-y-6">
              <div className="inline-flex p-4 bg-red-500/10 text-red-500 rounded-full">
                <AlertOctagon className="w-12 h-12" />
              </div>
              
              <div className="space-y-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  System Exception Detected
                </h1>
                <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                  Platform Nutri-Intelligence mendeteksi error tidak terduga pada thread rendering React Anda.
                </p>
              </div>

              {this.state.error && (
                <div className="bg-zinc-950 p-4 rounded border border-zinc-800 text-left overflow-x-auto max-h-[120px] scrollbar-thin">
                  <span className="text-[10px] text-red-400 font-mono break-all leading-normal block">
                    {this.state.error.stack || this.state.error.message}
                  </span>
                </div>
              )}

              <div className="pt-2 flex flex-col space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#00d4ff] to-[#00a4cf] text-black font-semibold py-2.5 px-4 rounded-lg hover:brightness-110 transition-all text-xs"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  <span>Reload Application</span>
                </button>

                <button
                  onClick={this.handleBackup}
                  className="w-full flex items-center justify-center space-x-2 bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 py-2.5 px-4 rounded-lg transition-all text-xs"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Rescue Local Backup (.json)</span>
                </button>
              </div>

              <div className="text-[10px] text-zinc-500 font-mono">
                Autosave & indexedDB rescue backup engine is fully functional.
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
