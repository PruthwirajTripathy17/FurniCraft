import { useEffect, useState } from "react";

const Countdown = () => {
  const [t, setT] = useState({ d: 221, h: 12, m: 14, s: 23 });

  useEffect(() => {
    const id = setInterval(() => {
      setT((previous) => {
        let { d, h, m, s } = previous;
        s -= 1;
        if (s < 0) {
          s = 59;
          m -= 1;
        }
        if (m < 0) {
          m = 59;
          h -= 1;
        }
        if (h < 0) {
          h = 23;
          d -= 1;
        }
        return { d, h, m, s };
      });
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {[
        ["DAYS", t.d],
        ["HRS", t.h],
        ["MINS", t.m],
        ["SECS", t.s],
      ].map(([label, val]) => (
        <div key={label} className="min-w-[62px] rounded-lg bg-white/15 px-4 py-3 text-center">
          <div className="text-[28px] font-bold leading-none text-white">{String(val).padStart(2, "0")}</div>
          <div className="mt-1 text-[10px] font-medium text-white/65">{label}</div>
        </div>
      ))}
    </div>
  );
};

export default Countdown;
