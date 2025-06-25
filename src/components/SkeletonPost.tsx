"use client";

export default function SkeletonPost() {
  return (
    <li className="rounded-3xl p-6 glass-dark border border-primary animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-4 w-28 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-4 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-4 w-5/6 bg-gray-300 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-64 w-full bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="mt-6 flex gap-6 pt-4 border-t border-primary">
        <div className="h-5 w-20 bg-gray-300 dark:bg-gray-700 rounded" />
        <div className="h-5 w-24 bg-gray-300 dark:bg-gray-700 rounded" />
      </div>
    </li>
  );
}
