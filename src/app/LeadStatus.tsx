interface LeadStatusProps {
  status: "inquiry" | "negotiation" | "closing";
}

export function LeadStatus({ status }: LeadStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "inquiry":
        return "bg-blue-100 text-blue-800";
      case "negotiation":
        return "bg-yellow-100 text-yellow-800";
      case "closing":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
