import { Button } from "@heroui/react";
import { X } from "lucide-react";
import { Report } from "@/types/reports";
import { useState } from "react";

type ReportDetailsProps = {
  report: Report;
  voterId: string;
  onClose: () => void;
  onVote: (reportId: number) => Promise<void>;
};

export function ReportDetails({ report, voterId, onClose, onVote }: ReportDetailsProps) {
  const [isVoting, setIsVoting] = useState(false);
  
  const handleVote = async (reportId: number) => {
    setIsVoting(true);
    await onVote(reportId);
    setIsVoting(false);
  };

  const activityLabels: { [key: string]: string } = {
    "1": "Arrests",
    "2": "Patrols",
    "3": "Questioning",
    "4": "ID Checks",
    "5": "Other"
  };

  const clothingLabels: { [key: string]: string } = {
    "6": "Tactical Gear",
    "7": "Plain Clothes",
    "8": "Uniforms",
    "9": "Other"
  };

  const equipmentLabels: { [key: string]: string } = {
    "10": "Handcuffs",
    "11": "Zip Cuffs",
    "12": "Weapons",
    "13": "Marked Vehicle",
    "14": "Unmarked Vehicle",
    "15": "Other"
  };

  return (
    <div className="absolute bottom-20 left-5 right-5 sm:left-auto sm:right-5 sm:w-[400px] bg-background border rounded-lg p-4 shadow-lg z-30">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold">Report Details</h3>
        <Button
          isIconOnly
          size="sm"
          variant="light"
          onPress={onClose}
        >
          <X size={16} />
        </Button>
      </div>
      <div className="space-y-2 text-sm">
        <p><strong>Time:</strong> {report.time}</p>
        <p><strong>Location:</strong> {report.location}</p>
        <p><strong>Agents:</strong> {report.agent_count}</p>
        {report.activities.length > 0 && (
          <p><strong>Activities:</strong> {report.activities.map(a => activityLabels[a]).join(", ")}</p>
        )}
        {report.other_activity && (
          <p><strong>Other Activity:</strong> {report.other_activity}</p>
        )}
        {report.clothing.length > 0 && (
          <p><strong>Clothing:</strong> {report.clothing.map(c => clothingLabels[c]).join(", ")}</p>
        )}
        {report.other_clothing && (
          <p><strong>Other Clothing:</strong> {report.other_clothing}</p>
        )}
        {report.equipment.length > 0 && (
          <p><strong>Equipment:</strong> {report.equipment.map(e => equipmentLabels[e]).join(", ")}</p>
        )}
        {report.other_equipment && (
          <p><strong>Other Equipment:</strong> {report.other_equipment}</p>
        )}
        {report.details && (
          <p><strong>Details:</strong> {report.details}</p>
        )}
        <div className="mt-4 flex justify-between items-center">
          <p className="text-xs text-default-500">
            {report.over_votes.length}/2 votes to mark as over
          </p>
          <Button
            color="danger"
            size="sm"
            variant="flat"
            isDisabled={report.over_votes.includes(voterId)}
            isLoading={isVoting}
            onPress={() => handleVote(report.id)}
          >
            Mark as Over
          </Button>
        </div>
        <p className="text-xs text-default-500">
          Reported {new Date(report.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );
} 