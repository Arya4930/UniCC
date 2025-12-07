import Main from "../components/custom/Main";

export default function Home() {
  return (
    <div>
      <div className="top-0 left-0 w-full bg-yellow-500 text-black text-center py-2 font-medium z-[9999] shadow-md">
        ⚠️ All API services are currently down due to maintenance. Please check back later. ⚠️
      </div>
      <Main />
    </div>
  );
}
