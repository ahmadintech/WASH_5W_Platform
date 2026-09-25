import { Head } from '@inertiajs/react';
export default function ReportsShow({ report }: { report?: any }) {
  return (
    <>
      <Head title={`Report #${report?.id || ''}`} />
      <div className="p-8">
        <h1 className="text-2xl font-bold">Report Detail</h1>
        <p className="mt-4 text-gray-600">Details for report #{report?.id} will go here.</p>
      </div>
    </>
  );
}
