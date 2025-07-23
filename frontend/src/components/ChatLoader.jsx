import { LoaderIcon } from "lucide-react";

function ChatLoader() {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 to-green-100">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
        <LoaderIcon className="animate-spin size-12 text-green-500 mx-auto mb-4" />
        <p className="text-center text-lg font-medium text-gray-700">Connecting to chat...</p>
        <p className="text-center text-sm text-gray-500 mt-2">Please wait while we establish connection</p>
      </div>
    </div>
  );
}

export default ChatLoader;