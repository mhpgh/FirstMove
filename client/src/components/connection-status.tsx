import { User } from "@/lib/auth";

interface ConnectionStatusProps {
  partner: User | null;
  isConnected: boolean;
}

export function ConnectionStatus({ partner, isConnected }: ConnectionStatusProps) {
  if (!partner) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 animate-fade-in">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">No Partner Connected</h2>
          <p className="text-gray-500">Share your pairing code to connect with your partner</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Connected with</h2>
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full flex items-center justify-center">
          <span className="text-white font-semibold text-lg">
            {partner.displayName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="font-medium text-gray-800">{partner.displayName}</p>
          <p className="text-sm text-gray-500">
            {isConnected ? "Online now" : "Offline"}
          </p>
        </div>
      </div>
    </div>
  );
}
