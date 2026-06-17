export default function BlockedPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-7xl mb-6">🛡️</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Access Blocked
        </h1>
        <p className="text-gray-600 mb-6">
          CipherHacks has detected automated or suspicious activity from your
          session. This request has been blocked to protect sensitive data.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
          <p className="font-semibold mb-2">Why was I blocked?</p>
          <ul className="text-left space-y-1">
            <li>• Automated browser (headless/bot) detected</li>
            <li>• Known AI scraper user-agent identified</li>
            <li>• Suspicious request patterns or rate limiting</li>
            <li>• Honeypot field interaction detected</li>
          </ul>
        </div>
        <p className="text-xs text-gray-400 mt-6">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  );
}
