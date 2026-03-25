import { FiPlus } from 'react-icons/fi';

const FAB = ({ onClick }) => (
    <button
        onClick={onClick}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-xl shadow-blue-600/40 hover:shadow-blue-600/60 transition-all duration-200 hover:scale-110 z-40"
        aria-label="Add Transaction"
    >
        <FiPlus className="text-2xl" />
    </button>
);

export default FAB;
