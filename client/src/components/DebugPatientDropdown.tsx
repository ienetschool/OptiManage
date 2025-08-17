import { useQuery } from "@tanstack/react-query";

export function DebugPatientDropdown() {
  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["/api/patients"],
  });

  console.log("🔍 DEBUG - Patient data structure:", {
    totalPatients: patients.length,
    firstPatient: patients[0],
    allPatientKeys: patients[0] ? Object.keys(patients[0]) : [],
    sampleData: patients.slice(0, 2)
  });

  if (isLoading) return <div>Loading patients...</div>;

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
      <h3 className="font-semibold text-yellow-800">Patient Data Debug</h3>
      <pre className="text-xs mt-2 text-yellow-700">
        {JSON.stringify(
          {
            total: patients.length,
            first: patients[0],
            keys: patients[0] ? Object.keys(patients[0]) : []
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}