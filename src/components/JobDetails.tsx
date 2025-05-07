interface Job {
  id: string;
  title: string;
  company: {
    name: string;
  };
  description: string;
  requirements: string;
  location: string;
  salary?: string;
  createdAt: string;
}

interface JobDetailsProps {
  job: Job | null;
}

export default function JobDetails({ job }: JobDetailsProps) {
  if (!job) {
    return (
      <div className="bg-white shadow rounded-lg p-8 min-h-[500px] flex items-center justify-center text-gray-400">
        Ажлын байр сонгогдоогүй байна
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-8 min-h-[500px]">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/23813725c8b2f39dd1d36d4e94e16d8ab78110aa?placeholderIfAbsent=true"
            alt="logo"
            className="w-14 h-14 object-contain"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{job.title}</h2>
          <p className="text-lg text-gray-600">{job.company.name}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Байршил</h3>
          <p className="text-gray-600">{job.location}</p>
        </div>

        {job.salary && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Цалин</h3>
            <p className="text-gray-600">{job.salary}</p>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Тайлбар</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{job.description}</p>
        </div>

        {job.requirements && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Шаардлага
            </h3>
            <p className="text-gray-600 whitespace-pre-wrap">
              {job.requirements}
            </p>
          </div>
        )}

        <div className="pt-6">
          <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Анкет илгээх
          </button>
        </div>
      </div>
    </div>
  );
}
