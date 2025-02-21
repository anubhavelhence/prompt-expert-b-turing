import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function Sidebar() {
  const [location] = useLocation();
  const { toast } = useToast();

  const resetAll = () => {
    queryClient.clear();
    localStorage.clear();
    sessionStorage.clear();
    toast({
      title: "Reset Complete",
      description: "All data has been cleared. Please refresh the page.",
    });
  };

  const tasks = [
    { path: "/task-zero", label: "Task 0: Initial Information" },
    { path: "/task-one", label: "Task 1: Evaluate Problem" },
    { path: "/task-two", label: "Task 2: Grade Solutions" },
    { path: "/task-three", label: "Task 3: Evaluate Model Grading" },
    { path: "/task-four", label: "Task 4: Evaluate Rubric" },
  ];

  return (
    <div className="w-64 h-screen bg-card fixed left-0 top-0 border-r p-4 flex flex-col">
      <div className="space-y-2 flex-1">
        <h2 className="font-semibold mb-4">Task Navigation</h2>
        {tasks.map((task) => (
          <Link 
            key={task.path} 
            href={task.path}
          >
            <a 
              className={cn(
                "block p-2 rounded-lg hover:bg-accent transition-colors",
                location.includes(task.path) && "bg-accent"
              )}
            >
              {task.label}
            </a>
          </Link>
        ))}
      </div>
      <Button 
        variant="destructive" 
        className="w-full"
        onClick={resetAll}
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Reset All
      </Button>
    </div>
  );
}
