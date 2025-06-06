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
    <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-sm p-6 mb-6 animate-fade-in border border-pink-100">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-semibold text-xl">
            {partner.displayName.charAt(0).toUpperCase()}
          </span>
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Building intimacy with {partner.displayName}</h2>
        <p className="text-gray-600 leading-relaxed">
          Every connection strengthens your bond. Take time to be present with each other and nurture the love you share.
        </p>
      </div>
    </div>
  );
}
