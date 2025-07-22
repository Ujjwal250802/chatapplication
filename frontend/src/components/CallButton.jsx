import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <div className="absolute top-4 right-4 z-10">
      <button 
        onClick={handleVideoCall} 
        className="btn btn-success btn-sm text-white shadow-lg"
        title="Start Video Call"
      >
        <VideoIcon className="size-5" />
      </button>
    </div>
  );
}

export default CallButton;