import type { ProcessStep } from "./types";

const steps: ProcessStep[] = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/0993b2182737f6efecd080e45cfb782def4a8bfc?placeholderIfAbsent=true",
    title: "Бүртгэл үүсгэх",
    description: "Нэвтрэх товчин дээр даран өөрийн Имэйл-ээр бүртгэл үүсгэнэ.",
  },
  {
    icon: "AI",
    title: "AI товчин дээр дарах",
    description: "Баруун дээр байрлах AI-товчийг дарна уу.",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/a24df4711f630035b223ebbc7bb2f14cd1d52266?placeholderIfAbsent=true",
    title: "Өөрийн CV-г оруулах",
    description: "Та өөрийн CV-г PDF/Word файлаар оруулах боломжтой.",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/6eb0c7b65db9c513545528042e8dbb594ce15bf1?placeholderIfAbsent=true",
    title: "Илгээх",
    description:
      "Өөрийн CV-гээ илгээснээр хэсэг хугацааны дараа таны CV-г боловсруулж дуусна",
  },
];

const Arrow = () => (
  <svg
    width="120"
    height="48"
    viewBox="0 0 120 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="mx-2 transition-transform duration-300 ease-in-out"
  >
    <path
      d="M3 45C25 3 95 3 117 45"
      stroke="#A3BFFA"
      strokeWidth="2"
      strokeDasharray="8 8"
      fill="none"
      className="transition-stroke duration-300"
    />
    <path
      d="M112 43L117 45L115 39"
      stroke="#A3BFFA"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ProcessStep = ({ icon, title, description }: ProcessStep) => (
  <div className="flex flex-col items-center w-60 mx-2 flex-shrink">
    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 shadow-sm mb-3 transition-shadow duration-300 hover:shadow-md">
      {icon === "AI" ? (
        <span className="text-[#0C213A] text-xl font-semibold">AI</span>
      ) : (
        <img src={icon} className="w-8 h-8 object-contain" alt={title} />
      )}
    </div>
    <h3 className="text-xl font-bold text-[#0C213A] text-center mb-1">{title}</h3>
    <p className="text-base text-gray-600 text-center leading-relaxed font-thin">{description}</p>
  </div>
);

export default function ProcessSection() {
  return (
    <section className="w-full bg-white min-h-[93vh] flex items-center px-32">
      <div className="w-full">
        <h2 className="text-3xl sm:text-3xl md:text-4xl font-semibold text-[#0C213A] text-center mb-16">
          Өөрийн CV-д хэрхэн дүн шинжилгээ <br />хийлгэх вэ?
        </h2>
        <div className="w-full flex flex-row items-center justify-center">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-row items-center">
              <ProcessStep {...step} />
              {idx < steps.length - 1 && <Arrow key={`arrow-${idx}`} />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}