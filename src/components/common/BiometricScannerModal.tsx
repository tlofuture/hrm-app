import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Fingerprint,
  Eye,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Sparkles,
  Camera,
  RefreshCw,
  User,
  Navigation,
  ShieldCheck,
} from 'lucide-react';
import { Employee, AttendanceMethod, AttendanceRecord } from '../../types';
import { translations } from '../../utils/translations';
import {
  playBiometricScanHum,
  playBiometricSuccess,
  playBiometricAlert,
} from '../../utils/audio';

interface BiometricScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  selectedEmployeeId?: string;
  defaultMethod?: AttendanceMethod;
  defaultAction?: 'clock_in' | 'clock_out';
  onRecordAttendance: (record: AttendanceRecord) => void;
  language: 'en' | 'my';
}

export const BiometricScannerModal: React.FC<BiometricScannerModalProps> = ({
  isOpen,
  onClose,
  employees,
  selectedEmployeeId,
  defaultMethod,
  defaultAction,
  onRecordAttendance,
  language,
}) => {
  const t = translations[language];
  const [method, setMethod] = useState<AttendanceMethod>(defaultMethod || 'fingerprint');
  const [actionType, setActionType] = useState<'clock_in' | 'clock_out'>(defaultAction || 'clock_in');
  const [currentEmpId, setCurrentEmpId] = useState<string>(
    selectedEmployeeId || employees[0]?.employeeId || 'NX-1002'
  );
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const [confidence, setConfidence] = useState<number>(0);
  const [useCamera, setUseCamera] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Sync selected employee ID if prop changes
  useEffect(() => {
    if (selectedEmployeeId) {
      setCurrentEmpId(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  useEffect(() => {
    if (defaultMethod) {
      setMethod(defaultMethod);
    }
    if (defaultAction) {
      setActionType(defaultAction);
    }
  }, [defaultMethod, defaultAction, isOpen]);

  // Handle webcam initialization when camera mode requested for Eye Scan
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen && method === 'eye_scan' && useCamera) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'user' } })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setCameraError(null);
        })
        .catch(() => {
          setCameraError(
            language === 'my'
              ? 'ကင်မရာ အသုံးပြုခွင့် မရရှိပါ။ Simulation ဖြင့် ဆက်လက်စကင်ဖတ်နိုင်ပါသည်။'
              : 'Webcam permission unavailable. Continuing with high-tech optical simulator.'
          );
          setUseCamera(false);
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen, method, useCamera, language]);

  if (!isOpen) return null;

  const currentEmployee = employees.find((e) => e.employeeId === currentEmpId) || employees[0];

  const handleStartScan = () => {
    if (scanState === 'scanning') return;
    setScanState('scanning');
    playBiometricScanHum();

    // Simulate multi-stage biometric hashing
    const scanInterval = setInterval(() => {
      playBiometricScanHum();
    }, 400);

    setTimeout(() => {
      clearInterval(scanInterval);
      const confScore = +(98.5 + Math.random() * 1.4).toFixed(1);
      setConfidence(confScore);
      setScanState('success');
      playBiometricSuccess();

      // Format record
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const dateStr = now.toISOString().split('T')[0];

      let locationStr = 'Yangon HQ - Ground Gate Biometric Terminal';
      if (method === 'eye_scan') {
        locationStr = 'Yangon HQ - Level 4 Tech Lab Iris Sensor';
      } else if (method === 'mobile') {
        locationStr = 'NexHR Mobile App - Yangon HQ GPS Geofence (18m)';
      }

      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}`,
        employeeId: currentEmployee.employeeId,
        employeeName: currentEmployee.name,
        department: currentEmployee.department,
        date: dateStr,
        clockInTime: actionType === 'clock_in' ? timeStr : '08:50:00',
        clockOutTime: actionType === 'clock_out' ? timeStr : undefined,
        method,
        status: actionType === 'clock_in' && now.getHours() >= 9 && now.getMinutes() > 15 ? 'late' : 'present',
        location: locationStr,
        overtimeHours: actionType === 'clock_out' && now.getHours() >= 18 ? now.getHours() - 17 : 0,
        biometricConfidence: confScore,
      };

      onRecordAttendance(newRecord);
    }, 1800);
  };

  const resetScan = () => {
    setScanState('idle');
    setConfidence(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg">
              {method === 'fingerprint' ? (
                <Fingerprint className="w-5 h-5" />
              ) : method === 'eye_scan' ? (
                <Eye className="w-5 h-5" />
              ) : (
                <Smartphone className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {t.biometricTerminal}
              </h3>
              <p className="text-[11px] text-slate-500">
                {language === 'my'
                  ? 'လုံခြုံရေးအဆင့်မြင့် ဇီဝမက်ထရစ်နှင့် မိုဘိုင်းလ် ရုံးတက်စနစ်'
                  : 'High-Assurance Biometric & Mobile Verification'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Employee & Mode Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-slate-700">
                {language === 'my' ? 'ဝန်ထမ်းရွေးချယ်ရန်' : 'Select Employee'}:
              </label>
              <select
                value={currentEmpId}
                onChange={(e) => {
                  setCurrentEmpId(e.target.value);
                  resetScan();
                }}
                className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium cursor-pointer"
              >
                {employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.name} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            {/* Scan Method Switcher (3 Tabs) */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMethod('mobile');
                  resetScan();
                }}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all ${
                  method === 'mobile'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{language === 'my' ? 'မိုဘိုင်းလ်' : 'Mobile GPS'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod('fingerprint');
                  resetScan();
                }}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all ${
                  method === 'fingerprint'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                <span>{t.fingerprintScan}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod('eye_scan');
                  resetScan();
                }}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-all ${
                  method === 'eye_scan'
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{t.eyeScan}</span>
              </button>
            </div>

            {/* Action Type: Clock In vs Clock Out */}
            <div className="flex items-center justify-center gap-4 text-xs font-medium pt-1">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="actionType"
                  checked={actionType === 'clock_in'}
                  onChange={() => setActionType('clock_in')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>{t.clockIn}</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700">
                <input
                  type="radio"
                  name="actionType"
                  checked={actionType === 'clock_out'}
                  onChange={() => setActionType('clock_out')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>{t.clockOut}</span>
              </label>
            </div>
          </div>

          {/* Interactive Scanning Sensor Canvas */}
          <div className="relative flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800">
            {/* High-tech sensor background pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px]" />

            {method === 'mobile' ? (
              /* MOBILE PHONE INTERACTIVE PUNCH */
              <div
                onClick={handleStartScan}
                className="relative flex flex-col items-center justify-between w-64 p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/40 shadow-xl cursor-pointer hover:border-indigo-400 transition-all active:scale-98"
              >
                {/* Mobile Screen Top Bar */}
                <div className="w-full flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-2 mb-2">
                  <span className="font-mono text-slate-300">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    GPS Locked
                  </span>
                </div>

                {/* Geofence info badge */}
                <div className="w-full p-2 bg-slate-950/70 rounded-lg border border-slate-800/80 text-[10px] space-y-1 mb-3">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-indigo-400" />
                      HQ Geofence:
                    </span>
                    <span className="font-semibold text-emerald-400">Within 18m (50m Limit)</span>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono">
                    Coord: 16.8409° N, 96.1735° E
                  </div>
                </div>

                {/* Central Mobile Biometric Punch Button */}
                <div
                  className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 ${
                    scanState === 'scanning'
                      ? 'ring-4 ring-indigo-500/80 shadow-lg shadow-indigo-500/40 bg-indigo-950/60'
                      : scanState === 'success'
                      ? 'ring-4 ring-emerald-500/80 shadow-lg shadow-emerald-500/40 bg-emerald-950/60'
                      : 'ring-2 ring-indigo-500/30 hover:ring-indigo-400 bg-indigo-600/20'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <Smartphone
                      className={`w-8 h-8 transition-colors ${
                        scanState === 'scanning'
                          ? 'text-indigo-400 animate-pulse'
                          : scanState === 'success'
                          ? 'text-emerald-400'
                          : 'text-indigo-300'
                      }`}
                    />
                    <span className="text-[9px] font-bold text-white mt-1 uppercase tracking-wide">
                      {actionType === 'clock_in' ? 'Clock In' : 'Clock Out'}
                    </span>
                  </div>
                  {scanState === 'scanning' && (
                    <div className="absolute inset-0 rounded-full border-2 border-indigo-400 animate-ping opacity-75" />
                  )}
                </div>

                <div className="mt-3 text-[10px] text-slate-400 text-center font-medium">
                  {language === 'my'
                    ? 'မိုဘိုင်းလ် GPS ဖြင့် တိုက်ရိုက် Punch နှိပ်ပါ'
                    : 'Tap screen to punch via Mobile GPS Geofence'}
                </div>
              </div>
            ) : method === 'fingerprint' ? (
              /* FINGERPRINT INTERACTIVE TERMINAL */
              <div
                onClick={handleStartScan}
                className={`relative flex items-center justify-center w-36 h-36 rounded-full cursor-pointer transition-all duration-300 ${
                  scanState === 'scanning'
                    ? 'ring-4 ring-indigo-500/70 shadow-lg shadow-indigo-500/30 bg-slate-900'
                    : scanState === 'success'
                    ? 'ring-4 ring-emerald-500/70 shadow-lg shadow-emerald-500/30 bg-slate-900'
                    : 'hover:ring-2 hover:ring-slate-600 bg-slate-900/80 active:scale-95'
                }`}
              >
                {/* Concentric Scanner Rings */}
                <div
                  className={`absolute inset-2 rounded-full border border-dashed ${
                    scanState === 'scanning'
                      ? 'border-indigo-400 animate-spin'
                      : 'border-slate-700'
                  }`}
                />

                {/* Fingerprint Vector Graphic */}
                <svg
                  className={`w-20 h-20 transition-colors ${
                    scanState === 'scanning'
                      ? 'text-indigo-400'
                      : scanState === 'success'
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
                  <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
                  <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
                  <path d="M2 12a10 10 0 0 1 18-6" />
                  <path d="M2 16h.01" />
                  <path d="M21.8 16c.2-2 .131-5.354 0-6" />
                  <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
                  <path d="M8.65 22c.21-.66.45-1.32.57-2" />
                  <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
                </svg>

                {/* Sweeping Laser Line when scanning */}
                {scanState === 'scanning' && (
                  <div className="absolute inset-x-4 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-sm shadow-cyan-400 animate-pulse" />
                )}
              </div>
            ) : (
              /* EYE / IRIS SCAN TERMINAL */
              <div
                onClick={handleStartScan}
                className="relative flex items-center justify-center w-40 h-40 rounded-full cursor-pointer overflow-hidden transition-all duration-300"
              >
                {/* Optional real camera feed or sci-fi retina HUD */}
                {useCamera ? (
                  <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-indigo-400">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-125"
                    />
                    <div className="absolute inset-0 bg-indigo-900/20" />
                  </div>
                ) : (
                  <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-cyan-500/50 bg-slate-900 flex items-center justify-center">
                    <img
                      src="/src/assets/images/biometric_retina_lens_1791292493616.jpg"
                      alt="Biometric Iris Scan Reticle"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                      className={`w-full h-full object-cover transition-opacity ${
                        scanState === 'scanning' ? 'opacity-90' : 'opacity-70'
                      }`}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-16 h-16 rounded-full border border-cyan-400/40 animate-ping" />
                    </div>
                  </div>
                )}

                {/* HUD Overlay Crosshairs */}
                <div
                  className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
                    scanState === 'scanning' ? 'animate-pulse' : ''
                  }`}
                >
                  <div className="w-24 h-24 rounded-full border border-cyan-400/80 border-dashed" />
                  <div className="absolute w-28 h-[1px] bg-cyan-400/60" />
                  <div className="absolute h-28 w-[1px] bg-cyan-400/60" />
                </div>
              </div>
            )}

            {/* Instruction / State Kicker */}
            <div className="mt-4 text-center">
              {scanState === 'idle' && (
                <button
                  type="button"
                  onClick={handleStartScan}
                  className="text-xs text-indigo-300 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    {method === 'mobile'
                      ? (language === 'my' ? 'မိုဘိုင်းလ် GPS ဖြင့် Punch နှိပ်ပါ' : 'Tap mobile screen to punch')
                      : method === 'fingerprint'
                      ? t.placeFinger
                      : t.alignEye}
                  </span>
                </button>
              )}

              {scanState === 'scanning' && (
                <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.scanning}</span>
                </div>
              )}

              {scanState === 'success' && (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{t.scanSuccess}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono tabular-nums">
                    {t.confidenceScore}: {confidence}%
                  </p>
                </div>
              )}
            </div>

            {/* Camera Toggle for Eye Scan */}
            {method === 'eye_scan' && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUseCamera(!useCamera);
                  }}
                  className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <Camera className="w-3 h-3" />
                  <span>
                    {useCamera
                      ? language === 'my'
                        ? 'စကင်ဂရပ်ဖစ်သို့ ပြန်ပြောင်းရန်'
                        : 'Use Optical HUD'
                      : language === 'my'
                        ? 'ဝဘ်ကင်မရာ အသုံးပြုမည်'
                        : 'Enable Camera Stream'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Verification Details Card */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">
                {language === 'my' ? 'ဝန်ထမ်းအမည်' : 'Employee'}:
              </span>
              <span className="font-semibold text-slate-800">
                {currentEmployee.name} ({currentEmployee.employeeId})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {t.verifiedLocation}:
              </span>
              <span className="text-slate-700 font-medium">
                {method === 'mobile'
                  ? 'NexHR Mobile App (Yangon HQ Geofence - 18m)'
                  : method === 'eye_scan'
                  ? 'Yangon HQ - Level 4 Tech Lab Iris Sensor'
                  : 'Yangon HQ - Ground Gate Biometric Terminal'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {language === 'my' ? 'မှတ်တမ်းတင်ချိန်' : 'Timestamp'}:
              </span>
              <span className="font-mono text-slate-700 tabular-nums">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {language === 'my' ? 'ပိတ်မည်' : 'Close'}
            </button>
            <button
              type="button"
              onClick={handleStartScan}
              disabled={scanState === 'scanning'}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              {scanState === 'scanning' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{language === 'my' ? 'စစ်ဆေးနေဆဲ...' : 'Scanning...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {scanState === 'success'
                      ? language === 'my'
                        ? 'ထပ်မံ စကင်ဖတ်မည်'
                        : 'Scan Again'
                      : language === 'my'
                      ? 'စကင် စတင်မည်'
                      : 'Initiate Biometric Scan'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
