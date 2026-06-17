'use client';

import { useState } from 'react';
import { useShieldStatus } from '@cipherhacks/shield/react';

export function ShieldStatus() {
  const status = useShieldStatus();
  const [expanded, setExpanded] = useState(false);

  const statusColor = status.headlessDetected
    ? 'bg-red-500'
    : status.active
      ? 'bg-green-500'
      : 'bg-gray-400';

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`${statusColor} text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-transform`}
        title="CipherHacks Shield Status"
      >
        🛡️
      </button>

      {expanded && (
        <div className="absolute bottom-14 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-72">
          <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
            🛡️ CipherHacks Shield
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span
                className={`font-medium ${status.active ? 'text-green-600' : 'text-gray-400'}`}
              >
                {status.active ? 'Active' : 'Initializing...'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Threat Score</span>
              <span
                className={`font-medium ${
                  status.threatScore > 60
                    ? 'text-red-600'
                    : status.threatScore > 30
                      ? 'text-yellow-600'
                      : 'text-green-600'
                }`}
              >
                {status.threatScore}/100
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Headless Browser</span>
              <span
                className={`font-medium ${status.headlessDetected ? 'text-red-600' : 'text-green-600'}`}
              >
                {status.headlessDetected ? 'Detected!' : 'None'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Honeypot Trips</span>
              <span
                className={`font-medium ${status.honeypotTriggered ? 'text-red-600' : 'text-green-600'}`}
              >
                {status.honeypotTriggered ? 'Triggered!' : 'Clean'}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Blocked</span>
              <span className="font-medium text-gray-900">
                {status.blockedCount}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 mb-1">
              ACTIVE DEFENSES
            </h4>
            <div className="flex flex-wrap gap-1">
              {[
                'Bot Detection',
                'DOM Shield',
                'Honeypots',
                'Rate Limit',
                'CSP',
                'Behavior',
              ].map((defense) => (
                <span
                  key={defense}
                  className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full"
                >
                  {defense}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
