interface LeadStatusProps {
  status: "Preliminary" | "Price Negotiation" | "Deal" | "Meetup";
}

export function LeadStatus({ status }: LeadStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Preliminary":
        return "bg-blue-100 text-blue-800";
      case "Price Negotiation": 
        return "bg-yellow-100 text-yellow-800";
      case "Deal":
        return "bg-green-100 text-green-800";
      case "Meetup":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}
    >
      {status}
    </span>
  );
}
