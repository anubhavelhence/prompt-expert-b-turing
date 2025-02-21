import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ClipboardList } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6" />
            Expert B/C Workflow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Welcome to the workflow automation system. Start by completing Task 0 to begin the process.
          </p>
          <Button 
            onClick={() => setLocation("/task-zero")}
            className="w-full"
          >
            Start Workflow
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}