import { useState } from "react";
import { BloodRequest, BloodGroup } from "@/types/bloodRequest";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { QrCode, Copy, Trash2 } from "lucide-react";
import { formatDate, getStatusClasses, getStatusIcon } from "@/utils/bloodRequest";

interface RequestsTableProps {
  requests: BloodRequest[];
  onViewQR: (request: BloodRequest) => void;
  onCopyRTID: (rtid: string) => void;
  onDelete: (rtid: string) => void;
}

export const RequestsTable = ({
  requests,
  onViewQR,
  onCopyRTID,
  onDelete,
}: RequestsTableProps) => {
  const [filterBG, setFilterBG] = useState<string>("All");
  const [filterDate, setFilterDate] = useState<string>("All");

  const filteredRequests = requests.filter((req) => {
    const bgMatch = filterBG === "All" || req.bloodGroup === filterBG;
    const dateMatch =
      filterDate === "All" ||
      formatDate(req.requiredBy) === formatDate(new Date(filterDate));
    return bgMatch && dateMatch;
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-primary">
          Active Requests 📋
        </h2>
        <div className="flex gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">🩸 Group</span>
            <Select value={filterBG} onValueChange={setFilterBG}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">📅 Date</span>
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RTID (ID / PATIENT)</TableHead>
              <TableHead>GROUP</TableHead>
              <TableHead>UNITS</TableHead>
              <TableHead>REQUIRED BY</TableHead>
              <TableHead>STATUS</TableHead>
              <TableHead>ACTION</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.rtid}>
                <TableCell>
                  <div>
                    <div className="font-mono text-xs font-semibold">
                      🆔 {request.rtid}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {request.patientName}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-semibold">
                    {request.bloodGroup}
                  </Badge>
                </TableCell>
                <TableCell>{request.unitsRequired} units</TableCell>
                <TableCell>{formatDate(request.requiredBy)}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`border ${getStatusClasses(request.status)}`}
                  >
                    {getStatusIcon(request.status)} {request.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewQR(request)}
                      title="View QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onCopyRTID(request.rtid)}
                      title="Copy RTID"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDelete(request.rtid)}
                      className="text-destructive hover:text-destructive"
                      title="Delete Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
