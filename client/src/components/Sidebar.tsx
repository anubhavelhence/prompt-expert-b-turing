import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Loader2, RotateCcw } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { WorkflowTask } from "@shared/schema";

export function Sidebar() {
  const [location] = useLocation();
  const { toast } = useToast();

  // Get the current workflow ID from the URL if it exists
  const workflowId = location.split('/').pop();
  const isNumeric = (str: string) => !isNaN(Number(str));
  const currentId = isNumeric(workflowId || '') ? workflowId : undefined;

  // If we're on a task page, fetch the workflow data
  const { data: workflow } = useQuery({
    queryKey: currentId ? ['/api/workflow', currentId] : null,
    enabled: !!currentId,
  });

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
    { path: currentId ? `/task-one/${currentId}` : "/task-zero", label: "Task 1: Evaluate Problem" },
    { path: currentId ? `/task-two/${currentId}` : "/task-zero", label: "Task 2: Grade Solutions" },
    { path: currentId ? `/task-three/${currentId}` : "/task-zero", label: "Task 3: Evaluate Model Grading" },
    { path: currentId ? `/task-four/${currentId}` : "/task-zero", label: "Task 4: Evaluate Rubric" },
  ];

  return (
    <div className="w-64 h-screen bg-card fixed left-0 top-0 border-r p-4 flex flex-col">
      <div className="space-y-2 flex-1">
        <h2 className="font-semibold mb-4">Task Navigation</h2>
        {tasks.map((task, index) => {
          // Don't allow navigation to tasks 1-4 if Task 0 hasn't been completed
          const isDisabled = index > 0 && !currentId;

          return (
            <Link 
              key={index}
              href={isDisabled ? "/task-zero" : task.path}
            >
              <a 
                className={cn(
                  "block p-2 rounded-lg transition-colors",
                  isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-accent",
                  location.includes(task.path.split('/')[1]) && "bg-accent"
                )}
                onClick={(e) => {
                  if (isDisabled) {
                    e.preventDefault();
                    toast({
                      title: "Complete Task 0 first",
                      description: "You need to complete Task 0 before accessing other tasks.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                {task.label}
              </a>
            </Link>
          );
        })}
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