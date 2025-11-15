import ReactDOM from "react-dom";

function ModalWrapper({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100000]">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-[350px] sm:w-[450px] relative">
        <button className="absolute top-3 right-3 ..." onClick={onClose}>✕</button>
        {children}
      </div>
    </div>,
    document.body
  );
}
export default ModalWrapper;