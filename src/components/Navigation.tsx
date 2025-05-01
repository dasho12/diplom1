import Image from "next/image";
export const Header = () => {
  return (
    <header className="flex flex-col justify-center px-32 py-3 w-full bg-white min-h-[70px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] max-md:px-5 max-md:max-w-full fixed top-0 z-50">
      <nav className="flex flex-wrap gap-8 justify-between items-center w-full max-w-[1420px] mx-auto max-md:max-w-full">
        <div className="flex flex-wrap gap-8 items-center min-w-60 text-slate-900 max-md:max-w-full">
          <h1 className="text-2xl font-bold tracking-tight">Talento</h1>
          <div className="flex gap-8 items-center text-sm font-medium min-w-60">
            <a
              href="/"
              className="hover:text-slate-700 cursor-pointer relative group text-slate-900"
            >
              <span className="group-hover:text-slate-700 transition-colors">
                Нүүр
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-300 group-hover:w-full"></div>
            </a>
            <a
              href="/jobs"
              className="hover:text-slate-700 cursor-pointer relative group text-slate-900"
            >
              <span className="group-hover:text-slate-700 transition-colors">
                Ажлын байр
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-300 group-hover:w-full"></div>
            </a>
            <a
              href="#about"
              className="hover:text-slate-700 cursor-pointer relative group text-slate-900"
            >
              <span className="group-hover:text-slate-700 transition-colors">
                Таленто гэж юу вэ?
              </span>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-slate-900 transition-all duration-300 group-hover:w-full"></div>
            </a>
          </div>
        </div>
        <Image
          src="/icons/AI.png"
          alt="logo"
          width={40}
          height={40}
          className="rounded-lg"
        />
        <div className="flex gap-4 items-center text-sm min-w-60">
          <button className="gap-2.5 self-stretch px-4 py-2 my-auto font-medium rounded-lg border border-solid border-slate-900 text-slate-900 hover:bg-slate-50 transition-colors">
            Ажил олгогч
          </button>
          <button className="gap-2.5 self-stretch px-4 py-2 my-auto font-bold text-white whitespace-nowrap rounded-lg bg-slate-900 hover:bg-slate-800 transition-colors">
            Нэвтрэх
          </button>
        </div>
      </nav>
    </header>
  );
};
