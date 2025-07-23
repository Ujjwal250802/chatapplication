import { CheckCircle, CreditCard, User, Hash, Clock, ArrowUpRight, ArrowDownLeft } from "lucide-react";

const PaymentMessage = ({ message }) => {
  try {
    if (!message?.payment_details) {
      return null;
    }

    const paymentDetails = message.payment_details;
    const isReceived = paymentDetails.type === "received";
    
    const formatTime = (timestamp) => {
      try {
        return new Date(timestamp).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      } catch (error) {
        return "Unknown time";
      }
    };

    return (
      <div className={`max-w-sm rounded-2xl border-2 shadow-xl mx-auto my-3 overflow-hidden ${
        isReceived 
          ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 border-green-200 dark:from-green-900/20 dark:to-green-800/20 dark:border-green-700' 
          : 'bg-gradient-to-br from-blue-50 via-sky-50 to-blue-100 border-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 dark:border-blue-700'
      }`}>
        {/* Header Strip */}
        <div className={`h-2 ${
          isReceived 
            ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
            : 'bg-gradient-to-r from-blue-400 to-sky-500'
        }`}></div>
        
        <div className="p-6">
          {/* Header with Icon and Status */}
          <div className="flex items-center gap-4 mb-5">
            <div className={`p-3 rounded-2xl shadow-lg ${
              isReceived 
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/25' 
                : 'bg-gradient-to-br from-blue-500 to-sky-600 shadow-blue-500/25'
            }`}>
              {isReceived ? (
                <ArrowDownLeft className="size-6 text-white" />
              ) : (
                <ArrowUpRight className="size-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`font-bold text-lg ${
                isReceived ? 'text-green-800 dark:text-green-200' : 'text-blue-800 dark:text-blue-200'
              }`}>
                {isReceived ? '💰 Money Received' : '💸 Payment Sent'}
              </h3>
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="size-3" />
                <span>{formatTime(paymentDetails.timestamp)}</span>
              </div>
            </div>
          </div>

          {/* Amount Display */}
          <div className="text-center mb-5">
            <div className={`text-4xl font-bold mb-2 ${
              isReceived ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'
            }`}>
              ₹{paymentDetails.amount}
            </div>
            <div className={`text-sm font-medium px-3 py-1 rounded-full inline-block ${
              isReceived 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            }`}>
              {isReceived ? 'Credited to your account' : 'Debited from your account'}
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3 mb-5">
            <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-black/20 rounded-xl border border-white/50">
              <div className="flex items-center gap-2">
                <User className="size-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isReceived ? 'From' : 'To'}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {isReceived ? paymentDetails.sender_name : paymentDetails.recipient_name}
              </span>
            </div>
            
            {!isReceived && paymentDetails.recipient_upi && (
              <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-black/20 rounded-xl border border-white/50">
                <div className="flex items-center gap-2">
                  <CreditCard className="size-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">UPI ID</span>
                </div>
                <span className="text-sm font-mono text-gray-800 dark:text-gray-200">
                  {paymentDetails.recipient_upi}
                </span>
              </div>
            )}
            
            <div className="flex items-center justify-between p-3 bg-white/70 dark:bg-black/20 rounded-xl border border-white/50">
              <div className="flex items-center gap-2">
                <Hash className="size-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Transaction ID</span>
              </div>
              <span className="text-xs font-mono text-gray-600 dark:text-gray-400 max-w-32 truncate">
                {paymentDetails.transaction_id}
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full border border-green-200 dark:border-green-700">
              <CheckCircle className="size-4 text-green-600 dark:text-green-400" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                ✅ Transaction Successful
              </span>
            </div>
          </div>

          {/* Powered by footer */}
          <div className="text-center pt-3 border-t border-gray-200/50 dark:border-gray-600">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              🔒 Secured by ChatSphere Pay
            </span>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in PaymentMessage component:", error);
    return (
      <div className="max-w-sm p-4 bg-red-50 border border-red-200 rounded-xl mx-auto my-2">
        <p className="text-red-600 text-sm text-center">❌ Error displaying payment message</p>
      </div>
    );
  }
};

export default PaymentMessage;