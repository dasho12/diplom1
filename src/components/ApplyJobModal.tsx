import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface CV {
  id: string;
  fileName: string;
  fileUrl: string;
  createdAt: string;
  status: string;
  matchScore?: number;
}

interface ApplyJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (cvId: string) => Promise<void>;
  cvs: CV[];
  jobTitle: string;
}

export default function ApplyJobModal({
  isOpen,
  onClose,
  onApply,
  cvs,
  jobTitle,
}: ApplyJobModalProps) {
  const [selectedCV, setSelectedCV] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedCV) {
      setError("CV сонгоно уу");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onApply(selectedCV);
      onClose();
    } catch (error) {
      setError("Ажилд өргөдөл гаргахад алдаа гарлаа");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-semibold leading-6 text-gray-900 mb-4"
                    >
                      {jobTitle} - Ажилд өргөдөл гаргах
                    </Dialog.Title>

Dashzeweg Erdenebileg, [5/7/2025 12:04 PM]
<div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CV сонгох
                      </label>
                      <div className="space-y-2">
                        {cvs.length === 0 ? (
                          <p className="text-gray-500">
                            CV оруулаагүй байна.{" "}
                            <a
                              href="/jobseeker/profile"
                              className="text-indigo-600 hover:text-indigo-500"
                            >
                              CV оруулах
                            </a>
                          </p>
                        ) : (
                          cvs.map((cv) => (
                            <div
                              key={cv.id}
                              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                              onClick={() => setSelectedCV(cv.id)}
                            >
                              <input
                                type="radio"
                                name="cv"
                                value={cv.id}
                                checked={selectedCV === cv.id}
                                onChange={() => setSelectedCV(cv.id)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                              />
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {cv.fileName}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {new Date(cv.createdAt).toLocaleDateString()}
                                </p>
                                {cv.matchScore && (
                                  <p className="text-sm text-green-600">
                                    Тохиролт: {cv.matchScore}%
                                  </p>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {error && (
                      <p className="mt-2 text-sm text-red-600">{error}</p>
                    )}

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        onClick={onClose}
                      >
                        Болих
                      </button>
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !selectedCV}
                      >
                        {isSubmitting ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          "Өргөдөл гаргах"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}