export function ProductCardSkeleton({ count = 4, size = "lg" }) {
  const imageHeight = size === "lg" ? "h-[204px]" : "h-[169px]";
  const frameHeight = size === "lg" ? "min-h-[220px]" : "min-h-[185px]";

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <article key={i} className="animate-pulse">
          <div className={`mb-3.5 rounded-xl bg-gray-200 ${frameHeight}`} />
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
          <div className="mb-2 flex gap-1">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="size-3 rounded-full bg-gray-200" />
            ))}
          </div>
          <div className={`${imageHeight} hidden`} />
          <div className="h-4 w-1/3 rounded bg-gray-200" />
        </article>
      ))}
    </>
  );
}

export function TableRowSkeleton({ rows = 5, cols = 4 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="animate-pulse">
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-4 py-4">
              <div className="h-4 rounded bg-gray-200" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export function TestimonialCardSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <article
          key={i}
          className="animate-pulse rounded-lg bg-white px-6 py-7"
        >
          <div className="mb-3 flex gap-1">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="size-3 rounded-full bg-gray-200" />
            ))}
          </div>
          <div className="mb-2 h-4 w-1/2 rounded bg-gray-200" />
          <div className="mb-4 h-3 w-1/3 rounded bg-gray-200" />
          <div className="space-y-2">
            <div className="h-3 rounded bg-gray-200" />
            <div className="h-3 rounded bg-gray-200" />
            <div className="h-3 w-4/5 rounded bg-gray-200" />
          </div>
        </article>
      ))}
    </>
  );
}

export function BlogCardSkeleton({ count = 2 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <article
          key={i}
          className="animate-pulse flex flex-col gap-6 rounded-xl bg-white px-6 py-7 sm:flex-row sm:items-start sm:px-8"
        >
          <div className="flex-1 space-y-3">
            <div className="h-6 w-24 rounded-full bg-gray-200" />
            <div className="h-3 w-40 rounded bg-gray-200" />
            <div className="h-5 w-full rounded bg-gray-200" />
            <div className="h-5 w-3/4 rounded bg-gray-200" />
            <div className="size-9 rounded-full bg-gray-200" />
          </div>
          <div className="size-[140px] flex-shrink-0 rounded-lg bg-gray-200" />
        </article>
      ))}
    </>
  );
}

export function BestSellerCardSkeleton({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <article
          key={i}
          className="animate-pulse flex items-center gap-3.5 rounded-lg bg-[#F8F8F6] px-4 py-3.5"
        >
          <div className="size-[68px] flex-shrink-0 rounded-lg bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-1/3 rounded bg-gray-200" />
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="size-3 rounded-full bg-gray-200" />
              ))}
            </div>
          </div>
        </article>
      ))}
    </>
  );
}

export function StatsCardSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-xl border border-gray-200 bg-white p-5"
        >
          <div className="mb-2 h-3 w-24 rounded bg-gray-200" />
          <div className="h-8 w-16 rounded bg-gray-200" />
        </div>
      ))}
    </>
  );
}
