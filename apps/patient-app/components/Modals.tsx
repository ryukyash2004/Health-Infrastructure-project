"use client";

import { X, History, ClipboardEdit, AlertCircle } from "lucide-react";
import { useStore } from "../store/useStore";

export default function Modals() {
  const { 
    isLeftMenuOpen, 
    isMedicalFormOpen, 
    isSosOpen,
    toggleLeftMenu, 
    toggleMedicalForm,
    toggleSos
  } = useStore();

  const formFields = [
    "Patient Name", "Age", "Gender", "Medical History", 
    "Allergies", "AI Diagnosis", "Doctor Diagnosis", 
    "Differential Diagnosis", "Tests done"
  ];

  return (
    <>
      {/* Overlay */}
      {(isLeftMenuOpen || isMedicalFormOpen || isSosOpen) && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity"
          onClick={() => {
            if (isLeftMenuOpen) toggleLeftMenu();
            if (isMedicalFormOpen) toggleMedicalForm();
            if (isSosOpen) toggleSos();
          }}
        />
      )}

      {/* SOS Modal */}
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white z-[60] shadow-2xl rounded-3xl p-8 transition-all duration-300 ${isSosOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Emergency SOS</h2>
          <p className="text-gray-600">This will contact emergency services and notify your doctor immediately.</p>
          <div className="flex flex-col w-full gap-3 mt-2">
            <button className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl text-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-100">
              Call Emergency (112)
            </button>
            <button 
              onClick={toggleSos}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Left Drawer */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-white z-[60] shadow-2xl transition-transform duration-300 ease-in-out ${isLeftMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Menu</h2>
          <button onClick={toggleLeftMenu} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <nav className="p-4 flex flex-col gap-2">
          <button className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-xl text-gray-700 transition-colors">
            <History className="w-5 h-5" />
            <span>Previous Chats</span>
          </button>
          <button 
            onClick={() => { toggleLeftMenu(); toggleMedicalForm(); }}
            className="flex items-center gap-3 w-full p-3 hover:bg-gray-50 rounded-xl text-gray-700 transition-colors"
          >
            <ClipboardEdit className="w-5 h-5" />
            <span>Edit Medical Records</span>
          </button>
        </nav>
      </aside>

      {/* Medical Intake Form Modal */}
      <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg bg-white z-[60] shadow-2xl rounded-3xl transition-all duration-300 ${isMedicalFormOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Medical Record</h2>
          <button onClick={toggleMedicalForm} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {formFields.map((field) => (
            <div key={field} className="space-y-1.5">
              <label className="text-sm font-medium text-gray-600 ml-1">{field}</label>
              <input 
                type="text" 
                placeholder={`Enter ${field.toLowerCase()}...`}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all"
              />
            </div>
          ))}
          <button className="w-full bg-gray-900 text-white font-semibold py-3 rounded-xl mt-4 hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
            Save Records
          </button>
        </div>
      </div>
    </>
  );
}
