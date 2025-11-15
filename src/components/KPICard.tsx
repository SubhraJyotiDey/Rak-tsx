import { Card, CardContent } from "./ui/card";

interface KPICardProps {
  label: string;
  value: number;
  icon?: string;
}

export const KPICard = ({ label, value, icon }: KPICardProps) => {
  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <p className="text-3xl font-bold text-primary">{value}</p>
          </div>
          {icon && <span className="text-4xl">{icon}</span>}
        </div>
      </CardContent>
    </Card>
  );
};
