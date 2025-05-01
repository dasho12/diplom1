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
    description: "Та өөрийн CV-г PDF/PNG/JPEG файлаар оруулах боломжтой.",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/04fcdb08a3cb484fba8d958382052e5c/6eb0c7b65db9c513545528042e8dbb594ce15bf1?placeholderIfAbsent=true",
    title: "Илгээх",
    description:
      "Өөрийн CV-гээ илгээснээр хэсэг хугацааны дараа таны CV-г боловсруулж дуусна",
  },
];

const ProcessStep = ({ icon, title, description }: ProcessStep) => (
  <article className="w-3/12 max-md:ml-0 max-md:w-full">
    <div className="flex flex-col items-center self-stretch p-6 my-auto w-full rounded-xl max-md:px-5 max-md:mt-9">
      <div className="flex gap-2.5 items-center p-5 bg-white h-[72px] rounded-[80px] w-[72px]">
        {icon === "AI" ? (
          <span className="px-4 py-3.5 text-xs font-medium whitespace-nowrap min-h-[45px] text-slate-900 w-[45px]">
            AI
          </span>
        ) : (
          <img src={icon} className="object-contain w-8 aspect-square" alt="" />
        )}
      </div>
      <div className="flex flex-col items-start mt-6 max-w-full text-center w-[264px]">
        <h3 className="text-lg font-medium leading-loose text-zinc-900">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-5 text-gray-500">{description}</p>
      </div>
    </div>
  </article>
);

export default function ProcessSection() {
  return (
    <section className="flex flex-col justify-center px-72 py-16 w-full bg-slate-100 min-h-[512px] max-md:px-5 max-md:max-w-full">
      <div className="flex flex-col items-center w-full max-w-[1320px] max-md:max-w-full">
        <h2 className="text-3xl font-medium leading-8 text-center text-slate-900 max-md:max-w-full">
          Өөрийн CV-д хэрхэн дүн шинжилгээ хийлгэх вэ?
        </h2>
        <div className="mt-11 w-full rounded-none max-md:mt-10">
          <div className="flex gap-5 max-md:flex-col">
            {steps.map((step, index) => (
              <ProcessStep key={index} {...step} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
